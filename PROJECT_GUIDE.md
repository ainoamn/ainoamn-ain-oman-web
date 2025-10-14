# 📘 دليل المشروع الشامل - Ain Oman Web

## 🎯 نظرة عامة

**المشروع:** Ain Oman - منصة العقارات الذكية  
**التقنية:** Next.js 15 + TypeScript + Tailwind CSS  
**المسار:** `C:\dev\ain-oman-web`  
**الغرض:** منصة عقارات متكاملة في سلطنة عُمان  

---

## 🏗️ هيكل المشروع

### 📁 الهيكل الرئيسي

```
C:\dev\ain-oman-web\
│
├── src/                          # الكود المصدري
│   ├── components/               # المكونات
│   ├── pages/                    # الصفحات
│   ├── context/                  # Context APIs
│   ├── hooks/                    # Custom Hooks
│   ├── lib/                      # المكتبات المساعدة
│   ├── styles/                   # ملفات CSS
│   ├── types/                    # TypeScript Types
│   └── utils/                    # دوال مساعدة
│
├── public/                       # الملفات العامة
│   ├── sw.js                     # Service Worker
│   ├── manifest.json             # PWA Manifest
│   └── images/                   # الصور
│
├── .data/                        # قاعدة البيانات المحلية (JSON)
│   ├── bookings.json
│   ├── properties.json
│   └── db.json
│
├── scripts/                      # سكريبتات مساعدة
│   └── fix-dates-simple.ps1
│
├── docs/                         # التوثيق
│   └── (25+ ملف توثيق)
│
├── next.config.js                # إعدادات Next.js
├── tailwind.config.js            # إعدادات Tailwind
├── tsconfig.json                 # إعدادات TypeScript
└── package.json                  # التبعيات
```

---

## 📂 دليل المجلدات المفصل

### 1. `src/components/` - المكونات

#### المكونات الأساسية:
```
components/
├── InstantLink.tsx           ⚡ رابط سريع مع prefetching
├── InstantImage.tsx          ⚡ صورة محسّنة
├── SafeText.tsx              ⚡ نص آمن لمعالجة Objects
├── FeatureGate.tsx           🔐 التحكم في عرض المحتوى حسب الباقة (جديد!)
│
├── layout/                   # مكونات التخطيط
│   ├── Header.tsx            # الرأس (Navbar)
│   ├── Footer.tsx            # التذييل
│   └── MainLayout.tsx        # التخطيط الرئيسي
│
├── properties/               # مكونات العقارات
│   ├── PropertyCard.tsx      # بطاقة العقار
│   ├── PropertyFilter.tsx    # فلتر العقارات
│   └── ...
│
├── booking/                  # مكونات الحجز
│   └── SmartSyncIndicator.tsx
│
├── admin/                    # مكونات الإدارة
│   ├── AdvancedFilterSystem.tsx
│   ├── AdvancedDataTable.tsx
│   └── SmartAnalytics.tsx
│
└── dashboard/                # مكونات لوحات التحكم
    ├── StatsOverview.tsx
    └── RentalStatusChart.tsx
```

#### متى تستخدم أي مكون:
```typescript
// للروابط → استخدم InstantLink
import InstantLink from '@/components/InstantLink';
<InstantLink href="/properties">العقارات</InstantLink>

// للصور → استخدم InstantImage
import InstantImage from '@/components/InstantImage';
<InstantImage src="/image.jpg" alt="صورة" />

// لنص قد يكون object → استخدم toSafeText
import { toSafeText } from '@/components/SafeText';
const title = toSafeText(property.title, 'ar');
```

---

### 2. `src/pages/` - الصفحات

