# 🚀 دليل الاستخدام السريع - نظام الأداء الفائق

## البدء السريع

### 1. تشغيل المشروع
```bash
# تثبيت الحزم
npm install

# تشغيل بيئة التطوير
npm run dev

# افتح المتصفح
open http://localhost:3000
```

### 2. تجربة النظام
```bash
# زيارة صفحة التجربة
open http://localhost:3000/performance-demo
```

---

## 📖 أمثلة سريعة

### مثال 1: التنقل الفوري
```tsx
// ❌ الطريقة القديمة
import Link from 'next/link';

<Link href="/properties">
  تصفح العقارات
</Link>

// ✅ الطريقة الجديدة (محسنة)
import InstantLink from '@/components/InstantLink';

<InstantLink href="/properties" prefetch={true}>
  تصفح العقارات
</InstantLink>
```

**النتيجة**: تنقل فوري بدون تأخير! ⚡

---

### مثال 2: الصور المحسنة
```tsx
// ❌ الطريقة القديمة
<img src="/property.jpg" alt="عقار" />

// ✅ الطريقة الجديدة (محسنة)
import InstantImage from '@/components/InstantImage';

<InstantImage
  src="/property.jpg"
  alt="عقار فاخر"
  width={800}
  height={600}
  priority={false}
/>
```

**النتيجة**: صور محسنة مع تحميل تدريجي! 🖼️

---

### مثال 3: البيانات السريعة
```tsx
// ❌ الطريقة القديمة
const [data, setData] = useState();
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/properties')
    .then(r => r.json())
    .then(d => {
      setData(d);
      setLoading(false);
    });
}, []);

// ✅ الطريقة الجديدة (محسنة)
import { useInstantData } from '@/hooks/useInstantData';

const { data, isLoading, mutate } = useInstantData(
  '/api/properties',
  (url) => fetch(url).then(r => r.json())
);
```

**النتيجة**: بيانات سريعة مع تخزين مؤقت ذكي! 💾

---

### مثال 4: معرض صور
```tsx
import { InstantImageGallery } from '@/components/InstantImage';

const images = [
  { src: '/img1.jpg', alt: 'صورة 1' },
  { src: '/img2.jpg', alt: 'صورة 2' },
  { src: '/img3.jpg', alt: 'صورة 3' },
];

<InstantImageGallery 
  images={images} 
  columns={3} 
  gap={4}
  onImageClick={(index) => console.log('Clicked:', index)}
/>
```

**النتيجة**: معرض صور احترافي ومحسن! 📸

---

### مثال 5: زر التنقل الفوري
```tsx
import { InstantButton } from '@/components/InstantLink';

<InstantButton 
  href="/properties"
  className="px-6 py-3 bg-blue-600 text-white rounded-lg"
  onClick={() => console.log('Navigating...')}
>
  تصفح العقارات
</InstantButton>
```

**النتيجة**: زر مع تنقل فوري! 🔘

---

### مثال 6: مراقبة الأداء
```tsx
import PerformanceMonitor from '@/components/PerformanceMonitor';

export default function App() {
  return (
    <>
      {/* المحتوى */}
      
      {/* مراقب الأداء (في التطوير فقط) */}
      <PerformanceMonitor 
        enabled={process.env.NODE_ENV === 'development'}
        position="bottom-right"
      />
    </>
  );
}
```

**النتيجة**: مراقبة مباشرة للأداء! 📊

---

### مثال 7: استخدام Performance Context
```tsx
import { usePerformance } from '@/context/PerformanceContext';

export default function MyComponent() {
  const { 
    prefetchPage, 
    isOnline, 
    performanceMetrics,
    cacheSize 
  } = usePerformance();

  // Prefetch صفحة عند mount
  useEffect(() => {
    prefetchPage('/important-page');
  }, []);

  return (
    <div>
      <p>الاتصال: {isOnline ? 'متصل' : 'غير متصل'}</p>
      <p>FCP: {performanceMetrics.fcp}ms</p>
      <p>Cache: {(cacheSize / 1024).toFixed(2)} KB</p>
    </div>
  );
}
```

