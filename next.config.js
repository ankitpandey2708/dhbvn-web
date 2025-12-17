/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    DHBVN_FORM_ID: process.env.DHBVN_FORM_ID,
    DHBVN_LOGIN: process.env.DHBVN_LOGIN,
    DHBVN_SOURCE_TYPE: process.env.DHBVN_SOURCE_TYPE,
    DHBVN_VERSION: process.env.DHBVN_VERSION,
    DHBVN_TOKEN: process.env.DHBVN_TOKEN,
    DHBVN_ROLE_ID: process.env.DHBVN_ROLE_ID,
  },
  async rewrites() {
    return [
      {
        source: '/api/data/:match*',
        destination: 'https://dhbvn.vercel.app/_vercel/insights/:match*',
      },
      {
        source: '/api/performance/:match*',
        destination: 'https://dhbvn.vercel.app/_vercel/speed-insights/:match*',
      },
    ];
  },
}

module.exports = nextConfig 