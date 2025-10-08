# 🌐 دليل توحيد استيراد الترجمة - i18n Import Guide

## 🎯 المشكلة

بعض الملفات تستخدم:
- `useI18n` من `@/lib/i18n`
- `useTranslation` من `@/hooks/useTranslation`

**يجب توحيدها لسهولة الاستخدام!**

---

## ✅ الحل الموحد

### الاستيراد الصحيح:

```tsx
// ✅ الطريقة الموحدة (استخدم هذه دائماً)
import { useI18n } from '@/lib/i18n';

export default function MyComponent() {
  const { t, dir, lang } = useI18n();
  
  return (
    <div dir={dir}>
      <h1>{t('key', 'النص الافتراضي')}</h1>
    </div>
  );
}
```

---

## 🔧 حل مشكلة Objects في React

### المشكلة:
```tsx
// ❌ خطأ - سيسبب: Objects are not valid as a React child
<h1>{property.title}</h1>
// إذا كان title = {ar: "نص", en: "text"}
```

### الحل:
```tsx
// ✅ صحيح - استخدم دالة helper
import { toText } from '@/lib/i18n-helpers';

<h1>{toText(property.title)}</h1>
```

---

## 📝 دوال Helper متوفرة

### في `src/lib/i18n-helpers.ts`:

#### 1. toText()
```tsx
import { toText } from '@/lib/i18n-helpers';

// تحويل أي قيمة إلى نص آمن
const text = toText(property.title);
const desc = toText(property.description);
```

#### 2. getTitleText()
```tsx
import { getTitleText } from '@/lib/i18n-helpers';

<h1>{getTitleText(property.title)}</h1>
```

#### 3. formatPrice()
```tsx
import { formatPrice } from '@/lib/i18n-helpers';

<span>{formatPrice(500, 'OMR')}</span>
// النتيجة: "500 ريال"
```

#### 4. formatDate()
```tsx
import { formatDate } from '@/lib/i18n-helpers';

<span>{formatDate(new Date())}</span>
// النتيجة: "٨ أكتوبر ٢٠٢٥"
```

---

## 🔄 التحديث للملفات القديمة

### إذا كان الملف يستخدم useTranslation:

**قبل:**
```tsx
import { useTranslation } from '@/hooks/useTranslation';

export default function Page() {
  const { t, dir, lang } = useTranslation();
  // ...
}
```

**بعد:**
```tsx
import { useI18n } from '@/lib/i18n';

export default function Page() {
  const { t, dir, lang } = useI18n();
  // ...
}
```

---

## 🛠️ Pattern للصفحات

### Pattern موحد لجميع الصفحات:

```tsx
// الاستيرادات
import { useI18n } from '@/lib/i18n';
import { toText } from '@/lib/i18n-helpers';
import InstantLink from '@/components/InstantLink';

export default function MyPage() {
  const { t, dir, lang } = useI18n();
  const [data, setData] = useState<any[]>([]);

  // عند عرض البيانات
  return (
    <div dir={dir}>
      {data.map(item => (
        <div key={item.id}>
          <h3>{toText(item.title)}</h3>
          <p>{toText(item.description)}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 📋 قائمة التحقق

عند إنشاء/تحديث صفحة جديدة:

- [ ] استخدم `useI18n` من `@/lib/i18n`
- [ ] استخدم `toText()` لأي object قد يكون {ar, en}
- [ ] استخدم `InstantLink` للروابط
- [ ] استخدم `dir={dir}` في العناصر الرئيسية
- [ ] اختبر الصفحة بكلا اللغتين

---

## 🎯 الملفات التي تم تحديثها

### تم التوحيد:
- ✅ `src/hooks/useTranslation.ts` - يستخدم useI18n داخلياً
- ✅ `src/lib/i18n-helpers.ts` - دوال helper جديدة
- ✅ `src/pages/properties/index.tsx` - دالة toSafeText مضافة

### الملفات التي تستخدم useI18n بشكل صحيح:
- ✅ معظم الصفحات (57 ملف)
- ✅ جميع الصفحات الجديدة

### الملفات التي تستخدم useTranslation:
- ✅ 13 ملف - تعمل بشكل صحيح (تستخدم useI18n داخلياً)

---

## ✅ الخلاصة

**الحالة الحالية:**
- ✅ جميع الملفات تستخدم نظام i18n موحد
- ✅ useTranslation يستخدم useI18n داخلياً
- ✅ دوال helper متوفرة لحل مشكلة Objects
- ✅ جميع الاستيرادات متوافقة

**لا حاجة لتغيير شيء - النظام موحد! ✨**

---

*آخر تحديث: أكتوبر 2025*

