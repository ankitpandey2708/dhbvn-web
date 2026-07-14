# Community Reported Outages — Feature Spec

## Problem

DHBVN's live feed only shows outages it has logged. If a feeder trips and DHBVN hasn't logged it yet, users see no outage — even when their power is out. In practice, DHBVN often never logs the outage at all.

## Solution

A parallel outage feed driven by user votes. When users find their feeder with no active DHBVN entry, they can vote "Still Out?". Enough votes creates a **Community Reported** entry — with its own start time, vote count, and freshness — independent of DHBVN.

---

## Data Model

```sql
community_votes
  id             SERIAL PRIMARY KEY
  feeder         TEXT NOT NULL          -- feeder name (catalog or "Others")
  district_id    INTEGER NOT NULL
  vote_type      TEXT NOT NULL          -- 'out' | 'restored'
  visitor_id     TEXT NOT NULL          -- FingerprintJS visitorId
  voted_at       TIMESTAMPTZ DEFAULT now()

  UNIQUE (visitor_id, feeder, district_id)  -- one vote per visitor per feeder (latest wins on conflict)

feeder_decay_config   -- materialized, refreshed daily by cron
  feeder         TEXT NOT NULL
  district_id    INTEGER NOT NULL
  decay_hours    NUMERIC NOT NULL       -- p75 outage duration from outage_history
  PRIMARY KEY (feeder, district_id)
```

### Decay Calculation

```sql
SELECT feeder, district_id,
  PERCENTILE_CONT(0.75) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (restoration_time - start_time)) / 3600
  ) AS decay_hours
FROM outage_history
WHERE restoration_time IS NOT NULL
GROUP BY feeder, district_id
```

**Fallback chain:** feeder p75 → district p75 → global p75. Refreshed daily.

---

## Vote Mechanics

| Rule | Detail |
|---|---|
| **Dedup** | FingerprintJS OSS `visitorId` — one active vote per browser per feeder. Lazy-loaded on first "Still Out?" click. |
| **Silent dedup** | Duplicate vote → `ON CONFLICT DO UPDATE voted_at = now()` — no error shown, just refreshes timestamp |
| **Threshold** | 1–2 votes: not shown publicly. 3+ votes: surfaced as Community Reported. |
| **Active window** | Only votes with `voted_at > now() - decay_hours` count toward active status |
| **Auto-close** | No new "Still Out" vote within `decay_hours` → outage auto-closes |
| **"Power Back"** | Weak signal — clears the voter's own "Still Out" vote. Supplements decay but does not replace it. |
| **"Others" feeders** | Voteable. Same mechanics. No catalog metadata but feeder name from live API is sufficient. |

---

## API

### `POST /api/votes`
```ts
body: {
  feeder: string
  districtId: number
  voteType: 'out' | 'restored'
  visitorId: string        // from FingerprintJS
}
response: { ok: true }
```

### `GET /api/votes/community?district={id}`
Returns active community-reported outages for a district (3+ votes, within decay window).

```ts
response: CommunityOutage[]

interface CommunityOutage {
  feeder: string
  districtId: number
  firstVotedAt: string     // ISO — used as community "start time"
  voteCount: number        // active votes only (within decay window)
  recentVoteAt: string     // most recent vote timestamp
  decayHours: number       // TTL for this feeder
}
```

---

## UI

### Unified feed — single list, no sections

DHBVN and community entries are interleaved in one feed, sorted by outage start time (newest first). No separate sections. Both are first-class.

Header count: `N outages · X DHBVN · Y community`

Source is indicated by an icon + label row above each feeder name:

| Entry type | Icon | Label color |
|---|---|---|
| DHBVN reported | 🏛️ | Red — `DHBVN Reported` |
| Community only | 👥 | Amber — `N community reports` |
| Merged | 🔗 | Purple — `Community → DHBVN Logged` |

### Entry anatomy

**DHBVN entry:**
```
🏛️ DHBVN Reported
SECTOR 15 FEEDER
Sector 15, Block A, Block B
[Since 10:30 AM]  Restoration 4:00 PM  Planned maintenance
```

**Community entry:**
```
👥 8 community reports
NIT FEEDER 3                              [Still Out?]
NIT Colony, Ajronda Chowk
[Since 11:45 AM]  Not logged by DHBVN
```

- "Still Out?" button on community entries only — right-aligned.
- After voting: button switches to `✓ You reported · Power Back`.
- Vote state persisted in `localStorage` as UX hint (not authoritative).

**Merged entry (DHBVN catches up):**
```
🔗 Community → DHBVN Logged
OLD FARIDABAD FEEDER
Old Faridabad, Suraj Kund Road
● Community reported   2:15 PM
● DHBVN logged         4:00 PM
● Restoration expected 6:00 PM
```

Timeline dots inside the card — amber for community, red for DHBVN, green for restoration. No vote button on merged entries.

### Vote count display

- Show: `N community reports` — active votes only (within decay window), not all-time count.
- Entries below threshold (1–2 votes) not shown in the feed.

---

## Identity — FingerprintJS OSS

- Package: `@fingerprintjs/fingerprintjs` (free, ~12kb)
- Lazy-loaded only when user clicks "Still Out?" — not on page load
- `visitorId` sent with every vote POST
- Does not survive incognito — acceptable for casual dedup
- Accuracy ~60% — sufficient; this is not fraud prevention

---

## Decay Config Cron

Daily job refreshes `feeder_decay_config` from `outage_history`. Fallback chain ensures every feeder always has a decay value.

```
Feeder history available     → feeder p75
No feeder history            → district p75
No district history either   → global p75
```

---

## What this delivers end-to-end

1. User's power is out, DHBVN hasn't logged it.
2. User finds their feeder in the Browse tab → clicks "Still Out?".
3. Others on the same feeder do the same.
4. At 3+ votes: feeder surfaces in **Community Reported** with first-vote time as start.
5. If DHBVN eventually logs it: merge shows full timeline.
6. If DHBVN never logs it: community outage auto-closes when votes decay past `decay_hours` with no renewal.

---

## Out of Scope

- Telegram integration
- Push notifications (no mechanism available)
- "Report missing feeder" (catalog already contains all known feeders)
- Auth / user accounts
