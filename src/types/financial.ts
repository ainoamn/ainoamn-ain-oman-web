// src/types/financial.ts - أنواع البيانات المالية والمحاسبية

// ========================
// 1. دليل الحسابات المحاسبية
// ========================

export type AccountType = 
  | 'asset'           // أصول
  | 'liability'       // خصوم
  | 'equity'          // حقوق ملكية
  | 'revenue'         // إيرادات
  | 'expense'         // مصروفات
  | 'contra_asset'    // أصول مقابلة
  | 'contra_liability'; // خصوم مقابلة

export interface Account {
  id: string;
  code: string;                    // رمز الحساب (مثلاً: 1100)
  name: {
    ar: string;
    en: string;
  };
  type: AccountType;
  parentAccountId?: string;        // للحسابات الفرعية
  balance: number;                 // الرصيد الحالي
  currency: 'OMR' | 'USD' | 'EUR' | 'SAR' | 'AED';
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ========================
// 2. الفواتير
// ========================

export type InvoiceType = 
  | 'rent'              // فاتورة إيجار
  | 'service'           // فاتورة خدمات
  | 'utility'           // فواتير المرافق
  | 'maintenance'       // فاتورة صيانة
  | 'subscription'      // فاتورة اشتراك
  | 'sale'              // فاتورة بيع
  | 'other';            // أخرى

export type InvoiceStatus = 
  | 'draft'             // مسودة
  | 'sent'              // مرسلة
  | 'viewed'            // تم عرضها
  | 'unpaid'            // غير مدفوعة
  | 'paid'              // مدفوعة
  | 'partially_paid'    // مدفوعة جزئياً
  | 'overdue'           // متأخرة
  | 'cancelled'         // ملغاة
  | 'refunded';         // مستردة

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;                 // نسبة الضريبة (%)
  discountRate: number;            // نسبة الخصم (%)
  total: number;
  accountId?: string;              // ربط بحساب محاسبي
}

export interface Invoice {
  id: string;
  invoiceNumber: string;           // رقم الفاتورة (INV-2025-0001)
  type: InvoiceType;
  status: InvoiceStatus;
  
  // optional linkage to reservations/payments
  reservationId?: string;
  amount?: number;
  
  // الأطراف
  issuerId: string;                // من أصدر الفاتورة
  customerId: string;              // العميل
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  
  // التواريخ
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  // legacy alias sometimes used in code
  paidAt?: string;
  
  // المبالغ
  items: InvoiceItem[];
  subtotal: number;                // المجموع الفرعي
  taxAmount: number;               // مبلغ الضريبة
  discountAmount: number;          // مبلغ الخصم
  totalAmount: number;             // المبلغ الإجمالي
  paidAmount: number;              // المبلغ المدفوع
  remainingAmount: number;         // المبلغ المتبقي
  
  // الربط
  propertyId?: string;             // ربط بعقار
  unitId?: string;                 // ربط بوحدة
  contractId?: string;             // ربط بعقد
  subscriptionId?: string;         // ربط باشتراك
  
