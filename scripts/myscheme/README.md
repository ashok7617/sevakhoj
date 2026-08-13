# myScheme ingest (SevaKhoj)

Pull authoritative, structured scheme data from the Government of India's
official portal **[myScheme](https://www.myscheme.gov.in/)** (Digital India
Corporation · MeitY) for SevaKhoj's care verticals — elderly, widows,
disability, workers, women — then reconcile it into our catalogue.

We deliberately do **not** mirror all 4,700+ schemes. myScheme already does
breadth officially; SevaKhoj's value is a curated care set **plus pre-filled
applications**. This pipeline keeps our existing entries accurate and expands
coverage where it matters.

## Why this is allowed

- **robots.txt** permits crawling (`Allow: /`, only `/404` disallowed).
- myScheme's **copyright policy**: *"Material featured on this platform may be
  reproduced free of charge"* — conditioned on **accurate reproduction +
  prominent attribution + non-misleading context**. Every record we keep stores
  its `sourceUrl` so the app attributes myScheme.
- The crawler drives a **real browser like a person would** — no API keys, no
  WAF evasion — and is rate-limited to be gentle on a government server.

## Run it

```bash
npm i                              # installs playwright (devDependency)
npx playwright install chromium    # one-time browser download
npm run myscheme:ingest            # crawl all keyword verticals (resumable)
npm run myscheme:normalize         # → scripts/myscheme/out/normalized.json
```

Ad-hoc single keyword:

```bash
node scripts/myscheme/ingest.mjs "old age pension"
```

## What you get

- `cache/schemes/<slug>.json` — one raw record per scheme (title, benefits,
  eligibility, application process, documents, sources, sourceUrl). Resumable:
  re-running skips slugs already cached. **git-ignored.**
- `out/normalized.json` — the same data shaped like `src/data/sampleSchemes.ts`,
  with `_hint_*` fields (state / group / level / apply URL) as **starting
  guesses only**. **git-ignored.**

## The human gate (important)

`normalize.mjs` never writes into `sampleSchemes.ts`. Per SevaKhoj's honesty
rule, a person reviews `out/normalized.json`, confirms the `_hint_*` fields, adds
an `id`, and pastes the keepers into `src/data/sampleSchemes.ts` — keeping
`sourceUrl` for attribution and `verificationStatus` honest. Then the usual
`npm run db:seed-schemes` (local + Neon) publishes them.

## Tuning

- Edit `keywords.mjs` to change which verticals / terms are crawled.
- Politeness/limits (`NAV_DELAY_MS`, `SCROLL_ROUNDS`, `PER_KEYWORD_CAP`) live at
  the top of `ingest.mjs`.
- Selectors are grounded in myScheme's current DOM (`#details`, `#benefits`,
  `#eligibility`, `#documents-required`, `#sources`, results as
  `a[href^="/schemes/"]`). If myScheme redesigns, adjust `extractScheme`.
