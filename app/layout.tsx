import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed, IBM_Plex_Mono } from 'next/font/google'
import { CustomAnalytics } from './custom-analytics'
import { WebMCPProvider } from '@/components/WebMCPProvider'
import { SITE_URL } from '@/lib/dhbvn-config'
import './globals.css'

// ── Type system: the IBM Plex superfamily ──
// One engineered, infrastructural voice — Sans for UI, Condensed for the
// board headlines, Mono for every reading on the panel.
const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
})

const plexCond = IBM_Plex_Sans_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-plex-cond',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'DHBVN Power Outage Tracker — Haryana Live Updates',
    template: '%s',
  },
  description:
    'Real-time power outage tracker for Haryana districts served by DHBVN. Affected feeders, areas, start times, and expected restoration — updated every 5 minutes.',
  authors: [{ name: 'DHBVN Outage Tracker' }],
  robots: { index: true, follow: true },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'DHBVN Outage Tracker',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: '#14110d',
}

const siteSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DHBVN Outage Tracker',
    url: SITE_URL,
    sameAs: ['https://dhbvn.org.in'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DHBVN Outage Tracker',
    url: SITE_URL,
  },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <html
      lang="en-IN"
      className={`dark ${plexSans.variable} ${plexCond.variable} ${plexMono.variable}`}
    >
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="relative z-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />

        {children}

        <WebMCPProvider />
        <CustomAnalytics />
      </body>
    </html>
  )
}
