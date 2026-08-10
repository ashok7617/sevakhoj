"""Database loader (psycopg 3). Imported lazily so --dry-run needs no driver.

Writes follow the traceability principle:
  1. raw record -> source_records (never mutated)
  2. standardized row -> facilities (upsert by external_id)
  3. link source_records.mapped_entity_id -> facilities.id
All within one transaction per batch.
"""
from __future__ import annotations

from typing import Dict, List, Optional

from . import DATA_GOV_IN_SOURCE_URL
from .transform import ResourceConfig, StagedRecord

# Facility columns in a fixed order. retrieved_at is written with now();
# enum columns get an explicit text->enum cast.
_FAC_COLS = [
    "name", "facility_type", "care_category_id", "category", "sub_category",
    "gender", "age_group", "age_min", "age_max", "capacity", "current_occupancy",
    "fees_inr", "cost_type", "services", "medical_services", "residential",
    "government_registration", "phone", "email", "address", "state", "district",
    "city", "pincode", "latitude", "longitude", "verification_status",
    "official_source_url", "external_id", "source_id", "source_record_id",
    "retrieved_at",
]
_CASTS = {
    "gender": "::gender_served",
    "cost_type": "::cost_type",
    "verification_status": "::verification_status",
}


class LoadStats:
    def __init__(self) -> None:
        self.raw_staged = 0
        self.inserted = 0
        self.updated = 0

    def as_dict(self) -> Dict[str, int]:
        return {"raw_staged": self.raw_staged, "inserted": self.inserted, "updated": self.updated}


def load(
    staged: List[StagedRecord],
    cfg: ResourceConfig,
    database_url: str,
    source_url: str = DATA_GOV_IN_SOURCE_URL,
) -> LoadStats:
    import psycopg  # lazy: only needed for real loads
    from psycopg.types.json import Jsonb

    # Build the facility upsert SQL once.
    def value_sql(col: str) -> str:
        return "now()" if col == "retrieved_at" else "%s" + _CASTS.get(col, "")

    cols_sql = ", ".join(_FAC_COLS)
    vals_sql = ", ".join(value_sql(c) for c in _FAC_COLS)
    param_cols = [c for c in _FAC_COLS if c != "retrieved_at"]
    update_sql = ", ".join(
        "%s = EXCLUDED.%s" % (c, c) for c in _FAC_COLS if c != "external_id"
    )
    upsert_sql = (
        "INSERT INTO facilities (%s) VALUES (%s) "
        "ON CONFLICT (external_id) WHERE external_id IS NOT NULL "
        "DO UPDATE SET %s, updated_at = now() "
        "RETURNING id, (xmax = 0) AS inserted"
    ) % (cols_sql, vals_sql, update_sql)

    stats = LoadStats()
    with psycopg.connect(database_url) as conn:
        with conn.cursor() as cur:
            source_id = _ensure_source(cur, source_url)
            care_id = _care_category_id(cur, cfg.care_category_slug)

            for rec in staged:
                # 1) raw -> source_records (idempotent by source_id + record id)
                cur.execute(
                    """
                    INSERT INTO source_records
                      (source_id, entity_type, source_record_id, raw, retrieved_at)
                    VALUES (%s, 'facility'::entity_type, %s, %s, now())
                    ON CONFLICT (source_id, source_record_id)
                      WHERE source_record_id IS NOT NULL
                      DO UPDATE SET raw = EXCLUDED.raw, retrieved_at = now()
                    RETURNING id
                    """,
                    (source_id, rec.source_record_id, Jsonb(rec.raw)),
                )
                sr_id = cur.fetchone()[0]
                stats.raw_staged += 1

                # 2) standardized -> facilities (upsert by external_id)
                f = rec.facility
                params: List[object] = []
                for c in param_cols:
                    if c == "care_category_id":
                        params.append(care_id)
                    elif c == "source_id":
                        params.append(source_id)
                    elif c == "official_source_url":
                        params.append(f.get("official_source_url") or source_url)
                    elif c == "services":
                        params.append(Jsonb(f.get("services") or []))
                    else:
                        params.append(f.get(c))

                cur.execute(upsert_sql, params)
                fac_id, inserted = cur.fetchone()
                stats.inserted += 1 if inserted else 0
                stats.updated += 0 if inserted else 1

                # 3) link raw record to the standardized entity
                cur.execute(
                    "UPDATE source_records SET mapped_entity_id = %s WHERE id = %s",
                    (fac_id, sr_id),
                )
        conn.commit()
    return stats


def _ensure_source(cur, source_url: str) -> str:
    cur.execute(
        """
        INSERT INTO government_sources
          (government_level, ministry, source_name, source_url, category, has_api,
           research_status)
        VALUES ('central', 'MeitY / NIC', 'data.gov.in', %s, 'mixed', true, 'researched')
        ON CONFLICT (source_url) DO NOTHING
        """,
        (source_url,),
    )
    cur.execute("SELECT id FROM government_sources WHERE source_url = %s", (source_url,))
    return cur.fetchone()[0]


def _care_category_id(cur, slug: str) -> Optional[int]:
    cur.execute("SELECT id FROM care_categories WHERE slug = %s", (slug,))
    row = cur.fetchone()
    return row[0] if row else None
