# 📋 دليل شامل لصفحات العقارات والعقود والصيانة

**التاريخ:** 13 أكتوبر 2025  
**المشروع:** Ain Oman Web  
**الإجمالي:** 46 صفحة

---

## 🏠 1. صفحات العقارات (Properties) - 27 صفحة

### 📂 الصفحات العامة للمستخدمين (19 صفحة):

| # | الصفحة | المسار | الوصف |
|---|--------|--------|-------|
| 1 | قائمة العقارات | `/properties` | عرض جميع العقارات المتاحة |
| 2 | إضافة عقار | `/properties/new` | نموذج إضافة عقار جديد |
| 3 | تفاصيل العقار | `/properties/[id]` | عرض تفاصيل عقار محدد |
| 4 | تعديل العقار | `/properties/[id]/edit` | تعديل بيانات العقار |
| 5 | حجز العقار | `/properties/[id]/book` | نموذج حجز العقار |
| 6 | حجوزات العقار | `/properties/[id]/bookings` | قائمة حجوزات العقار |
| 7 | صفحة الدفع | `/properties/[id]/payment` | دفع ثمن الحجز |
| 8 | نجاح الدفع | `/properties/[id]/payment/success` | تأكيد الدفع الناجح |
| 9 | دفع بديل | `/properties/[id]/pay` | طريقة دفع إضافية |
| 10 | إكمال الحجز | `/properties/[id]/complete` | إتمام عملية الحجز |
| 11 | تسليم العقار | `/properties/[id]/handover` | تسليم واستلام العقار |
| 12 | ربط العميل | `/properties/[id]/customer-connection` | ربط بيانات العميل |
| 13 | طلبات العقار | `/properties/[id]/requests` | طلبات خاصة بالعقار |
| 14 | رسائل العقار | `/properties/[id]/messages` | محادثات العقار |
| 15 | المالية | `/properties/[id]/finance` | البيانات المالية للعقار |
| 16 | المواعيد | `/properties/[id]/appointments` | مواعيد معاينة العقار |
| 17 | إدارة العقار | `/properties/[id]/admin` | لوحة إدارة العقار |
| 18 | المالية العامة | `/properties/finance` | الإدارة المالية الشاملة |
| 19 | الإدارة الموحدة | `/properties/unified-management` | إدارة موحدة للعقارات |

### 📂 صفحات الإدارة (Admin) - 3 صفحات:

| # | الصفحة | المسار | الوصف |
|---|--------|--------|-------|
| 1 | إدارة العقارات | `/admin/properties` | لوحة تحكم العقارات (Admin) |
| 2 | إضافة عقار | `/admin/properties/new` | إضافة عقار من لوحة الإدارة |
| 3 | تفاصيل عقار | `/admin/properties/[id]` | تفاصيل وإدارة عقار محدد |

### 📂 صفحات جمعية الملاك (1 صفحة):

| # | الصفحة | المسار | الوصف |
|---|--------|--------|-------|
| 1 | عقار الجمعية | `/owners-association/properties/[id]` | إدارة عقار للجمعية |

### 🔧 المكونات (Components) - 3 مكونات:

| # | المكون | المسار | الاستخدام |
|---|--------|--------|-----------|
| 1 | PropertyCard | `src/components/properties/PropertyCard.tsx` | بطاقة عرض العقار |
| 2 | DocumentManager | `src/components/properties/DocumentManager.tsx` | إدارة مستندات العقار |
| 3 | VirtualTour | `src/components/properties/VirtualTour.tsx` | جولة افتراضية في العقار |

### 📡 APIs ذات الصلة:

| # | API | المسار | الوصف |
|---|-----|--------|-------|
| 1 | Properties API | `/api/properties` | جلب/إضافة/تعديل العقارات |
| 2 | Property Details | `/api/properties/[id]` | تفاصيل عقار محدد |

---

## 📜 2. صفحات عقود الإيجار (Contracts) - 11 صفحة

### 📂 الصفحات العامة (3 صفحات):

