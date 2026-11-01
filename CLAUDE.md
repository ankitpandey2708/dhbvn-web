# CLAUDE.md

## Deployment

### Primary: Vercel (paused)
- **URL:** https://dhbvn.vercel.app — **PAUSED** since Oct 30, 2026 (Fluid Active CPU exceeded Hobby fair-use). Auto-resumes **Nov 29, 2026**.
- To cut usage, the 15-min history cron runs on GitHub Actions (see History Collection below) and user-driven history saves are throttled.

### Temporary mirror: Cloudflare Workers (while Vercel is paused)
- **URL:** https://dhbvn.ankitpandey2708.workers.dev — served by the `dhbvn` Worker.
- **Setup:** `@opennextjs/cloudflare` adapter; `wrangler.jsonc` + `open-next.config.ts` (OpenNext). Postgres (`POSTGRES_URL` secret on the Worker, same Neon DB) works directly — no Hyperdrive needed.
- **Deploy changes:** `npx opennextjs-cloudflare build && npx wrangler deploy`
- **Retire** once Vercel resumes on Nov 29, 2026 (or repoint a real domain instead).

## Data Sources

The app combines two independent data sources to show the full picture.

### 1. Live Outage Feed — "Who is affected right now?"
- **Source:** DHBVN website (live scrape)
- **Route:** `/api/dhbvn?district=X`
- **Frequency:** On page load, on district change, then every 5 minutes
- **Output:** Feeders currently down with areas, start time, restoration time, reason

### 2. Feeder Catalog (CIN) — "What feeders exist in this district?"
- **Source:** DHBVN's CIN PDFs — one per circle
- **Script:** `scripts/parse-cin-pdfs.py` — downloads all 11 circle PDFs, extracts feeder names
- **Frequency:** GitHub Actions weekly cron (Monday 2am UTC) or manual trigger
- **Output:** `public/data/feeders/{circle}.json` committed to repo

### 3. District Config — "Which district maps to which circle?"
- **Source:** `public/data/districts.json` — manually maintained, single source of truth
- **Consumed by:** `lib/telegram/subscriptions.ts` → `DISTRICTS[]`
- **Changes:** Only when DHBVN restructures circles (rare)

### How They Combine

```
CIN catalog (all feeders in district)
        +
Live feed (feeders currently down)
        =
Show all feeders, highlight the ones that are down
Feeders in live feed but not in catalog → "Others" bucket
```

### Staleness Profile

| Source | Changes how often | Action needed |
|--------|-------------------|---------------|
| Live feed | Every few minutes | Automatic (5-min poll) |
| CIN catalog | Weekly | GH Actions cron (unverified — see Feeder Catalog note above) |
| District config | Rarely | Manual edit in `districts.json` |

---

## Live Feed Cleaning Pipeline

The raw upstream API is cleaned **server-side** in `lib/dhbvn-api.ts` (`fetchDHBVNOutages()`) **before** `GET /api/dhbvn?district={id}` responds.

```
DHBVN XML API  ──►  fetchDHBVNOutages()  ──►  /api/dhbvn  ──►  Client
   (raw)              (cleaning steps)         (clean JSON)
```

### Cleaning Steps (in order)

1. **XML Parsing** — upstream returns base64-encoded XML; decoded and parsed via `fast-xml-parser` (`xmlParser.parse(xmlData)`, repeated tags forced to arrays).

Additional server-side caching applied on top of the pipeline:
- **Raw-rows cache** — `fetchAllDHBVNRawRows()` returns a per-instance 60s cached result with in-flight dedupe, so concurrent/rapid requests for the same district share one DHBVN fetch + parse.
- **History count cache** — `/api/dhbvn/history` reuses a per-instance 60s cached `count(*)` per (district, search) combination instead of re-scanning the append-only table on every page view.
2. **Invalid Structure Check** — throws if `result?.RESULT?.RESULTS?.[0]` is missing, rather than returning malformed data.
3. **Null/Missing Field Filtering** — drops rows missing any of `FEEDER`, `START_TIME`, `EXPECTED_RESTORATION_TIME`. Optional fields `AREA` and `ADDRESS` (reason) default to `''` if missing.
4. **Active Outage Filtering** — parses `restoration_time` (`"16-Apr-2025 10:24:00"`) as IST (UTC+5:30), converts to UTC, keeps only outages with a **future** restoration time. Upstream returns both active and historical entries; this drops the historical ones.
5. **Grouping by feeder** — rows are grouped by normalized feeder name (trimmed, collapsed whitespace, uppercased); each unique area is collected into that feeder's `areas[]`. One output object per feeder.
6. **Sorting** — alphabetically by `feeder`.

