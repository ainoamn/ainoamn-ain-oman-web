# 🔄 دليل التحديث - Migration Guide

## نقل الصفحات القديمة إلى نظام الأداء الفائق ⚡

### 📋 خطوات التحديث

#### 1. تحديث Imports

**قبل:**
```tsx
import Link from 'next/link';
```

**بعد:**
```tsx
import Link from 'next/link';
import InstantLink from '@/components/InstantLink';
// أو
import { InstantLink } from '@/components/instant';
```

---

#### 2. استبدال Link بـ InstantLink

**قبل:**
```tsx
<Link href="/properties">
  تصفح العقارات
</Link>
```

**بعد:**
```tsx
<InstantLink href="/properties">
  تصفح العقارات
</InstantLink>
```

---

#### 3. تحديث الصور

**قبل:**
```tsx
<img src="/property.jpg" alt="عقار" />
```

**بعد:**
```tsx
import InstantImage from '@/components/InstantImage';

<InstantImage
  src="/property.jpg"
  alt="عقار"
  width={800}
  height={600}
/>
```

---

#### 4. إزالة Header و Footer من الصفحات

**قبل:**
```tsx
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Page() {
  return (
    <>
      <Header />
      {/* المحتوى */}
      <Footer />
    </>
  );
}
```

**بعد:**
```tsx
// Header و Footer يتم إضافتهم تلقائياً بواسطة MainLayout في _app.tsx

export default function Page() {
  return (
    <>
      {/* المحتوى فقط */}
    </>
  );
}
```

---

#### 5. تحديث router.push إلى InstantLink

**قبل:**
```tsx
<button onClick={() => router.push('/properties')}>
  تصفح
</button>
```

**بعد:**
```tsx
import { InstantButton } from '@/components/InstantLink';

<InstantButton href="/properties">
  تصفح
</InstantButton>
```

---

### 🎯 أمثلة كاملة

#### مثال 1: صفحة قائمة

**قبل:**
```tsx
import Link from 'next/link';

export default function PropertiesPage() {
  return (
    <div>
      {properties.map(p => (
        <Link key={p.id} href={`/property/${p.id}`}>
          <div className="card">
            <img src={p.image} alt={p.title} />
            <h3>{p.title}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

**بعد:**
```tsx
import InstantLink from '@/components/InstantLink';
import InstantImage from '@/components/InstantImage';

export default function PropertiesPage() {
  return (
    <div>
      {properties.map(p => (
        <InstantLink key={p.id} href={`/property/${p.id}`}>
          <div className="card">
            <InstantImage
              src={p.image}
              alt={p.title}
              width={400}
              height={300}
            />
            <h3>{p.title}</h3>
          </div>
        </InstantLink>
      ))}
    </div>
  );
}
```

---

#### مثال 2: صفحة تفاصيل

**قبل:**
```tsx
import { useRouter } from 'next/router';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function DetailsPage() {
  const router = useRouter();
  
  return (
    <>
      <Header />
      <main>
        <button onClick={() => router.push('/properties')}>
          عودة
        </button>
        <img src="/detail.jpg" alt="تفاصيل" />
      </main>
      <Footer />
    </>
  );
}
```

**بعد:**
```tsx
import { InstantButton } from '@/components/InstantLink';
import InstantImage from '@/components/InstantImage';

export default function DetailsPage() {
  return (
    <main>
      <InstantButton href="/properties">
        عودة
      </InstantButton>
      <InstantImage
        src="/detail.jpg"
        alt="تفاصيل"
        width={1200}
        height={800}
        priority={true}
      />
    </main>
  );
}
```

---

### 🔧 المشاكل الشائعة وحلولها

#### مشكلة 1: Header is not defined

**السبب:** استخدام Header مباشرة في الصفحة  
**الحل:** إزالة Header و Footer - يتم إضافتهم تلقائياً

```tsx
// ❌ خطأ
<Header />

// ✅ صحيح
// لا حاجة - MainLayout يضيفهم تلقائياً
```

---

#### مشكلة 2: الصور لا تظهر

**السبب:** مسار الصورة خاطئ أو أبعاد غير محددة  
**الحل:** تحديد المسار الصحيح والأبعاد

```tsx
// ❌ خطأ
<InstantImage src="image.jpg" />

// ✅ صحيح
<InstantImage
  src="/images/property.jpg"
  alt="عقار"
  width={800}
  height={600}
/>
```

---

#### مشكلة 3: التنقل بطيء

**السبب:** استخدام Link عادي بدلاً من InstantLink  
**الحل:** استخدام InstantLink

```tsx
// ❌ بطيء
<Link href="/page">Page</Link>

// ✅ فوري ⚡
<InstantLink href="/page">Page</InstantLink>
```

---

### 📊 قائمة التحقق

استخدم هذه القائمة عند تحديث أي صفحة:

- [ ] استبدال `Link` بـ `InstantLink`
- [ ] استبدال `<img>` بـ `InstantImage`
- [ ] إزالة `Header` و `Footer` المباشرين
- [ ] تحديث `router.push` إلى `InstantLink` أو `InstantButton`
- [ ] تحديد أبعاد جميع الصور
- [ ] اختبار الصفحة
- [ ] التحقق من عدم وجود أخطاء في Console

---

### 🚀 نصائح للأداء

1. **استخدم priority للصور المهمة فقط**
```tsx
// للصورة الرئيسية فقط
<InstantImage priority={true} />

// لباقي الصور
<InstantImage priority={false} />
```

2. **حدد الأبعاد الصحيحة**
```tsx
// حدد الأبعاد الفعلية للصورة
<InstantImage width={800} height={600} />
```

3. **استخدم prefetch بحكمة**
```tsx
// للروابط المهمة
<InstantLink href="/important" prefetch={true} />

// للروابط الأقل أهمية (مثل footer)
<InstantLink href="/terms" prefetch={false} />
```

---

### 📚 موارد إضافية

- [دليل الاستخدام الكامل](INSTANT_NAVIGATION_README.md)
- [دليل البدء السريع](QUICK_START_GUIDE.md)
- [مرجع API](COMPONENTS_API_REFERENCE.md)

---

### ✅ الصفحات التي تم تحديثها

- [x] `src/pages/_app.tsx` - PerformanceProvider
- [x] `src/components/layout/Header.tsx` - InstantLink
- [x] `src/components/properties/PropertyCard.tsx` - InstantLink & InstantImage
- [x] `src/pages/auctions/[id].tsx` - إصلاح Header error
- [x] `src/pages/index.tsx` - إضافة InstantLink import
- [ ] `src/pages/properties/index.tsx` - قيد العمل
- [ ] `src/pages/auctions/index.tsx` - قيد العمل
- [ ] باقي الصفحات - قيد التحديث التدريجي

---

**💡 ملاحظة:** التحديث تدريجي - الصفحات القديمة ستعمل ولكن بدون تحسينات الأداء الفائق.

**🎯 الهدف:** تحديث جميع الصفحات الرئيسية أولاً، ثم الصفحات الثانوية تدريجياً.

---

*آخر تحديث: أكتوبر 2025*

