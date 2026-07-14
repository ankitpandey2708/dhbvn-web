import { NextResponse } from 'next/server';
import { SITE_URL as BASE_URL } from '@/lib/dhbvn-config';

export const dynamic = 'force-dynamic';

/**
 * API Catalog — RFC 9727
 * Returns a Linkset document (application/linkset+json) describing the
 * Publisher's public API endpoints and their capabilities.
 *
 * Link relations used:
 *   item          – RFC 6573  – an API that is a member of the catalog
 *   service-desc  – RFC 8631  – OpenAPI / service description
 *   service-doc   – RFC 8631  – human-readable API documentation
 *   status        – health / status endpoint
 */
export async function GET() {
  const catalog = {
    linkset: [
      {
        anchor: `${BASE_URL}/.well-known/api-catalog`,
        // Outage data API — the primary public API
        item: [
          {
            href: `${BASE_URL}/api/dhbvn`,
            type: 'application/json',
          },
        ],
        'service-desc': [
          {
            href: `${BASE_URL}/api/dhbvn`,
            type: 'application/json',
          },
        ],
        'service-doc': [
          {
            href: 'https://github.com/ankitpandey2708/dhbvn-web',
            type: 'text/html',
          },
        ],
        status: [
          {
            href: `${BASE_URL}/api/dhbvn?district=10`,
            type: 'application/json',
          },
        ],
      },
      // Telegram webhook endpoint
      {
        anchor: `${BASE_URL}/.well-known/api-catalog`,
        item: [
          {
            href: `${BASE_URL}/api/telegram/webhook`,
            type: 'application/json',
          },
        ],
        'service-desc': [
          {
            href: `${BASE_URL}/api/telegram/webhook`,
            type: 'application/json',
          },
        ],
        'service-doc': [
          {
            href: 'https://core.telegram.org/bots/api',
            type: 'text/html',
          },
        ],
      },
    ],
  };

  return new NextResponse(JSON.stringify(catalog, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/linkset+json; charset=utf-8',
      'Link': '</.well-known/api-catalog>; rel="api-catalog"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

// HEAD support per RFC 9727 §2
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Link': '</.well-known/api-catalog>; rel="api-catalog"',
      'Content-Type': 'application/linkset+json; charset=utf-8',
    },
  });
}
