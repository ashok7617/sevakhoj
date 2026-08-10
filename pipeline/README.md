# Ingestion pipeline — data.gov.in

Config-driven ETL that pulls open datasets from **data.gov.in**, standardizes
them, and loads them into the platform's Postgres/PostGIS database — following
the flow in [`../memory.md`](../memory.md):

```
data.gov.in API → raw records → stage → clean → standardize
  → address/PIN normalize → geocode (opt-in) → dedupe → load
  → source_records (raw, untouched) + facilities (standardized)
```

**Why data.gov.in first:** it is the one Central source with an official open
license (**GODL-India** — commercial + non-commercial reuse permitted) and a
real JSON API, so it's the safest, highest-leverage starting point.

## Core principle: originals are never overwritten

Every run writes the **raw** government record verbatim to `source_records`, and
the **standardized** row to `facilities`. They are linked both ways:

- `facilities.external_id` = `data_gov_in:<resource>:<record_id>` (idempotent upsert key)
- `facilities.source_id` / `source_record_id` / `retrieved_at` (traceability)
- `source_records.mapped_entity_id` → the facility it produced

Re-running updates in place instead of duplicating.

## Setup

```bash
cd pipeline
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt          # only needed for real DB loads
cp .env.example .env                      # add your DATA_GOV_IN_API_KEY
```

`DATABASE_URL` is read from `pipeline/.env` or the repo-root `.env.local`.
Make sure the app's migrations have been applied first (`npm run db:migrate` and
`npm run db:seed` from the repo root) so the taxonomy exists.

## Usage

```bash
# List configured datasets
python -m ingest list

# Preview transforms with the bundled sample — no network, no DB, no deps:
python -m ingest run old_age_homes --fixture fixtures/old_age_homes_sample.json --dry-run

# Live: point a resource at its real data.gov.in resource_id, then load
export DGI_RESOURCE_OLD_AGE_HOMES=<resource-uuid-from-data.gov.in>
python -m ingest run old_age_homes --limit 500

# Geocode rows that lack coordinates (OpenStreetMap/Nominatim, ≤1 req/s):
python -m ingest run old_age_homes --limit 200 --geocode nominatim

# JSON summary (for scripting/CI):
python -m ingest run old_age_homes --fixture fixtures/old_age_homes_sample.json --dry-run --json
```

`--dry-run` fetches + transforms and prints a summary (counts, coordinates,
in-batch duplicates, records with warnings, a sample) without writing anything.

## Adding / fixing a dataset

Datasets vary in column names, so each resource maps standardized fields to a
**list of candidate source columns** (matched case/spacing-insensitively).

1. Find the dataset on data.gov.in and copy its **resource_id** (a UUID).
2. Add or edit an entry in [`ingest/resources.py`](ingest/resources.py):
   - `care_category_slug` must match a row in the `care_categories` taxonomy.
   - Extend `name_fields` / `_COMMON` with the dataset's actual column names.
3. Set the id via env (`DGI_RESOURCE_<KEY>=...`) or edit `resource_id` in place.
4. Preview with `--dry-run` before loading.

Verification: rows from data.gov.in are marked `government_verified` (they match
an official source) with `official_source_url` set. This is *source* verification
only — never an endorsement of a facility's service quality.

## Tests

Pure-stdlib, offline:

```bash
python -m unittest discover -s tests -v
```

## Layout

```
ingest/
  datagovin.py   API client (urllib, pagination, retries)
  resources.py   dataset registry + field mappings
  transform.py   clean / standardize / normalize (pure, tested)
  geocode.py     pluggable geocoder (none | nominatim)
  db.py          psycopg loader (raw + upsert + link), lazy-imported
  pipeline.py    orchestration
  __main__.py    CLI  (python -m ingest ...)
fixtures/        sample data for offline dry-runs
tests/           unittest suite
```

## Notes & limits

- Only `old_age_homes`, `child_care_institutions`, `disability_ddrc` are wired
  as examples; their `resource_id`s are placeholders until you set the real ones.
- Nominatim is fine for small backfills, not bulk geocoding — swap in a proper
  geocoding provider or an offline PIN-centroid table for large runs.
- Children's / mental-health data needs stronger verification and safety review
  before public display (see `memory.md`).
