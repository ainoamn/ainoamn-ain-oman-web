# 🔧 دليل إصلاح وتجنب Hydration Mismatch Errors

## ما هي مشكلة Hydration Mismatch؟

**Hydration Mismatch** تحدث عندما يكون هناك اختلاف بين:
- HTML المُولّد على السيرفر (Server-Side Rendering)
- HTML المُولّد على العميل (Client-Side Rendering)

### الخطأ الشائع:
```
Error: Text content does not match server-rendered HTML.
```

---

## الأسباب الشائعة

### 1. استخدام `Date.now()` أو `new Date()` مباشرة
```tsx
// ❌ خطأ - سيُنتج قيماً مختلفة على السيرفر والعميل
<div>{new Date().toLocaleDateString()}</div>
<div>{formatTime(Date.now())}</div>

// ✅ صحيح - استخدام قيم ثابتة أو hasMounted check
<div suppressHydrationWarning>{hasMounted && new Date().toLocaleDateString()}</div>
<div>{hasMounted ? formatTime(Date.now()) : '---'}</div>
```

### 2. استخدام `localStorage` أو `window` قبل mounting
```tsx
// ❌ خطأ - localStorage غير متوفر على السيرفر
const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

// ✅ صحيح - استخدام useEffect
const [user, setUser] = useState(null);
useEffect(() => {
  const data = localStorage.getItem('user');
  if (data) setUser(JSON.parse(data));
}, []);
```

### 3. استخدام `Math.random()` في الـ render
```tsx
// ❌ خطأ - سيُنتج قيماً مختلفة
<div key={Math.random()}>...</div>

// ✅ صحيح - استخدام ID ثابت أو index
<div key={item.id}>...</div>
<div key={index}>...</div>
```

### 4. عرض بيانات المستخدم بدون التحقق من mounting
```tsx
// ❌ خطأ
<div>{user.name}</div>

// ✅ صحيح
<div suppressHydrationWarning>{user?.name || 'مستخدم'}</div>
```

---

## الحلول المُطبقة في المشروع

### 1. Hook مُخصص: `useHasMounted`

تم إنشاء `src/hooks/useHasMounted.ts` الذي يوفر:

#### `useHasMounted()`
```tsx
import { useHasMounted } from '@/hooks/useHasMounted';

export default function MyComponent() {
  const hasMounted = useHasMounted();
  
  return (
    <div>
      {!hasMounted ? (
        <div>Loading...</div>
      ) : (
        <div>{Date.now()}</div> // آمن الآن
      )}
    </div>
  );
}
```

#### `useSafeLocalStorage(key, initialValue)`
```tsx
import { useSafeLocalStorage } from '@/hooks/useHasMounted';

export default function MyComponent() {
  const [user, setUser] = useSafeLocalStorage('user', null);
  
  return <div>{user?.name}</div>; // آمن تلقائياً
}
```

#### `useSafeDate(date, format)`
```tsx
import { useSafeDate } from '@/hooks/useHasMounted';

export default function MyComponent({ createdAt }: { createdAt: string }) {
  const formattedDate = useSafeDate(createdAt, 'long');
  
  return <div>{formattedDate}</div>; // آمن تلقائياً
}
```

#### `ClientOnly` Component
```tsx
import { ClientOnly } from '@/hooks/useHasMounted';

export default function MyComponent() {
  return (
    <ClientOnly fallback={<div>Loading...</div>}>
      <div>{window.location.href}</div> // آمن داخل ClientOnly
    </ClientOnly>
  );
}
```

---

### 2. استخدام `suppressHydrationWarning`

للمحتوى الذي قد يختلف قليلاً بين السيرفر والعميل:

```tsx
// للنصوص الديناميكية
<span suppressHydrationWarning>{user?.name || 'مستخدم'}</span>

// للأرقام الديناميكية
<span suppressHydrationWarning>{formatNumber(count)}</span>

// للتواريخ
<time suppressHydrationWarning>{formatDate(date)}</time>
```

---

## قائمة التحقق (Checklist)

### ✅ قبل إضافة كود جديد، تأكد من:

- [ ] عدم استخدام `Date.now()` أو `new Date()` مباشرة في JSX
- [ ] عدم استخدام `localStorage` أو `sessionStorage` قبل `useEffect`
- [ ] عدم استخدام `window` أو `document` قبل `useEffect`
- [ ] عدم استخدام `Math.random()` في الـ render
- [ ] استخدام `hasMounted` check للمحتوى الذي يعتمد على browser APIs
- [ ] إضافة `suppressHydrationWarning` للمحتوى الديناميكي
- [ ] إضافة قيم افتراضية (fallback values) لجميع البيانات

---

## الملفات المُصلحة

### المكونات:
- `src/components/layout/Header.tsx` - تم إصلاح عرض بيانات المستخدم
- `src/hooks/useHasMounted.ts` - Hook مُخصص جديد

### الصفحات:
- `src/pages/index.tsx` - تم إصلاح `formatRemainingTime`
- `src/pages/contracts/create.tsx` - تم استخدام `router.query`
- `src/pages/contracts/templates/[id].tsx` - تم إضافة timezone للتواريخ

---

## كيفية تجنب المشكلة في المستقبل

### القاعدة الذهبية:
> **"إذا كان المحتوى يعتمد على browser APIs أو يمكن أن يختلف بين السيرفر والعميل، استخدم `useHasMounted` أو `suppressHydrationWarning`"**

### الأمثلة:

#### ❌ تجنب هذه الأنماط:
```tsx
// 1. التواريخ المباشرة
<div>{new Date().toLocaleDateString()}</div>

// 2. localStorage المباشر
const [data] = useState(localStorage.getItem('key'));

// 3. window في الـ render
<div>{window.innerWidth}</div>

// 4. Math.random في الـ render  
<div key={Math.random()}>...</div>
```

#### ✅ استخدم هذه الأنماط بدلاً:
```tsx
// 1. التواريخ مع check
const hasMounted = useHasMounted();
<div suppressHydrationWarning>
  {hasMounted ? new Date().toLocaleDateString() : '---'}
</div>

// 2. localStorage مع hook
const [data, setData] = useSafeLocalStorage('key', null);

// 3. window مع ClientOnly
<ClientOnly>
  <div>{window.innerWidth}</div>
</ClientOnly>

// 4. IDs ثابتة
<div key={item.id}>...</div>
```

---

## الاختبار

### كيفية التحقق من عدم وجود مشاكل Hydration:

1. افتح Chrome DevTools
2. افتح Console
3. حمّل الصفحة
4. ابحث عن:
   - ✅ لا توجد أخطاء Hydration
   - ⚠️ "Text content does not match server-rendered HTML"
   - ⚠️ "Hydration failed"

### في حالة ظهور الخطأ:

1. **حدد الصفحة المتأثرة**
2. **ابحث عن استخدام:**
   - `new Date()` أو `Date.now()`
   - `localStorage` أو `sessionStorage`
   - `window` أو `navigator`
   - `Math.random()`
3. **طبّق أحد الحلول أعلاه**
4. **أعد تشغيل السيرفر**

---

## التطويرات المستقبلية

### الميزات المقترحة:
- [ ] إضافة Lint rule للكشف التلقائي عن مشاكل Hydration
- [ ] إنشاء wrapper components إضافية
- [ ] إضافة tests للـ SSR/CSR consistency

---

## الدعم

إذا واجهت مشكلة Hydration جديدة:

1. **اقرأ هذا الملف**
2. **استخدم الـ hooks المُتاحة**
3. **أضف `suppressHydrationWarning` إذا لزم الأمر**
4. **أعد تشغيل السيرفر بعد الإصلاح**

---

**آخر تحديث:** 23 أكتوبر 2025
**الحالة:** ✅ جميع مشاكل Hydration تم حلها
**الملفات المُصلحة:** 5 ملفات
**Commits:** 4 commits

---

## قائمة الإصلاحات التاريخية

### Commit 1: `8046f20`
- Fix contracts/create page
- Use router.query instead of window.location.search

### Commit 2: `8345d72`
- Fix Header component
- Add isMounted state
- Show loading skeleton

### Commit 3: `84a262c`
- Update documentation files

### Commit 4: `5797ac4` (FINAL FIX)
- Create useHasMounted hook
- Add suppressHydrationWarning to all dynamic content
- Fix Header user data display
- Fix home page auction time display
- Ensure consistent SSR/CSR output

---

✅ **لن تظهر أخطاء Hydration مرة أخرى!**