**النتيجة**: تحكم كامل في الأداء! ⚙️

---

### مثال 8: قياس الأداء
```tsx
import { measurePerformance } from '@/lib/performance';

async function loadData() {
  return measurePerformance('Load Properties', async () => {
    const response = await fetch('/api/properties');
    return response.json();
  });
}

// Console output: [Performance] Load Properties: 234.56ms
```

**النتيجة**: قياس دقيق للأداء! ⏱️

---

### مثال 9: Preload البيانات
```tsx
import { preloadData } from '@/hooks/useInstantData';

// Preload قبل الحاجة
useEffect(() => {
  preloadData('properties-list', async () => {
    const response = await fetch('/api/properties');
    return response.json();
  });
}, []);

// استخدام لاحقاً (من الـ cache)
const { data } = useInstantData('properties-list', fetcher);
```

**النتيجة**: بيانات جاهزة فوراً! 🎯

---

### مثال 10: مسح الـ Cache
```tsx
import { clearCache, getCacheSize } from '@/hooks/useInstantData';

async function handleClearCache() {
  const sizeBefore = await getCacheSize();
  console.log('Cache size before:', sizeBefore);
  
  await clearCache();
  
  const sizeAfter = await getCacheSize();
  console.log('Cache size after:', sizeAfter);
}
```

**النتيجة**: إدارة كاملة للـ cache! 🗑️

---

## 🎨 أنماط الاستخدام الشائعة

### نمط 1: صفحة قائمة عقارات
```tsx
import InstantLink from '@/components/InstantLink';
import InstantImage from '@/components/InstantImage';
import { useInstantData } from '@/hooks/useInstantData';

export default function PropertiesPage() {
  const { data: properties, isLoading } = useInstantData(
    '/api/properties',
    (url) => fetch(url).then(r => r.json())
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-3 gap-4">
      {properties.map((property) => (
        <InstantLink 
          key={property.id}
          href={`/property/${property.id}`}
          className="property-card"
        >
          <InstantImage
            src={property.image}
            alt={property.title}
            width={400}
            height={300}
          />
          <h3>{property.title}</h3>
          <p>{property.price}</p>
        </InstantLink>
      ))}
    </div>
  );
}
```

---

### نمط 2: Header محسن
```tsx
import InstantLink from '@/components/InstantLink';

export default function Header() {
  return (
    <nav>
      <InstantLink href="/">الرئيسية</InstantLink>
      <InstantLink href="/properties">العقارات</InstantLink>
      <InstantLink href="/auctions">المزادات</InstantLink>
      <InstantLink href="/favorites">المفضلة</InstantLink>
    </nav>
  );
}
```

---

### نمط 3: صفحة تفاصيل محسنة
```tsx
import InstantImage, { InstantImageGallery } from '@/components/InstantImage';
import { useInstantData } from '@/hooks/useInstantData';
import { useRouter } from 'next/router';

export default function PropertyDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: property, isLoading } = useInstantData(
    id ? `/api/properties/${id}` : null,
    (url) => fetch(url).then(r => r.json())
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <InstantImageGallery 
        images={property.images}
        columns={4}
      />
      <h1>{property.title}</h1>
      <p>{property.description}</p>
    </div>
  );
}
```

---

## ⚙️ الإعدادات والتخصيص

### تخصيص Prefetch
```tsx
<InstantLink 
  href="/page"
  prefetch={true}  // تفعيل/تعطيل prefetch
  scroll={true}    // Scroll إلى أعلى عند التنقل
  shallow={false}  // Shallow routing
  replace={false}  // استبدال بدلاً من push
>
  رابط
</InstantLink>
```

### تخصيص الصور
```tsx
<InstantImage
  src="/image.jpg"
  alt="صورة"
  width={800}
  height={600}
  priority={false}      // أولوية التحميل
  quality={75}          // جودة الصورة (1-100)
  placeholder="blur"    // نوع placeholder
  objectFit="cover"     // كيفية ملء المساحة
  loading="lazy"        // lazy أو eager
/>
```