#### هيكل الصفحات:
```
pages/
├── _app.tsx                  # نقطة الدخول الرئيسية (Providers)
├── _document.tsx             # HTML Document
├── index.tsx                 # الصفحة الرئيسية
│
├── properties/               # العقارات
│   ├── index.tsx             # قائمة العقارات
│   ├── [id].tsx              # تفاصيل العقار
│   ├── new.tsx               # إضافة عقار
│   └── [id]/
│       ├── edit.tsx          # تعديل عقار
│       └── bookings.tsx      # حجوزات العقار
│
├── booking/                  # الحجوزات ⚡ NEW
│   ├── new.tsx               # حجز جديد (3 خطوات)
│   └── [id]/
│       ├── payment.tsx       # صفحة الدفع (4 طرق)
│       └── success.tsx       # صفحة النجاح
│
├── bookings/                 # قائمة الحجوزات
│   └── index.tsx             # مُعاد تصميمها ⚡
│
├── chat.tsx                  # الدردشة ⚡ NEW
│
├── admin/                    # لوحة الإدارة
│   ├── bookings/
│   │   ├── index.tsx         # قائمة الحجوزات (Admin)
│   │   └── [id].tsx          # تفاصيل الحجز - مُعاد تصميمها ⚡
│   ├── properties/
│   ├── contracts/
│   ├── customers/
│   └── ...
│
├── dashboard/                # لوحات التحكم
│   ├── owner.tsx             # لوحة المعلن
│   ├── customer.tsx          # لوحة العميل
│   └── ...
│
├── profile/                  # الملف الشخصي
│   ├── index.tsx
│   └── bookings.tsx
│
└── api/                      # API Routes
    ├── bookings/
    │   ├── index.ts          # GET, POST
    │   └── [id].ts           # GET, PATCH, DELETE
    ├── properties/
    ├── messages.ts           ⚡ NEW
    ├── reviews.ts            ⚡ NEW
    └── badges.ts             ⚡ NEW
```

---

### 3. `src/context/` - Context APIs

```
context/
├── PerformanceContext.tsx      ⚡ إدارة الأداء
├── BookingsContext.tsx         ⚡ إدارة الحجوزات (موحد!)
├── SubscriptionContext.tsx     🔐 إدارة الاشتراكات والصلاحيات (جديد!)
├── AuthContext.tsx             # المصادقة
├── CurrencyContext.tsx         # العملات
└── ChatContext.tsx             # الدردشة
```

#### كيفية استخدام Context:

```typescript
// في _app.tsx (تم بالفعل):
<SubscriptionProvider>
  <BookingsProvider>
    <App />
  </BookingsProvider>
</SubscriptionProvider>

// في أي صفحة:
import { useBookings } from '@/context/BookingsContext';
const { bookings, loading, addBooking, updateBooking } = useBookings();

// للاشتراكات والصلاحيات:
import { useSubscription } from '@/context/SubscriptionContext';
const { plan, hasFeature, canUseFeature } = useSubscription();
```

---

### 4. `src/hooks/` - Custom Hooks

```
hooks/
├── useInstantData.ts         ⚡ جلب بيانات سريع (SWR-like)
├── useOptimizedImage.ts      ⚡ تحسين الصور
├── useTranslation.ts         # الترجمة
└── ...
```

---

### 5. `src/lib/` - المكتبات المساعدة

```
lib/
├── i18n.ts                   # نظام الترجمة الرئيسي ✅
├── i18n-helpers.ts           ⚡ دوال مساعدة لـ i18n
├── dateHelpers.ts            ⚡ دوال التواريخ الميلادية
├── serviceWorker.ts          ⚡ تسجيل Service Worker
├── performance.ts            # مراقبة الأداء
└── fsdb.ts                   # قاعدة بيانات ملفات
```

---

## 🎨 معايير البرمجة

### 1. **تسمية الملفات**

```
✅ PascalCase للمكونات: PropertyCard.tsx
✅ camelCase للـ utilities: dateHelpers.ts
✅ kebab-case للصفحات الديناميكية: [id].tsx
✅ lowercase للـ API: bookings/index.ts
```

### 2. **تسمية المتغيرات**

```typescript
✅ camelCase: const userName = 'أحمد';
✅ PascalCase للـ Types: interface User {}
✅ UPPER_CASE للثوابت: const MAX_SIZE = 100;
```

### 3. **استيراد الملفات**

