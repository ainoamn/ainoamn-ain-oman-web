# 🔐 دليل نظام الصلاحيات الشامل - Ain Oman Web

## 📋 نظرة عامة

نظام صلاحيات متكامل يتحكم في عرض وإخفاء الميزات بناءً على باقة اشتراك المستخدم.

---

## 📁 ملفات النظام

### 1. **`src/lib/featurePermissions.ts`**
- تعريف جميع الصلاحيات في الموقع
- ربط كل صلاحية بالباقة المطلوبة
- دوال مساعدة للتحقق من الصلاحيات

### 2. **`src/hooks/useFeatureAccess.ts`**
- Hook للتحقق من صلاحية واحدة: `useFeatureAccess()`
- Hook للتحقق من عدة صلاحيات: `useFeatureAccessMultiple()`
- دوال مساعدة: `getUserPlan()`, `getPlanName()`

### 3. **`src/components/FeatureGuard.tsx`**
- مكون لحماية الأقسام: `<FeatureGuard>`
- شارة "مميز": `<PremiumBadge>`
- رسالة ترقية: `<UpgradePrompt>`

### 4. **`src/components/property/PropertyAdminTabs.tsx`**
- تبويبات صفحة إدارة العقار مع الصلاحيات
- عرض التبويبات المتاحة فقط
- إشعار بالميزات المقفلة

---

## 🎯 الصلاحيات المتاحة

### إدارة العقار (Property Management)

| الصلاحية | المعرف | الباقة المطلوبة | الوصف |
|---------|-------|----------------|-------|
| نظرة عامة | `OVERVIEW` | Basic | عرض نظرة عامة وإحصائيات العقار |
| عرض المهام | `TASKS_VIEW` | Standard | عرض مهام العقار |
| إدارة المهام | `TASKS_MANAGE` | Standard | إنشاء وإدارة المهام |
| عرض عقود الإيجار | `LEASES_VIEW` | Basic | عرض عقود الإيجار |
| إدارة عقود الإيجار | `LEASES_MANAGE` | Standard | إنشاء وإدارة عقود الإيجار |
| عرض الفواتير | `INVOICES_VIEW` | Basic | عرض الفواتير والمدفوعات |
| إدارة الفواتير | `INVOICES_MANAGE` | Standard | إنشاء وإدارة الفواتير |
| عرض الصيانة | `MAINTENANCE_VIEW` | Standard | عرض طلبات الصيانة |
| إدارة الصيانة | `MAINTENANCE_MANAGE` | Standard | إنشاء وإدارة طلبات الصيانة |
| عرض القضايا القانونية | `LEGAL_VIEW` | Premium | عرض القضايا القانونية |
| إدارة القضايا القانونية | `LEGAL_MANAGE` | Premium | إنشاء وإدارة القضايا القانونية |
| عرض العقود | `CONTRACTS_VIEW` | Basic | عرض جميع العقود |
| إدارة العقود | `CONTRACTS_MANAGE` | Standard | إنشاء وإدارة العقود |
| عرض الطلبات | `REQUESTS_VIEW` | Basic | عرض طلبات المستأجرين |
| إدارة الطلبات | `REQUESTS_MANAGE` | Standard | الرد على وإدارة الطلبات |
| عرض التقويم | `CALENDAR_VIEW` | Standard | عرض أحداث التقويم |
| إدارة التقويم | `CALENDAR_MANAGE` | Standard | إنشاء وإدارة أحداث التقويم |
| عرض التنبيهات | `ALERTS_VIEW` | Standard | عرض تنبيهات العقار |
| إدارة التنبيهات | `ALERTS_MANAGE` | Standard | إنشاء وإدارة التنبيهات |
| عرض التقييمات | `REVIEWS_VIEW` | Basic | عرض تقييمات العقار |
| إدارة التقييمات | `REVIEWS_MANAGE` | Standard | الرد على التقييمات |
| التنبؤات والذكاء | `AI_ANALYTICS` | Premium | تنبؤات ورؤى مدعومة بالذكاء الاصطناعي |
| التقارير المتقدمة | `ADVANCED_REPORTS` | Premium | إنشاء التقارير المتقدمة |
| العمليات الجماعية | `BULK_OPERATIONS` | Premium | تنفيذ العمليات الجماعية |

### النظام (System)

| الصلاحية | المعرف | الباقة المطلوبة | الوصف |
|---------|-------|----------------|-------|
| الوصول للـ API | `API_ACCESS` | Enterprise | الوصول إلى واجهة البرمجة |
| العلامة البيضاء | `WHITE_LABEL` | Enterprise | حل العلامة البيضاء |

---

