import { handleDhbvnGet } from '@/lib/dhbvn-route';

// JSON live feed. `Accept: text/markdown` requests are rewritten by proxy.ts
// to /api/dhbvn/md — see lib/dhbvn-route.ts for caching notes.
export function GET(request: Request) {
  return handleDhbvnGet(request, 'json');
}
