import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import { GitHubBadge } from './components/github-badge'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Faridabad Power Outage Information | DHBVN Live Updates',
  description: 'Get real-time information about power outages in Faridabad. Track ongoing outages, restoration times, and affected areas powered by DHBVN data.',
  keywords: ['Faridabad power outage',  'Faridabad electricity outage', 'power cut Faridabad', 'Faridabad electricity status', 'Faridabad electricity updates', 'power restoration Faridabad'],
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
    title: 'Faridabad Power Outage Tracker | Real-time Updates',
    description: 'Track real-time power outages in Faridabad with location, feeder details, start times and expected restoration times.',
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
    title: 'Faridabad Power Outage Information',
    description: 'Real-time updates on power outages in Faridabad areas',
    images: ['https://www.dhbvn.org.in/RAPDRP-Redesign-theme/images/favicon.ico'],
  },
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className}>
        <GitHubBadge />
        <ThemeToggle />
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
} 