## 🔧 كيفية الاستخدام

### 1. استخدام `FeatureGuard` لحماية قسم كامل

```tsx
import FeatureGuard from '@/components/FeatureGuard';

function MyComponent() {
  return (
    <FeatureGuard 
      featureId="TASKS_VIEW" 
      mode="lock" 
      showUpgrade={true}
    >
      {/* المحتوى المحمي */}
      <div>
        <h2>المهام</h2>
        <TasksList />
      </div>
    </FeatureGuard>
  );
}
```

### 2. استخدام `useFeatureAccess` للتحقق من صلاحية

```tsx
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

function MyComponent() {
  const { hasAccess, isLoading } = useFeatureAccess('LEGAL_VIEW');

  if (isLoading) return <div>جاري التحميل...</div>;
  
  if (!hasAccess) {
    return <div>هذه الميزة غير متاحة في باقتك الحالية</div>;
  }

  return <div>المحتوى المحمي</div>;
}
```

### 3. استخدام `useFeatureAccessMultiple` للتحقق من عدة صلاحيات

```tsx
import { useFeatureAccessMultiple } from '@/hooks/useFeatureAccess';

function MyComponent() {
  const { accessMap, isLoading } = useFeatureAccessMultiple([
    'TASKS_VIEW',
    'CALENDAR_VIEW',
    'LEGAL_VIEW'
  ]);

  if (isLoading) return <div>جاري التحميل...</div>;

  return (
    <div>
      {accessMap['TASKS_VIEW'] && <TasksSection />}
      {accessMap['CALENDAR_VIEW'] && <CalendarSection />}
      {accessMap['LEGAL_VIEW'] && <LegalSection />}
    </div>
  );
}
```

### 4. استخدام `PropertyAdminTabs` في صفحة إدارة العقار

```tsx
import PropertyAdminTabs, { TabContentWrapper } from '@/components/property/PropertyAdminTabs';

function PropertyAdminPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div>
      {/* التبويبات مع الصلاحيات */}
      <PropertyAdminTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* المحتوى */}
      {activeTab === 'overview' && (
        <TabContentWrapper tabId="overview">
          <OverviewContent />
        </TabContentWrapper>
      )}
      
      {activeTab === 'tasks' && (
        <TabContentWrapper tabId="tasks">
          <TasksContent />
        </TabContentWrapper>
      )}
    </div>
  );
}
```

---

## 📊 الباقات وصلاحياتها

### 🌱 الباقة الأساسية (Basic) - 29 ر.ع./شهر

**الصلاحيات:**
- ✅ نظرة عامة
- ✅ عرض عقود الإيجار
- ✅ عرض الفواتير
- ✅ عرض العقود
- ✅ عرض الطلبات
- ✅ عرض التقييمات

**الحدود:**
- 5 عقارات
- 20 وحدة
- 100 حجز
- 1 مستخدم
- 1 GB تخزين

---

### 🚀 الباقة المعيارية (Standard) - 79 ر.ع./شهر

**الصلاحيات:** (كل Basic +)
- ✅ إدارة المهام (عرض وتحرير)
- ✅ إدارة عقود الإيجار
- ✅ إدارة الفواتير
- ✅ الصيانة (عرض وإدارة)
- ✅ إدارة العقود
- ✅ إدارة الطلبات
- ✅ التقويم (عرض وإدارة)
- ✅ التنبيهات (عرض وإدارة)
- ✅ إدارة التقييمات

**الحدود:**
- 25 عقار
- 100 وحدة
- 500 حجز
- 5 مستخدمين
- 10 GB تخزين

---

### 💎 الباقة المميزة (Premium) - 149 ر.ع./شهر

**الصلاحيات:** (كل Standard +)
- ✅ الشؤون القانونية (عرض وإدارة)
- ✅ التنبؤات والذكاء الاصطناعي
- ✅ التقارير المتقدمة
- ✅ العمليات الجماعية

**الحدود:**
- 100 عقار
- 500 وحدة
- 2000 حجز
- مستخدمون غير محدودين
- 50 GB تخزين

---

### 👑 الباقة المؤسسية (Enterprise) - 299 ر.ع./شهر

**الصلاحيات:** (كل Premium +)
- ✅ الوصول للـ API
- ✅ العلامة البيضاء
- ✅ جميع الميزات

**الحدود:**
- عقارات غير محدودة
- وحدات غير محدودة
- حجوزات غير محدودة
- مستخدمون غير محدودين
- 200 GB تخزين

---

## 🎨 أوضاع العرض (Modes)

### 1. **Hide** - إخفاء كامل

```tsx
<FeatureGuard featureId="LEGAL_VIEW" mode="hide">
  <LegalSection />
</FeatureGuard>
```