```typescript
// ✅ الترتيب الصحيح:
// 1. React
import { useState, useEffect } from 'react';

// 2. Next.js
import { useRouter } from 'next/router';
import Head from 'next/head';

// 3. مكونات خارجية
import { FaHome } from 'react-icons/fa';

// 4. مكونات محلية
import InstantLink from '@/components/InstantLink';

// 5. Context & Hooks
import { useBookings } from '@/context/BookingsContext';

// 6. Types
import type { Property } from '@/types/property';

// 7. دوال مساعدة
import { toSafeText } from '@/components/SafeText';
import { formatDate } from '@/lib/dateHelpers';
```

### 4. **بناء المكونات**

```typescript
// ✅ الهيكل القياسي:
import { useState } from 'react';

interface MyComponentProps {
  title: string;
  onSave?: () => void;
}

export default function MyComponent({ title, onSave }: MyComponentProps) {
  const [loading, setLoading] = useState(false);
  
  const handleSave = async () => {
    setLoading(true);
    try {
      // العملية
      onSave?.();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <button onClick={handleSave} disabled={loading}>
        {loading ? 'جاري الحفظ...' : 'حفظ'}
      </button>
    </div>
  );
}
```

---

## 🔧 التقنيات المستخدمة

### Frontend:
- ✅ **Next.js 15.4.6** - React Framework
- ✅ **React 18+** - مكتبة UI
- ✅ **TypeScript** - Type Safety
- ✅ **Tailwind CSS** - Styling
- ✅ **Framer Motion** - Animations

### State Management:
- ✅ **Context API** - Global State
- ✅ **React Hooks** - Local State
- ✅ **SWR Pattern** - Data Fetching

### Performance:
- ✅ **Service Worker** - Caching & Offline
- ✅ **Image Optimization** - WebP, AVIF
- ✅ **Code Splitting** - Dynamic Imports
- ✅ **Prefetching** - Link Prefetching

### i18n:
- ✅ **Custom i18n System** - `src/lib/i18n.ts`
- ✅ **RTL Support** - دعم العربية
- ✅ **Multiple Languages** - عربي/إنجليزي

### Data Storage:
- ✅ **JSON Files** - `.data/*.json`
- ✅ **localStorage** - Browser Storage
- ✅ **API Routes** - Next.js API

### Real-time Communication (جديد - المرحلة 22):
- ✅ **BroadcastChannel API** - تزامن فوري بين التبويبات (< 200ms)
- ✅ **CustomEvent** - تزامن داخل نفس التبويب
- ✅ **Centralized API** - roles-config.json للتزامن عبر المتصفحات

### Best Practices (محدّث):
- ✅ **Hydration-safe Rendering** - استخدام mounted state لتجنب hydration errors
- ✅ **Dynamic Components** - مكونات تتغير حسب permissions
- ✅ **InstantLink Pattern** - استخدام InstantLink بدلاً من <a> أو <button> للروابط
- ✅ **Permission-based UI** - واجهات ديناميكية حسب صلاحيات المستخدم

---

## 📐 معايير التصميم

### 1. **الألوان** 🎨

```css
/* Primary Colors */
--color-primary: #059669 (green-600)
--color-secondary: #2563eb (blue-600)

/* Status Colors */
--color-success: #10b981 (green-500)
--color-warning: #f59e0b (yellow-500)
--color-error: #ef4444 (red-500)
--color-info: #3b82f6 (blue-500)

/* Neutrals */
--color-gray-50: #f9fafb
--color-gray-900: #111827

/* Gradients */
from-green-600 to-blue-600
from-gray-50 to-gray-100
```

### 2. **Typography** ✍️

```css
/* Headings */
h1: text-4xl font-bold (36px)
h2: text-3xl font-bold (30px)
h3: text-2xl font-bold (24px)
h4: text-xl font-bold (20px)
h5: text-lg font-semibold (18px)

/* Body */
p: text-base (16px)
small: text-sm (14px)
tiny: text-xs (12px)
```

### 3. **Spacing** 📏

```css
/* Padding */
p-2: 0.5rem (8px)
p-4: 1rem (16px)
p-6: 1.5rem (24px)
p-8: 2rem (32px)

/* Margin */
m-2, m-4, m-6, m-8 (نفس الأعلاه)

/* Gap */
gap-2, gap-4, gap-6 (للـ flex & grid)
```

### 4. **Borders & Shadows** 🎭