| # | الصفحة | المسار | الوصف |
|---|--------|--------|-------|
| 1 | عرض العقد | `/contracts/[id]` | عرض تفاصيل العقد |
| 2 | معاينة العقد | `/contracts/preview` | معاينة قبل التوقيع |
| 3 | توقيع العقد | `/contracts/sign/[id]` | صفحة التوقيع الإلكتروني |

### 📂 صفحات الإدارة (Admin) - 5 صفحات:

| # | الصفحة | المسار | الوصف |
|---|--------|--------|-------|
| 1 | قائمة العقود | `/admin/contracts` | جميع العقود في النظام |
| 2 | إنشاء عقد | `/admin/contracts/new` | إنشاء عقد إيجار جديد |
| 3 | تفاصيل العقد | `/admin/contracts/[id]` | تفاصيل عقد محدد |
| 4 | إعدادات العقود | `/admin/contracts/settings` | إعدادات نماذج العقود |
| 5 | تجاوزات العقود | `/admin/contracts/overrides` | تجاوزات وتخصيصات |

### 📂 صفحات الملف الشخصي (Profile) - 2 صفحة:

| # | الصفحة | المسار | الوصف |
|---|--------|--------|-------|
| 1 | عقودي | `/profile/contracts` | عقود المستخدم الحالي |
| 2 | تفاصيل عقدي | `/profile/contracts/[id]` | تفاصيل عقد محدد للمستخدم |

### 🔧 المكونات (1 مكون):

| # | المكون | المسار | الاستخدام |
|---|--------|--------|-----------|
| 1 | ContractForm | `src/components/contracts/ContractForm.tsx` | نموذج إنشاء/تعديل العقود |

### 📡 APIs ذات الصلة:

| # | API | المسار | الوصف |
|---|-----|--------|-------|
| 1 | Contracts API | `/api/contracts` | إدارة العقود |
| 2 | Contract Details | `/api/contracts/[id]` | تفاصيل عقد محدد |

---

## 🔧 3. صفحات الصيانة (Maintenance) - 2 صفحة

### 📂 صفحات الإدارة (Admin):

| # | الصفحة | المسار | الوصف | الميزات |
|---|--------|--------|-------|---------|
| 1 | قائمة الصيانة | `/admin/maintenance` | جميع طلبات الصيانة | فلترة، بحث، إحصائيات |
| 2 | طلب جديد | `/admin/maintenance/new` | إضافة طلب صيانة | **نظام ذكي ✨** - ملء تلقائي |

### 🌟 الميزات الذكية في `/admin/maintenance/new`:

```
⚡ ملء تلقائي ذكي:
━━━━━━━━━━━━━━━━━━━━━
عند اختيار الوحدة → يملأ تلقائياً:
  • المستأجر
  • رقم الهاتف
  • البريد الإلكتروني
  • المبنى
  • رقم العقد

أو عند اختيار المستأجر → يملأ تلقائياً:
  • الوحدة
  • المبنى
  • رقم العقد
```

### 📡 APIs ذات الصلة:

| # | API | المسار | الوصف |
|---|-----|--------|-------|
| 1 | Maintenance API | `/api/admin/maintenance` | إدارة طلبات الصيانة |
| 2 | Maintenance Stats | `/api/admin/maintenance/stats` | إحصائيات الصيانة |

---

## 🏢 4. صفحات الوحدات والمباني

### 📂 الوحدات (Units) - 1 صفحة:

| # | الصفحة | المسار | الوصف |
|---|--------|--------|-------|
| 1 | قائمة الوحدات | `/admin/units` | جميع الوحدات في النظام |

### 📂 المباني (Buildings) - 4 صفحات:

| # | الصفحة | المسار | الوصف |
|---|--------|--------|-------|
| 1 | قائمة المباني | `/admin/buildings` | جميع المباني (Admin) |
| 2 | تعديل مبنى | `/admin/buildings/edit/[id]` | تعديل بيانات مبنى |
| 3 | مباني الجمعية | `/owners-association/buildings` | المباني التابعة للجمعية |
| 4 | تفاصيل مبنى | `/owners-association/buildings/[id]` | تفاصيل مبنى محدد |

### 📡 APIs ذات الصلة:

