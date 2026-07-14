import { NextRequest, NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/dhbvn-config';
import { DISTRICTS } from '@/lib/district';

export const dynamic = 'force-dynamic';

/**
 * Markdown for Agents
 *
 * Returns a Markdown representation of the requested page when the
 * client sends Accept: text/markdown.
 *
 * Content-Type is set to text/markdown and x-markdown-tokens is
 * included as an estimated token count.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = searchParams.get('_page') || '/';

  // ── Generate markdown based on the requested page ──────────────────
  const markdown = generateMarkdown(page);

  // Token estimate: ~4 chars per token
  const estimatedTokens = Math.ceil(markdown.length / 4);

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'x-markdown-tokens': String(estimatedTokens),
      'Cache-Control': 'public, max-age=300',
      Vary: 'accept',
    },
  });
}

/**
 * Generate a Markdown representation of the requested page.
 */
function generateMarkdown(_page: string): string {
  const frontmatter = [
    '---',
    'title: DHBVN Power Outage Tracker | Haryana Live Updates',
    'description: Real-time power outage information across Haryana districts. Track ongoing outages, restoration times, and affected areas powered by DHBVN data.',
    `url: ${SITE_URL}`,
    '---',
    '',
  ].join('\n');

  const districtRows = DISTRICTS.map(
    d => `| ${String(d.id).padEnd(2)} | ${d.name.padEnd(15)} |`
  ).join('\n');

  const body = [
    '# DHBVN Power Outage Tracker',
    '',
    'Real-time power outage information across Haryana districts.',
    '',
    '## Overview',
    '',
    'This service provides real-time data about power outages reported by DHBVN',
    `(Dakshin Haryana Bijli Vitran Nigam) across ${DISTRICTS.length} districts in Haryana, India.`,
    '',
    '## Supported Districts',
    '',
    '| ID | District        |',
    '|----|-----------------|',
    districtRows,
    '',
    '## API',
    '',
    'Fetch outage data for any district:',
    '',
    '```',
    'GET /api/dhbvn?district={id}',
    '```',
    '',
    'Returns JSON with fields: **area**, **feeder**, **start_time**, **restoration_time**, **reason**.',
    '',
    '## Telegram Bot',
    '',
    'Subscribe to real-time alerts: [@dhbvn_bot](https://t.me/dhbvn_bot)',
    '',
  ].join('\n');

  const structuredData = [
    '```json',
    '{',
    '  "@context": "https://schema.org",',
    '  "@type": "WebPage",',
    '  "name": "Faridabad Power Outage Information",',
    '  "description": "Real-time information about power outages in Faridabad with location details",',
    `  "url": "${SITE_URL}"`,
    '}',
    '```',
    '',
  ].join('\n');

  return frontmatter + body + structuredData;
}
