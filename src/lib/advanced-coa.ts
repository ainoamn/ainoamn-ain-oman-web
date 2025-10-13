// src/lib/advanced-coa.ts - نظام شجرة الحسابات المتقدم متعدد الأبعاد
/**
 * Advanced Multi-Dimensional Chart of Accounts
 * شجرة حسابات هيكلية موزونة تدعم التحليل متعدد الأبعاد
 * 
 * نظام التكويد: 12 رقماً مقسمة كالتالي:
 * XX-XXXX-XX-XX-XX
 * │  │    │  │  │
 * │  │    │  │  └─ البعد الجغرافي (فرع/منطقة)
 * │  │    │  └──── مركز التكلفة/الإيراد
 * │  │    └─────── القسم الفرعي
 * │  └──────────── رقم الحساب
 * └─────────────── القسم الرئيسي (النوع)
 */

export interface AdvancedAccount {
  // التكويد المتقدم
  code: string;  // مثال: 11-1010-01-02-03
  structure: {
    mainClass: string;       // 11 = أصول متداولة
    accountNumber: string;   // 1010 = نقدية
    subDivision: string;     // 01 = نقدية في الصندوق
    costCenter: string;      // 02 = فرع مسقط
    geography: string;       // 03 = محافظة مسقط
  };
  
  // المعلومات الأساسية
  name: {
    ar: string;
    en: string;
  };
  description: string;
  
  // التصنيف
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  subCategory: string;
  
  // التسلسل الهرمي
  parentCode?: string;
  level: number;
  hasChildren: boolean;
  
  // الربط مع المعايير
  ifrsMapping: {
    category: string;
    disclosureNote: string;
  };
  localGAAPMapping?: {
    category: string;
    adjustments: string[];
  };
  
  // الأبعاد المالية
  dimensions: {
    costCenter?: string;
    project?: string;
    department?: string;
    geography?: string;
    product?: string;
  };
  
  // الموازنة
  budget: {
    enabled: boolean;
    annual: number;
    quarterly: number[];
    monthly: number[];
    variance: number;
  };
  
  // السلوك
  behavior: {
    allowDirectPosting: boolean;
    requireApproval: boolean;
    reconciliationRequired: boolean;
    autoReverse: boolean;
  };
  
  // الأرصدة
  balance: {
    opening: number;
    debit: number;
    credit: number;
    closing: number;
  };
  
  currency: string;
  isActive: boolean;
  tags: string[];
}

// ========================
// نظام التكويد المتقدم
// ========================

export class COACodeGenerator {
  /**
   * توليد رمز حساب متقدم
   */
  static generate(params: {
    mainClass: number;
    accountNumber: number;
    subDivision?: number;
    costCenter?: number;
    geography?: number;
  }): string {
    const parts = [
      params.mainClass.toString().padStart(2, '0'),
      params.accountNumber.toString().padStart(4, '0'),
      (params.subDivision || 0).toString().padStart(2, '0'),
      (params.costCenter || 0).toString().padStart(2, '0'),
      (params.geography || 0).toString().padStart(2, '0')
    ];
    
    return parts.join('-');
  }
  
  /**
   * تحليل رمز الحساب
   */
  static parse(code: string): {
    mainClass: number;
    accountNumber: number;
    subDivision: number;
    costCenter: number;
    geography: number;
  } {
    const parts = code.split('-').map(p => parseInt(p, 10));
    
    return {
      mainClass: parts[0] || 0,
      accountNumber: parts[1] || 0,
      subDivision: parts[2] || 0,
      costCenter: parts[3] || 0,
      geography: parts[4] || 0
    };
  }
}

// ========================
// الأقسام الرئيسية
// ========================

export const MAIN_CLASSES = {
  // الأصول
  CURRENT_ASSETS: 11,
  NON_CURRENT_ASSETS: 12,
  
  // الخصوم
  CURRENT_LIABILITIES: 21,
  NON_CURRENT_LIABILITIES: 22,
  
  // حقوق الملكية
  EQUITY: 30,
  
  // الإيرادات
  OPERATING_REVENUE: 41,
  NON_OPERATING_REVENUE: 42,
  
  // المصروفات
  COST_OF_SALES: 51,
  OPERATING_EXPENSES: 52,
  ADMINISTRATIVE_EXPENSES: 53,
  FINANCIAL_EXPENSES: 54
};

// ========================
// مراكز التكلفة
// ========================

