# 📚 مرجع API للمكونات - Components API Reference

## 🔗 InstantLink

### الوصف
مكون للتنقل الفوري بسرعة البرق مع prefetching ذكي.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | **required** | عنوان URL للتنقل |
| `children` | `ReactNode` | **required** | محتوى الرابط |
| `className` | `string` | `''` | CSS classes |
| `prefetch` | `boolean` | `true` | تفعيل الـ prefetch |
| `onClick` | `function` | - | معالج النقر |
| `onMouseEnter` | `function` | - | معالج المرور بالماوس |
| `title` | `string` | - | عنوان الرابط |
| `target` | `string` | - | هدف الرابط |
| `rel` | `string` | - | علاقة الرابط |
| `shallow` | `boolean` | `false` | shallow routing |
| `scroll` | `boolean` | `true` | scroll عند التنقل |
| `replace` | `boolean` | `false` | استبدال بدلاً من push |

### أمثلة

```tsx
// بسيط
<InstantLink href="/properties">
  تصفح العقارات
</InstantLink>

// متقدم
<InstantLink 
  href="/property/123"
  prefetch={true}
  className="text-blue-600 hover:underline"
  onClick={() => console.log('Navigating...')}
>
  عرض التفاصيل
</InstantLink>

// بدون scroll
<InstantLink href="/top" scroll={false}>
  إلى الأعلى
</InstantLink>
```

---

## 🔘 InstantButton

### الوصف
زر للتنقل الفوري.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | **required** | عنوان URL للتنقل |
| `children` | `ReactNode` | **required** | محتوى الزر |
| `className` | `string` | `''` | CSS classes |
| `onClick` | `function` | - | معالج النقر |
| `disabled` | `boolean` | `false` | تعطيل الزر |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | نوع الزر |

### مثال

```tsx
<InstantButton 
  href="/checkout"
  className="btn btn-primary"
  onClick={() => console.log('Checking out...')}
>
  إتمام الشراء
</InstantButton>
```

---

## 🖼️ InstantImage

### الوصف
مكون صور محسن مع تحميل تدريجي.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | **required** | مصدر الصورة |
| `alt` | `string` | **required** | نص بديل |
| `width` | `number` | - | العرض (مطلوب إذا لم يكن fill) |
| `height` | `number` | - | الارتفاع (مطلوب إذا لم يكن fill) |
| `fill` | `boolean` | `false` | ملء المساحة المتاحة |
| `priority` | `boolean` | `false` | أولوية التحميل |
| `quality` | `number` | `75` | جودة الصورة (1-100) |
| `placeholder` | `'blur' \| 'empty'` | `'blur'` | نوع placeholder |
| `blurDataURL` | `string` | - | blur placeholder مخصص |
| `className` | `string` | `''` | CSS classes |
| `objectFit` | `'contain' \| 'cover' \| ...` | `'cover'` | كيفية ملء المساحة |
| `objectPosition` | `string` | `'center'` | موضع الصورة |
| `sizes` | `string` | - | أحجام responsive |
| `onLoad` | `function` | - | معالج التحميل |
| `onError` | `function` | - | معالج الخطأ |
| `loading` | `'lazy' \| 'eager'` | `'lazy'` | نوع التحميل |

### أمثلة

```tsx
// بسيط
<InstantImage
  src="/property.jpg"
  alt="عقار فاخر"
  width={800}
  height={600}
/>

// fill مع objectFit
<InstantImage
  src="/banner.jpg"
  alt="بانر"
  fill
  objectFit="cover"
  priority={true}
/>

// مع معالجات
<InstantImage
  src="/image.jpg"
  alt="صورة"
  width={400}
  height={300}
  onLoad={() => console.log('Loaded!')}
  onError={() => console.error('Error!')}
/>
```

---

## 🎨 InstantImageGallery

### الوصف
معرض صور محسن.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `Array<{src, alt, width?, height?}>` | **required** | مصفوفة الصور |
| `columns` | `number` | `3` | عدد الأعمدة |
| `gap` | `number` | `4` | المسافة بين الصور |
| `className` | `string` | `''` | CSS classes |
| `onImageClick` | `function` | - | معالج النقر على صورة |

### مثال

```tsx
<InstantImageGallery
  images={[
    { src: '/img1.jpg', alt: 'صورة 1' },
    { src: '/img2.jpg', alt: 'صورة 2' },
    { src: '/img3.jpg', alt: 'صورة 3' },
  ]}
  columns={3}
  gap={4}
  onImageClick={(index) => console.log('Clicked:', index)}
/>
```

---

## 📊 useInstantData

### الوصف
Hook للبيانات الفورية مع تخزين مؤقت.

### Signature

