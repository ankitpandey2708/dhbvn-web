import type { Metadata } from 'next'
import { CustomAnalytics, CustomSpeedInsights } from './custom-analytics'
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
        <a
          href="https://t.me/dhbvn_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center p-4 rounded-full bg-[#0088cc] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-hidden focus:ring-2 focus:ring-[#0088cc] focus:ring-offset-2"
          aria-label="Chat with DHBVN Bot on Telegram"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        </a>
        <CustomSpeedInsights />
        <CustomAnalytics />
      </body>
    </html>
  )
} 