```css
/* Rounded */
rounded-lg: 0.5rem
rounded-xl: 0.75rem
rounded-2xl: 1rem
rounded-3xl: 1.5rem

/* Shadows */
shadow-sm: صغير
shadow-md: متوسط
shadow-lg: كبير
shadow-xl: أكبر
shadow-2xl: الأكبر
```

---

## 🔗 أنماط الربط والتنقل

### 1. **الروابط الداخلية** (استخدم InstantLink)

```typescript
import InstantLink from '@/components/InstantLink';

// ✅ الطريقة الصحيحة:
<InstantLink href="/properties">العقارات</InstantLink>

// ❌ لا تستخدم:
<Link href="/properties">العقارات</Link>
```

### 2. **الانتقال البرمجي**

```typescript
import { useRouter } from 'next/router';

const router = useRouter();

// ✅ مع await للسرعة:
await router.push('/booking/success');

// البدائل:
await router.replace('/login'); // بدون history
await router.back(); // للخلف
```

### 3. **Prefetching**

```typescript
// InstantLink يقوم بـ prefetch تلقائياً!
<InstantLink href="/properties" prefetch={true}>
  العقارات
</InstantLink>
```

---

## 📦 إدارة البيانات

### 1. **Context API** (للبيانات المشتركة)

```typescript
// الحجوزات (موجود):
import { useBookings } from '@/context/BookingsContext';

const { bookings, loading, addBooking, updateBooking } = useBookings();

// استخدام:
addBooking(newBooking);      // إضافة
updateBooking(id, updates);  // تحديث
```

### 2. **API Routes** (جلب البيانات)

```typescript
// GET: جلب البيانات
const response = await fetch('/api/bookings');
const data = await response.json();

// POST: إضافة جديد
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

// PATCH: تحديث موجود
const response = await fetch(`/api/bookings/${id}`, {
  method: 'PATCH',
  body: JSON.stringify(updates)
});

// DELETE: حذف
const response = await fetch(`/api/bookings/${id}`, {
  method: 'DELETE'
});
```

### 3. **localStorage** (بيانات محلية)

```typescript
// حفظ
localStorage.setItem('key', JSON.stringify(data));

// جلب
const data = JSON.parse(localStorage.getItem('key') || '{}');

// حذف
localStorage.removeItem('key');
```

---

## 🌍 نظام i18n (الترجمة)

### الاستيراد الموحد:
```typescript
// ✅ استخدم دائماً:
import { useI18n } from '@/lib/i18n';

const { t, dir, lang, setLang } = useI18n();
```

### معالجة Objects المترجمة:
```typescript
import { toSafeText } from '@/components/SafeText';

// إذا كان النص قد يكون object:
const title = toSafeText(property.title, 'ar');

// في JSX:
<h1>{title}</h1>
```

### بناء النصوص:
```typescript
// للنصوص الثابتة:
<h1>{t('properties.title')}</h1>

// للنصوص الديناميكية:
const title = toSafeText(data.title, lang);
<h1>{title}</h1>
```

---

## 📅 التعامل مع التواريخ

### **استخدام التقويم الميلادي (Gregorian)** ✅

```typescript
import { formatDate, formatDateTime, formatDateShort } from '@/lib/dateHelpers';

// تنسيق طويل:
formatDate('2025-10-08', 'long')  // → "8 أكتوبر 2025"

// تنسيق قصير:
formatDateShort('2025-10-08')  // → "08/10/2025"

// تاريخ ووقت:
formatDateTime('2025-10-08T15:30:00')  // → "8 أكتوبر 2025 3:30 م"
```

### **في المكونات:**

```typescript
// ✅ الطريقة الصحيحة:
new Date(date).toLocaleDateString('ar', {
  calendar: 'gregory',      // التقويم الميلادي
  numberingSystem: 'latn',  // الأرقام اللاتينية
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

// ❌ لا تستخدم:
new Date(date).toLocaleDateString('ar-SA')  // هجري
```

---

## 💰 التعامل مع العملات

