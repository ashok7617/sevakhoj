# SevaKhoj — Deployment & Operations Runbook

Practical reference for running **SevaKhoj** (सेवा खोज) in production. Written
2026-08-10. Keep this up to date when the hosting, domain, or auth setup changes.

- **Live site:** https://sevakhoj.com
- **Repo:** https://github.com/ashok7617/sevakhoj (public, MIT)
- **Admin dashboard:** https://sevakhoj.com/admin (password-protected — see [Admin lock](#admin-lock))

---

## 1. Architecture at a glance

| Layer | Choice | Notes |
|-------|--------|-------|
| App framework | **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind v4 | React 19.2 |
| Hosting | **Vercel** | Auto-deploys on every push to `main` |
| Database | **Neon** serverless Postgres + PostGIS | Transaction pooler connection |
| ORM / driver | Drizzle ORM + `postgres.js` | `prepare: false` required for the pooler |
| AI (optional) | Anthropic SDK (Claude) — Care Finder | Falls back to a free rule-based extractor with **no** API key |

### Why these settings exist (don't "fix" them blindly)
- `src/db/index.ts` uses `postgres(url, { max: <3 in prod>, prepare: false })`.
  **`prepare: false` is mandatory** on Neon's transaction pooler — prepared
  statements break there. Do not remove it.
- Every query in `src/lib/queries.ts` is wrapped in `safe()` so the site renders
  a "DB not connected" notice instead of crashing if the DB is unreachable.

---

## 2. Deploy workflow

Deployment is **git-push-based** — there is no manual deploy step.

```bash
git add -A
git commit -m "your message"
git push          # → Vercel builds & deploys the new commit to production
```

- Vercel is connected to the GitHub repo; a push to `main` = a production deploy.
- A deploy takes ~1–2 minutes. Watch it in the Vercel dashboard → Deployments.
- Before pushing, always run locally:
  ```bash
  npm run lint && npm run build
  ```

### Verify a deploy is live
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://sevakhoj.com/          # expect 200
```

---

## 3. Domain & DNS

- **Registrar:** Mochahost (where sevakhoj.com was purchased).
- **DNS is managed by Vercel** — the domain's *nameservers* are delegated to
  Vercel: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`.
- Because nameservers point to Vercel, **DNS records edited at Mochahost are
  ignored.** Manage records in Vercel, not in Mochahost's zone editor.

### Nameserver hygiene (one-time cleanup)
The registrar briefly listed **four** nameservers (two Vercel + two Mochahost).
Keep only the two Vercel ones:
```
ns1.vercel-dns.com   ✅ keep
ns2.vercel-dns.com   ✅ keep
ns31.mochahost.com   ❌ remove
ns32.mochahost.com   ❌ remove
```
Mixed nameservers cause intermittent resolution. Fix in Mochahost's
**domain / nameserver settings** (not the DNS records page).