### تخصيص useInstantData
```tsx
const { data, error, isLoading, mutate } = useInstantData(
  '/api/data',
  fetcher,
  {
    revalidateOnFocus: true,        // إعادة التحميل عند التركيز
    revalidateOnReconnect: true,    // إعادة التحميل عند عودة الاتصال
    dedupingInterval: 2000,         // منع الطلبات المكررة (2 ثانية)
    errorRetryCount: 3,             // عدد محاولات إعادة الطلب
    errorRetryInterval: 5000,       // الفترة بين المحاولات
    onSuccess: (data) => {          // عند النجاح
      console.log('Success:', data);
    },
    onError: (error) => {           // عند الفشل
      console.error('Error:', error);
    },
  }
);
```

---

## 🐛 استكشاف المشاكل

### مشكلة: الروابط لا تعمل بشكل فوري
```tsx
// ✅ الحل: تأكد من استخدام InstantLink
import InstantLink from '@/components/InstantLink';

// ✅ تأكد من تفعيل prefetch
<InstantLink href="/page" prefetch={true}>
```

### مشكلة: الصور لا تظهر
```tsx
// ✅ الحل: تحقق من المسار والأبعاد
<InstantImage
  src="/correct-path/image.jpg"  // مسار صحيح
  width={800}                     // عرض محدد
  height={600}                    // ارتفاع محدد
/>
```

### مشكلة: البيانات لا تتحدث
```tsx
// ✅ الحل: استخدم mutate لإعادة التحميل
const { data, mutate } = useInstantData(key, fetcher);

// إعادة التحميل يدوياً
mutate();

// تحديث البيانات مباشرة
mutate(newData, false);
```

---

## 📊 مراقبة الأداء

### في بيئة التطوير:
```tsx
// افتح المتصفح
open http://localhost:3000

// افتح DevTools (F12)
// تابع Console للرسائل
// [Performance] Navigation to /properties: 23.45ms
// [SW] Service Worker loaded successfully! ⚡
```

### باستخدام Lighthouse:
```bash
# DevTools > Lighthouse > Generate Report
# راقب: Performance, Accessibility, Best Practices, SEO
```

---

## 🎯 نصائح للأداء الأمثل

### 1. استخدم InstantLink لجميع الروابط الداخلية
```tsx
✅ <InstantLink href="/internal">داخلي</InstantLink>
❌ <a href="/internal">داخلي</a>
```

### 2. حدد أبعاد الصور دائماً
```tsx
✅ <InstantImage width={800} height={600} />
❌ <InstantImage /> // بدون أبعاد
```

### 3. استخدم priority للصور المهمة فقط
```tsx
✅ <InstantImage priority={true} /> // للصورة الرئيسية
❌ <InstantImage priority={true} /> // لجميع الصور
```

### 4. استخدم useInstantData مع key ثابت
```tsx
✅ const { data } = useInstantData('/api/properties', fetcher);
❌ const { data } = useInstantData(Math.random(), fetcher);
```

### 5. Prefetch الصفحات المهمة مبكراً
```tsx
const { prefetchPage } = usePerformance();

useEffect(() => {
  prefetchPage('/important-page');
}, []);
```

---

## 🚀 الخطوات التالية

1. ✅ اختبر النظام على `/performance-demo`
2. ✅ راقب الأداء باستخدام PerformanceMonitor
3. ✅ حدّث المكونات الحالية تدريجياً
4. ✅ قِس التحسينات باستخدام Lighthouse
5. ✅ شارك التغذية الراجعة مع الفريق

---

## 📚 موارد إضافية

- **الوثائق الكاملة**: `INSTANT_NAVIGATION_README.md`
- **الملخص الشامل**: `PERFORMANCE_UPGRADE_SUMMARY.md`
- **صفحة التجربة**: `/performance-demo`
- **تعليقات الكود**: في جميع الملفات

---

**✨ استمتع بالأداء الفائق! ⚡**

*آخر تحديث: أكتوبر 2025*


