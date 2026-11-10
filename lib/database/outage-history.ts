// Append-only outage history for ML / analytics.
// Each row is deduped by (district_id, feeder, start_time) via unique index.

import type { DHBVNData } from '../dhbvn-api';
import { db } from './db';
import { outageHistory } from './schema';

/**
 * Save a batch of raw outage rows to the history table using a single
 * multi-row INSERT. Dedup is handled by the unique index on
 * (district_id, feeder, start_time).
 *
 * Returns the number of rows actually inserted (skipped duplicates excluded).
 *
 * This function should NEVER throw — callers wrap it in fire-and-forget.
 */
export async function saveOutageBatch(
  districtId: number,
  rows: DHBVNData[]
): Promise<number> {
  if (rows.length === 0) return 0;
  if (!db) return 0;

  try {
    const inserted = await db.insert(outageHistory)
      .values(
        rows.map(row => ({
          districtId,
          feeder: row.feeder,
          startTime: row.start_time,
          restorationTime: row.restoration_time,
          reason: row.reason,
        }))
      )
      .onConflictDoNothing()
      .returning({ insertedId: outageHistory.id });

    return inserted.length;
  } catch (error) {
    console.error(`Failed to insert outage batch (${rows.length} rows, district ${districtId}):`, error);
    return 0;
  }
}
