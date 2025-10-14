# 📊 **دليل لوحات التحكم - Ain Oman**

**التاريخ:** 14 أكتوبر 2025

---

## 🎯 **لوحة التحكم حسب كل دور:**

### 1️⃣ **مدير الشركة (Company Admin)**
```
الدور: company_admin
البريد: admin@ainoman.om
كلمة المرور: Admin@2025
```

**لوحات التحكم:**
- 📊 **الرئيسية:** `/dashboard` → يوجهك تلقائياً
- 🏢 **لوحة المدير:** `/dashboard/admin`
- 📈 **المتقدمة:** `/dashboard/advanced`

**الوصول:**
- ✅ جميع لوحات التحكم
- ✅ `/admin/dashboard` - لوحة الإدارة الرئيسية
- ✅ جميع الصفحات

---

### 2️⃣ **المالك الأصلي (Property Owner)**
```
الدور: property_owner
البريد: owner@ainoman.om
كلمة المرور: Owner@2025
```

**لوحات التحكم:**
- 📊 **الرئيسية:** `/dashboard` → يوجهك إلى `/dashboard/owner`
- 👑 **لوحة المالك:** `/dashboard/owner`
- 🏢 **إدارة العقارات:** `/dashboard/property-owner`

**المميزات:**
- ✅ إدارة العقارات
- ✅ عرض الحجوزات
- ✅ المالية والفواتير
- ✅ طلبات الصيانة
- ✅ التقارير الأساسية

**الصفحات المتاحة:**
- `/properties` - العقارات
- `/properties/new` - إضافة عقار
- `/admin/financial` - النظام المالي
- `/admin/invoices` - الفواتير
- `/admin/maintenance` - الصيانة
- `/bookings` - الحجوزات

---

### 3️⃣ **مدير عقار (Property Manager)**
```
الدور: property_manager
البريد: manager@ainoman.om
كلمة المرور: Manager@2025
```

**لوحة التحكم:**
- 📊 `/dashboard` → `/dashboard/manager`

**الصلاحيات (7):**
- ✅ إدارة العقارات (عرض، تعديل، وحدات)
- ✅ الصيانة (عرض، إنشاء، تعيين)
- ✅ إدارة المهام

---

### 4️⃣ **محاسب (Accountant)**
```
الدور: accountant
البريد: accountant@ainoman.om
كلمة المرور: Account@2025
```

**لوحة التحكم:**
- 📊 `/dashboard` → `/dashboard/accountant`

**الصلاحيات (8):**
- ✅ النظام المالي الكامل
- ✅ الفواتير (عرض، إنشاء، تعديل، حذف)
- ✅ الشيكات
- ✅ التقارير (أساسية، متقدمة، تصدير)

---

### 5️⃣ **مستشار قانوني (Legal Advisor)**
```
الدور: legal_advisor
البريد: legal@ainoman.om
كلمة المرور: Legal@2025
```

**لوحة التحكم:**
- 📊 `/dashboard` → `/dashboard/legal`

**الصلاحيات (3):**
- ✅ القضايا القانونية (عرض، إنشاء، تعديل)

---

### 6️⃣ **مندوب مبيعات (Sales Agent)**
```
الدور: sales_agent
البريد: sales@ainoman.om
كلمة المرور: Sales@2025
```

**لوحة التحكم:**
- 📊 `/dashboard` → `/dashboard/sales`

**الصلاحيات (4):**
- ✅ عرض العقارات
- ✅ إضافة عقار جديد
- ✅ عرض الصيانة
- ✅ إدارة المهام

---

### 7️⃣ **فني صيانة (Maintenance Staff)**
```
الدور: maintenance_staff
البريد: maintenance@ainoman.om
كلمة المرور: Maint@2025
```

**لوحة التحكم:**
- 📊 `/dashboard` → `/dashboard/maintenance`

**الصلاحيات (2):**
- ✅ عرض طلبات الصيانة
- ✅ إدارة المهام

---

### 8️⃣ **مستأجر (Tenant)**
```
الدور: tenant
البريد: tenant@example.com
كلمة المرور: Tenant@2025
```

**لوحة التحكم:**
- 📊 `/dashboard` → `/dashboard/customer`

**الصلاحيات (3):**
- ✅ عرض العقارات
- ✅ عرض الصيانة
- ✅ إنشاء طلب صيانة

---

### 9️⃣ **مستثمر (Investor)**
```
الدور: investor
البريد: investor@ainoman.om
كلمة المرور: Invest@2025
```

**لوحة التحكم:**
- 📊 `/dashboard` → `/dashboard/investor`

**الصلاحيات (4):**
- ✅ عرض العقارات
- ✅ عرض المالية
- ✅ التقارير
- ✅ التحليلات

---