  // معلومات إضافية
  currency: 'OMR' | 'USD' | 'EUR' | 'SAR' | 'AED';
  notes?: string;
  attachments?: string[];
  recurring?: {
    enabled: boolean;
    frequency: 'monthly' | 'quarterly' | 'yearly';
    nextIssueDate: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

// ========================
// 3. المدفوعات
// ========================

export type PaymentMethod = 
  | 'cash'              // نقداً
  | 'bank_transfer'     // تحويل بنكي
  | 'check'             // شيك
  | 'credit_card'       // بطاقة ائتمان
  | 'debit_card'        // بطاقة مدين
  | 'online'            // دفع إلكتروني
  | 'mobile_wallet';    // محفظة إلكترونية

export type PaymentStatus = 
  | 'pending'           // معلق
  | 'processing'        // قيد المعالجة
  | 'completed'         // مكتمل
  | 'failed'            // فشل
  | 'cancelled'         // ملغي
  | 'refunded';         // مسترد

export interface Payment {
  id: string;
  paymentNumber?: string;           // رقم المدفوع (PAY-2025-0001)
  invoiceId: string;               // ربط بالفاتورة
  
  // الأطراف
  payerId?: string;                 // الدافع
  payerName?: string;
  receiverId?: string;              // المستقبل
  receiverName?: string;
  
  // المبلغ والطريقة
  amount: number;
  currency: 'OMR' | 'USD' | 'EUR' | 'SAR' | 'AED';
  method: PaymentMethod;
  status?: PaymentStatus;
  
  // التواريخ
  paymentDate?: string;
  processedDate?: string;
  // time when payment was recorded/settled
  paidAt?: string;
  
  // تفاصيل الدفع
  referenceNumber?: string;        // رقم المرجع
  bankName?: string;
  accountNumber?: string;
  checkNumber?: string;
  transactionId?: string;
  
  // الربط المحاسبي
  debitAccountId?: string;         // حساب المدين
  creditAccountId?: string;        // حساب الدائن
  journalEntryId?: string;         // ربط بقيد محاسبي
  
  // معلومات إضافية
  notes?: string;
  receiptNote?: string;
  attachments?: string[];
  
  createdAt?: string;
  updatedAt?: string;
}

// ========================
// 4. الشيكات
// ========================

export type CheckType = 
  | 'received'          // شيك مستلم
  | 'issued';           // شيك صادر

export type CheckStatus = 
  | 'pending'           // معلق
  | 'deposited'         // تم إيداعه
  | 'cleared'           // تم صرفه
  | 'bounced'           // مرتد
  | 'cancelled'         // ملغي
  | 'replaced';         // تم استبداله

export interface Check {
  id: string;
  checkNumber: string;
  type: CheckType;
  status: CheckStatus;
  
  // الأطراف
  issuerId: string;                // مصدر الشيك
  issuerName: string;
  beneficiaryId: string;           // المستفيد
  beneficiaryName: string;
  
  // التفاصيل البنكية
  bankName: string;
  branchName?: string;
  accountNumber: string;
  
  // المبلغ والتواريخ
  amount: number;
  currency: 'OMR' | 'USD' | 'EUR' | 'SAR' | 'AED';
  issueDate: string;
  dueDate: string;
  depositDate?: string;
  clearanceDate?: string;
  bouncedDate?: string;
  
  // الربط
  invoiceId?: string;
  paymentId?: string;
  propertyId?: string;
  unitId?: string;
  
  // معلومات إضافية
  notes?: string;
  attachments?: string[];
  bouncedReason?: string;
  replacementCheckId?: string;     // إذا كان بديل لشيك مرتد
  
  createdAt: string;
  updatedAt: string;
}

// ========================
// 5. القيود المحاسبية
// ========================

export type JournalEntryType = 
  | 'standard'          // قيد عادي
  | 'adjusting'         // قيد تسوية
  | 'closing'           // قيد إقفال
  | 'reversing'         // قيد عكسي
  | 'opening';          // قيد افتتاحي

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;                   // مدين
  credit: number;                  // دائن
  description?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;             // رقم القيد (JE-2025-0001)
  type: JournalEntryType;
  date: string;
  
  // الأسطر
  lines: JournalEntryLine[];
  totalDebit: number;              // مجموع المدين
  totalCredit: number;             // مجموع الدائن
  
  // الربط
  invoiceId?: string;
  paymentId?: string;
  checkId?: string;
  propertyId?: string;
  
  // معلومات
  description: string;
  reference?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  isPosted: boolean;               // تم الترحيل
  
  notes?: string;
  attachments?: string[];
  
  createdAt: string;
  updatedAt: string;
}

// ========================
// 6. التقارير المالية
// ========================

export interface BalanceSheet {
  asOfDate: string;
  
  // الأصول
  assets: {
    currentAssets: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      prepaidExpenses: number;
      total: number;
    };
    fixedAssets: {
      property: number;
      equipment: number;
      vehicles: number;
      accumulatedDepreciation: number;
      total: number;
    };
    total: number;
  };
  
