import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for Agent Readiness
 *
 * 1. Markdown for Agents — when a client sends Accept: text/markdown,
 *    rewrite the request to a markdown handler that returns content
 *    with Content-Type: text/markdown.
 *
 * 2. Link headers — add Link HTTP headers for agent discovery
 *    (RFC 8288) pointing to the API catalog and other resources.
 */

// Paths that should NOT be intercepted for markdown rewriting
const MARKDOWN_EXCLUDED_PATHS = [
  '/_next/',
  '/api/',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/.well-known/',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accept = request.headers.get('accept') || '';
  const wantsMarkdown = accept.includes('text/markdown');

  // ── Markdown for Agents ──────────────────────────────────────────────
  // If the client wants markdown and this is not an excluded path,
  // rewrite to the markdown route handler.
  if (wantsMarkdown && !MARKDOWN_EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = '/api/markdown';
    url.searchParams.set('_page', pathname);
    return NextResponse.rewrite(url);
  }

  const response = NextResponse.next();

  // Add Vary header so caches know the response depends on Accept
  const vary = response.headers.get('vary') || '';
  if (!vary.includes('accept')) {
    response.headers.set('vary', vary ? `${vary}, accept` : 'accept');
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to all paths except static files / internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
