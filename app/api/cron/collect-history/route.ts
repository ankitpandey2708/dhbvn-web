// Collect outage history for all 12 districts.
// PRIMARY path is the GitHub Actions workflow (.github/workflows/collect-history.yml)
// every 15 min, which keeps this CPU off Vercel entirely. This endpoint only
// serves as a manual/fallback trigger.
//
// Auth: requires `Authorization: Bearer <CRON_SECRET>` (the header Vercel Cron
// sends automatically). Each call fetches + parses all 12 districts and writes
// to Postgres, so leaving it open let anyone burn Active CPU. If CRON_SECRET
// is unset, the endpoint is disabled.
//   curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/collect-history

import { NextResponse } from 'next/server';
import { collectAllDistrictsHistory } from '@/lib/database/collect-history';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
