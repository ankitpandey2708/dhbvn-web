import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy for Agent Readiness — Markdown for Agents.
 *
 * Runs ONLY for requests that send `Accept: text/markdown` (enforced by the
 * `has` condition in `config.matcher`), so ordinary browser/bot traffic never
 * invokes a function here. On Vercel Fluid every proxy run is billed as
 * Active CPU, and the old catch-all matcher ran on every page + API hit.
 *
 * Instead of a `Vary: accept` header (which fragments the CDN cache per
 * distinct Accept string), markdown requests are rewritten to a DIFFERENT
 * PATH, so JSON/HTML and markdown get separate, stable cache keys:
 *   /api/dhbvn?district=X   → /api/dhbvn/md?district=X
 *   /<page>                 → /api/markdown?_page=/<page>
 * (Rewrites must change the pathname — query-only rewrites on the same path
 * don't reach the route handler.)
 */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  if (pathname === '/api/dhbvn') {
    url.pathname = '/api/dhbvn/md';
    return NextResponse.rewrite(url);
  }

  url.pathname = '/api/markdown';
  url.search = '';
  url.searchParams.set('_page', pathname);
  return NextResponse.rewrite(url);
}

// Must stay a static literal — Next.js parses `config` at build time.
export const config = {
  matcher: [
    {
      source: '/api/dhbvn',
      has: [{ type: 'header', key: 'accept', value: '.*text/markdown.*' }],
    },
    {
      // Pages only — excludes API routes, Next internals, well-known files,
      // static data and root metadata files.
      source: '/((?!api/|_next/|\\.well-known/|data/|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest).*)',
      has: [{ type: 'header', key: 'accept', value: '.*text/markdown.*' }],
    },
  ],
};
