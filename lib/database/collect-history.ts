// Shared history collection — fetches raw rows for one or all districts
// and saves them to the outage_history table. Used by both the cron endpoint
// and the live API route (when a real user triggers a fetch).

import { fetchAllDHBVNRawRows } from '@/lib/dhbvn-api';
import { saveOutageBatch } from '@/lib/database/outage-history';
import { DISTRICTS } from '@/lib/district';

interface CollectionResult {
  districtId: number;
  districtName: string;
  rowsFetched: number;
  rowsInserted: number;
  error?: string;
}

/**
 * Fetch raw outage rows from DHBVN for a single district and save to history.
 * Returns how many rows were fetched and how many were newly inserted.
 * Never throws — errors are returned in the result object.
 */
async function collectDistrictHistory(
  districtId: number,
  districtName?: string,
  prefetchedRows?: Awaited<ReturnType<typeof fetchAllDHBVNRawRows>>,
): Promise<CollectionResult> {
  const name = districtName ?? `district-${districtId}`;
  try {
    const rows = prefetchedRows ?? await fetchAllDHBVNRawRows(String(districtId));
    const inserted = await saveOutageBatch(districtId, rows);
    return { districtId, districtName: name, rowsFetched: rows.length, rowsInserted: inserted };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { districtId, districtName: name, rowsFetched: 0, rowsInserted: 0, error: msg };
  }
}

/**
 * Fetch raw outage rows from DHBVN for ALL 12 districts and save to history.
 * Districts are processed in small sequential batches instead of all 12 at
 * once, so CPU-heavy XML parsing doesn't all land in the same milliseconds
 * (Fluid Active CPU bills CPU-seconds; flat spikes are what gets throttled).
 * Never throws — individual district errors are captured per result.
 */
const CONCURRENCY = 3;

export async function collectAllDistrictsHistory(): Promise<CollectionResult[]> {
  const results: CollectionResult[] = [];

  for (let i = 0; i < DISTRICTS.length; i += CONCURRENCY) {
    const batch = DISTRICTS.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map(d => collectDistrictHistory(d.id, d.name)),
    );

    results.push(
      ...batchResults.map((r, j) => {
        if (r.status === 'fulfilled') return r.value;
        const d = batch[j];
        return {
          districtId: d.id,
          districtName: d.name,
          rowsFetched: 0,
          rowsInserted: 0,
          error: r.reason instanceof Error ? r.reason.message : String(r.reason),
        };
      }),
    );
  }

  return results;
}

// ── In-memory throttle for user-request-driven collection ──
// The cron path keeps history fresh every interval; a save on EVERY user
// poll is almost always redundant. This per-instance map skips a save if the
// same district was collected recently on this instance. It is best-effort
// (resets on cold start, isn't shared across instances) — the dedup index on
// (district_id, feeder, start_time) makes any overlap harmless.
const lastCollectAt = new Map<number, number>();
const COLLECT_THROTTLE_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Like collectDistrictHistory(), but skips the DB save if this instance
 * already collected that district within COLLECT_THROTTLE_MS. The max
 * staleness window equals the cron cadence, so no real gaps are introduced.
 */
export async function collectDistrictHistoryThrottled(
  districtId: number,
  districtName?: string,
  prefetchedRows?: Awaited<ReturnType<typeof fetchAllDHBVNRawRows>>,
): Promise<CollectionResult | undefined> {
  const now = Date.now();
  if (now - (lastCollectAt.get(districtId) ?? 0) < COLLECT_THROTTLE_MS) {
    return undefined; // skipped — nothing collected
  }
  // Reserve the slot before awaiting so concurrent polls don't double-save.
  lastCollectAt.set(districtId, now);
  return collectDistrictHistory(districtId, districtName, prefetchedRows);
}
