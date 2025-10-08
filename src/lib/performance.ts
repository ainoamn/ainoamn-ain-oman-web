// src/lib/performance.ts
// دوال مساعدة للأداء والتحسين ⚡

/**
 * قياس وقت تنفيذ دالة
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    
    // إرسال إلى analytics (اختياري)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name,
        value: Math.round(duration),
        event_category: 'Performance',
      });
    }
    
    return result;
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
}

/**
 * تحسين الصور للعرض
 */
export function optimizeImageUrl(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  } = {}
): string {
  const { width, height, quality = 75, format } = options;

  // إذا كانت الصورة محلية
  if (src.startsWith('/') || src.startsWith('./')) {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    if (format) params.set('fm', format);

    return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`;
  }

  return src;
}

/**
 * Debounce function للأداء
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function للأداء
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load component
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  if (typeof window === 'undefined') {
    return importFn;
  }

  return () => {
    return measurePerformance('Lazy Load Component', importFn);
  };
}

/**
 * Preconnect to domain
 */
export function preconnect(domain: string) {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = domain;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

/**
 * Prefetch DNS
 */
export function dnsPrefetch(domain: string) {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = domain;
  document.head.appendChild(link);
}

/**
 * Preload resource
 */
export function preload(
  href: string,
  as: 'script' | 'style' | 'image' | 'font' | 'fetch',
  options: {
    type?: string;
    crossOrigin?: 'anonymous' | 'use-credentials';
  } = {}
) {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  if (options.type) link.type = options.type;
  if (options.crossOrigin) link.crossOrigin = options.crossOrigin;
  
  document.head.appendChild(link);
}

/**
 * تحقق من دعم WebP
 */
export async function supportsWebP(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * تحقق من دعم AVIF
 */
export async function supportsAVIF(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src =
      'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}

/**
 * الحصول على نوع الاتصال
 */
export function getConnectionType(): string {
  if (typeof navigator === 'undefined') return 'unknown';

  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  return connection?.effectiveType || 'unknown';
}

/**
 * تحقق من الاتصال السريع
 */
export function isFastConnection(): boolean {
  const type = getConnectionType();
  return type === '4g' || type === 'unknown';
}

/**
 * تحسين تحميل الخطوط
 */
export function optimizeFontLoading(fontFamily: string, fontUrl: string) {
  if (typeof document === 'undefined') return;

  // Preconnect to font source
  const preconnectLink = document.createElement('link');
  preconnectLink.rel = 'preconnect';
  preconnectLink.href = new URL(fontUrl).origin;
  preconnectLink.crossOrigin = 'anonymous';
  document.head.appendChild(preconnectLink);

  // Preload font
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'font';
  preloadLink.type = 'font/woff2';
  preloadLink.href = fontUrl;
  preloadLink.crossOrigin = 'anonymous';
  document.head.appendChild(preloadLink);

  // Add font-display: swap
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: '${fontFamily}';
      src: url('${fontUrl}') format('woff2');
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Resource Hints Helper
 */
export class ResourceHints {
  private static added = new Set<string>();

  static preconnect(origin: string) {
    const key = `preconnect:${origin}`;
    if (this.added.has(key)) return;
    this.added.add(key);
    preconnect(origin);
  }

  static dnsPrefetch(origin: string) {
    const key = `dns-prefetch:${origin}`;
    if (this.added.has(key)) return;
    this.added.add(key);
    dnsPrefetch(origin);
  }

  static preload(href: string, as: any, options?: any) {
    const key = `preload:${href}`;
    if (this.added.has(key)) return;
    this.added.add(key);
    preload(href, as, options);
  }
}

/**
 * Performance Observer Helper
 */
export class PerformanceMonitor {
  private observers: PerformanceObserver[] = [];

  observePaint(callback: (entries: PerformanceEntryList) => void) {
    if (typeof PerformanceObserver === 'undefined') return;

    const observer = new PerformanceObserver(callback);
    observer.observe({ entryTypes: ['paint'] });
    this.observers.push(observer);
  }

  observeLCP(callback: (entries: PerformanceEntryList) => void) {
    if (typeof PerformanceObserver === 'undefined') return;

    const observer = new PerformanceObserver(callback);
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(observer);
  }

  observeFID(callback: (entries: PerformanceEntryList) => void) {
    if (typeof PerformanceObserver === 'undefined') return;

    const observer = new PerformanceObserver(callback);
    observer.observe({ entryTypes: ['first-input'] });
    this.observers.push(observer);
  }

  observeCLS(callback: (entries: PerformanceEntryList) => void) {
    if (typeof PerformanceObserver === 'undefined') return;

    const observer = new PerformanceObserver(callback);
    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(observer);
  }

  disconnect() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

/**
 * تنسيق الوقت للعرض
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
}

/**
 * تنسيق حجم الملف للعرض
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Web Vitals Score Helper
 */
export function getWebVitalsScore(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    FCP: [1800, 3000],
    LCP: [2500, 4000],
    FID: [100, 300],
    CLS: [0.1, 0.25],
    TTFB: [800, 1800],
  };

  const [good, needsImprovement] = thresholds[metric] || [0, 0];

  if (value <= good) return 'good';
  if (value <= needsImprovement) return 'needs-improvement';
  return 'poor';
}


