// src/lib/serviceWorker.ts
// تسجيل وإدارة Service Worker للأداء الفائق ⚡

/**
 * تسجيل Service Worker
 * ⚠️ DISABLED - Service Worker معطل مؤقتاً
 */
export function registerServiceWorker() {
  // Service Worker معطل - تم إرجاع النظام إلى حالة مستقرة
  console.log('[SW] Service Worker is disabled');
  return;
}

/**
 * إلغاء تسجيل Service Worker
 */
export async function unregisterServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('[SW] Service Worker unregistered');
    }
  } catch (error) {
    console.error('[SW] Service Worker unregistration failed:', error);
  }
}

/**
 * مسح الـ cache
 */
export async function clearCache() {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    console.log('[SW] Cache cleared');
  } catch (error) {
    console.error('[SW] Cache clearing failed:', error);
  }
}

/**
 * الحصول على حجم الـ cache
 */
export async function getCacheSize(): Promise<number> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return 0;
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

    return totalSize;
  } catch (error) {
    console.error('[SW] Failed to get cache size:', error);
    return 0;
  }
}

/**
 * تنسيق حجم الـ cache
 */
export function formatCacheSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Prefetch URLs
 */
export async function prefetchUrls(urls: string[]) {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return;
  }

  try {
    const cache = await caches.open('ain-oman-dynamic-v1');
    await Promise.all(
      urls.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (error) {
          console.warn(`[SW] Failed to prefetch: ${url}`, error);
        }
      })
    );
    console.log('[SW] URLs prefetched:', urls.length);
  } catch (error) {
    console.error('[SW] Prefetch failed:', error);
  }
}

/**
 * تحقق من توفر Service Worker
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * تحقق من حالة الاتصال
 */
export function getConnectionStatus(): {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} {
  if (typeof window === 'undefined') {
    return { online: true };
  }

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
  };
}

/**
 * مراقبة حالة الاتصال
 */
export function watchConnectionStatus(
  callback: (status: { online: boolean; effectiveType?: string }) => void
) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStatusChange = () => {
    callback(getConnectionStatus());
  };

  window.addEventListener('online', handleStatusChange);
  window.addEventListener('offline', handleStatusChange);

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  connection?.addEventListener('change', handleStatusChange);

  // إرجاع دالة لإلغاء المراقبة
  return () => {
    window.removeEventListener('online', handleStatusChange);
    window.removeEventListener('offline', handleStatusChange);
    connection?.removeEventListener('change', handleStatusChange);
  };
}

/**
 * تحسين الأداء باستخدام Resource Hints
 */
export function addResourceHints(hints: {
  preconnect?: string[];
  prefetch?: string[];
  preload?: Array<{ href: string; as: string; type?: string }>;
}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // Preconnect
  hints.preconnect?.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // Prefetch
  hints.prefetch?.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });

  // Preload
  hints.preload?.forEach(({ href, as, type }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  });
}


