-- India Care & Support Platform — initial schema (authoritative DDL).
-- Enables PostGIS, creates enums/tables, and adds spatial (GIST) and
-- full-text (GIN) indexes. Mirrors src/db/schema.ts. Idempotent-ish:
-- guarded with IF NOT EXISTS where practical.

CREATE EXTENSION IF NOT EXISTS postgis;

-- ---------------------------------------------------------------- enums
DO $$ BEGIN
  CREATE TYPE government_level AS ENUM ('central','state','ut','district','local');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM
    ('government_verified','registration_verified','phone_verified','user_submitted','needs_verification');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE gender_served AS ENUM ('male','female','all','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cost_type AS ENUM ('free','subsidized','paid','mixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE entity_type AS ENUM ('organization','facility','scheme');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------- taxonomy
CREATE TABLE IF NOT EXISTS care_categories (
  id          serial PRIMARY KEY,
  slug        varchar(128) NOT NULL UNIQUE,
  name        text NOT NULL,
  group_slug  varchar(64) NOT NULL,
  group_name  text NOT NULL,
  description text,
  sort_order  integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS scheme_categories (
  id         serial PRIMARY KEY,
  slug       varchar(128) NOT NULL UNIQUE,
  name       text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

-- --------------------------------------------------------- govt sources
CREATE TABLE IF NOT EXISTS government_sources (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  government_level       government_level NOT NULL,
  ministry               text,
  department             text,
  state                  text,
  source_name            text NOT NULL,
  source_url             text NOT NULL,
  api_url                text,
  data_format            text,
  license_or_reuse_notes text,
  update_frequency       text,
  last_checked           timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS source_records (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id           uuid NOT NULL REFERENCES government_sources(id),
  entity_type         entity_type NOT NULL,
  source_record_id    text,
  raw                 jsonb NOT NULL,
  retrieved_at        timestamptz NOT NULL DEFAULT now(),
  source_last_updated date,
  mapped_entity_id    uuid
);
CREATE INDEX IF NOT EXISTS source_records_source_idx ON source_records(source_id);
CREATE INDEX IF NOT EXISTS source_records_entity_idx ON source_records(entity_type, mapped_entity_id);

-- --------------------------------------------------------- organizations
CREATE TABLE IF NOT EXISTS organizations (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   text NOT NULL,
  organization_type      text,
  legal_structure        text,
  registration_number    text,
  registration_authority text,
  website                text,
  phone                  text,
  email                  text,
  address                text,
  state                  text,
  district               text,
  city                   text,
  pincode                varchar(10),
  latitude               double precision,
  longitude              double precision,
  location               geometry(Point, 4326),
  verification_status    verification_status NOT NULL DEFAULT 'needs_verification',
  last_verified          timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS organizations_state_district_idx ON organizations(state, district);
CREATE INDEX IF NOT EXISTS organizations_location_idx ON organizations USING gist(location);

-- ------------------------------------------------------------- facilities
CREATE TABLE IF NOT EXISTS facilities (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id         uuid REFERENCES organizations(id),
  name                    text NOT NULL,
  facility_type           text,
  care_category_id        integer REFERENCES care_categories(id),
  category                text,
  sub_category            text,
  gender                  gender_served NOT NULL DEFAULT 'all',
  age_group               text,
  age_min                 integer,
  age_max                 integer,
  capacity                integer,
  current_occupancy       integer,
  fees_inr                integer,
  cost_type               cost_type,
  services                jsonb DEFAULT '[]'::jsonb,
  medical_services        boolean DEFAULT false,
  residential             boolean DEFAULT false,
  government_registration text,
  phone                   text,
  email                   text,
  address                 text,
  state                   text,
  district                text,
  city                    text,
  pincode                 varchar(10),
  latitude                double precision,
  longitude               double precision,
  location                geometry(Point, 4326),
  verification_status     verification_status NOT NULL DEFAULT 'needs_verification',
  last_verified           timestamptz,
  official_source_url     text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  search_tsv tsvector GENERATED ALWAYS AS (
    to_tsvector('simple',
      coalesce(name,'') || ' ' || coalesce(facility_type,'') || ' ' ||
      coalesce(category,'') || ' ' || coalesce(sub_category,'') || ' ' ||
      coalesce(city,'') || ' ' || coalesce(district,'') || ' ' || coalesce(state,''))
  ) STORED
);
CREATE INDEX IF NOT EXISTS facilities_state_district_idx ON facilities(state, district);
CREATE INDEX IF NOT EXISTS facilities_category_idx ON facilities(care_category_id);
CREATE INDEX IF NOT EXISTS facilities_location_idx ON facilities USING gist(location);
CREATE INDEX IF NOT EXISTS facilities_search_idx ON facilities USING gin(search_tsv);

-- -------------------------------------------------------- govt schemes
CREATE TABLE IF NOT EXISTS government_schemes (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_name          text NOT NULL,
  scheme_code          text,
  government_level     government_level NOT NULL,
  ministry             text,
  department           text,
  state                text,
  district             text,
  beneficiary_category text,
  scheme_category_id   integer REFERENCES scheme_categories(id),
  eligibility          text,
  income_limit_inr     integer,
  age_min              integer,
  age_max              integer,
  benefits             text,
  documents_required   jsonb DEFAULT '[]'::jsonb,
  application_process  text,
  application_url      text,
  official_source_url  text,
  source_id            uuid REFERENCES government_sources(id),
  source_record_id     text,
  source_last_updated  date,
  verified_date        date,
  verification_status  verification_status NOT NULL DEFAULT 'needs_verification',
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  search_tsv tsvector GENERATED ALWAYS AS (
    to_tsvector('simple',
      coalesce(scheme_name,'') || ' ' || coalesce(beneficiary_category,'') || ' ' ||
      coalesce(benefits,'') || ' ' || coalesce(eligibility,'') || ' ' ||
      coalesce(ministry,'') || ' ' || coalesce(department,'') || ' ' || coalesce(state,''))
  ) STORED
);
CREATE INDEX IF NOT EXISTS schemes_level_state_idx ON government_schemes(government_level, state);
CREATE INDEX IF NOT EXISTS schemes_category_idx ON government_schemes(scheme_category_id);
CREATE INDEX IF NOT EXISTS schemes_search_idx ON government_schemes USING gin(search_tsv);

-- ------------------------------------------------------- verifications
CREATE TABLE IF NOT EXISTS verifications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type       entity_type NOT NULL,
  entity_id         uuid NOT NULL,
  verification_type text NOT NULL,
  source            text,
  verified_by       text,
  verification_date timestamptz NOT NULL DEFAULT now(),
  expiry_date       date,
  evidence          jsonb,
  status            verification_status NOT NULL
);
CREATE INDEX IF NOT EXISTS verifications_entity_idx ON verifications(entity_type, entity_id);

-- ---------------------------------------- keep PostGIS location in sync
-- Derives `location` from latitude/longitude on write, so callers only set
-- lat/long. Applies to organizations and facilities.
CREATE OR REPLACE FUNCTION set_location_from_latlng() RETURNS trigger AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  ELSE
    NEW.location := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_org_location ON organizations;
CREATE TRIGGER trg_org_location BEFORE INSERT OR UPDATE OF latitude, longitude
  ON organizations FOR EACH ROW EXECUTE FUNCTION set_location_from_latlng();

DROP TRIGGER IF EXISTS trg_fac_location ON facilities;
CREATE TRIGGER trg_fac_location BEFORE INSERT OR UPDATE OF latitude, longitude
  ON facilities FOR EACH ROW EXECUTE FUNCTION set_location_from_latlng();