export const COST_CENTERS = {
  HEAD_OFFICE: { code: '01', name: 'المكتب الرئيسي' },
  MUSCAT_BRANCH: { code: '02', name: 'فرع مسقط' },
  SALALAH_BRANCH: { code: '03', name: 'فرع صلالة' },
  SOHAR_BRANCH: { code: '04', name: 'فرع صحار' },
  NIZWA_BRANCH: { code: '05', name: 'فرع نزوى' },
  // يمكن إضافة المزيد
};

// ========================
// المناطق الجغرافية
// ========================

export const GEOGRAPHIES = {
  MUSCAT: { code: '01', name: 'محافظة مسقط' },
  DHOFAR: { code: '02', name: 'محافظة ظفار' },
  BATINAH_NORTH: { code: '03', name: 'شمال الباطنة' },
  BATINAH_SOUTH: { code: '04', name: 'جنوب الباطنة' },
  SHARQIYAH_NORTH: { code: '05', name: 'شمال الشرقية' },
  // يمكن إضافة المزيد
};

// ========================
// دليل الحسابات المتقدم
// ========================

export const ADVANCED_CHART_OF_ACCOUNTS: AdvancedAccount[] = [
  // ===== الأصول المتداولة =====
  {
    code: '11-0000-00-00-00',
    structure: { mainClass: '11', accountNumber: '0000', subDivision: '00', costCenter: '00', geography: '00' },
    name: { ar: 'الأصول المتداولة', en: 'Current Assets' },
    description: 'أصول يمكن تحويلها إلى نقد خلال سنة',
    type: 'asset',
    category: 'current',
    subCategory: 'main',
    level: 1,
    hasChildren: true,
    ifrsMapping: { category: 'IAS 1 - Current Assets', disclosureNote: 'Note 5' },
    dimensions: {},
    budget: { enabled: false, annual: 0, quarterly: [], monthly: [], variance: 0 },
    behavior: { allowDirectPosting: false, requireApproval: false, reconciliationRequired: false, autoReverse: false },
    balance: { opening: 0, debit: 0, credit: 0, closing: 0 },
    currency: 'OMR',
    isActive: true,
    tags: ['assets', 'current']
  },
  
  {
    code: '11-1010-00-00-00',
    structure: { mainClass: '11', accountNumber: '1010', subDivision: '00', costCenter: '00', geography: '00' },
    name: { ar: 'النقدية وما يعادلها', en: 'Cash and Cash Equivalents' },
    description: 'النقد في الصندوق والبنوك والاستثمارات قصيرة الأجل',
    type: 'asset',
    category: 'current',
    subCategory: 'cash',
    parentCode: '11-0000-00-00-00',
    level: 2,
    hasChildren: true,
    ifrsMapping: { category: 'IAS 7 - Cash and Cash Equivalents', disclosureNote: 'Note 6' },
    dimensions: {},
    budget: { enabled: true, annual: 100000, quarterly: [25000, 25000, 25000, 25000], monthly: [], variance: 0 },
    behavior: { allowDirectPosting: false, requireApproval: false, reconciliationRequired: true, autoReverse: false },
    balance: { opening: 50000, debit: 0, credit: 0, closing: 50000 },
    currency: 'OMR',
    isActive: true,
    tags: ['cash', 'liquid']
  },
  
  {
    code: '11-1010-01-02-01',
    structure: { mainClass: '11', accountNumber: '1010', subDivision: '01', costCenter: '02', geography: '01' },
    name: { ar: 'نقدية الصندوق - فرع مسقط', en: 'Cash on Hand - Muscat Branch' },
    description: 'النقد المتوفر في صندوق فرع مسقط',
    type: 'asset',
    category: 'current',
    subCategory: 'cash',
    parentCode: '11-1010-00-00-00',
    level: 3,
    hasChildren: false,
    ifrsMapping: { category: 'IAS 7 - Cash', disclosureNote: 'Note 6.1' },
    dimensions: {
      costCenter: COST_CENTERS.MUSCAT_BRANCH.code,
      geography: GEOGRAPHIES.MUSCAT.code
    },
    budget: { enabled: true, annual: 10000, quarterly: [2500, 2500, 2500, 2500], monthly: [], variance: 0 },
    behavior: { allowDirectPosting: true, requireApproval: false, reconciliationRequired: true, autoReverse: false },
    balance: { opening: 5000, debit: 0, credit: 0, closing: 5000 },
    currency: 'OMR',
    isActive: true,
    tags: ['cash', 'muscat', 'petty-cash']
  },
  
  {
    code: '11-1020-00-00-00',
    structure: { mainClass: '11', accountNumber: '1020', subDivision: '00', costCenter: '00', geography: '00' },
    name: { ar: 'المدينون وأوراق القبض', en: 'Accounts Receivable' },
    description: 'المبالغ المستحقة من العملاء',
    type: 'asset',
    category: 'current',
    subCategory: 'receivables',
    parentCode: '11-0000-00-00-00',
    level: 2,
    hasChildren: true,
    ifrsMapping: { category: 'IFRS 9 - Financial Assets at Amortized Cost', disclosureNote: 'Note 7' },
    dimensions: {},
    budget: { enabled: true, annual: 50000, quarterly: [], monthly: [], variance: 0 },
    behavior: { allowDirectPosting: false, requireApproval: false, reconciliationRequired: true, autoReverse: false },
    balance: { opening: 30000, debit: 0, credit: 0, closing: 30000 },
    currency: 'OMR',
    isActive: true,
    tags: ['receivables', 'trade']
  },
  
  // ===== الخصوم المتداولة =====
  {
    code: '21-0000-00-00-00',
    structure: { mainClass: '21', accountNumber: '0000', subDivision: '00', costCenter: '00', geography: '00' },
    name: { ar: 'الخصوم المتداولة', en: 'Current Liabilities' },
    description: 'التزامات مستحقة خلال سنة',
    type: 'liability',
    category: 'current',
    subCategory: 'main',
    level: 1,
    hasChildren: true,
    ifrsMapping: { category: 'IAS 1 - Current Liabilities', disclosureNote: 'Note 10' },
    dimensions: {},
    budget: { enabled: false, annual: 0, quarterly: [], monthly: [], variance: 0 },
    behavior: { allowDirectPosting: false, requireApproval: false, reconciliationRequired: false, autoReverse: false },
    balance: { opening: 0, debit: 0, credit: 0, closing: 0 },
    currency: 'OMR',
    isActive: true,
    tags: ['liabilities', 'current']
  },
  
  {
    code: '21-2010-00-00-00',
    structure: { mainClass: '21', accountNumber: '2010', subDivision: '00', costCenter: '00', geography: '00' },
    name: { ar: 'الدائنون وأوراق الدفع', en: 'Accounts Payable' },
    description: 'المبالغ المستحقة للموردين',
    type: 'liability',
    category: 'current',
    subCategory: 'payables',
    parentCode: '21-0000-00-00-00',
    level: 2,
    hasChildren: true,
    ifrsMapping: { category: 'IFRS 9 - Financial Liabilities', disclosureNote: 'Note 11' },
    dimensions: {},
    budget: { enabled: true, annual: 30000, quarterly: [], monthly: [], variance: 0 },
    behavior: { allowDirectPosting: false, requireApproval: false, reconciliationRequired: true, autoReverse: false },
    balance: { opening: 20000, debit: 0, credit: 0, closing: 20000 },
    currency: 'OMR',
    isActive: true,
    tags: ['payables', 'trade']
  }
];

