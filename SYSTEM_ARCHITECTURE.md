# 🏗️ **بنية النظام - System Architecture**

## 📐 **هندسة النظام المالي**

---

## 🎯 **المبادئ الهندسية المطبقة:**

### ✅ **1. Modularity (النمطية)**
```
النظام مقسم إلى وحدات مستقلة:
├── types/          # أنواع البيانات
├── lib/            # الوظائف المشتركة
├── components/     # المكونات القابلة لإعادة الاستخدام
└── pages/          # الصفحات المستقلة
```

### ✅ **2. Scalability (قابلية التوسع)**

**التوسع الأفقي (Horizontal):**
```typescript
// إضافة نظام جديد بسهولة:
// 1. أضف صفحة جديدة في pages/admin/financial/
// 2. أضف رابط في لوحة التحكم الرئيسية
// 3. النظام يعمل مباشرة!

// مثال:
pages/admin/financial/new-system/
  ├── index.tsx
  ├── details.tsx
  └── reports.tsx
```

**التوسع الطولي (Vertical):**
```typescript
// إضافة ميزات لنظام موجود:
// 1. أضف دوال جديدة في lib/
// 2. أضف أنواع في types/
// 3. أضف مكونات في components/

// مثال:
lib/financial-ai.ts
  → إضافة دالة: predictInventory()
```

### ✅ **3. Maintainability (سهولة الصيانة)**

**كود نظيف ومنظم:**
```typescript
// ✅ Good
export function calculateTax(amount: number, rate: number): number {
  return amount * (rate / 100);
}

// ❌ Bad
const ct = (a: any, r: any) => a * r / 100;
```

**تسميات واضحة:**
```typescript
// ✅ Good
const totalRevenue = calculateTotalRevenue(invoices);

// ❌ Bad
const tr = calc(inv);
```

### ✅ **4. Reusability (إعادة الاستخدام)**

**مكونات قابلة لإعادة الاستخدام:**
```typescript
// SmartTooltip.tsx - يُستخدم في أي صفحة
<AccountingTerm termKey="balance_sheet">
  <h1>الميزانية العمومية</h1>
</AccountingTerm>

// PrintShareModal.tsx - يُستخدم في أي وثيقة
<PrintShareModal 
  documentType="invoice"
  documentId="INV-001"
  documentTitle="فاتورة رقم 001"
/>
```

### ✅ **5. Type Safety (أمان الأنواع)**

**TypeScript في كل مكان:**
```typescript
// ✅ Type-safe
interface Invoice {
  id: string;
  amount: number;
  status: InvoiceStatus;
}

function processInvoice(invoice: Invoice): void {
  // الكومبايلر يتحقق من الأنواع
}

// ❌ Not type-safe
function processInvoice(invoice: any) {
  // خطر! لا تحقق من الأنواع
}
```

---

## 📁 **هيكل المجلدات:**

```
src/
├── types/                      # أنواع البيانات
│   ├── financial.ts           # 20 interface
│   └── contacts.ts            # 3 interface + IBAN
│
├── lib/                        # الوظائف المشتركة
│   ├── financial-ai.ts        # AI + تنبؤات
│   ├── chart-of-accounts.ts   # دليل الحسابات
│   └── user-roles.ts          # أدوار المستخدمين
│
├── components/                 # المكونات
│   ├── common/
│   │   └── SmartTooltip.tsx   # تلميحات ذكية
│   └── financial/
│       └── PrintShareModal.tsx # طباعة ومشاركة
│
├── pages/admin/financial/      # الصفحات المالية
│   ├── index.tsx               # لوحة التحكم
│   ├── customers.tsx           # العملاء
│   ├── beneficiaries.tsx       # المستفيدون
│   ├── bank-accounts.tsx       # الحسابات البنكية
│   ├── assets.tsx              # الأصول
│   ├── cost-centers.tsx        # مراكز التكلفة
│   ├── data-migration.tsx      # نقل البيانات
│   │
│   ├── sales/                  # 8 صفحات
│   │   ├── index.tsx
│   │   ├── quotations.tsx
│   │   ├── receipts.tsx
│   │   └── ...
│   │
│   ├── purchases/              # 6 صفحات
│   │   ├── index.tsx
│   │   └── ...
│   │
│   ├── payroll/                # 5 صفحات
│   │   ├── index.tsx
│   │   └── ...
│   │
│   ├── inventory/              # 4 صفحات
│   │   ├── index.tsx
│   │   └── ...
│   │
│   └── reports/                # 13 صفحة
│       ├── index.tsx
│       ├── balance-sheet.tsx
│       └── ...
│
└── server/
    ├── serialNumbers.ts        # أرقام متسلسلة
    └── ...
```

---

## 🔗 **الربط بين الأنظمة:**

### **1. الربط المباشر (Direct Linking):**
```typescript
// من لوحة التحكم → صفحة فرعية
<button onClick={() => router.push('/admin/financial/customers')}>
  العملاء والموردين
</button>

// من صفحة فرعية → صفحة تفصيلية
<button onClick={() => router.push(`/admin/financial/customers/${id}`)}>
  عرض التفاصيل
</button>
```

### **2. الربط عبر البيانات (Data Linking):**
```typescript
// عميل → فواتير
const customerInvoices = invoices.filter(inv => inv.customerId === customerId);

// فاتورة → مدفوعات
const invoicePayments = payments.filter(pay => pay.invoiceId === invoiceId);

// حساب بنكي → معاملات
const bankTransactions = transactions.filter(tx => tx.bankAccountId === accountId);
```

