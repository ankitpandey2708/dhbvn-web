// Standalone outage-history collector — runs the same 12-district collection
// that GET /api/cron/collect-history performs, but from any Node process.
// Used by the GitHub Actions cron (.github/workflows/collect-history.yml) so
// the per-15-min XML fetching/parsing CPU never runs on Vercel itself.
//
// Required env: POSTGRES_URL (the same connection string Vercel uses).

import { collectAllDistrictsHistory } from '../lib/database/collect-history';

async function main() {
  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL is not set — cannot save outage history.');
    process.exit(1);
  }

  const results = await collectAllDistrictsHistory();

  const totalFetched = results.reduce((s, r) => s + r.rowsFetched, 0);
  const totalInserted = results.reduce((s, r) => s + r.rowsInserted, 0);
  const failures = results.filter(r => r.error);

  console.log(JSON.stringify({
    success: failures.length === 0,
    timestamp: new Date().toISOString(),
    summary: {
      districts: results.length,
      rowsFetched: totalFetched,
      rowsInserted: totalInserted,
      errors: failures.length,
    },
  }, null, 2));

  if (failures.length > 0) {
    console.error(JSON.stringify(failures, null, 2));
    process.exit(1);
  }
}

main();
