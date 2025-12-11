import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Faridabad Power Outage Information',
    short_name: 'DHBVN Outages',
    description: 'Real-time information about power outages in Faridabad with location details',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: 'https://www.dhbvn.org.in/RAPDRP-Redesign-theme/images/favicon.ico',
        sizes: '64x64',
        type: 'image/x-icon',
      },
    ],
  }
} 