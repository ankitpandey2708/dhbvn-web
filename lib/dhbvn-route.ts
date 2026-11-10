// Shared GET handler for the live outage feed.
//   /api/dhbvn?district=X     → JSON
//   /api/dhbvn/md?district=X  → Markdown (proxy.ts rewrites `/api/dhbvn` here
//                               for `Accept: text/markdown`)
//
// Cost notes (Vercel Hobby was paused for Fluid Active CPU, Oct 2026):
// - No `Vary: accept`. It split the CDN cache per distinct Accept string, so
//   most requests missed and re-ran the DHBVN fetch + XML parse. JSON and
//   markdown live at different paths instead, so each has one cache key.
// - Unknown query params are redirected to the canonical URL, so cache-busting
//   strings (`?district=10&x=123`) can't force the expensive path.

import { NextResponse } from 'next/server';
import { fetchAllDHBVNRawRows, filterActiveOutages } from '@/lib/dhbvn-api';
import { collectDistrictHistoryThrottled } from '@/lib/database/collect-history';
import { getDistrictName } from '@/lib/district';

export type DhbvnFormat = 'json' | 'md';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
} as const;

// Errors/redirects are cheap but still invocations — cache them briefly so a
// bot hammering a bad URL is absorbed by the CDN.
const SHORT_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60',
} as const;

const PATHS: Record<DhbvnFormat, string> = { json: '/api/dhbvn', md: '/api/dhbvn/md' };

function markdownResponse(md: string, status: number, extra: Record<string, string> = {}) {
  return new NextResponse(md, {
    status,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'x-markdown-tokens': String(Math.ceil(md.length / 4)),
      ...extra,
    },
  });
}

export async function handleDhbvnGet(request: Request, format: DhbvnFormat) {
  const wantsMarkdown = format === 'md';
  try {
    const requestUrl = new URL(request.url);
    const { searchParams } = requestUrl;
    const district = searchParams.get('district') || '10';

    // ── Canonicalize: only `district` is allowed ─────────────────────────
    if ([...searchParams.keys()].some(k => k !== 'district')) {
      const canonical = new URL(PATHS[format], requestUrl.origin);
      canonical.searchParams.set('district', district);
      return NextResponse.redirect(canonical, { status: 308, headers: SHORT_CACHE_HEADERS });
    }

    // ── Validate district (must be integer 1-12) ──────────────────────────
    const districtId = Number(district);
    if (Number.isNaN(districtId) || !Number.isInteger(districtId) || districtId < 1 || districtId > 12) {
      const errMsg = `Invalid district parameter: "${district}". Must be an integer between 1 and 12.`;
      console.error(errMsg);
      if (wantsMarkdown) return markdownResponse(`# Error\n\n${errMsg}\n`, 400, SHORT_CACHE_HEADERS);
      return NextResponse.json({ error: errMsg }, { status: 400, headers: SHORT_CACHE_HEADERS });
    }

    // ── Fetch ALL raw rows (including expired) — used for both history and UI ──
    const allRows = await fetchAllDHBVNRawRows(district);

    // ── Fire-and-forget: save raw rows to history DB in background ──
    // Skipped when this instance recently collected the same district (10-min
    // throttle; cron keeps the DB fresh regardless). Error is logged, never blocks.
    collectDistrictHistoryThrottled(districtId, getDistrictName(districtId), allRows)
      .catch(err => console.error('Outage history save failed (non-blocking):', err));

    // ── Filter active outages for the response ──
    const data = filterActiveOutages(allRows);

    if (wantsMarkdown) {
      let md = `# Power Outages - District ${district}\n\n`;
      md += `*Generated: ${new Date().toISOString()}*\n\n`;

      if (data.length === 0) {
        md += 'No current outages reported.\n';
      } else {
        md += `**${data.length} active outage(s)**\n\n`;
        data.forEach((item, i) => {
          md += `### ${i + 1}. ${item.feeder}\n\n`;
          md += `| Field | Value |\n`;
          md += `|-------|-------|\n`;
          md += `| **Feeder** | ${item.feeder} |\n`;
          md += `| **Areas Affected** | ${item.areas.join(', ')} |\n`;
          md += `| **Start Time** | ${item.start_time} |\n`;
          md += `| **Restoration Time** | ${item.restoration_time} |\n`;
          md += `| **Reason** | ${item.reason || 'N/A'} |\n\n`;
        });
      }
      return markdownResponse(md, 200, CACHE_HEADERS);
    }

    return NextResponse.json(data, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('Error fetching DHBVN data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    if (wantsMarkdown) return markdownResponse(`# Error\n\n${errorMessage}\n`, 500);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