  // الخصوم
  liabilities: {
    currentLiabilities: {
      accountsPayable: number;
      shortTermLoans: number;
      accruedExpenses: number;
      total: number;
    };
    longTermLiabilities: {
      mortgages: number;
      longTermLoans: number;
      total: number;
    };
    total: number;
  };
  
  // حقوق الملكية
  equity: {
    capital: number;
    retainedEarnings: number;
    currentYearProfit: number;
    total: number;
  };
  
  totalLiabilitiesAndEquity: number;
}

export interface IncomeStatement {
  startDate: string;
  endDate: string;
  
  // الإيرادات
  revenue: {
    rentRevenue: number;
    serviceRevenue: number;
    subscriptionRevenue: number;
    otherRevenue: number;
    total: number;
  };
  
  // التكاليف
  costOfRevenue: {
    maintenanceCosts: number;
    utilityCosts: number;
    total: number;
  };
  
  grossProfit: number;
  
  // المصروفات
  operatingExpenses: {
    salaries: number;
    rent: number;
    marketing: number;
    administrative: number;
    depreciation: number;
    other: number;
    total: number;
  };
  
  operatingIncome: number;
  
  // بنود أخرى
  otherIncome: number;
  otherExpenses: number;
  
  netIncome: number;
}

export interface CashFlowStatement {
  startDate: string;
  endDate: string;
  
  // التدفقات التشغيلية
  operatingActivities: {
    netIncome: number;
    adjustments: {
      depreciation: number;
      accountsReceivableChange: number;
      accountsPayableChange: number;
    };
    total: number;
  };
  
  // التدفقات الاستثمارية
  investingActivities: {
    propertyPurchases: number;
    equipmentPurchases: number;
    total: number;
  };
  
  // التدفقات التمويلية
  financingActivities: {
    loansReceived: number;
    loansRepaid: number;
    ownerContributions: number;
    dividendsPaid: number;
    total: number;
  };
  
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
}

// ========================
// 7. المعاملات المالية
// ========================

export type TransactionType = 
  | 'income'            // دخل
  | 'expense'           // مصروف
  | 'transfer'          // تحويل
  | 'adjustment';       // تسوية

export interface Transaction {
  id: string;
  transactionNumber: string;
  type: TransactionType;
  date: string;
  
  // المبلغ
  amount: number;
  currency: 'OMR' | 'USD' | 'EUR' | 'SAR' | 'AED';
  
  // الحسابات
  fromAccountId?: string;
  toAccountId?: string;
  
  // الربط
  invoiceId?: string;
  paymentId?: string;
  checkId?: string;
  propertyId?: string;
  userId?: string;
  
  // المعلومات
  description: string;
  category?: string;
  tags?: string[];
  notes?: string;
  attachments?: string[];
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ========================
// 8. الميزانية والتخطيط
// ========================

export interface Budget {
  id: string;
  name: string;
  fiscalYear: number;
  startDate: string;
  endDate: string;
  
  // الميزانيات حسب الفئة
  categories: {
    categoryId: string;
    categoryName: string;
    budgetedAmount: number;
    actualAmount: number;
    variance: number;               // الفرق
    variancePercentage: number;     // نسبة الفرق
  }[];
  
  totalBudgeted: number;
  totalActual: number;
  totalVariance: number;
  
  status: 'draft' | 'approved' | 'active' | 'closed';
  
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ========================
// 9. الإيصالات
// ========================

export type ReceiptType = 
  | 'payment'           // إيصال دفع
  | 'refund'            // إيصال استرداد
  | 'advance'           // إيصال دفعة مقدمة
  | 'security_deposit'; // إيصال تأمين

export interface Receipt {
  id: string;
  receiptNumber: string;
  type: ReceiptType;
  
  // الأطراف
  receivedFrom: string;
  receivedFromId: string;
  receivedBy: string;
  receivedById: string;
  
