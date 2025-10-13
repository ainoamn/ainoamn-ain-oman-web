# 📊 إحصاء شامل: لوحات التحكم وأنواع المستخدمين

## 🎛️ لوحات التحكم الموجودة (14 لوحة)

### الملفات في `src/pages/dashboard/`:

| # | الملف | الرابط | الدور المستهدف |
|---|-------|--------|----------------|
| 1 | `index.tsx` | `/dashboard` | صفحة اختيار اللوحة |
| 2 | `admin.tsx` | `/dashboard/admin` | المدير العام |
| 3 | `owner.tsx` | `/dashboard/owner` | مالك العقار |
| 4 | `property-owner.tsx` | `/dashboard/property-owner` | مالك العقار (نسخة 2) |
| 5 | `landlord.tsx` | `/dashboard/landlord` | المؤجر |
| 6 | `tenant.tsx` | `/dashboard/tenant` | المستأجر |
| 7 | `customer.tsx` | `/dashboard/customer` | العميل |
| 8 | `corporate-tenant.tsx` | `/dashboard/corporate-tenant` | مستأجر شركة |
| 9 | `investor.tsx` | `/dashboard/investor` | المستثمر |
| 10 | `developer.tsx` | `/dashboard/developer` | المطور العقاري |
| 11 | `agency.tsx` | `/dashboard/agency` | الوكالة العقارية |
| 12 | `hoa.tsx` | `/dashboard/hoa` | جمعية الملاك |
| 13 | `advanced.tsx` | `/dashboard/advanced` | لوحة متقدمة |
| 14 | `widgets.tsx` | `/dashboard/widgets` | Widgets |

### لوحات فرعية:
- `auctions/index.tsx` - `/dashboard/auctions` - لوحة المزادات
- `messages/index.tsx` - `/dashboard/messages` - الرسائل
- `requests/index.tsx` - `/dashboard/requests` - الطلبات

---

## 👥 أنواع المستخدمين الموجودة

### من `src/pages/dashboard/index.tsx`:

| # | المعرف | الاسم | الوصف | اللون |
|---|--------|-------|-------|-------|
| 1 | `admin` | إدارة النظام | المدير العام للموقع | 🔴 أحمر |
| 2 | `property-owner` | مالك العقار | إدارة عقاراتك | 🟢 أخضر |
| 3 | `customer` | العميل | عرض حجوزاتك | 🔵 أزرق |

### من ملفات اللوحات الأخرى:

| # | الدور | الملف | الاستخدام |
|---|-------|-------|-----------|
| 4 | `owner` | `owner.tsx` | مالك عقار (بديل) |
| 5 | `landlord` | `landlord.tsx` | المؤجر |
| 6 | `tenant` | `tenant.tsx` | المستأجر |
| 7 | `corporate_tenant` | `corporate-tenant.tsx` | مستأجر شركة |
| 8 | `investor` | `investor.tsx` | مستثمر عقاري |
| 9 | `developer` | `developer.tsx` | مطور عقاري |
| 10 | `agency` | `agency.tsx` | وكالة عقارية |
| 11 | `hoa` | `hoa.tsx` | جمعية ملاك |
| 12 | `broker` | (مذكور في الكود) | وسيط عقاري |
| 13 | `company` | (مذكور في الكود) | شركة |

### من `src/pages/api/auth/verify-otp.ts`:

| الدور الافتراضي | القيمة |
|-----------------|--------|
| افتراضي | `individual_tenant` |

---

## 🔍 التحليل - المشاكل الموجودة:

### ❌ **تكرار في اللوحات:**

1. **مالك العقار - 3 نسخ!**
   - `owner.tsx`
   - `property-owner.tsx`
   - `landlord.tsx`
   
   **السبب:** نفس الدور، أسماء مختلفة

2. **المستأجر - 2 نسخ!**
   - `tenant.tsx`
   - `corporate-tenant.tsx`
   
   **الفرق:** فردي vs شركة

---

### ❌ **أدوار غير محددة بوضوح:**

```typescript
// في dashboard/index.tsx:
if (['owner', 'developer', 'company', 'broker'].includes(role)) {
  // نفس اللوحة!
}
```

**المشكلة:** 4 أدوار مختلفة → نفس اللوحة

---

## 🎯 الأدوار الموصى بها (مبسّطة):

### النظام المقترح (7 أدوار فقط):

| # | الدور | الكود | الوصف | اللوحة |
|---|-------|------|-------|--------|
| 1 | **المدير** | `admin` | إدارة النظام | `/dashboard/admin` |
| 2 | **مالك العقار** | `property_owner` | إدارة عقاراته | `/dashboard/property-owner` |
| 3 | **مدير العقار** | `property_manager` | إدارة محدودة | `/dashboard/property-owner` |
| 4 | **المستأجر (فرد)** | `tenant` | عرض وحدته | `/dashboard/tenant` |
| 5 | **المستأجر (شركة)** | `corporate_tenant` | عرض وحداته | `/dashboard/corporate-tenant` |
| 6 | **المستثمر/المطور** | `investor` | متابعة استثماراته | `/dashboard/investor` |
| 7 | **مستخدم عادي** | `user` | تصفح وحجز | `/profile` |

