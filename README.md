# SevaKhoj · सेवा खोज

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live](https://img.shields.io/badge/Live-sevakhoj.com-brightgreen.svg)](https://sevakhoj.com)

**Live at [sevakhoj.com](https://sevakhoj.com).** Running it or deploying your own? See the [Deployment & Operations runbook](docs/DEPLOYMENT.md).

_Domain: **SevaKhoj.com**. "Seva" (service/care) + "Khoj" (search) — a care search. (Formerly the working name "India Care & Support Platform".)_

A trusted, India-wide platform to discover **care & support facilities** and
**government schemes** — for senior citizens, widows, children, and more —
built on standardized, **source-attributed** government data.

This is a **discovery** platform. It is **not** a government service, and
government registration is **not** an endorsement of service quality. See
[`memory.md`](memory.md) for the full product brief, roadmap, and principles.

![SevaKhoj — find care facilities and government schemes across India](docs/screenshots/home.png)

## Screenshots

**AI Care Finder** — a plain-language request (English, हिंदी, or Hinglish) is parsed into structured filters and answered from the database, with source attribution and preliminary-eligibility notes (try it live: `/finder?q=…`):

![SevaKhoj AI Care Finder](docs/screenshots/care-finder.png)

**Near Me** — PostGIS radius search rendered on a Leaflet / OpenStreetMap map:

![SevaKhoj Near Me map](docs/screenshots/near-map.png)

**Admin verification dashboard** — data-quality KPIs and a per-status breakdown; recording a decision writes to an audit trail. A "Government Verified" badge means a record matches an official source — never an endorsement of quality:

![SevaKhoj admin verification dashboard](docs/screenshots/admin-dashboard.png)

## Tech stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **PostgreSQL 16 + PostGIS** (geospatial "nearby" search)
- **Drizzle ORM** (typed queries) + hand-written SQL migrations (authoritative DDL)
- Python for data ingestion (Phase 2 — not in this scaffold yet)

## Project layout

```
migrations/            Authoritative SQL DDL (PostGIS, tables, triggers, FTS)
src/db/schema.ts       Drizzle schema mirroring the DDL (typed queries)
src/db/migrate.ts      Minimal SQL migration runner  (npm run db:migrate)
src/db/seed.ts         Taxonomy + SAMPLE UP records   (npm run db:seed)
src/data/governmentSourceMatrix.ts  Govt Data Source Master Matrix (source of truth)
pipeline/              Python ingestion pipeline for data.gov.in (see pipeline/README.md)
src/lib/queries.ts     Resilient data access (degrades gracefully w/o DB)
src/lib/badges.ts      Verification badge model (registration ≠ endorsement)
src/lib/groups.ts      Beneficiary group taxonomy for nav/landing
src/components/        Header, footer, cards, verification badge
src/app/               Home, /care-centers, /care-centers/[id], /schemes,
                       /for-organizations
```

## Getting started

### 1. Start Postgres + PostGIS

**With Docker (recommended):**

```bash
docker compose up -d
```

**Without Docker (macOS):** install [Postgres.app](https://postgresapp.com/)
with the PostGIS bundle, then create the database and role:

```bash
createdb india_care_setu
psql india_care_setu -c "CREATE ROLE care LOGIN PASSWORD 'care'; GRANT ALL ON DATABASE india_care_setu TO care;"
```

Connection string lives in `.env.local` (copy from `.env.example`):

```
DATABASE_URL="postgres://care:care@localhost:5432/india_care_setu"
```

### 2. Migrate + seed

```bash
npm run db:setup      # runs migrations, then seeds taxonomy + sample UP data
```

Or individually: `npm run db:migrate` and `npm run db:seed`.

### 3. Run the app

```bash
npm run dev
```

Open http://localhost:3000. The app runs even **without** a database — pages
show a "connect your database" notice instead of data.

## Scripts

| Script              | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Start the dev server                               |
| `npm run build`     | Production build                                   |
| `npm run db:migrate`| Apply `migrations/*.sql` once each (tracked)       |
| `npm run db:seed`   | Seed taxonomy + sample records (idempotent)        |
| `npm run db:setup`  | migrate + seed                                     |
| `npm run db:studio` | Browse data in Drizzle Studio                      |
| `npm run lint`      | ESLint                                             |

## Deployment

Hosted on **Vercel** (auto-deploys on push to `main`) with a **Neon** serverless
Postgres + PostGIS database. `/admin` is password-protected (HTTP Basic Auth via
`src/proxy.ts`, gated by the `ADMIN_PASSWORD` env var). Full details —
domain/DNS, environment variables, the admin lock, and troubleshooting — are in
the **[Deployment & Operations runbook](docs/DEPLOYMENT.md)**.

## Data model & core principles

- **Never overwrite original government data.** Raw records are preserved in
  `source_records`; standardized entities (`organizations`, `facilities`,
  `government_schemes`) link back via `source_id` + `source_record_id` for full
  traceability and change detection.
- **Verification badges** (`government_verified`, `registration_verified`,
  `phone_verified`, `user_submitted`, `needs_verification`) are visible on every
  record. Registration is never presented as a quality endorsement.
- **Sample seed data is marked `needs_verification`** and prefixed `[SAMPLE]` so
  it is never mistaken for verified official information.
- Every geocoded row auto-derives its PostGIS `location` from lat/long via a
  trigger, enabling GIST-indexed nearest-facility queries.

## Roadmap (from `memory.md`)

- **Phase 0** Research: Government Data Source Master Matrix ✅, taxonomy ✅, schema ✅
- **Phase 1** MVP: senior citizens · widows · children, pilot Uttar Pradesh + 1 state — search, maps, facility & scheme pages, admin/verification
- **Phase 2** Data engine: ingestion ✅ (data.gov.in; see `pipeline/`), + CSV/Excel/PDF, dedup, geocoding, change detection
- **Phase 3** India expansion (28 states + 8 UTs, more categories)
- **Phase 4** AI Care Finder (grounded, retrieval-only; must not invent eligibility)
- **Phase 5** Organization portal · **Phase 6** Mobile/PWA

## Data ingestion

The `pipeline/` directory holds a config-driven Python ETL for **data.gov.in**
(open GODL-India license). It preserves raw government records in
`source_records` and upserts standardized rows into `facilities` with full
source traceability. Preview with zero setup:

```bash
cd pipeline && python -m ingest run old_age_homes --fixture fixtures/old_age_homes_sample.json --dry-run
```

See [pipeline/README.md](pipeline/README.md) for full usage.

## Not yet built (next steps)

- Map view (Mapbox/Google) + PostGIS radius search endpoint
- CSV/Excel/PDF ingestion + change detection (extends `pipeline/`)
- Admin / verification dashboard
- AI Care Finder (natural-language → structured filters, grounded in records)
