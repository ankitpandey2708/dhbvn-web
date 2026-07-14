/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactCompiler: true,
  async rewrites() {
    return [
      // Rewrites for .well-known paths (Next.js dot-prefixed route workaround)
      {
        source: '/.well-known/api-catalog',
        destination: '/api/well-known/api-catalog',
      },
      {
        source: '/.well-known/agent-skills/index.json',
        destination: '/api/well-known/agent-skills',
      },
      {
        source: '/.well-known/mcp/server-card.json',
        destination: '/api/well-known/mcp/server-card',
      },
      // Existing analytics rewrites
      {
        source: '/api/data/:match*',
        destination: 'https://dhbvn.vercel.app/_vercel/insights/:match*',
      },
    ];
  },

  async headers() {
    return [
      {
        // Link headers for the homepage (RFC 8288)
        source: '/',
        headers: [
          {
            key: 'Link',
            value:
              '</.well-known/api-catalog>; rel="api-catalog", </.well-known/mcp/server-card.json>; rel="mcp-server-card", </robots.txt>; rel="service-meta", </sitemap.xml>; rel="sitemap"',
          },
        ],
      },
      {
        source: '/data/feeders/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/icon.svg',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/manifest.webmanifest',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

module.exports = nextConfig;