---

## 📋 مصفوفة الصلاحيات المقترحة:

| الوظيفة | Admin | Owner | Manager | Tenant | Investor | User |
|---------|-------|-------|---------|--------|----------|------|
| **رؤية جميع العقارات** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **رؤية عقاراته** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **إضافة عقار** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **تعديل عقار** | ✅ | ✅ | ✅* | ❌ | ✅ | ❌ |
| **حذف عقار** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **رؤية جميع الوحدات** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **رؤية وحداته** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **رؤية جميع المهام** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **رؤية مهامه** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **رؤية جميع الفواتير** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **رؤية فواتيره** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **رؤية جميع الحجوزات** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **رؤية حجوزاته** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **إدارة المستخدمين** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **إدارة الباقات** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

`*` بصلاحيات محددة من المالك

---

## 🔄 الربط المطلوب:

### 1. **ربط الصفحات بالأدوار:**

```typescript
// src/pages/properties/unified-management.tsx
const user = getCurrentUser();

// فلترة العقارات
const myProperties = filterPropertiesByRole(allProperties, user);
// النتيجة: فقط عقارات المستخدم الحالي
```

### 2. **ربط الوحدات:**

```typescript
// src/pages/admin/units/index.tsx
const user = getCurrentUser();

if (user.role !== 'admin') {
  return <div>غير مصرح - للمديرين فقط</div>;
}

// عرض جميع الوحدات (Admin only)
```

### 3. **ربط المهام:**

```typescript
// src/pages/tasks/index.tsx
const user = getCurrentUser();
const myTasks = filterTasksByRole(allTasks, user);
```

### 4. **ربط الفواتير:**

```typescript
// src/pages/invoices/index.tsx
const user = getCurrentUser();
const myInvoices = filterInvoicesByRole(allInvoices, user);
```

---

## 📁 الملفات المنشأة:

✅ **`src/lib/rbac.ts`** - نظام RBAC الكامل:
- `filterPropertiesByRole()` - فلترة العقارات
- `filterUnitsByRole()` - فلترة الوحدات
- `filterTasksByRole()` - فلترة المهام
- `filterInvoicesByRole()` - فلترة الفواتير
- `filterBookingsByRole()` - فلترة الحجوزات
- `filterLegalCasesByRole()` - فلترة القضايا
- `canAccessProperty()` - فحص الوصول
- `canEditProperty()` - فحص التعديل
- `canDeleteProperty()` - فحص الحذف
- `getCurrentUser()` - الحصول على المستخدم

---

## 🎯 الخطوات التالية المقترحة:

### الخيار A: **تطبيق RBAC فوراً**
```
1. تطبيق فلترة على /properties/unified-management
2. تطبيق فلترة على /profile
3. تطبيق فلترة على /property/[id]/admin
4. تطبيق فلترة على /admin/units (Admin only)
5. اختبار شامل
```

### الخيار B: **إنشاء نظام المستخدمين أولاً**
```
1. إنشاء /admin/users (إدارة المستخدمين)
2. تعيين الأدوار (Admin, Owner, Tenant, etc.)
3. ربط المستخدمين بالعقارات
4. ثم تطبيق RBAC
```

### الخيار C: **دمج اللوحات المكررة**
```
1. دمج owner.tsx + property-owner.tsx + landlord.tsx
   → لوحة واحدة: /dashboard/property-owner

2. دمج tenant.tsx + corporate-tenant.tsx
   → لوحة واحدة: /dashboard/tenant
   → مع فحص: isCorporate

3. حذف الملفات المكررة
```

---

## 📊 الإحصائيات:

- **إجمالي لوحات التحكم:** 14 لوحة (+ 3 فرعية)
- **أدوار محددة في الكود:** 13 دور
- **أدوار موصى بها:** 7 أدوار
- **تكرار في اللوحات:** 5 لوحات مكررة
- **صفحات تحتاج RBAC:** 50+ صفحة

---

## 💡 توصيتي:

**الترتيب الأمثل:**

```
1️⃣ إنشاء نظام إدارة المستخدمين (/admin/users)
   ↓
2️⃣ تعيين الأدوار الواضحة (7 أدوار)
   ↓
3️⃣ دمج اللوحات المكررة (14 → 7 لوحات)
   ↓
4️⃣ تطبيق RBAC على جميع الصفحات
   ↓
5️⃣ اختبار شامل
```

**هذا سيعطينا:**
- ✅ نظام واضح ومنظم
- ✅ بدون تكرار
- ✅ سهل الصيانة
- ✅ أمان محكم

---

**ما رأيك؟ هل نبدأ بإنشاء نظام إدارة المستخدمين؟** 🎯