  // المبلغ
  amount: number;
  amountInWords: string;           // المبلغ بالحروف
  currency: 'OMR' | 'USD' | 'EUR' | 'SAR' | 'AED';
  
  // التفاصيل
  paymentMethod: PaymentMethod;
  date: string;
  description: string;
  
  // الربط
  invoiceId?: string;
  paymentId?: string;
  propertyId?: string;
  
  // التوقيع والطباعة
  signature?: string;
  isPrinted: boolean;
  printedAt?: string;
  printedBy?: string;
  
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

// ========================
// 10. حسابات العملاء
// ========================

export interface CustomerAccount {
  id: string;
  customerId: string;
  customerName: string;
  customerType: 'tenant' | 'landlord' | 'service_provider' | 'other';
  
  // الأرصدة
  balance: number;                 // الرصيد الحالي
  creditLimit: number;             // حد الائتمان
  availableCredit: number;         // الائتمان المتاح
  
  // الإحصائيات
  totalInvoices: number;
  totalPaid: number;
  totalOutstanding: number;        // المستحق
  totalOverdue: number;            // المتأخر
  
  // التواريخ
  lastPaymentDate?: string;
  lastInvoiceDate?: string;
  
  // التقييم
  paymentRating: number;           // 1-5
  daysSinceLastPayment?: number;
  averagePaymentDays: number;
  
  isActive: boolean;
  
  createdAt: string;
  updatedAt: string;
}

// ========================
// 11. السنة المالية
// ========================

export interface FiscalYear {
  id: string;
  year: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed';
  
  // الإحصائيات
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  
  // تواريخ الإقفال
  closedAt?: string;
  closedBy?: string;
  
  createdAt: string;
  updatedAt: string;
}

// ========================
// 12. الضرائب
// ========================

export interface TaxRate {
  id: string;
  name: string;
  rate: number;                    // نسبة الضريبة (%)
  type: 'vat' | 'income' | 'property' | 'other';
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
}

// ========================
// 13. فئات المصروفات
// ========================

export interface ExpenseCategory {
  id: string;
  code: string;
  name: {
    ar: string;
    en: string;
  };
  parentCategoryId?: string;
  accountId: string;               // ربط بحساب محاسبي
  budget?: number;                 // الميزانية المخصصة
  spent: number;                   // المصروف الفعلي
  isActive: boolean;
}

// ========================
// 14. الخزينة
// ========================

export interface CashRegister {
  id: string;
  name: string;
  location: string;
  
  // الرصيد
  openingBalance: number;
  currentBalance: number;
  closingBalance: number;
  
  // التواريخ
  openedAt: string;
  openedBy: string;
  closedAt?: string;
  closedBy?: string;
  
  // الإحصائيات
  totalCashIn: number;
  totalCashOut: number;
  transactionCount: number;
  
  status: 'open' | 'closed';
  
  currency: 'OMR' | 'USD' | 'EUR' | 'SAR' | 'AED';
  
  createdAt: string;
  updatedAt: string;
}

// ========================
// 15. الأصول الثابتة
// ========================

export interface FixedAsset {
  id: string;
  assetNumber: string;
  name: string;
  category: 'property' | 'equipment' | 'vehicle' | 'furniture' | 'other';
  
  // القيمة
  purchasePrice: number;
  currentValue: number;
  accumulatedDepreciation: number;
  bookValue: number;
  
  // الإهلاك
  depreciationMethod: 'straight_line' | 'declining_balance' | 'units_of_production';
  usefulLife: number;              // العمر الإنتاجي (سنوات)
  depreciationRate: number;
  annualDepreciation: number;
  
  // التواريخ
  purchaseDate: string;
  depreciationStartDate: string;
  
  // الربط
  propertyId?: string;
  accountId: string;               // حساب الأصل
  depreciationAccountId: string;   // حساب الإهلاك
  
  // الحالة
  status: 'active' | 'disposed' | 'fully_depreciated';
  
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

