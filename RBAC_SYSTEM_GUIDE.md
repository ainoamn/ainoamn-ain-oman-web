# 🔐 دليل نظام التحكم في الوصول حسب الدور (RBAC)

## 📋 نظرة عامة

نظام متكامل للتحكم في عرض البيانات حسب دور المستخدم في منصة عين عُمان.

---

## 👥 الأدوار المتاحة

### 1. **Admin** - المدير العام
```typescript
role: 'admin'
```
**الصلاحيات:**
- ✅ رؤية **جميع** العقارات والوحدات
- ✅ رؤية **جميع** الحجوزات والمهام
- ✅ رؤية **جميع** الفواتير والقضايا
- ✅ تعديل وحذف أي شيء
- ✅ الوصول لجميع صفحات `/admin/*`

**الصفحات الخاصة:**
- `/admin/properties` - كل العقارات
- `/admin/units` - كل الوحدات
- `/admin/subscriptions` - إدارة الباقات
- `/admin/users` - إدارة المستخدمين

---

### 2. **Property Owner** - مالك العقار
```typescript
role: 'property_owner'
```
**الصلاحيات:**
- ✅ رؤية **عقاراته فقط**
- ✅ إضافة/تعديل/حذف عقاراته
- ✅ رؤية حجوزات عقاراته
- ✅ رؤية فواتير عقاراته
- ✅ رؤية مهام عقاراته
- ✅ تعيين مديرين للعقارات

**الصفحات الخاصة:**
- `/properties/unified-management` - إدارة موحدة
- `/property/[id]/admin` - إدارة عقار محدد
- `/dashboard/owner` - لوحة تحكم المالك

**الفلترة:**
```typescript
properties.filter(p => 
  p.ownerId === user.id || 
  p.createdBy === user.id
)
```

---

### 3. **Property Manager** - مدير العقار
```typescript
role: 'property_manager'
```
**الصلاحيات:**
- ✅ رؤية العقارات **المسندة له فقط**
- ✅ إدارة الوحدات (حسب صلاحيات المالك)
- ✅ إدارة المهام والصيانة
- ✅ رؤية الحجوزات والفواتير
- ❌ **لا يستطيع** حذف العقار (إلا بصلاحية من المالك)

**الصفحات الخاصة:**
- `/properties/unified-management` - العقارات المسندة
- `/property/[id]/admin` - إدارة محدودة

**الفلترة:**
```typescript
properties.filter(p => 
  p.managerId === user.id ||
  p.managers?.includes(user.id)
)
```

---

### 4. **Tenant** - المستأجر
```typescript
role: 'tenant'
```
**الصلاحيات:**
- ✅ رؤية **الوحدة المستأجرة فقط**
- ✅ عرض تفاصيل عقاره
- ✅ رؤية فواتيره
- ✅ إضافة طلبات صيانة
- ✅ رؤية مهامه
- ❌ **لا يستطيع** التعديل على العقار
- ❌ **لا يستطيع** رؤية معلومات مالية المالك

**الصفحات الخاصة:**
- `/dashboard/tenant` - لوحة تحكم المستأجر
- `/profile` - معلوماته الشخصية

**الفلترة:**
```typescript
properties.filter(p => 
  p.tenantId === user.id ||
  p.units?.some(u => u.tenantId === user.id)
)
```

---

### 5. **User** - مستخدم عادي
```typescript
role: 'user'
```
**الصلاحيات:**
- ✅ رؤية العقارات **المنشورة فقط**
- ✅ البحث والتصفح
- ✅ حجز الوحدات
- ✅ إضافة للمفضلة
- ❌ **لا يستطيع** رؤية عقارات خاصة
- ❌ **لا يستطيع** رؤية معلومات مالية

**الصفحات الخاصة:**
- `/properties` - تصفح العقارات
- `/bookings` - حجوزاته
- `/profile` - ملفه الشخصي

**الفلترة:**
```typescript
properties.filter(p => 
  p.published === true && 
  p.status !== 'hidden'
)
```

---

## 📊 مصفوفة الصلاحيات

| الإجراء | Admin | Owner | Manager | Tenant | User |
|---------|-------|-------|---------|--------|------|
| **رؤية جميع العقارات** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **رؤية عقاراته** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **إضافة عقار** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **تعديل عقار** | ✅ | ✅ | ✅* | ❌ | ❌ |
| **حذف عقار** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **رؤية جميع الوحدات** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **رؤية وحداته** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **رؤية جميع الفواتير** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **رؤية فواتيره** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **رؤية جميع المهام** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **رؤية مهامه** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **حجز وحدة** | ✅ | ✅ | ✅ | ✅ | ✅ |