### What is NOT cleaned server-side

Applied client-side **after** `/api/dhbvn` returns — UI-only, no effect on the API response:

1. **Search/global filter** — by `area` or `feeder` match
2. **Urgency filter** — groups by time remaining (`major` / `moderate` / `minor`)
3. **PDF generation** — export formatting

### History Collection (dual-path — live + cron)

Every API call to `/api/dhbvn` saves **all raw rows** (including expired) to the `outage_history` Postgres table in the background. Additionally, a **GitHub Actions cron** (`.github/workflows/collect-history.yml`, every 15 min) runs `scripts/collect-history.ts` (`npx tsx`) to collect data from **all 12 districts** — ensuring continuous coverage even when no users are on the dashboard, while keeping this recurring CPU off Vercel. `GET /api/cron/collect-history` exists only as a manual/fallback trigger.

```
                  ┌── user request ──►  /api/dhbvn?district=X
                  │                         │
                  │                         ├─► collectDistrictHistoryThrottled()  (fire-and-forget, 10-min per-instance backoff)
                  │                         ├─► filterActiveOutages()
                  │                         └─► response (unchanged latency)
                  │
DHBVN API ───────┤
                  │
                  └── GitHub Actions cron ──►  npx tsx scripts/collect-history.ts
                                                  └─► collectAllDistrictsHistory()
                                                        ├─► district 1  ──► fetchAllDHBVNRawRows() → saveOutageBatch()
                                                        ├─► district 2  ──► ...
                                                        └─► ... up to 12 districts (batches of 3)
```

- **Single fetch:** The DHBVN XML is fetched once per district per call; the result is shared between the DB save and the UI response.
- **User-request backoff:** `collectDistrictHistoryThrottled()` (10-min in-memory, per-instance) skips the fire-and-forget save when the cron path already covered that district — the dedup index makes any overlap harmless.
- **Dedup:** Unique index on `(district_id, feeder, start_time)` — same outage seen across polls is not duplicated.
- **Retention:** No TTL — append-only, kept forever for ML/analytics.
- **Failure-safe:** DB errors are logged but never affect the API response.
- **Shared logic:** `lib/database/collect-history.ts` centralizes collection — reused by both the live route and the cron endpoint.

### Output Schema (`DHBVNData`)

```ts
interface DHBVNData {
    feeder: string;            // Feeder identifier (normalized: trimmed, uppercased)
    areas: string[];           // Affected locality/area names for this feeder
    start_time: string;        // Outage start time (IST)
    restoration_time: string;  // Expected restoration time (IST)
    reason: string;            // Reason for outage (from ADDRESS field, trimmed)
}
```

---

## District → Circle Mapping

Source of truth: `public/data/districts.json`

### Convention

Each district entry has an optional `circles` field:

| `circles` value | Meaning |
|---|---|
| absent | Circle name = district name. One circle, one feeder file. |
| `["Name1", "Name2"]` | Explicit circle names — used when district ≠ circle name, or district spans multiple circles. |
| `null` | No CIN catalog exists for this district. Browse tab shows "not available". |

### Current Exceptions

| District | circles value | Why |
|---|---|---|
| Mahendargarh | `["Narnaul"]` | DHBVN named the circle after Narnaul city, not the district |
| Gurugram | `["Gurugram-I", "Gurugram-2"]` | District is split across two circles |
| Nuh | `null` | No CIN data published by DHBVN |
| Charkhi Dadri | `null` | No CIN data published by DHBVN |

### How Circle Name Maps to Files

**Feeder JSON:** `/public/data/feeders/{circle.toLowerCase()}.json`
- `Faridabad` → `feeders/faridabad.json`
- `Gurugram-I` → `feeders/gurugram-i.json`

**PDF download** (in `scripts/parse-cin-pdfs.py` via `circle_to_pdf()`):
- Default: `{name}_Circle_CIN.pdf`
- `Gurugram-1` → `Gurugram1_Circle_CIN.pdf` (drops hyphen)
- `Gurugram-2` → `Gurugram2_Circle_CIN.pdf` (drops hyphen)

### How to Update

**Rename a circle** (e.g. DHBVN renames "Narnaul" to "Mahendargarh"):
1. Update `circles` value in `public/data/districts.json`
2. Rename the feeder JSON file in `public/data/feeders/`
3. Re-run GH Actions workflow to regenerate with new name

**Add a new district/circle:**
1. Add entry to `public/data/districts.json`
2. Trigger GH Actions workflow — new feeder JSON is created automatically

**Fix a non-standard PDF filename:**
Update `circle_to_pdf()` in `scripts/parse-cin-pdfs.py`.
