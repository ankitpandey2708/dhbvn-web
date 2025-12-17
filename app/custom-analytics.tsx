'use client'

import { useEffect } from 'react'

export function CustomAnalytics() {
  useEffect(() => {
    const analyticsScript = document.createElement('script')
    analyticsScript.src = '/api/data/script.js'
    analyticsScript.defer = true
    document.head.appendChild(analyticsScript)

    return () => {
      if (analyticsScript.parentNode) {
        analyticsScript.parentNode.removeChild(analyticsScript)
      }
    }
  }, [])

  return null
}

export function CustomSpeedInsights() {
  useEffect(() => {
    const speedInsightsScript = document.createElement('script')
    speedInsightsScript.src = '/api/performance/script.js'
    speedInsightsScript.defer = true
    document.head.appendChild(speedInsightsScript)

    return () => {
      if (speedInsightsScript.parentNode) {
        speedInsightsScript.parentNode.removeChild(speedInsightsScript)
      }
    }
  }, [])

  return null
}