**النتيجة:** لا يظهر أي شيء إذا لم تكن الصلاحية متاحة

---

### 2. **Lock** - قفل مع رسالة (الافتراضي)

```tsx
<FeatureGuard featureId="AI_ANALYTICS" mode="lock">
  <AISection />
</FeatureGuard>
```

**النتيجة:** يظهر المحتوى مطموساً مع رسالة ترقية احترافية

---

### 3. **Disable** - تعطيل مع شارة

```tsx
<FeatureGuard featureId="BULK_OPERATIONS" mode="disable">
  <BulkActionsButton />
</FeatureGuard>
```

**النتيجة:** يظهر المحتوى باهتاً مع زر ترقية صغير

---

## 🔄 تطبيق النظام على صفحات الموقع

### صفحات يجب تطبيق النظام عليها:

#### 1. ✅ صفحة إدارة العقار
- `/property/[id]/admin`
- **تم:** تطبيق `PropertyAdminTabs`

#### 2. ⏳ صفحة المهام
- `/tasks`
- `/admin/tasks`
- **المطلوب:** استخدام `FeatureGuard` مع `TASKS_VIEW` و `TASKS_MANAGE`

#### 3. ⏳ صفحة التقويم
- `/calendar`
- **المطلوب:** استخدام `FeatureGuard` مع `CALENDAR_VIEW`

#### 4. ⏳ صفحة القضايا القانونية
- `/legal`
- `/legal/[caseId]`
- `/legal/new`
- **المطلوب:** استخدام `FeatureGuard` مع `LEGAL_VIEW` و `LEGAL_MANAGE`

#### 5. ⏳ صفحة الصيانة
- `/admin/maintenance`
- **المطلوب:** استخدام `FeatureGuard` مع `MAINTENANCE_VIEW`

#### 6. ⏳ صفحة الذكاء الاصطناعي
- `/admin/ai-panel`
- **المطلوب:** استخدام `FeatureGuard` مع `AI_ANALYTICS`

#### 7. ⏳ صفحة التقارير
- `/reports`
- **المطلوب:** استخدام `FeatureGuard` مع `ADVANCED_REPORTS`

---

## 🧪 اختبار النظام

### 1. اختبار باقة Basic

```javascript
// في localStorage:
{
  "ain_auth": {
    "subscription": {
      "planId": "basic"
    }
  }
}
```

**النتيجة المتوقعة:**
- ✅ نظرة عامة تظهر
- ❌ المهام مقفلة
- ❌ الصيانة مقفلة
- ❌ الشؤون القانونية مقفلة
- ❌ الذكاء الاصطناعي مقفل

---

### 2. اختبار باقة Standard

```javascript
{
  "ain_auth": {
    "subscription": {
      "planId": "standard"
    }
  }
}
```

**النتيجة المتوقعة:**
- ✅ نظرة عامة تظهر
- ✅ المهام تظهر
- ✅ الصيانة تظهر
- ✅ التقويم يظهر
- ❌ الشؤون القانونية مقفلة
- ❌ الذكاء الاصطناعي مقفل

---

### 3. اختبار باقة Premium

```javascript
{
  "ain_auth": {
    "subscription": {
      "planId": "premium"
    }
  }
}
```

**النتيجة المتوقعة:**
- ✅ جميع الميزات تظهر ماعدا API و White Label

---

## 📝 ملاحظات مهمة

### 1. **التخزين المحلي (localStorage)**

النظام يعتمد على `localStorage` لقراءة باقة المستخدم:

```javascript
const authData = localStorage.getItem('ain_auth');
const user = JSON.parse(authData);
const planId = user.subscription.planId;
```

### 2. **التحديث التلقائي**

عند تغيير الباقة من `/subscriptions`، يتم تحديث `localStorage` تلقائياً.

### 3. **صفحة الإدارة**

صفحة `/admin/subscriptions` تتحكم في:
- إنشاء وتعديل الباقات
- تعيين الباقات للمستخدمين
- عرض الصلاحيات لكل باقة

---

## 🎯 الخطوات التالية

1. ✅ إنشاء نظام الصلاحيات
2. ✅ إنشاء Hook للتحقق
3. ✅ إنشاء مكون FeatureGuard
4. ✅ تطبيق على صفحة إدارة العقار
5. ⏳ تطبيق على بقية الصفحات (130+ صفحة)
6. ⏳ ربط مع `/admin/subscriptions`
7. ⏳ اختبار شامل

---

**تم إنشاؤه:** 12 أكتوبر 2025  
**الإصدار:** 1.0  
**الحالة:** نشط ✅