### The `www` subdomain (must be added separately in Vercel)
On Vercel, `www.sevakhoj.com` is a **separate domain** from the apex — adding
`sevakhoj.com` does **not** auto-cover `www`. If `https://www.sevakhoj.com`
fails with *"no certificate subject name matches www.sevakhoj.com"*:
1. Vercel → Domains → **Add** `www.sevakhoj.com` (this is what makes Vercel
   issue a Let's Encrypt cert covering `www` — a few minutes).

> Renewing the *apex* cert does NOT fix `www` — `www` needs its own domain entry.

### `www` → apex redirect (done in code, not the dashboard)
Once `www` has a cert, it's canonicalized to the apex via a **host-based
redirect in `next.config.ts`** (not the Vercel dashboard redirect option), so
the choice is version-controlled:

```ts
async redirects() {
  return [
    {
      source: "/:path*",
      has: [{ type: "host", value: "www.sevakhoj.com" }],
      destination: "https://sevakhoj.com/:path*",
      permanent: true, // 308
    },
  ];
}
```

Result: `www.sevakhoj.com/<path>` → **308** → `sevakhoj.com/<path>` (path
preserved). `sevakhoj.com` is the single canonical host. To flip the canonical
host to `www` instead, invert the `has` host value and the destination.

### Diagnostic commands
```bash
# What nameservers are delegated?
whois sevakhoj.com | grep -i "Name Server:"

# Does apex / www resolve, and to Vercel?
dig +short sevakhoj.com A
dig +short www.sevakhoj.com

# What names does the served certificate actually cover? (look for www in SAN)
echo | openssl s_client -servername sevakhoj.com -connect sevakhoj.com:443 2>/dev/null \
  | openssl x509 -noout -subject -ext subjectAltName

# CAA must allow Let's Encrypt (or be absent) for certs to issue
dig +short sevakhoj.com CAA
```

---

## 4. Admin lock

`/admin` is protected with HTTP Basic Auth so the public site stays open while
the admin dashboard stays private.

- **File:** `src/proxy.ts` (Next 16 renamed the old `middleware` convention to
  `proxy`; using the old name only produces a deprecation warning).
- **Scope:** matcher `["/admin", "/admin/:path*"]` — ONLY `/admin` and pages
  beneath it. Every public page is unaffected (returns 200, no prompt).
- **Gate:** env var `ADMIN_PASSWORD` (and optional `ADMIN_USER`, default `admin`).
- **Behavior when `ADMIN_PASSWORD` is unset:**
  - production → **deny (503, fail-closed)** so an unconfigured deploy can't leak
  - development → allow (local `npm run dev` admin stays frictionless)

### There is intentionally NO "Admin" link in the site header
It was removed on 2026-08-10 because it popped the login prompt for ordinary
visitors. Admins reach the dashboard by typing `sevakhoj.com/admin` directly.

### Verify the lock
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://sevakhoj.com/admin           # 401 (locked)
curl -s -o /dev/null -w "%{http_code}\n" -u admin:WRONG https://sevakhoj.com/admin   # 401 (rejects bad creds)
# correct password → 200 (test in a browser or with your real password)
```

### Change / set the admin password
Vercel → project → Settings → Environment Variables → set `ADMIN_PASSWORD`
(Production) → **Redeploy** for it to take effect.

> This is a single shared password — fine for a solo/small-team admin. For
> multiple admins or roles, replace it with a real auth system (e.g. NextAuth).

---

## 5. Environment variables

| Variable | Where | Required? | Purpose |
|----------|-------|-----------|---------|
| `DATABASE_URL` | Vercel (Production) + local `.env.local` | **Yes** | Neon Postgres connection string. Use the **pooled** connection string for the app. |
| `ADMIN_PASSWORD` | Vercel (Production) | **Yes in prod** | Unlocks `/admin`. Unset ⇒ 503 in prod. |
| `ADMIN_USER` | Vercel | No | Admin username (default `admin`). |
| `ANTHROPIC_API_KEY` | Vercel / local | No | Enables the LLM path of the Care Finder. Unset ⇒ free rule-based fallback (recommended default; keeps care queries on-server, zero cost). |
| `NEXT_PUBLIC_MAPBOX_TOKEN` / `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | — | No | Not used; the map runs on free OpenStreetMap/Leaflet. |

See `.env.example` for the annotated template. **Never commit real secrets** —
set them in the Vercel dashboard and in a local, git-ignored `.env.local`.

### Two Neon connection strings
Neon gives a **pooled** and a **direct** string:
- **App runtime (`DATABASE_URL` in Vercel):** the **pooled** string.
- **Migrations / seed scripts:** the **direct** (non-pooled) string works best.
  All migration/seed scripts use `postgres(url, { max: 1, prepare: false })`.

To safely print a connection string without leaking the password:
```bash
echo "$DATABASE_URL" | sed -E 's#://[^:]+:[^@]+@#://USER:PASS@#'
```

---

## 6. Public vs. protected routes

| Route | Access | What it is |
|-------|--------|------------|
| `/` | Public | Home + care journeys |
| `/finder` | Public | AI Care Finder (English / हिंदी / Hinglish) |
| `/near` | Public | PostGIS "near me" Leaflet map |
| `/care-centers`, `/care-centers/[id]` | Public | Facility listings + detail |
| `/schemes` | Public | Government schemes |
| `/register` | Public | "Add a Center" self-registration |
| `/data-sources` | **Public** | Government Data Source Master Matrix (moved here from `/admin/sources` on 2026-08-10) |
| `/for-organizations` | Public | Info for orgs |
| `/admin`, `/admin/verify` | **Protected** | Verification dashboard (Basic Auth) |

> `/admin/sources` no longer exists — the matrix is public at `/data-sources`.

---

## 7. Database operations

Run locally against the Neon DB (with `DATABASE_URL` set in `.env.local`):

```bash
npm run db:setup          # migrate + seed taxonomy/sources/schemes (idempotent)
npm run db:migrate        # apply migrations/*.sql only
npm run db:seed           # taxonomy + scheme samples (no fake facilities)
npm run db:import-sources # upsert the govt source matrix into the DB
npm run db:seed-starter   # load the 9 real, needs_verification senior-care orgs
npm run matrix:csv        # export the source matrix to CSV
npm run test:finder       # 27 Care Finder checks (English + Hindi/Hinglish)
```

- **Authoritative DDL is `migrations/*.sql`** (enables PostGIS, the trigger that
  derives `location` from lat/long, and full-text indexes). `src/db/schema.ts`
  mirrors it for typed queries — keep both in sync.
- Real facilities come from `/register`, verified manual seeds, or RTI replies —
  **never bulk web scraping** (see `docs/rti/` and the data-sourcing decision in
  project memory). Data is never shown as "government_verified" without an
  official source.

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `https://www.sevakhoj.com` TLS error | `www` not added as its own Vercel domain | Add `www.sevakhoj.com` in Vercel so it gets a cert (§3); the apex redirect is already handled in `next.config.ts` |
| `/admin` returns **503** | `ADMIN_PASSWORD` not set in prod | Set it in Vercel → redeploy (§4) |
| A public page unexpectedly asks to log in | A link points into `/admin/*` | Repoint it to a public route (this is how `/data-sources` was fixed) |
| Site shows "Database not connected" | `DATABASE_URL` wrong/unset, or Neon asleep | Check the Vercel env var; confirm the **pooled** string + `sslmode=require` |
| Neon errors about prepared statements | `prepare: false` missing | Keep `prepare: false` in `src/db/index.ts` (§1) |
| DNS resolves intermittently | Mixed nameservers (Vercel + Mochahost) | Remove the Mochahost nameservers (§3) |
| Build fails on push | Lint/type error | Run `npm run lint && npm run build` locally first |

---

## 9. Guardrails (product invariants — do not break)

From the project brief (`memory.md`). These are non-negotiable:
- **Never overwrite original government data.** Raw records land verbatim in
  `source_records` and are never mutated.
- **Government registration ≠ endorsement of service quality.** The footer says
  so on every page; keep that disclaimer.
- **The AI must not invent** eligibility, benefits, or facility data. The LLM
  only parses a query into structured criteria; all answers come from the DB.
- **Free to use, no AI budget required.** The rule-based Care Finder must keep
  working with no `ANTHROPIC_API_KEY`.
- Show **verification badges** and attribute a source + last-verified date on
  every record.
