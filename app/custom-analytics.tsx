'use client'

import { useEffect } from 'react'

function shouldLoadAnalytics(): boolean {
  // Don't load analytics in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    return false
  }

  // Check if user has opted out via query parameter
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    if (params.get('notrack') === 'true' || params.get('dev') === 'true') {
      return false
    }
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