### **3. الربط عبر API (API Linking):**
```typescript
// في المستقبل - الربط عبر API
const response = await fetch('/api/financial/invoices');
const invoices = await response.json();
```

---

## 🚀 **كيفية التوسع:**

### **إضافة نظام فرعي جديد:**

**الخطوة 1: إنشاء الصفحة**
```typescript
// pages/admin/financial/new-system.tsx
export default function NewSystemPage() {
  return (
    <div>
      <h1>نظام جديد</h1>
      {/* محتوى النظام */}
    </div>
  );
}
```

**الخطوة 2: إضافة الرابط في لوحة التحكم**
```typescript
// pages/admin/financial/index.tsx
const mainModules = [
  // ... الأنظمة الموجودة
  {
    id: 'new-system',
    name: 'نظام جديد',
    icon: FiStar,
    color: 'blue',
    path: '/admin/financial/new-system',
    desc: 'وصف النظام الجديد'
  }
];
```

**الخطوة 3: إضافة أنواع (اختياري)**
```typescript
// types/financial.ts
export interface NewSystemItem {
  id: string;
  name: string;
  // ... باقي الحقول
}
```

---

## 🔄 **كيفية الربط مع أنظمة أخرى:**

### **1. الربط مع نظام العقارات:**
```typescript
// في صفحة العقار:
import Link from 'next/link';

<Link href={`/admin/financial/customers/${property.ownerId}`}>
  <button>عرض السجل المالي للمالك</button>
</Link>

// في صفحة العميل:
const properties = await getPropertiesByOwnerId(customerId);
```

### **2. الربط مع نظام الإيجارات:**
```typescript
// توليد فاتورة تلقائياً من عقد إيجار:
function generateRentInvoice(lease: Lease): Invoice {
  return {
    id: generateInvoiceNumber(),
    customerId: lease.tenantId,
    amount: lease.monthlyRent,
    type: 'rent',
    status: 'draft',
    // ... باقي الحقول
  };
}
```

### **3. الربط مع نظام المستخدمين:**
```typescript
// استيراد العملاء من المستخدمين:
const users = await getUsers();
const customers = users.map(user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  type: 'customer',
  // ... باقي الحقول
}));
```

---

## 🛠️ **أدوات الصيانة:**

### **1. التحقق من الأخطاء:**
```bash
# TypeScript type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

### **2. التصحيح (Debugging):**
```typescript
// إضافة console.log للتصحيح
console.log('Customer data:', customer);

// استخدام React DevTools
// Chrome Extension: React Developer Tools
```

### **3. الاختبار:**
```typescript
// في المستقبل - إضافة اختبارات
import { render, screen } from '@testing-library/react';

test('renders customer name', () => {
  render(<CustomerCard customer={mockCustomer} />);
  expect(screen.getByText('أحمد السالمي')).toBeInTheDocument();
});
```

---

## 📊 **قاعدة البيانات:**

### **الهيكل المقترح (Future):**

```sql
-- العملاء والموردين
CREATE TABLE contacts (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(20),  -- customer, vendor, employee
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  ...
);

-- المستفيدون
CREATE TABLE beneficiaries (
  id VARCHAR(50) PRIMARY KEY,
  contact_id VARCHAR(50) REFERENCES contacts(id),
  iban VARCHAR(50),
  bank_name VARCHAR(100),
  ...
);

-- الفواتير
CREATE TABLE invoices (
  id VARCHAR(50) PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE,
  customer_id VARCHAR(50) REFERENCES contacts(id),
  amount DECIMAL(10,2),
  status VARCHAR(20),
  ...
);

-- المدفوعات
CREATE TABLE payments (
  id VARCHAR(50) PRIMARY KEY,
  invoice_id VARCHAR(50) REFERENCES invoices(id),
  amount DECIMAL(10,2),
  method VARCHAR(20),
  ...
);
```

---

## 🌐 **API Structure (Future):**

```
GET    /api/financial/customers          # قائمة العملاء
POST   /api/financial/customers          # إضافة عميل
GET    /api/financial/customers/:id      # تفاصيل عميل
PUT    /api/financial/customers/:id      # تحديث عميل
DELETE /api/financial/customers/:id      # حذف عميل

GET    /api/financial/invoices           # قائمة الفواتير
POST   /api/financial/invoices           # إنشاء فاتورة
GET    /api/financial/invoices/:id       # تفاصيل فاتورة
PUT    /api/financial/invoices/:id       # تحديث فاتورة

GET    /api/financial/reports/balance-sheet    # الميزانية
GET    /api/financial/reports/income-statement # قائمة الدخل
```

---

## 📝 **Best Practices:**

### ✅ **1. كود نظيف:**
- تسميات واضحة
- تعليقات مفيدة
- دوال صغيرة ومحددة
- تجنب التكرار (DRY)

### ✅ **2. أمان:**
- التحقق من المدخلات
- استخدام TypeScript
- معالجة الأخطاء
- تشفير البيانات الحساسة

### ✅ **3. الأداء:**
- Lazy loading للصفحات
- تحميل البيانات عند الحاجة
- استخدام useMemo و useCallback
- تحسين الصور

### ✅ **4. تجربة المستخدم:**
- Loading states
- Error messages
- Success feedback
- Responsive design

---

## 🎯 **الخلاصة:**

**النظام مبني بطريقة:**
- ✅ **نمطية** - سهل التوسع
- ✅ **مرنة** - سهل التعديل
- ✅ **آمنة** - TypeScript + validation
- ✅ **قابلة للصيانة** - كود نظيف ومنظم
- ✅ **قابلة للربط** - سهل الربط مع أي نظام

**جاهز للإنتاج والتوسع!** 🚀

