import { NextResponse } from 'next/server';
import { fetchAllDHBVNRawRows, filterActiveOutages } from '@/lib/dhbvn-api';
import { collectDistrictHistory } from '@/lib/database/collect-history';
import { getDistrictName } from '@/lib/district';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
  'Vary': 'accept',
} as const;


export async function GET(request: Request) {
  try {
    // Extract district value from query params, default to "10" (Faridabad)
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district') || '10';

    // Check if client wants markdown (Agent Readiness)
    const accept = request.headers.get('accept') || '';
    const wantsMarkdown = accept.includes('text/markdown');

    // ── Validate district (must be integer 1-12) ──────────────────────────
    const districtId = Number(district);
    if (Number.isNaN(districtId) || !Number.isInteger(districtId) || districtId < 1 || districtId > 12) {
      const errMsg = `Invalid district parameter: "${district}". Must be an integer between 1 and 12.`;
      console.error(errMsg);
      if (wantsMarkdown) {
        const md = `# Error\n\n${errMsg}\n`;
        return new NextResponse(md, {
          status: 400,
          headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'x-markdown-tokens': String(Math.ceil(md.length / 4)) },
        });
      }
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    // ── Fetch ALL raw rows (including expired) — used for both history and UI ──
    const allRows = await fetchAllDHBVNRawRows(district);

    // ── Fire-and-forget: save raw rows to history DB in background ──
    // Error is logged but never blocks the response.
    collectDistrictHistory(districtId, getDistrictName(districtId), allRows)
      .catch(err => console.error('Outage history save failed (non-blocking):', err));

    // ── Filter active outages for the UI response ──
    const data = filterActiveOutages(allRows);

    // ── Return markdown if client requested it ──────────────────────────────
    if (wantsMarkdown) {
      const districtName = district || '10';
      let md = `# Power Outages - District ${districtName}\n\n`;
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

      const estimatedTokens = Math.ceil(md.length / 4);
      return new NextResponse(md, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'x-markdown-tokens': String(estimatedTokens),
          ...CACHE_HEADERS,
        },
      });
    }

    // ── Return JSON (default) ───────────────────────────────────────────────
    return NextResponse.json(data, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('Error fetching DHBVN data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    const accept = request.headers.get('accept') || '';
    const wantsMarkdown = accept.includes('text/markdown');

    if (wantsMarkdown) {
      const md = `# Error\n\n${errorMessage}\n`;
      return new NextResponse(md, {
        status: 500,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'x-markdown-tokens': String(Math.ceil(md.length / 4)) },
      });
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
