import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DHBVN Outage Tracker',
    short_name: 'DHBVN Outages',
    description:
      'Real-time power outage tracker for Haryana districts served by DHBVN.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a1118',
    theme_color: '#0a1118',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  };
}
