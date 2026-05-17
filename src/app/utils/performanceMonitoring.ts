/**
 * Performance Monitoring Utilities
 * 
 * Tracks Core Web Vitals and other performance metrics for production monitoring.
 * These metrics can be sent to analytics services like Google Analytics, Vercel Analytics, etc.
 */

// Web Vitals metric types
export interface Metric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

/**
 * Report Web Vitals to console (development) or analytics endpoint (production)
 */
export function reportWebVitals(metric: Metric) {
  if (import.meta.env.DEV) {
    // Development: Log to console
    console.log(`[Performance] ${metric.name}:`, {
      value: Math.round(metric.value),
      rating: metric.rating,
      id: metric.id,
    });
  } else {
    // Production: Send to analytics
    // Example: Send to Google Analytics
    // window.gtag?.('event', metric.name, {
    //   value: Math.round(metric.value),
    //   metric_id: metric.id,
    //   metric_rating: metric.rating,
    //   metric_delta: Math.round(metric.delta),
    // });
    
    // Example: Send to custom analytics endpoint
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   body: JSON.stringify(metric),
    //   headers: { 'Content-Type': 'application/json' },
    // });
  }
}

/**
 * Measure and report Largest Contentful Paint (LCP)
 * Good: < 2.5s, Needs Improvement: 2.5-4s, Poor: > 4s
 */
export function measureLCP() {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
      
      const value = lastEntry.renderTime || lastEntry.loadTime || 0;
      
      reportWebVitals({
        name: 'LCP',
        value,
        rating: value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor',
        delta: value,
        id: `lcp-${Date.now()}`,
      });
      
      // Disconnect observer after first measurement to allow bfcache
      observer.disconnect();
    });
    
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    
    // Clean up on page hide to enable bfcache
    window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
  } catch (error) {
    console.error('[Performance] Error measuring LCP:', error);
  }
}

/**
 * Measure and report First Input Delay (FID)
 * Good: < 100ms, Needs Improvement: 100-300ms, Poor: > 300ms
 */
export function measureFID() {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const value = entry.processingStart - entry.startTime;
        
        reportWebVitals({
          name: 'FID',
          value,
          rating: value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor',
          delta: value,
          id: `fid-${Date.now()}`,
        });
      });
      
      // Disconnect after first input to allow bfcache
      observer.disconnect();
    });
    
    observer.observe({ type: 'first-input', buffered: true });
    
    // Clean up on page hide to enable bfcache
    window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
  } catch (error) {
    console.error('[Performance] Error measuring FID:', error);
  }
}

/**
 * Measure and report Cumulative Layout Shift (CLS)
 * Good: < 0.1, Needs Improvement: 0.1-0.25, Poor: > 0.25
 */
export function measureCLS() {
  try {
    let clsValue = 0;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      reportWebVitals({
        name: 'CLS',
        value: clsValue,
        rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
        delta: clsValue,
        id: `cls-${Date.now()}`,
      });
    });
    
    observer.observe({ type: 'layout-shift', buffered: true });
    
    // Clean up on page hide to enable bfcache
    window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
  } catch (error) {
    console.error('[Performance] Error measuring CLS:', error);
  }
}

/**
 * Measure and report First Contentful Paint (FCP)
 * Good: < 1.8s, Needs Improvement: 1.8-3s, Poor: > 3s
 */
export function measureFCP() {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const value = entry.startTime;
        
        reportWebVitals({
          name: 'FCP',
          value,
          rating: value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor',
          delta: value,
          id: `fcp-${Date.now()}`,
        });
      });
      
      // Disconnect after measurement to allow bfcache
      observer.disconnect();
    });
    
    observer.observe({ type: 'paint', buffered: true });
    
    // Clean up on page hide to enable bfcache
    window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
  } catch (error) {
    console.error('[Performance] Error measuring FCP:', error);
  }
}

/**
 * Initialize all performance monitoring
 * Call this once when your app starts
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }
  
  measureLCP();
  measureFID();
  measureCLS();
  measureFCP();
}

/**
 * Track custom performance marks
 * Useful for measuring specific user interactions or code execution times
 */
export function markPerformance(name: string) {
  if (typeof window !== 'undefined' && window.performance?.mark) {
    performance.mark(name);
  }
}

/**
 * Measure time between two performance marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string) {
  if (typeof window !== 'undefined' && window.performance?.measure) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      
      if (import.meta.env.DEV) {
        console.log(`[Performance] ${name}: ${Math.round(measure.duration)}ms`);
      }
      
      return measure.duration;
    } catch (error) {
      console.error('[Performance] Error measuring:', error);
    }
  }
  return 0;
}