```typescript
// التنسيق القياسي:
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-OM', {
    style: 'currency',
    currency: 'OMR',
    maximumFractionDigits: 3
  }).format(amount || 0);
};

// الاستخدام:
formatCurrency(1500)  // → "1,500.000 ر.ع"
```

---

## 🎨 أنماط Tailwind المستخدمة

### 1. **الأزرار**

```typescript
// Primary
className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"

// Secondary
className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"

// Outline
className="border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50"

// Danger
className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
```

### 2. **البطاقات**

```typescript
// بطاقة بسيطة
className="bg-white rounded-xl shadow-sm p-6"

// بطاقة مميزة
className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow"

// بطاقة مع Gradient
className="bg-gradient-to-br from-green-600 to-blue-600 text-white rounded-2xl p-6"
```

### 3. **النماذج**

```typescript
// Input
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"

// Select
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"

// Textarea
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 min-h-[120px]"
```

### 4. **Grid Layouts**

```typescript
// 2 أعمدة
className="grid md:grid-cols-2 gap-6"

// 3 أعمدة
className="grid md:grid-cols-3 gap-6"

// 4 أعمدة
className="grid grid-cols-2 md:grid-cols-4 gap-4"

// Responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

---

## 🔐 معايير الأمان

### 1. **التحقق من المدخلات**

```typescript
// ✅ دائماً:
const sanitizedInput = String(input || '').trim();
if (!sanitizedInput) {
  return alert('الحقل مطلوب');
}
```

### 2. **معالجة الأخطاء**

```typescript
try {
  const response = await fetch('/api/bookings');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  // ...
} catch (error) {
  console.error('Error:', error);
  alert('حدث خطأ: ' + (error as Error).message);
}
```

### 3. **التحقق من الصلاحيات**

```typescript
// في الصفحات الإدارية:
if (session?.user?.role !== 'admin') {
  return <div>غير مصرح</div>;
}
```

---

## 📱 Responsive Design

### Breakpoints:
```css
sm: 640px   /* Tablet صغير */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop صغير */
xl: 1280px  /* Desktop */
2xl: 1536px /* Desktop كبير */
```

### أمثلة:
```typescript
// Stack على Mobile، Grid على Desktop:
className="flex flex-col md:flex-row gap-4"

// 1 عمود Mobile، 2 Tablet، 3 Desktop:
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// إخفاء على Mobile:
className="hidden md:block"

// إظهار على Mobile فقط:
className="block md:hidden"
```

---

## 🔄 دورة حياة الحجز

```
1. المستخدم → /properties/[id]
   ↓ (يضغط "حجز الوحدة")
   
2. → /booking/new?propertyId=X
   - الخطوة 1: البيانات الشخصية
   - الخطوة 2: تفاصيل الحجز
   - الخطوة 3: المراجعة
   ↓ (يضغط "تأكيد الحجز")
   
3. → POST /api/bookings
   ✅ حفظ في API
   ✅ إضافة إلى Context (addBooking)
   ↓
   
4. → /booking/[id]/payment
   - اختيار طريقة الدفع (4 خيارات)
   - إدخال التفاصيل
   ↓ (يضغط "تأكيد الدفع")
   
5. → PATCH /api/bookings/[id]
   ✅ تحديث الحالة إلى 'paid'
   ✅ تحديث Context (updateBooking)
   ↓
   
6. → /booking/[id]/success
   ✅ عرض تفاصيل النجاح
   ✅ طباعة / مشاركة
