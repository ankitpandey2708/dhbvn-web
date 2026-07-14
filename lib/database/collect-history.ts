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
export async function collectDistrictHistory(
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
 * Districts are processed concurrently (Promise.allSettled).
 * Never throws — individual district errors are captured per result.
 */
export async function collectAllDistrictsHistory(): Promise<CollectionResult[]> {
  const results = await Promise.allSettled(
    DISTRICTS.map(d => collectDistrictHistory(d.id, d.name)),
  );

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return {
      districtId: DISTRICTS[i].id,
      districtName: DISTRICTS[i].name,
      rowsFetched: 0,
      rowsInserted: 0,
      error: r.reason instanceof Error ? r.reason.message : String(r.reason),
    };
  });
}