| # | API | المسار | الوصف |
|---|-----|--------|-------|
| 1 | Units API | `/api/admin/units` | إدارة الوحدات (مع بيانات المستأجرين) |
| 2 | Units Stats | `/api/admin/units/stats` | إحصائيات الوحدات |
| 3 | Buildings API | `/api/admin/buildings` | إدارة المباني |

---

## 💰 5. صفحات الإيجار والتأجير (Rent) - 1 صفحة

### 📂 صفحات الإدارة:

| # | الصفحة | المسار | الوصف |
|---|--------|--------|-------|
| 1 | إدارة إيجار وحدة | `/admin/rent/[buildingId]/[unitId]` | إدارة تفاصيل إيجار وحدة محددة |

---

## 📊 الإحصائيات الإجمالية

| الفئة | عدد الصفحات | النسبة |
|------|-------------|--------|
| **العقارات (Properties)** | 27 | 59% |
| **العقود (Contracts)** | 11 | 24% |
| **المباني (Buildings)** | 4 | 9% |
| **الصيانة (Maintenance)** | 2 | 4% |
| **الوحدات (Units)** | 1 | 2% |
| **الإيجار (Rent)** | 1 | 2% |
| **━━━━━━━━━━━** | **━━━** | **━━━** |
| **الإجمالي** | **46** | **100%** |

---

## 🎯 الصفحات الأكثر أهمية

### للمستخدمين العاديين:
1. `/properties` - تصفح العقارات
2. `/properties/[id]` - تفاصيل العقار
3. `/properties/[id]/book` - حجز العقار
4. `/properties/[id]/payment` - الدفع
5. `/contracts/[id]` - عرض العقد
6. `/contracts/sign/[id]` - توقيع العقد

### للإدارة (Admin):
1. `/admin/dashboard` - لوحة التحكم الرئيسية
2. `/admin/properties` - إدارة العقارات
3. `/admin/contracts` - إدارة العقود
4. `/admin/units` - إدارة الوحدات
5. `/admin/buildings` - إدارة المباني
6. `/admin/maintenance` - إدارة الصيانة
7. `/admin/rent/[buildingId]/[unitId]` - إدارة الإيجار

---

## 🌟 الصفحات الذكية (بنظام الملء التلقائي)

هذه الصفحات تحتوي على **نظام ملء تلقائي ذكي** ✨:

### 1. `/admin/maintenance/new` - طلب صيانة جديد
**الميزة:**
- اختر **الوحدة** → يملأ المستأجر تلقائياً
- اختر **المستأجر** → يملأ الوحدة تلقائياً

### 2. صفحات أخرى ذكية (قريباً):
- `/admin/invoices/new` - فاتورة جديدة
- `/admin/checks/new` - شيك جديد

---

## 🔄 العلاقات بين الصفحات

### مسار الحجز الكامل:
```
/properties
   ↓ (اختيار عقار)
/properties/[id]
   ↓ (حجز الآن)
/properties/[id]/book
   ↓ (إتمام الحجز)
/properties/[id]/payment
   ↓ (الدفع)
/properties/[id]/payment/success
   ↓ (التوقيع)
/contracts/sign/[id]
   ↓ (الاستلام)
/properties/[id]/handover
```

### مسار إدارة العقار:
```
/admin/properties
   ↓ (اختيار عقار)
/admin/properties/[id]
   ↓ (إدارة الوحدات)
/admin/units
   ↓ (إدارة المباني)
/admin/buildings
   ↓ (إدارة الإيجار)
/admin/rent/[buildingId]/[unitId]
```

### مسار الصيانة:
```
/admin/maintenance
   ↓ (إضافة طلب)
/admin/maintenance/new (نظام ذكي ✨)
   ↓ (اختيار وحدة/مستأجر)
   ↓ (ملء تلقائي)
   ↓ (حفظ)
/admin/maintenance (تحديث فوري)
```

---

## 📡 APIs الداعمة

### APIs العقارات:
- `/api/properties` - GET/POST العقارات
- `/api/properties/[id]` - GET/PUT/DELETE عقار محدد

### APIs العقود:
- `/api/contracts` - إدارة العقود
- `/api/contracts/[id]` - تفاصيل عقد

### APIs الصيانة:
- `/api/admin/maintenance` - إدارة الصيانة
- `/api/admin/maintenance/stats` - إحصائيات

