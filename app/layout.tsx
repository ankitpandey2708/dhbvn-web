import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'DHBVN Power Outage Information | Haryana Live Updates',
  description: 'Get real-time information about power outages across Haryana districts. Track ongoing outages, restoration times, and affected areas powered by DHBVN data.',
  keywords: ['DHBVN power outage', 'Haryana electricity outage', 'power cut Haryana', 'Faridabad power outage', 'Gurugram power outage', 'Hisar power outage', 'DHBVN live updates', 'power restoration Haryana'],
  alternates: {
    canonical: 'https://dhbvn.vercel.app',
  },
  authors: [{ name: 'DHBVN Information Portal' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: 'https://dhbvn.vercel.app',
    title: 'DHBVN Power Outage Tracker | Real-time Updates',
    description: 'Track real-time power outages across Haryana districts including Faridabad, Gurugram, Hisar, and more with location, feeder details, and expected restoration times.',
    siteName: 'DHBVN Outage Tracker',
    images: [
      {
        url: 'https://www.dhbvn.org.in/RAPDRP-Redesign-theme/images/favicon.ico',
        width: 64,
        height: 64,
        alt: 'DHBVN Logo',
      }
    ],
  },
  twitter: {
    card: 'summary',
    title: 'DHBVN Power Outage Information | Haryana',
    description: 'Real-time updates on power outages across Haryana districts',
    images: ['https://www.dhbvn.org.in/RAPDRP-Redesign-theme/images/favicon.ico'],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="https://www.dhbvn.org.in/RAPDRP-Redesign-theme/images/favicon.ico"
        />
      </head>
      <body className="font-sans selection:bg-accent selection:text-accent-foreground">
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
} 