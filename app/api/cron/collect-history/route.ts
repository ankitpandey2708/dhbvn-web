// Cron trigger: collect outage history for all 12 districts.
// Called from an external cron service (e.g. cron-job.org every 15 min).
// No auth needed — data is public, dedup makes it safe, and the endpoint
// only writes to an append-only table via ON CONFLICT DO NOTHING.

import { NextResponse } from 'next/server';
import { collectAllDistrictsHistory } from '@/lib/database/collect-history';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results = await collectAllDistrictsHistory();

  const totalFetched = results.reduce((s, r) => s + r.rowsFetched, 0);
  const totalInserted = results.reduce((s, r) => s + r.rowsInserted, 0);
  const errors = results.filter(r => r.error);

  return NextResponse.json({
    success: errors.length === 0,
    timestamp: new Date().toISOString(),
    summary: {
      districts: results.length,
      rowsFetched: totalFetched,
      rowsInserted: totalInserted,
      errors: errors.length,
    },
    details: results,
  });
}