`*` بصلاحيات من المالك

---

## 🔄 كيفية الاستخدام

### في الصفحات (Frontend):

```typescript
import { getCurrentUser, filterPropertiesByRole } from '@/lib/rbac';

function MyPropertiesPage() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const user = getCurrentUser();
    
    fetch('/api/properties')
      .then(r => r.json())
      .then(data => {
        // فلترة حسب الدور
        const filtered = filterPropertiesByRole(data.items, user);
        setProperties(filtered);
      });
  }, []);

  // عرض العقارات المفلترة فقط
  return <div>{properties.map(...)}</div>
}
```

### في الـ APIs (Backend):

```typescript
import { filterPropertiesByRole } from '@/lib/rbac';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // الحصول على المستخدم من headers أو session
  const user = {
    id: req.headers['x-user-id'],
    role: req.headers['x-user-role'] || 'user'
  };

  const allProperties = getAll();
  
  // فلترة حسب الدور
  const filtered = filterPropertiesByRole(allProperties, user);
  
  res.json({ items: filtered });
}
```

---

## 📁 الصفحات والأدوار المسموحة

### صفحات عامة (الكل):
- `/` - الصفحة الرئيسية
- `/properties` - تصفح العقارات (منشورة فقط للزوار)
- `/about` - من نحن
- `/contact` - اتصل بنا

### صفحات المستخدم (User):
- `/profile` - ملفي الشخصي
- `/bookings` - حجوزاتي
- `/favorites` - المفضلة

### صفحات المستأجر (Tenant):
- `/dashboard/tenant` - لوحة المستأجر
- `/profile` - معلوماتي
- `/invoices` - فواتيري (فقط فواتيره)
- `/tasks` - مهامي (طلبات الصيانة)

### صفحات المالك (Owner):
- `/dashboard/owner` - لوحة المالك
- `/properties/unified-management` - إدارة عقاراتي
- `/property/[id]/admin` - إدارة عقار محدد
- `/invoices` - فواتير عقاراتي
- `/tasks` - مهام عقاراتي

### صفحات المدير (Manager):
- `/dashboard/property-owner` - لوحة المدير
- `/properties/unified-management` - العقارات المسندة
- `/property/[id]/admin` - إدارة محدودة

### صفحات الإدارة (Admin):
- `/admin/*` - جميع صفحات الإدارة
- `/admin/properties` - كل العقارات
- `/admin/units` - كل الوحدات
- `/admin/users` - المستخدمين
- `/admin/subscriptions` - الباقات

---

## 🎯 التوصية النهائية

### الحالة الحالية:

**المشكلة:**
```
❌ /api/properties يعرض جميع العقارات للجميع
❌ لا توجد فلترة حسب الدور
❌ المستأجر يمكنه رؤية عقارات الآخرين
```

**الحل:**
```
✅ تطبيق نظام RBAC
✅ فلترة البيانات في كل صفحة
✅ فحص الصلاحيات قبل العرض
```

---

### الخطوات المطلوبة:

#### **1. تطبيق RBAC على صفحة `/properties`**
- فلترة العقارات المنشورة للزوار
- عرض عقارات المستخدم فقط للملاك

#### **2. تطبيق RBAC على `/properties/unified-management`**
- عرض عقارات المستخدم فقط
- فلترة الوحدات حسب العقارات

#### **3. تطبيق RBAC على `/admin/units`**
- للمديرين فقط
- عرض جميع الوحدات

#### **4. تطبيق RBAC على `/profile`**
- فلترة الحجوزات حسب المستخدم
- فلترة المهام حسب المستخدم
- فلترة الفواتير حسب المستخدم

---

## 🚀 هل تريدني أن:

**أ) أطبق نظام RBAC على جميع الصفحات؟**
```
سأقوم بـ:
1. تطبيق filterPropertiesByRole في كل صفحة
2. تطبيق filterUnitsByRole في صفحات الوحدات
3. تطبيق filterTasksByRole في صفحات المهام
4. تطبيق filterInvoicesByRole في صفحات الفواتير
5. إضافة فحص الدور في جميع الصفحات
6. اختبار شامل
```

**ب) أبدأ بصفحة واحدة كمثال؟**
```
سأطبق على /properties/unified-management كمثال
ثم ننتقل للبقية
```

**ج) أنشئ نظام حسابات المستخدمين أولاً؟**
```
سأنشئ:
1. صفحة إدارة المستخدمين
2. تعيين الأدوار
3. ربط الحسابات بالعقارات
4. ثم نطبق RBAC
```

**ما هو اختيارك؟** 🎯