// ========================
// وظائف التحليل متعدد الأبعاد
// ========================

export class MultiDimensionalAnalysis {
  /**
   * تحليل حسب مركز التكلفة
   */
  static analyzeByCostCenter(accounts: AdvancedAccount[]): Map<string, number> {
    const analysis = new Map<string, number>();
    
    accounts.forEach(account => {
      if (account.dimensions.costCenter) {
        const current = analysis.get(account.dimensions.costCenter) || 0;
        analysis.set(account.dimensions.costCenter, current + account.balance.closing);
      }
    });
    
    return analysis;
  }
  
  /**
   * تحليل حسب المنطقة الجغرافية
   */
  static analyzeByGeography(accounts: AdvancedAccount[]): Map<string, number> {
    const analysis = new Map<string, number>();
    
    accounts.forEach(account => {
      if (account.dimensions.geography) {
        const current = analysis.get(account.dimensions.geography) || 0;
        analysis.set(account.dimensions.geography, current + account.balance.closing);
      }
    });
    
    return analysis;
  }
  
  /**
   * مقارنة الأداء مع الموازنة
   */
  static compareWithBudget(account: AdvancedAccount): {
    budgeted: number;
    actual: number;
    variance: number;
    variancePercent: number;
    status: 'over' | 'under' | 'on-target';
  } {
    const budgeted = account.budget.annual;
    const actual = account.balance.closing;
    const variance = actual - budgeted;
    const variancePercent = budgeted > 0 ? (variance / budgeted) * 100 : 0;
    
    let status: 'over' | 'under' | 'on-target' = 'on-target';
    if (Math.abs(variancePercent) > 5) {
      status = variancePercent > 0 ? 'over' : 'under';
    }
    
    return { budgeted, actual, variance, variancePercent, status };
  }
}