```

---

## 🗂️ أنواع الملفات

### TypeScript/React:
```
.tsx  → React components
.ts   → TypeScript utilities
.jsx  → React (JavaScript)
.js   → JavaScript utilities
```

### Styles:
```
.css  → CSS عادي
globals.css → Tailwind base
```

### Data:
```
.json → بيانات ثابتة
```

### Config:
```
next.config.js       → Next.js
tailwind.config.js   → Tailwind
tsconfig.json        → TypeScript
```

---

## 📋 APIs الموجودة

### Bookings:
```
GET    /api/bookings           # قائمة الحجوزات
POST   /api/bookings           # إنشاء حجز
GET    /api/bookings/[id]      # تفاصيل حجز
PATCH  /api/bookings/[id]      # تحديث حجز
DELETE /api/bookings/[id]      # حذف حجز
```

### Properties:
```
GET    /api/properties         # قائمة العقارات
POST   /api/properties         # إضافة عقار
GET    /api/properties/[id]    # تفاصيل عقار
PATCH  /api/properties/[id]    # تحديث عقار
```

### Messages:
```
GET    /api/messages           # قائمة الرسائل
POST   /api/messages           # إرسال رسالة
```

### Reviews:
```
GET    /api/reviews            # قائمة التقييمات
POST   /api/reviews            # إضافة تقييم
```

### Badges:
```
GET    /api/badges             # قائمة الشارات
```

---

## 🎯 قواعد البرمجة المتبعة

### 1. **NEVER استورد Header/Footer مباشرة**
```typescript
// ❌ خطأ:
import Header from '@/components/layout/Header';

// ✅ صح:
// لا شيء! MainLayout يتعامل معهما
```

### 2. **ALWAYS استخدم InstantLink**
```typescript
// ✅ صح:
import InstantLink from '@/components/InstantLink';

// ❌ خطأ:
import Link from 'next/link';
```

### 3. **ALWAYS استخدم toSafeText للنصوص الديناميكية**
```typescript
// ✅ صح:
const title = toSafeText(property.title, 'ar');
<h1>{title}</h1>

// ❌ خطأ:
<h1>{property.title}</h1>  // قد يكون object!
```

### 4. **ALWAYS استخدم Context للحجوزات**
```typescript
// ✅ صح:
const { bookings } = useBookings();

// ❌ خطأ:
useEffect(() => {
  fetch('/api/bookings').then(...)
}, []);
```

### 5. **ALWAYS استخدم formatDate للتواريخ**
```typescript
// ✅ صح:
import { formatDate } from '@/lib/dateHelpers';
const date = formatDate('2025-10-08', 'long');

// ❌ خطأ:
new Date(date).toLocaleDateString('ar-SA')  // هجري!
```

---

## 🛠️ أوامر مهمة

### Development:
```bash
npm run dev          # تشغيل الخادم
npm run build        # بناء للإنتاج
npm run start        # تشغيل الإنتاج
npm run lint         # فحص الأخطاء
```

### Git:
```bash
git status           # حالة الملفات
git add .            # إضافة الكل
git commit -m "msg"  # حفظ
git push             # رفع
git pull             # تحديث
```

---

## 📊 الإحصائيات

### الملفات:
- المكونات: 50+ component
- الصفحات: 80+ page
- APIs: 20+ endpoint
- Contexts: 5 context
- Hooks: 10+ hook

### الكود:
- إجمالي الأسطر: ~50,000+
- TypeScript: 90%
- JavaScript: 10%

---

## 🎯 نقاط مهمة للتذكر

### 1. **الأداء:**
- استخدم InstantLink دائماً
- استخدم InstantImage للصور
- Prefetch الصفحات المهمة

### 2. **البيانات:**
- استخدم Context للبيانات المشتركة
- تحديث Context عند الإضافة/التعديل
- معالجة الأخطاء دائماً

### 3. **التصميم:**
- Mobile first
- Gradient backgrounds للـ CTAs
- Icons واضحة
- Shadows ناعمة

### 4. **i18n:**
- استخدم toSafeText للنصوص الديناميكية
- استورد من '@/lib/i18n'
- دعم RTL

### 5. **التواريخ:**
- استخدم التقويم الميلادي
- الأرقام اللاتينية (1,2,3)
- استخدم formatDate()

---

## 📞 للعمل من كمبيوتر جديد

### الخطوات:
1. افتح المشروع: `cd C:\dev\ain-oman-web`
2. اقرأ: `CONVERSATION_HISTORY.md` (سجل المحادثة)
3. اقرأ: `PROJECT_GUIDE.md` (هذا الملف)
4. شغّل: `npm run dev`
5. افتح: `http://localhost:3000`
6. استمر في العمل!

---

## 📚 ملفات التوثيق المهمة

