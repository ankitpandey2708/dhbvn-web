import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DHBVN Power Outage Information - Haryana',
    short_name: 'DHBVN Outages',
    description: 'Real-time information about power outages across Haryana districts with location details',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a1118',
    theme_color: '#0a1118',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
} 