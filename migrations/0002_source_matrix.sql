-- Government Data Source Master Matrix — extends government_sources with the
-- matrix columns from memory.md so each source records what data it exposes,
-- in what formats, under what reuse terms, and how researched the row is.

ALTER TABLE government_sources
  ADD COLUMN IF NOT EXISTS category               text,          -- schemes | facilities | registration | mixed
  ADD COLUMN IF NOT EXISTS has_schemes            boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_facility_db        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_registration_data  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_api                boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS formats                jsonb   NOT NULL DEFAULT '[]'::jsonb, -- ["api","csv","excel","pdf","html"]
  ADD COLUMN IF NOT EXISTS data_fields            jsonb   NOT NULL DEFAULT '[]'::jsonb, -- fields available from the source
  ADD COLUMN IF NOT EXISTS access_method          text,          -- e.g. "API key", "Bulk download", "Manual PDF", "Portal search"
  ADD COLUMN IF NOT EXISTS research_status        text    NOT NULL DEFAULT 'skeleton',  -- researched | partial | skeleton
  ADD COLUMN IF NOT EXISTS notes                  text;

-- One row per source URL; enables idempotent upsert from the matrix importer.
CREATE UNIQUE INDEX IF NOT EXISTS government_sources_source_url_key
  ON government_sources(source_url);

CREATE INDEX IF NOT EXISTS government_sources_level_state_idx
  ON government_sources(government_level, state);
CREATE INDEX IF NOT EXISTS government_sources_research_status_idx
  ON government_sources(research_status);
