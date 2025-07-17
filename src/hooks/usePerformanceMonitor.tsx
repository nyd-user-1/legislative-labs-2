
import { useState, useEffect, useRef, useCallback } from 'react';

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToFirstByte: number;
  apiResponseTimes: Record<string, number[]>;
  componentRenderTimes: Record<string, number[]>;
  memoryUsage: {
    used: number;
    total: number;
    timestamp: number;
  }[];
  searchQueryTimes: number[];
  dataFetchingDurations: Record<string, number[]>;
}

export interface PerformanceHookReturn {
  metrics: PerformanceMetrics;
  startTimer: (name: string) => () => void;
  recordApiCall: (endpoint: string, duration: number) => void;
  recordComponentRender: (componentName: string, duration: number) => void;
  recordSearchQuery: (duration: number) => void;
  recordDataFetch: (operation: string, duration: number) => void;
  getWebVitals: () => Promise<any>;
  clearMetrics: () => void;
}

export const usePerformanceMonitor = (): PerformanceHookReturn => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    timeToFirstByte: 0,
    apiResponseTimes: {},
    componentRenderTimes: {},
    memoryUsage: [],
    searchQueryTimes: [],
    dataFetchingDurations: {},
  });

  const timersRef = useRef<Map<string, number>>(new Map());

  // Initialize page load metrics
  useEffect(() => {
    const updatePageMetrics = () => {
      if (performance && performance.timing) {
        const timing = performance.timing;
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        setMetrics(prev => ({
          ...prev,
          pageLoadTime: timing.loadEventEnd - timing.navigationStart,
          timeToFirstByte: timing.responseStart - timing.navigationStart,
        }));

        // Get paint metrics
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, firstContentfulPaint: entry.startTime }));
          }
        });

        // Get LCP if available
        if ('PerformanceObserver' in window) {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            setMetrics(prev => ({ ...prev, largestContentfulPaint: lastEntry.startTime }));
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        }
      }
    };

    if (document.readyState === 'complete') {
      updatePageMetrics();
    } else {
      window.addEventListener('load', updatePageMetrics);
      return () => window.removeEventListener('load', updatePageMetrics);
    }
  }, []);

  // Monitor memory usage
  useEffect(() => {
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: [
            ...prev.memoryUsage.slice(-19), // Keep last 20 entries
            {
              used: memInfo.usedJSHeapSize,
              total: memInfo.totalJSHeapSize,
              timestamp: Date.now(),
            }
          ]
        }));
      }
    };

    monitorMemory();
    const interval = setInterval(monitorMemory, 5000); // Every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const startTimer = useCallback((name: string) => {
    const startTime = performance.now();
    timersRef.current.set(name, startTime);
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
      return duration;
    };
  }, []);

  const recordApiCall = useCallback((endpoint: string, duration: number) => {
    setMetrics(prev => ({
      ...prev,
      apiResponseTimes: {
        ...prev.apiResponseTimes,
        [endpoint]: [...(prev.apiResponseTimes[endpoint] || []), duration].slice(-10)
      }
    }));
    console.log(`API Performance: ${endpoint} responded in ${duration.toFixed(2)}ms`);
  }, []);

  const recordComponentRender = useCallback((componentName: string, duration: number) => {
    setMetrics(prev => ({
      ...prev,
      componentRenderTimes: {
        ...prev.componentRenderTimes,
        [componentName]: [...(prev.componentRenderTimes[componentName] || []), duration].slice(-10)
      }
    }));
    console.log(`Component Performance: ${componentName} rendered in ${duration.toFixed(2)}ms`);
  }, []);

  const recordSearchQuery = useCallback((duration: number) => {
    setMetrics(prev => ({
      ...prev,
      searchQueryTimes: [...prev.searchQueryTimes, duration].slice(-20)
    }));
    console.log(`Search Performance: Query completed in ${duration.toFixed(2)}ms`);
  }, []);

  const recordDataFetch = useCallback((operation: string, duration: number) => {
    setMetrics(prev => ({
      ...prev,
      dataFetchingDurations: {
        ...prev.dataFetchingDurations,
        [operation]: [...(prev.dataFetchingDurations[operation] || []), duration].slice(-10)
      }
    }));
    console.log(`Data Fetch Performance: ${operation} completed in ${duration.toFixed(2)}ms`);
  }, []);

  const getWebVitals = useCallback(async () => {
    return new Promise((resolve) => {
      const vitals: any = {};
      
      // CLS (Cumulative Layout Shift)
      if ('PerformanceObserver' in window) {
        const clsObserver = new PerformanceObserver((entryList) => {
          let clsValue = 0;
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          vitals.cls = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            vitals.fid = (entry as any).processingStart - entry.startTime;
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      }

      setTimeout(() => resolve(vitals), 1000);
    });
  }, []);

  const clearMetrics = useCallback(() => {
    setMetrics({
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      timeToFirstByte: 0,
      apiResponseTimes: {},
      componentRenderTimes: {},
      memoryUsage: [],
      searchQueryTimes: [],
      dataFetchingDurations: {},
    });
    timersRef.current.clear();
  }, []);

  return {
    metrics,
    startTimer,
    recordApiCall,
    recordComponentRender,
    recordSearchQuery,
    recordDataFetch,
    getWebVitals,
    clearMetrics,
  };
};
