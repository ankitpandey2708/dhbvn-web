import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import { GitHubBadge } from './components/github-badge'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Faridabad Power Outage Information',
  description: 'Real-time information about power outages in Faridabad',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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