1. `CONVERSATION_HISTORY.md` - سجل المحادثة الكامل
2. `PROJECT_GUIDE.md` - هذا الملف (الدليل الشامل)
3. `INSTANT_NAVIGATION_README.md` - دليل Instant Navigation
4. `BOOKING_PAYMENT_SYSTEM_COMPLETE.md` - نظام الحجز
5. `BOOKINGS_CONTEXT_IMPLEMENTATION.md` - Context API
6. `GREGORIAN_CALENDAR_CONVERSION.md` - تحويل التواريخ

---

## 🎯 الهيكل القياسي للصفحة الجديدة

```typescript
// src/pages/my-page.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import InstantLink from '@/components/InstantLink';
import { useI18n } from '@/lib/i18n';
import { FaIcon } from 'react-icons/fa';

export default function MyPage() {
  const router = useRouter();
  const { t, dir } = useI18n();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data');
      const json = await res.json();
      setData(json.items || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={dir}>
      <Head>
        <title>العنوان | Ain Oman</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          العنوان
        </h1>
        
        {/* المحتوى */}
      </div>
    </div>
  );
}
```

---

## 🔐 نظام الاشتراكات والصلاحيات (Subscription System)

### نظرة عامة

نظام متكامل للتحكم في الصلاحيات بناءً على باقة المستخدم.

### المكونات الأساسية:

#### 1. **SubscriptionContext** (`src/context/SubscriptionContext.tsx`)
```typescript
// يوفر الوصول لبيانات الاشتراك من أي مكان
const { plan, subscription, hasFeature, isWithinLimit } = useSubscription();
```

#### 2. **FeatureGate** (`src/components/FeatureGate.tsx`)
```tsx
// إخفاء/قفل المحتوى حسب الباقة
<FeatureGate feature="tasks" mode="lock" showUpgrade={true}>
  <TasksSection />
</FeatureGate>
```

### الأوضاع المتاحة:
- `hide` - إخفاء كامل
- `lock` - قفل مع رسالة ترقية احترافية
- `disable` - عرض معطل (grayscale)

### Hooks المتاحة:
```typescript
useSubscription()           // الحالة الكاملة
useFeature(feature)         // التحقق من ميزة
useFeatureVisibility(key)   // للقوائم والأزرار
usePermission(permission)   // التحقق من صلاحية
```

### إضافة ميزة جديدة:

1. في `src/lib/permissionConfig.ts`:
```typescript
AUCTIONS_VIEW: 'auction_read',
```

2. في `src/lib/subscriptionSystem.ts`:
```typescript
{ id: 'auction_read', category: 'auctions', level: 'read' }
```

3. في الصفحة:
```tsx
<FeatureGate feature="auctions" mode="lock">
  <AuctionsPage />
</FeatureGate>
```

### إدارة الباقات:
```
http://localhost:3000/admin/subscriptions
```

### التوثيق الشامل:
- `SUBSCRIPTION_SYSTEM_COMPLETE_GUIDE.md` - دليل كامل
- `FEATURE_GATE_EXAMPLE.md` - أمثلة عملية
- `كيف_تستخدم_نظام_الاشتراكات.md` - دليل مبسط

---

## ⚡ نظام التزامن الفوري (Real-time Sync) - جديد

### نظرة عامة

نظام متقدم للتزامن الفوري بين التبويبات والمتصفحات (< 200ms).

### التقنيات المستخدمة:

#### 1. **BroadcastChannel API**
```typescript
// للتزامن بين جميع التبويبات والنوافذ في نفس المتصفح
const permissionsChannel = new BroadcastChannel('permissions_sync');

// إرسال تحديث:
permissionsChannel.postMessage({ 
  type: 'PERMISSIONS_UPDATED',
  timestamp: Date.now()
});

// استقبال التحديث:
permissionsChannel.onmessage = (event) => {
  if (event.data.type === 'PERMISSIONS_UPDATED') {
    loadUserData(); // تحديث البيانات
  }
};
```

#### 2. **CustomEvent**
```typescript
// للتزامن داخل نفس التبويب (storage event لا يعمل!)
window.dispatchEvent(new CustomEvent('permissions:updated'));

// الاستماع:
window.addEventListener('permissions:updated', () => {
  loadUserData();
});
```