### 🔟 **عميل متصفح (Customer Viewer)**
```
الدور: customer_viewer
البريد: viewer@example.com
كلمة المرور: Viewer@2025
```

**لوحة التحكم:**
- 📊 `/dashboard` → `/dashboard/customer`

**الصلاحيات (1):**
- ✅ عرض العقارات فقط

---

## 🔍 **كيف يعمل نظام التوجيه؟**

### عند تسجيل الدخول:
```
1. المستخدم يسجل دخول
2. يُحفظ الدور في localStorage
3. عند زيارة /dashboard
4. النظام يقرأ الدور
5. يوجه تلقائياً للوحة المناسبة
```

### مثال (المالك الأصلي):
```
user.role = "property_owner"
   ↓
/dashboard يقرأ الدور
   ↓
getDashboardPath(role) → "/dashboard/owner"
   ↓
router.push("/dashboard/owner")
   ↓
✅ يفتح لوحة المالك
```

---

## 📋 **جدول اللوحات:**

| الدور | لوحة التحكم | الرابط المباشر |
|------|-------------|-----------------|
| مدير الشركة | Admin Dashboard | `/dashboard/admin` |
| **مالك عقار** | **Owner Dashboard** | **`/dashboard/owner`** |
| مدير عقار | Manager Dashboard | `/dashboard/manager` |
| محاسب | Accountant Dashboard | `/dashboard/accountant` |
| قانوني | Legal Dashboard | `/dashboard/legal` |
| مبيعات | Sales Dashboard | `/dashboard/sales` |
| صيانة | Maintenance Dashboard | `/dashboard/maintenance` |
| مستأجر | Customer Dashboard | `/dashboard/customer` |
| مستثمر | Investor Dashboard | `/dashboard/investor` |
| متصفح | Customer Dashboard | `/dashboard/customer` |

---

## 🎯 **للمالك الأصلي (owner@ainoman.om):**

### الروابط المباشرة:

#### لوحات التحكم:
- 📊 **لوحة المالك:** `http://localhost:3000/dashboard/owner`
- 🏢 **إدارة العقارات:** `http://localhost:3000/dashboard/property-owner`
- 📈 **التوجيه التلقائي:** `http://localhost:3000/dashboard`

#### الصفحات الإدارية:
- 🏠 **العقارات:** `http://localhost:3000/properties`
- ➕ **إضافة عقار:** `http://localhost:3000/properties/new`
- 💰 **المالية:** `http://localhost:3000/admin/financial`
- 📄 **الفواتير:** `http://localhost:3000/admin/invoices`
- 🔧 **الصيانة:** `http://localhost:3000/admin/maintenance`
- 📅 **الحجوزات:** `http://localhost:3000/bookings`

#### الصفحات الشخصية:
- 👤 **الملف الشخصي:** `http://localhost:3000/profile`
- ⚙️ **الإعدادات:** `http://localhost:3000/settings`

---

## 📊 **مقارنة الأدوار:**

### ما يراه كل دور:

| الميزة | Admin | Owner | Manager | Accountant | Legal | Viewer |
|--------|-------|-------|---------|------------|-------|--------|
| **لوحة التحكم** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **إضافة عقار** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **النظام المالي** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **القضايا القانونية** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **إدارة المستخدمين** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **إدارة الأدوار** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 💡 **ملاحظات مهمة:**

### للمالك الأصلي (owner@ainoman.om):

1. **الدور:** `property_owner` (مالك عقار)
2. **الصلاحيات:** 11 صلاحية (ليس 0!)
3. **لوحة التحكم:** `/dashboard/owner`
4. **الباقة:** Premium

### التوجيه التلقائي:
```
عند فتح /dashboard:
→ يقرأ role = "property_owner"
→ يوجهك إلى /dashboard/owner
→ ✅ لوحة تحكم المالك
```

---

## 🔧 **إذا كانت اللوحة فارغة:**

### تحقق من:
1. ✅ تم تسجيل الدخول؟
2. ✅ الدور صحيح (`property_owner`)؟
3. ✅ الصلاحيات موجودة (11 صلاحية)؟

### في Console اكتب:
```javascript
JSON.parse(localStorage.getItem('ain_auth'))
// تحقق من:
// - role: "property_owner"
// - permissions: [11 items]
```

---

## 🎯 **الخلاصة:**

**المالك الأصلي (owner@ainoman.om):**
- ✅ الدور: **مالك عقار** (property_owner)
- ✅ لوحة التحكم: **`/dashboard/owner`**
- ✅ الصلاحيات: **11 صلاحية** (ليس 0!)
- ✅ الباقة: **Premium**

---

**🚀 افتح `/dashboard/owner` لترى لوحتك! 📊**

*14 أكتوبر 2025*