```tsx
function useInstantData<T>(
  key: string | null,
  fetcher: (key: string) => Promise<T>,
  options?: UseInstantDataOptions<T>
): UseInstantDataReturn<T>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `revalidateOnFocus` | `boolean` | `true` | إعادة التحقق عند التركيز |
| `revalidateOnReconnect` | `boolean` | `true` | إعادة التحقق عند عودة الاتصال |
| `dedupingInterval` | `number` | `2000` | فترة منع التكرار (ms) |
| `focusThrottleInterval` | `number` | `5000` | فترة throttle للتركيز (ms) |
| `errorRetryCount` | `number` | `3` | عدد محاولات إعادة الطلب |
| `errorRetryInterval` | `number` | `5000` | الفترة بين المحاولات (ms) |
| `onSuccess` | `function` | - | معالج النجاح |
| `onError` | `function` | - | معالج الخطأ |
| `fallbackData` | `T` | - | بيانات احتياطية |

### Return Value

```tsx
{
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (newData?: T, revalidate?: boolean) => Promise<void>;
  revalidate: () => Promise<void>;
}
```

### أمثلة

```tsx
// بسيط
const { data, error, isLoading } = useInstantData(
  '/api/properties',
  (url) => fetch(url).then(r => r.json())
);

// مع options
const { data, mutate } = useInstantData(
  '/api/user',
  fetcher,
  {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
    onSuccess: (data) => console.log('Success:', data),
  }
);

// مع fallback
const { data } = useInstantData(
  '/api/properties',
  fetcher,
  { fallbackData: [] }
);

// تحديث يدوي
mutate(newData);

// إعادة التحميل
revalidate();
```

---

## 🎯 usePerformance

### الوصف
Hook للوصول إلى Performance Context.

### Return Value

```tsx
{
  isOnline: boolean;
  connectionType: string | undefined;
  prefetchPage: (url: string) => Promise<void>;
  preloadData: <T>(key: string, fetcher: () => Promise<T>) => Promise<T>;
  clearCache: () => Promise<void>;
  cacheSize: number;
  isServiceWorkerReady: boolean;
  performanceMetrics: {
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
  };
}
```

### أمثلة

```tsx
const {
  isOnline,
  prefetchPage,
  performanceMetrics,
} = usePerformance();

// Prefetch صفحة
await prefetchPage('/important-page');

// عرض المقاييس
console.log('FCP:', performanceMetrics.fcp);
console.log('LCP:', performanceMetrics.lcp);

// التحقق من الاتصال
if (!isOnline) {
  alert('لا يوجد اتصال بالإنترنت');
}
```

---

## 🔧 Utility Functions

### measurePerformance

قياس وقت تنفيذ دالة.

```tsx
async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<T>
```

**مثال:**
```tsx
const data = await measurePerformance('Load Data', async () => {
  return fetch('/api/data').then(r => r.json());
});
// Console: [Performance] Load Data: 234.56ms
```

### optimizeImageUrl

تحسين رابط صورة.

```tsx
function optimizeImageUrl(
  src: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  }
): string
```

**مثال:**
```tsx
const optimized = optimizeImageUrl('/image.jpg', {
  width: 800,
  quality: 75,
  format: 'webp',
});
```

### debounce & throttle

```tsx
function debounce<T>(fn: T, delay: number): T
function throttle<T>(fn: T, limit: number): T
```

**مثال:**
```tsx
const handleSearch = debounce((query: string) => {
  // بحث
}, 300);

const handleScroll = throttle(() => {
  // معالجة scroll
}, 100);
```

### preload, preconnect, dnsPrefetch

```tsx
function preload(href: string, as: string, options?: {...}): void
function preconnect(domain: string): void
function dnsPrefetch(domain: string): void
```

**مثال:**
```tsx
preload('/font.woff2', 'font', { type: 'font/woff2' });
preconnect('https://api.example.com');
dnsPrefetch('https://cdn.example.com');
```

### formatBytes & formatDuration

```tsx
function formatBytes(bytes: number, decimals?: number): string
function formatDuration(ms: number): string
```

**مثال:**
```tsx
formatBytes(1024); // "1.00 KB"
formatDuration(1234); // "1.23s"
```

---

## 📊 PerformanceMonitor

### الوصف
مكون لمراقبة الأداء المباشر (للمطورين).

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | `process.env.NODE_ENV === 'development'` | تفعيل المراقب |
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'bottom-right'` | موضع المراقب |

### مثال

```tsx
<PerformanceMonitor 
  enabled={true}
  position="bottom-right"
/>
```

---

## 🎨 DevPerformanceWidget

### الوصف
عنصر واجهة سريع لعرض الأداء (للمطورين).

### مثال

```tsx
<DevPerformanceWidget />
```

---

## 📝 ملاحظات عامة

### استيراد المكونات

```tsx
// InstantLink
import InstantLink, { InstantButton } from '@/components/InstantLink';

// InstantImage
import InstantImage, { InstantImageGallery } from '@/components/InstantImage';

// Hooks
import { useInstantData, preloadData, clearCache } from '@/hooks/useInstantData';
import { usePerformance } from '@/context/PerformanceContext';

// Utilities
import { measurePerformance, formatBytes, formatDuration } from '@/lib/performance';

// Monitoring
import PerformanceMonitor, { DevPerformanceWidget } from '@/components/PerformanceMonitor';
```

### TypeScript Support

جميع المكونات والـ hooks مكتوبة بالكامل بـ TypeScript وتوفر IntelliSense كامل.

### Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Budget

- Bundle size: < 300KB (gzipped)
- FCP: < 1s
- LCP: < 1.5s
- TTI: < 2s

---

**📚 استخدم هذا المرجع كدليل سريع لجميع المكونات والـ APIs المتاحة!**

*آخر تحديث: أكتوبر 2025*


