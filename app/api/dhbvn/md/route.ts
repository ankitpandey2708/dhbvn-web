import { handleDhbvnGet } from '@/lib/dhbvn-route';

// Markdown live feed (Agent Readiness). Reached directly, or via proxy.ts when
// /api/dhbvn is requested with `Accept: text/markdown`.
export function GET(request: Request) {
  return handleDhbvnGet(request, 'md');
}
