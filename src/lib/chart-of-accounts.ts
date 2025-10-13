// src/lib/chart-of-accounts.ts - دليل الحسابات المحاسبي
import { Account, AccountType } from '@/types/financial';

// دليل الحسابات القياسي للشركات العقارية
export const CHART_OF_ACCOUNTS: Account[] = [
  
  // ========================
  // 1000 - الأصول (Assets)
  // ========================
  
  // 1100 - الأصول المتداولة (Current Assets)
  {
    id: 'acc_1100',
    code: '1100',
    name: { ar: 'الأصول المتداولة', en: 'Current Assets' },
    type: 'asset',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_1110',
    code: '1110',
    name: { ar: 'النقدية بالصندوق', en: 'Cash on Hand' },
    type: 'asset',
    parentAccountId: 'acc_1100',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_1120',
    code: '1120',
    name: { ar: 'النقدية بالبنك', en: 'Cash in Bank' },
    type: 'asset',
    parentAccountId: 'acc_1100',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_1130',
    code: '1130',
    name: { ar: 'المدينون', en: 'Accounts Receivable' },
    type: 'asset',
    parentAccountId: 'acc_1100',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    description: 'الذمم المدينة من المستأجرين والعملاء',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_1140',
    code: '1140',
    name: { ar: 'الشيكات تحت التحصيل', en: 'Checks Receivable' },
    type: 'asset',
    parentAccountId: 'acc_1100',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_1150',
    code: '1150',
    name: { ar: 'المصروفات المدفوعة مقدماً', en: 'Prepaid Expenses' },
    type: 'asset',
    parentAccountId: 'acc_1100',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_1160',
    code: '1160',
    name: { ar: 'التأمينات القابلة للاسترداد', en: 'Refundable Deposits' },
    type: 'asset',
    parentAccountId: 'acc_1100',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 1200 - الأصول الثابتة (Fixed Assets)
  {
    id: 'acc_1200',
    code: '1200',
    name: { ar: 'الأصول الثابتة', en: 'Fixed Assets' },
    type: 'asset',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_1210',
    code: '1210',
    name: { ar: 'العقارات الاستثمارية', en: 'Investment Properties' },
    type: 'asset',
    parentAccountId: 'acc_1200',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_1220',
    code: '1220',
    name: { ar: 'المعدات والأثاث', en: 'Equipment and Furniture' },
    type: 'asset',
    parentAccountId: 'acc_1200',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_1230',
    code: '1230',
    name: { ar: 'السيارات', en: 'Vehicles' },
    type: 'asset',
    parentAccountId: 'acc_1200',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_1290',
    code: '1290',
    name: { ar: 'مجمع الإهلاك', en: 'Accumulated Depreciation' },
    type: 'contra_asset',
    parentAccountId: 'acc_1200',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // ========================
  // 2000 - الخصوم (Liabilities)
  // ========================
  
  // 2100 - الخصوم المتداولة (Current Liabilities)
  {
    id: 'acc_2100',
    code: '2100',
    name: { ar: 'الخصوم المتداولة', en: 'Current Liabilities' },
    type: 'liability',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_2110',
    code: '2110',
    name: { ar: 'الدائنون', en: 'Accounts Payable' },
    type: 'liability',
    parentAccountId: 'acc_2100',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    description: 'الذمم الدائنة للموردين',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_2120',
    code: '2120',
    name: { ar: 'تأمينات المستأجرين', en: 'Tenant Security Deposits' },
    type: 'liability',
    parentAccountId: 'acc_2100',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_2130',
    code: '2130',
    name: { ar: 'إيرادات مقدمة', en: 'Unearned Revenue' },
    type: 'liability',
    parentAccountId: 'acc_2100',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    description: 'إيجارات مستلمة مقدماً',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_2140',
    code: '2140',
    name: { ar: 'الشيكات الصادرة', en: 'Checks Payable' },
    type: 'liability',
    parentAccountId: 'acc_2100',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_2150',
    code: '2150',
    name: { ar: 'مصروفات مستحقة', en: 'Accrued Expenses' },
    type: 'liability',
    parentAccountId: 'acc_2100',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 2200 - الخصوم طويلة الأجل (Long-term Liabilities)
  {
    id: 'acc_2200',
    code: '2200',
    name: { ar: 'الخصوم طويلة الأجل', en: 'Long-term Liabilities' },
    type: 'liability',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_2210',
    code: '2210',
    name: { ar: 'قروض طويلة الأجل', en: 'Long-term Loans' },
    type: 'liability',
    parentAccountId: 'acc_2200',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_2220',
    code: '2220',
    name: { ar: 'الرهون العقارية', en: 'Mortgages' },
    type: 'liability',
    parentAccountId: 'acc_2200',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // ========================
  // 3000 - حقوق الملكية (Equity)
  // ========================
  
  {
    id: 'acc_3000',
    code: '3000',
    name: { ar: 'حقوق الملكية', en: 'Owner\'s Equity' },
    type: 'equity',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_3100',
    code: '3100',
    name: { ar: 'رأس المال', en: 'Capital' },
    type: 'equity',
    parentAccountId: 'acc_3000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_3200',
    code: '3200',
    name: { ar: 'الأرباح المحتجزة', en: 'Retained Earnings' },
    type: 'equity',
    parentAccountId: 'acc_3000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_3300',
    code: '3300',
    name: { ar: 'صافي الربح/الخسارة للعام الحالي', en: 'Current Year Profit/Loss' },
    type: 'equity',
    parentAccountId: 'acc_3000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // ========================
  // 4000 - الإيرادات (Revenue)
  // ========================
  
  {
    id: 'acc_4000',
    code: '4000',
    name: { ar: 'الإيرادات', en: 'Revenue' },
    type: 'revenue',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_4100',
    code: '4100',
    name: { ar: 'إيرادات الإيجارات', en: 'Rental Revenue' },
    type: 'revenue',
    parentAccountId: 'acc_4000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_4110',
    code: '4110',
    name: { ar: 'إيرادات إيجار سكني', en: 'Residential Rent Revenue' },
    type: 'revenue',
    parentAccountId: 'acc_4100',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_4120',
    code: '4120',
    name: { ar: 'إيرادات إيجار تجاري', en: 'Commercial Rent Revenue' },
    type: 'revenue',
    parentAccountId: 'acc_4100',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_4200',
    code: '4200',
    name: { ar: 'إيرادات الخدمات', en: 'Service Revenue' },
    type: 'revenue',
    parentAccountId: 'acc_4000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_4300',
    code: '4300',
    name: { ar: 'إيرادات الاشتراكات', en: 'Subscription Revenue' },
    type: 'revenue',
    parentAccountId: 'acc_4000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_4400',
    code: '4400',
    name: { ar: 'إيرادات المزادات', en: 'Auction Revenue' },
    type: 'revenue',
    parentAccountId: 'acc_4000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_4900',
    code: '4900',
    name: { ar: 'إيرادات أخرى', en: 'Other Revenue' },
    type: 'revenue',
    parentAccountId: 'acc_4000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // ========================
  // 5000 - المصروفات (Expenses)
  // ========================
  
  {
    id: 'acc_5000',
    code: '5000',
    name: { ar: 'المصروفات', en: 'Expenses' },
    type: 'expense',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_5100',
    code: '5100',
    name: { ar: 'مصروفات الصيانة', en: 'Maintenance Expenses' },
    type: 'expense',
    parentAccountId: 'acc_5000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_5200',
    code: '5200',
    name: { ar: 'مصروفات المرافق', en: 'Utility Expenses' },
    type: 'expense',
    parentAccountId: 'acc_5000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    description: 'كهرباء، ماء، إنترنت',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_5300',
    code: '5300',
    name: { ar: 'الرواتب والأجور', en: 'Salaries and Wages' },
    type: 'expense',
    parentAccountId: 'acc_5000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_5400',
    code: '5400',
    name: { ar: 'مصروفات التسويق والإعلان', en: 'Marketing Expenses' },
    type: 'expense',
    parentAccountId: 'acc_5000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_5500',
    code: '5500',
    name: { ar: 'المصروفات الإدارية', en: 'Administrative Expenses' },
    type: 'expense',
    parentAccountId: 'acc_5000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_5600',
    code: '5600',
    name: { ar: 'الإهلاك', en: 'Depreciation' },
    type: 'expense',
    parentAccountId: 'acc_5000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_5700',
    code: '5700',
    name: { ar: 'الفوائد البنكية', en: 'Interest Expenses' },
    type: 'expense',
    parentAccountId: 'acc_5000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_5800',
    code: '5800',
    name: { ar: 'الديون المعدومة', en: 'Bad Debts' },
    type: 'expense',
    parentAccountId: 'acc_5000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'acc_5900',
    code: '5900',
    name: { ar: 'مصروفات أخرى', en: 'Other Expenses' },
    type: 'expense',
    parentAccountId: 'acc_5000',
    balance: 0,
    currency: 'OMR',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// دوال مساعدة
export const getAccountByCode = (code: string): Account | undefined => {
  return CHART_OF_ACCOUNTS.find(acc => acc.code === code);
};

export const getAccountById = (id: string): Account | undefined => {
  return CHART_OF_ACCOUNTS.find(acc => acc.id === id);
};

export const getAccountsByType = (type: AccountType): Account[] => {
  return CHART_OF_ACCOUNTS.filter(acc => acc.type === type);
};

export const getSubAccounts = (parentId: string): Account[] => {
  return CHART_OF_ACCOUNTS.filter(acc => acc.parentAccountId === parentId);
};

export const calculateAccountBalance = (accountId: string, transactions: any[]): number => {
  // حساب رصيد الحساب من المعاملات
  return transactions
    .filter(t => t.accountId === accountId)
    .reduce((sum, t) => sum + (t.debit - t.credit), 0);
};

