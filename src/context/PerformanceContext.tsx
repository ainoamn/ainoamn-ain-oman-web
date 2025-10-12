// src/context/PerformanceContext.tsx
// Context لإدارة الأداء والتنقل الفوري ⚡
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { registerServiceWorker, getConnectionStatus, watchConnectionStatus } from '@/lib/serviceWorker';

interface PerformanceContextType {
  isOnline: boolean;
  connectionType: string | undefined;
  prefetchPage: (url: string) => Promise<void>;
  preloadData: <T>(key: string, fetcher: () => Promise<T>) => Promise<T>;
  clearCache: () => Promise<void>;
  cacheSize: number;
  isServiceWorkerReady: boolean;
  performanceMetrics: {
    fcp?: number; // First Contentful Paint
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    ttfb?: number; // Time to First Byte
  };
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>();
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceContextType['performanceMetrics']>({});

  // تسجيل Service Worker
  useEffect(() => {
    registerServiceWorker();

    // تحقق من جاهزية Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsServiceWorkerReady(true);
        console.log('[Performance] Service Worker is ready! ⚡');
      });
    }
  }, []);

  // مراقبة حالة الاتصال
  useEffect(() => {
    const status = getConnectionStatus();
    setIsOnline(status.online);
    setConnectionType(status.effectiveType);

    const unwatch = watchConnectionStatus((newStatus) => {
      setIsOnline(newStatus.online);
      setConnectionType(newStatus.effectiveType);
    });

    return unwatch;
  }, []);

  // قياس أداء الصفحة
  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    // Web Vitals
    try {
      // FCP - First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries.find((entry) => entry.name === 'first-contentful-paint');
        if (fcp) {
          setPerformanceMetrics((prev) => ({ ...prev, fcp: fcp.startTime }));
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // LCP - Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          setPerformanceMetrics((prev) => ({ ...prev, lcp: lastEntry.startTime }));
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID - First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[];
        const fid = entries[0];
        if (fid) {
          setPerformanceMetrics((prev) => ({ ...prev, fid: fid.processingStart - fid.startTime }));
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            setPerformanceMetrics((prev) => ({ ...prev, cls: clsValue }));
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // TTFB - Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        setPerformanceMetrics((prev) => ({ ...prev, ttfb }));
      }

    } catch (error) {
      console.error('[Performance] Failed to observe performance metrics:', error);
    }
  }, []);

  // Prefetch صفحة
  const prefetchPage = useCallback(
    async (url: string) => {
      try {
        await router.prefetch(url);
        console.log(`[Performance] Prefetched: ${url}`);
      } catch (error) {
        console.error(`[Performance] Failed to prefetch ${url}:`, error);
      }
    },
    [router]
  );

  // Preload بيانات
  const preloadDataFunc = useCallback(async <T,>(key: string, fetcher: () => Promise<T>): Promise<T> => {
    try {
      const data = await fetcher();
      
      // حفظ في sessionStorage للوصول السريع
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(`preload:${key}`, JSON.stringify(data));
        } catch (e) {
          // تجاهل أخطاء التخزين (مثلاً عند امتلاء المساحة)
        }
      }
      
      return data;
    } catch (error) {
      console.error(`[Performance] Failed to preload data for ${key}:`, error);
      throw error;
    }
  }, []);

  // مسح الـ cache
  const clearCacheFunc = useCallback(async () => {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      setCacheSize(0);
      console.log('[Performance] Cache cleared');
    } catch (error) {
      console.error('[Performance] Failed to clear cache:', error);
    }
  }, []);

  // حساب حجم الـ cache
  useEffect(() => {
    const calculateCacheSize = async () => {
      if (typeof window === 'undefined' || !('caches' in window)) {
        return;
      }

      try {
        const cacheNames = await caches.keys();
        let totalSize = 0;

        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const keys = await cache.keys();

          for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              totalSize += blob.size;
            }
          }
        }

        setCacheSize(totalSize);
      } catch (error) {
        console.error('[Performance] Failed to calculate cache size:', error);
      }
    };

    // حساب الحجم عند التحميل وكل دقيقة
    calculateCacheSize();
    const interval = setInterval(calculateCacheSize, 60000);

    return () => clearInterval(interval);
  }, []);

  // Prefetch الصفحات المهمة عند التحميل
  useEffect(() => {
    if (!isServiceWorkerReady) return;

    const importantPages = [
      '/properties',
      '/auctions',
      '/development/projects',
      '/favorites',
    ];

    // Prefetch بعد 2 ثانية من التحميل
    const timeout = setTimeout(() => {
      importantPages.forEach((page) => {
        prefetchPage(page);
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isServiceWorkerReady, prefetchPage]);

  // تسجيل أداء التنقل
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      console.time(`[Performance] Navigation to ${url}`);
    };

    const handleRouteChangeComplete = (url: string) => {
      console.timeEnd(`[Performance] Navigation to ${url}`);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);

  const value: PerformanceContextType = {
    isOnline,
    connectionType,
    prefetchPage,
    preloadData: preloadDataFunc,
    clearCache: clearCacheFunc,
    cacheSize,
    isServiceWorkerReady,
    performanceMetrics,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
}

/**
 * Hook للأداء السريع
 */
export function useInstantPerformance() {
  const { prefetchPage, preloadData } = usePerformance();

  // Prefetch عند المرور بالماوس
  const handleMouseEnter = useCallback(
    (url: string) => {
      prefetchPage(url);
    },
    [prefetchPage]
  );

  return {
    handleMouseEnter,
    preloadData,
  };
}


