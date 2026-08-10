"""Orchestration: fetch -> transform -> (geocode) -> dedupe -> load."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from . import SOURCE_KEY, config as cfgmod
from .datagovin import DataGovInClient
from .geocode import make_geocoder
from .resources import PLACEHOLDER, get_resource
from .transform import StagedRecord, dedupe_key, transform_record


def read_fixture(path: str) -> List[Dict[str, Any]]:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if isinstance(data, dict):
        return data.get("records", []) or []
    if isinstance(data, list):
        return data
    raise ValueError("Fixture must be a list or an object with a 'records' array.")


def _iter_raw(
    cfg, limit: Optional[int], offset: int, fixture: Optional[str]
) -> List[Dict[str, Any]]:
    if fixture:
        rows = read_fixture(fixture)
        return rows[offset : offset + limit] if limit is not None else rows[offset:]
    if cfg.resource_id == PLACEHOLDER:
        raise RuntimeError(
            "resource_id for '%s' is a placeholder. Set DGI_RESOURCE_%s=<id> "
            "(from the dataset's data.gov.in page) or use --fixture." % (cfg.key, cfg.key.upper())
        )
    client = DataGovInClient(cfgmod.data_gov_in_api_key() or "")
    return list(client.iter_records(cfg.resource_id, max_records=limit, start_offset=offset))


def run(
    resource_key: str,
    limit: Optional[int] = 100,
    offset: int = 0,
    dry_run: bool = True,
    geocode: str = "none",
    fixture: Optional[str] = None,
    sample: int = 3,
) -> Dict[str, Any]:
    cfgmod.load_env()
    cfg = get_resource(resource_key)

    raw = _iter_raw(cfg, limit, offset, fixture)
    staged: List[StagedRecord] = [transform_record(r, cfg, SOURCE_KEY) for r in raw]

    # geocode records lacking coordinates (opt-in)
    geocoded = 0
    if geocode and geocode != "none":
        geocoder = make_geocoder(geocode)
        for s in staged:
            if s.facility.get("latitude") is None:
                res = geocoder.geocode(s.facility)
                if res:
                    s.facility["latitude"], s.facility["longitude"] = res
                    geocoded += 1

    # in-batch duplicate detection (cross-run dedupe handled by upsert)
    seen: set = set()
    dupes = 0
    for s in staged:
        k = dedupe_key(s.facility)
        if k in seen:
            dupes += 1
        else:
            seen.add(k)

    with_warnings = sum(1 for s in staged if s.warnings)
    with_coords = sum(1 for s in staged if s.facility.get("latitude") is not None)

    summary: Dict[str, Any] = {
        "resource": resource_key,
        "source": SOURCE_KEY,
        "fetched": len(staged),
        "with_coords": with_coords,
        "geocoded": geocoded,
        "in_batch_duplicates": dupes,
        "records_with_warnings": with_warnings,
        "dry_run": dry_run,
        "sample": [
            {
                "name": s.facility["name"],
                "state": s.facility["state"],
                "district": s.facility["district"],
                "pincode": s.facility["pincode"],
                "external_id": s.external_id,
                "warnings": s.warnings,
            }
            for s in staged[:sample]
        ],
    }

    if dry_run:
        return summary

    db_url = cfgmod.database_url()
    if not db_url:
        raise RuntimeError("DATABASE_URL is not set — cannot load. Use --dry-run to preview.")
    from .db import load  # lazy import (needs psycopg)

    stats = load(staged, cfg, db_url)
    summary.update(stats.as_dict())
    return summary
