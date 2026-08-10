-- Link standardized facilities back to their government source for
-- traceability (memory.md) and idempotent re-ingestion.
--   external_id      = "<source_key>:<resource>:<source_record_id>"  (stable)
--   source_id        -> government_sources
--   source_record_id = id within the source dataset
-- Raw records still live untouched in source_records; these columns are the
-- standardized-record side of the traceability link.

ALTER TABLE facilities
  ADD COLUMN IF NOT EXISTS external_id          text,
  ADD COLUMN IF NOT EXISTS source_id            uuid REFERENCES government_sources(id),
  ADD COLUMN IF NOT EXISTS source_record_id     text,
  ADD COLUMN IF NOT EXISTS source_last_updated  date,
  ADD COLUMN IF NOT EXISTS retrieved_at         timestamptz;

-- Idempotent upserts by external_id; partial index lets seed/manual rows keep
-- a NULL external_id without colliding.
CREATE UNIQUE INDEX IF NOT EXISTS facilities_external_id_key
  ON facilities(external_id) WHERE external_id IS NOT NULL;

-- Idempotent raw-record staging: one row per (source, source_record_id).
CREATE UNIQUE INDEX IF NOT EXISTS source_records_source_recordid_key
  ON source_records(source_id, source_record_id) WHERE source_record_id IS NOT NULL;
