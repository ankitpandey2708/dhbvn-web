'use client'

import { useEffect } from 'react'

function shouldLoadAnalytics(): boolean {
  // Don't load analytics in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    return false
  }

  // Check if user has opted out of analytics via localStorage
  if (typeof window !== 'undefined' && localStorage.getItem('disable-analytics') === 'true') {
    return false
  }

  return true
}

function useAnalyticsScript(src: string) {
  useEffect(() => {
    if (!shouldLoadAnalytics()) {
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.defer = true
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [src])
}

export function CustomAnalytics() {
  useAnalyticsScript('/api/data/script.js')
  return null
}

export function CustomSpeedInsights() {
  useAnalyticsScript('/api/performance/script.js')
  return null
}
