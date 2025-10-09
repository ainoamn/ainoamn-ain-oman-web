# 📐 معايير التخطيط الموحد - Layout Standards

**التاريخ:** 9 أكتوبر 2025  
**الهدف:** توحيد تنسيق جميع صفحات الموقع

---

## 🎯 المعيار الموحد

### Container الرئيسي:
```typescript
<div className="min-h-screen bg-gray-50">
  <Head>
    <title>عنوان الصفحة | عين عُمان</title>
  </Head>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* محتوى الصفحة */}
  </div>
</div>
```

---

## 📊 التفاصيل

### 1. **Outer Container:**
```css
min-h-screen   /* الارتفاع الكامل للشاشة */
bg-gray-50     /* خلفية رمادية فاتحة */
```

### 2. **Inner Container:**
```css
max-w-7xl      /* العرض الأقصى: 1280px */
mx-auto        /* توسيط أفقي */
px-4           /* هوامش جانبية: 16px (Mobile) */
sm:px-6        /* هوامش جانبية: 24px (Tablet) */
lg:px-8        /* هوامش جانبية: 32px (Desktop) */
py-8           /* هوامش عمودية: 32px */
```

---

## 🎨 المسافات الموحدة

### Headers (العناوين):
```css
h1: text-3xl font-bold text-gray-900 mb-6
h2: text-2xl font-bold text-gray-800 mb-4
h3: text-xl font-semibold text-gray-700 mb-3
```

### Sections (الأقسام):
```css
mb-6   /* مسافة بين الأقسام الرئيسية */
mb-4   /* مسافة بين الأقسام الفرعية */
gap-6  /* مسافة بين العناصر في Grid */
```

### Buttons (الأزرار):
```css
px-6 py-3        /* حجم الزر القياسي */
rounded-lg       /* زوايا دائرية */
font-medium      /* وزن الخط */
transition-colors /* انتقال سلس للألوان */
```

---

## 📋 الصفحات المُحدّثة

### ✅ محدّثة للمعيار الجديد:
```
✅ /properties/[id] (تفاصيل العقار)
✅ /properties (قائمة العقارات) ⭐ محدّثة الآن
```

### 🔄 تحتاج تحديث:
```
⏳ /bookings
⏳ /admin/bookings
⏳ /dashboard
⏳ /login
⏳ /contact
⏳ /booking/new
⏳ /chat
⏳ باقي الصفحات...
```

---

## 🎯 الفوائد

### 1. **تجربة موحدة:**
- نفس العرض في جميع الصفحات
- نفس الهوامش
- نفس المسافات

### 2. **Responsive:**
- Mobile: 16px padding
- Tablet: 24px padding
- Desktop: 32px padding

### 3. **احترافية:**
- تصميم منسق
- لا اختلافات محيرة
- تجربة أفضل

---

## 🔧 كيفية التطبيق

### لأي صفحة جديدة:
```typescript
export default function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>العنوان | عين عُمان</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* محتوى الصفحة */}
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          عنوان الصفحة
        </h1>

        {/* باقي المحتوى */}
      </div>
    </div>
  );
}
```

---

## 📐 القياسات

### العرض:
```
max-w-7xl = 1280px  ← القياس الموحد
```

### الهوامش الأفقية:
```
Mobile (<640px):   px-4  = 16px
Tablet (640-1024): px-6  = 24px
Desktop (>1024px): px-8  = 32px
```

### الهوامش العمودية:
```
py-8 = 32px (أعلى وأسفل)
```

---

## ✅ الصفحات ذات التنسيق الخاص

### استثناءات (لا تحتاج container):
```
✅ Modal popups
✅ Full-screen pages (login, auth)
✅ Landing pages
```

### لكن معظم الصفحات تحتاج للمعيار الموحد!

---

## 📊 التقدم

```
✅ المعيار محدد
✅ 2 صفحة محدّثة
⏳ ~50 صفحة متبقية
```

---

<div align="center">

## 🎯 الهدف

**تنسيق موحد = تجربة مستخدم أفضل!**

</div>

---

*آخر تحديث: 9 أكتوبر 2025*  
*الحالة: قيد التطبيق*  
*المعيار: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`*