#### 3. **Centralized API**
```typescript
// حل مشكلة localStorage بين المتصفحات المختلفة
// حفظ:
await fetch('/api/roles/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(rolesConfig)
});

// تحميل:
const res = await fetch('/api/roles/load');
const config = await res.json();
```

### مثال كامل (صفحة Profile):

```typescript
// src/pages/profile/index.tsx
useEffect(() => {
  // 1. BroadcastChannel للتبويبات الأخرى
  const channel = new BroadcastChannel('permissions_sync');
  
  channel.onmessage = (event) => {
    if (event.data.type === 'PERMISSIONS_UPDATED') {
      console.log('📡 Broadcast received');
      loadUserData(); // تحديث فوري!
    }
  };

  // 2. CustomEvent لنفس التبويب
  const handleUpdate = () => {
    console.log('👂 Custom event received');
    loadUserData();
  };
  
  window.addEventListener('permissions:updated', handleUpdate);

  // Cleanup
  return () => {
    channel.close();
    window.removeEventListener('permissions:updated', handleUpdate);
  };
}, []);
```

### مثال (صفحة Admin):

```typescript
// src/pages/admin/roles-permissions.tsx
const saveRolePermissions = async (roleId, permissions) => {
  // 1. حفظ في localStorage
  localStorage.setItem('roles_permissions_config', JSON.stringify(config));
  
  // 2. حفظ في API (للمتصفحات الأخرى)
  await fetch('/api/roles/save', {
    method: 'POST',
    body: JSON.stringify(config)
  });
  
  // 3. إرسال تحديث لجميع التبويبات
  const channel = new BroadcastChannel('permissions_sync');
  channel.postMessage({ type: 'PERMISSIONS_UPDATED' });
  
  // 4. تحديث نفس التبويب
  window.dispatchEvent(new CustomEvent('permissions:updated'));
};
```

### تجنب Hydration Errors:

```typescript
// ❌ خطأ: استخدام localStorage أو Date.now() مباشرة
export default function MyPage() {
  const theme = localStorage.getItem('theme'); // خطأ!
  const now = Date.now(); // خطأ!
  
  return <div>Theme: {theme}</div>;
}

// ✅ صح: استخدام mounted state
export default function MyPage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<string | null>(null);
  
  useEffect(() => {
    setMounted(true);
    setTheme(localStorage.getItem('theme'));
  }, []);
  
  if (!mounted) {
    return <div>Loading...</div>; // SSR render
  }
  
  return <div>Theme: {theme}</div>; // Client render
}
```

### الملفات الرئيسية:

1. `src/pages/api/roles/save.ts` - حفظ الصلاحيات
2. `src/pages/api/roles/load.ts` - تحميل الصلاحيات
3. `public/roles-config.json` - التخزين المركزي
4. `public/diagnose.html` - صفحة تشخيص
5. `public/init-roles.html` - تهيئة الأدوار

### للاختبار:

```bash
# 1. افتح تبويبين في Chrome:
تبويب 1: http://localhost:3000/profile (owner)
تبويب 2: http://localhost:3000/admin/roles-permissions (admin)

# 2. في التبويب 2:
- عدّل الصلاحيات
- احفظ

# 3. في التبويب 1:
- النتيجة: تحديث فوري (< 200ms) ✅
```

### للمتصفحات المختلفة:

```bash
# افتح صفحة التشخيص:
http://localhost:3000/diagnose.html

# اضغط "تحديث من API"
→ يحمل آخر إصدار من roles-config.json
```

### الإحصائيات:
- ⚡ سرعة التزامن: < 200ms
- 🔄 دعم: Chrome, Edge, Firefox, Safari
- 📱 يعمل على: Desktop, Mobile, Tablet
- 🌐 عبر المتصفحات: عبر API مركزي

---

<div align="center">

## 💚 دليل شامل للعمل من أي مكان!

**اقرأ هذا الملف + CONVERSATION_HISTORY.md = جاهز! ✅**

</div>

---

*آخر تحديث: 14 أكتوبر 2025*  
*الحالة: دليل نشط - يُحدّث مع كل تطوير*  
*الغرض: مرجع شامل للعمل من أي كمبيوتر*

