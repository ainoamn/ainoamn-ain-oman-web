# نظام لوحات التحكم الموحدة 🎨

## نظرة عامة

تم إنشاء نظام موحد لجميع لوحات التحكم في الموقع مع:
- ✅ تصميم موحد وألوان متناسقة
- ✅ إحصائيات حقيقية من APIs
- ✅ تنبؤات ذكية بناءً على سلوك المستخدم
- ✅ واجهة مستخدم حديثة ومتجاوبة

## المكونات الجديدة

### 1. UnifiedDashboardLayout
**المسار:** `src/components/dashboard/UnifiedDashboardLayout.tsx`

مكون موحد لتصميم جميع لوحات التحكم:
- Header موحد مع عنوان ووصف
- إمكانية إضافة أزرار إجراءات في الـ header
- تصميم متجاوب ومتناسق

**الاستخدام:**
```tsx
<UnifiedDashboardLayout
  title="لوحة التحكم"
  description="وصف اللوحة"
  headerActions={<button>إجراء</button>}
>
  {/* محتوى اللوحة */}
</UnifiedDashboardLayout>
```

### 2. UnifiedStatsCards
**المسار:** `src/components/dashboard/UnifiedStatsCards.tsx`

بطاقات إحصائيات موحدة مع:
- أيقونات ملونة
- نسب التغيير
- حالات التحميل
- تصميم موحد

**الاستخدام:**
```tsx
<UnifiedStatsCards 
  stats={[
    {
      title: 'العنوان',
      value: 123,
      change: 12.5,
      changeLabel: 'هذا الشهر',
      icon: FiUsers,
      color: 'blue'
    }
  ]}
  columns={4}
/>
```

### 3. AIPredictionsPanel
**المسار:** `src/components/dashboard/AIPredictionsPanel.tsx`

لوحة التنبؤات الذكية التي تعرض:
- فرص محتملة
- تحذيرات مهمة
- توصيات مخصصة
- اتجاهات السوق

**الاستخدام:**
```tsx
<AIPredictionsPanel
  userId={userId}
  userRole="property_owner"
  stats={stats}
/>
```

### 4. dashboardStatsService
**المسار:** `src/services/dashboardStats.ts`

خدمة موحدة لجلب الإحصائيات الحقيقية من APIs:
- `getOwnerStats(userId)`: إحصائيات المالك
- `getTenantStats(userId)`: إحصائيات المستأجر
- `getAdminStats()`: إحصائيات الإدارة

### 5. aiPredictionEngine
**المسار:** `src/lib/aiPredictions.ts`

نظام التنبؤات الذكية:
- تحليل سلوك المستخدم
- توليد تنبؤات مخصصة
- تتبع الإجراءات وعرض الصفحات

## لوحات التحكم الموحدة

### 1. Admin Dashboard
**المسار:** `src/pages/dashboard/admin-unified.tsx`

لوحة تحكم الإدارة الموحدة مع:
- إحصائيات المستخدمين والعقارات والحجوزات
- تفاصيل المهام
- إجراءات سريعة

### 2. Property Owner Dashboard
**المسار:** `src/pages/dashboard/property-owner-unified.tsx`

لوحة تحكم المالك الموحدة مع:
- إحصائيات العقارات والعقود
- تفاصيل الإيرادات
- تنبؤات ذكية للتوسع

### 3. Tenant Dashboard
**المسار:** `src/pages/dashboard/tenant-unified.tsx`

لوحة تحكم المستأجر الموحدة مع:
- إحصائيات العقود
- تنبيهات انتهاء العقود
- إجراءات سريعة

## كيفية التحديث

### تحديث لوحة تحكم موجودة

1. استبدال التصميم القديم بـ `UnifiedDashboardLayout`
2. استخدام `UnifiedStatsCards` بدلاً من البطاقات المخصصة
3. إضافة `AIPredictionsPanel` للتنبؤات الذكية
4. استخدام `dashboardStatsService` لجلب الإحصائيات

**مثال:**
```tsx
import UnifiedDashboardLayout from '@/components/dashboard/UnifiedDashboardLayout';
import UnifiedStatsCards from '@/components/dashboard/UnifiedStatsCards';
import AIPredictionsPanel from '@/components/dashboard/AIPredictionsPanel';
import { dashboardStatsService } from '@/services/dashboardStats';

export default function MyDashboard() {
  const [stats, setStats] = useState({});
  
  useEffect(() => {
    dashboardStatsService.getOwnerStats(userId).then(setStats);
  }, []);

  return (
    <UnifiedDashboardLayout title="لوحتي">
      <AIPredictionsPanel userId={userId} userRole="owner" stats={stats} />
      <UnifiedStatsCards stats={statsCards} />
    </UnifiedDashboardLayout>
  );
}
```

## الألوان الموحدة

النظام يستخدم لوحة ألوان موحدة:
- **Blue**: للمستخدمين والإحصائيات العامة
- **Green**: للعقارات والإيرادات الإيجابية
- **Purple**: للحجوزات والعقود
- **Yellow**: للتحذيرات والتنبيهات
- **Red**: للأخطاء والمهام المتأخرة
- **Indigo**: للمهام والإعدادات

## التنبؤات الذكية

النظام يولد تنبؤات بناءً على:
- سلوك المستخدم (الصفحات التي يزورها، الإجراءات التي يقوم بها)
- الإحصائيات الحالية
- دور المستخدم (مالك، مستأجر، إداري)

**أنواع التنبؤات:**
- **Opportunity**: فرص محتملة
- **Warning**: تحذيرات مهمة
- **Recommendation**: توصيات مخصصة
- **Trend**: اتجاهات السوق

## الخطوات التالية

1. ✅ إنشاء المكونات الأساسية
2. ✅ إنشاء لوحات التحكم الموحدة
3. ⏳ تحديث لوحات التحكم القديمة
4. ⏳ إضافة المزيد من التنبؤات الذكية
5. ⏳ تحسين الأداء والتحميل

## ملاحظات

- جميع الإحصائيات حقيقية من APIs
- التنبؤات الذكية تعمل بناءً على سلوك المستخدم الفعلي
- التصميم متجاوب ويعمل على جميع الأجهزة
- الكود منظم وقابل لإعادة الاستخدام
