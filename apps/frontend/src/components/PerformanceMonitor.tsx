import { useEffect } from 'react'

interface PerformanceMetrics {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
}

export const usePerformanceMonitor = () => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach((entry) => {
        if (entry.entryType === 'paint') {
          console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`)
        }
        
        if (entry.entryType === 'largest-contentful-paint') {
          console.log(`LCP: ${entry.startTime.toFixed(2)}ms`)
        }
        
        if (entry.entryType === 'first-input') {
          console.log(`FID: ${(entry as any).processingStart - entry.startTime}ms`)
        }
        
        if (entry.entryType === 'layout-shift') {
          console.log(`CLS: ${(entry as any).value}`)
        }
      })
    })

    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] })
      
      // Measure Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.fetchStart
        console.log(`TTFB: ${ttfb.toFixed(2)}ms`)
      }
    } catch (error) {
      console.warn('Performance monitoring not supported:', error)
    }

    return () => {
      observer.disconnect()
    }
  }, [])
}

export const PerformanceMonitor: React.FC = () => {
  usePerformanceMonitor()
  return null
}