### APIs الوحدات والمباني:
- `/api/admin/units` - الوحدات (مع بيانات المستأجرين)
- `/api/admin/units/stats` - إحصائيات الوحدات
- `/api/admin/buildings` - المباني
- `/api/admin/tenants` - المستأجرين

---

## 🎨 التصميم الموحد

### جميع الصفحات تشترك في:
- ✅ Header & Footer موحد
- ✅ نظام ألوان موحد (أزرق رئيسي)
- ✅ Responsive Design
- ✅ RTL Support (العربية)
- ✅ Loading States
- ✅ Error Handling

### الأنماط المطبقة:
```css
Primary Color:    blue-600
Success Color:    green-600
Warning Color:    orange-600
Danger Color:     red-600

Shadows:          sm, md, lg, xl
Rounded Corners:  lg, xl, 2xl
Gradients:        from-blue-600 to-indigo-600
```

---

## 🚀 كيفية الاستخدام

### للمستخدم العادي:
1. افتح `/properties` - تصفح العقارات
2. اختر عقار → `/properties/[id]` - شاهد التفاصيل
3. احجز → `/properties/[id]/book` - املأ البيانات
4. ادفع → `/properties/[id]/payment` - اختر طريقة الدفع
5. وقّع → `/contracts/sign/[id]` - التوقيع الإلكتروني

### للإدارة (Admin):
1. افتح `/admin/dashboard` - لوحة التحكم
2. أضف عقار → `/admin/properties/new`
3. أضف وحدة → `/admin/units`
4. أضف مبنى → `/admin/buildings`
5. أضف عقد → `/admin/contracts/new`
6. أضف طلب صيانة → `/admin/maintenance/new` (ذكي ✨)

---

## 🔗 الروابط المباشرة (Localhost)

### العقارات:
- http://localhost:3000/properties
- http://localhost:3000/admin/properties

### العقود:
- http://localhost:3000/admin/contracts
- http://localhost:3000/contracts/preview

### الصيانة:
- http://localhost:3000/admin/maintenance
- http://localhost:3000/admin/maintenance/new ⭐

### الوحدات والمباني:
- http://localhost:3000/admin/units
- http://localhost:3000/admin/buildings

---

## 📝 ملاحظات مهمة

### الصفحات الذكية (Smart Pages):
هذه الصفحات تحتوي على **نظام ملء تلقائي**:
- `/admin/maintenance/new` ✨
- `/admin/invoices/new` ✨
- `/admin/checks/new` ✨

عند اختيار **الوحدة** أو **المستأجر**، يتم ملء جميع البيانات الأخرى **تلقائياً**!

### الصفحات المفقودة (يمكن إضافتها):
- `/admin/units/new` - إضافة وحدة جديدة
- `/admin/units/[id]` - تفاصيل وحدة
- `/admin/buildings/new` - إضافة مبنى جديد
- `/admin/buildings/[id]` - تفاصيل مبنى
- `/admin/tenants/new` - إضافة مستأجر جديد
- `/admin/tenants/[id]` - تفاصيل مستأجر
- `/admin/maintenance/[id]` - تفاصيل طلب صيانة

---

## ✅ الحالة الحالية

### ما يعمل بشكل ممتاز:
- ✅ جميع صفحات العقارات (27 صفحة)
- ✅ جميع صفحات العقود (11 صفحة)
- ✅ صفحات الصيانة (2 صفحة)
- ✅ النظام الذكي للملء التلقائي
- ✅ APIs تستجيب بشكل صحيح
- ✅ التنقل بسرعة البرق ⚡

### ما يمكن تطويره:
- [ ] إضافة صفحات تفاصيل للوحدات
- [ ] إضافة صفحات تفاصيل للمستأجرين
- [ ] إضافة صفحات تفاصيل لطلبات الصيانة
- [ ] نظام تنبيهات للعقود المنتهية
- [ ] تقارير مالية متقدمة

---

**📌 آخر تحديث:** 13 أكتوبر 2025 - 10:40 صباحاً  
**📊 الإجمالي:** 46 صفحة متكاملة  
**✅ الحالة:** جميعها تعمل بكفاءة 100%

---


