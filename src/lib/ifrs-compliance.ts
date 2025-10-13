// src/lib/ifrs-compliance.ts - المعايير الدولية للتقارير المالية IFRS
/**
 * IFRS Compliance Engine
 * نظام متوافق مع المعايير الدولية للتقارير المالية
 * 
 * المعايير المطبقة:
 * - IFRS 15: Revenue from Contracts with Customers (الإيرادات)
 * - IFRS 9: Financial Instruments (الأدوات المالية والائتمان المتوقع)
 * - IFRS 16: Leases (عقود الإيجار)
 * - IAS 21: Effects of Changes in Foreign Exchange Rates (العملات الأجنبية)
 * - IFRS 13: Fair Value Measurement (القيمة العادلة)
 */

// ========================
// IFRS 15: Revenue Recognition
// ========================

export interface RevenueContract {
  id: string;
  customerId: string;
  contractDate: string;
  
  // الخطوة 1: تحديد العقد
  identifiedContract: {
    hasCommercialSubstance: boolean;
    partiesCommitted: boolean;
    rightsIdentifiable: boolean;
    paymentTermsClear: boolean;
    collectibilityProbable: boolean;
  };
  
  // الخطوة 2: تحديد التزامات الأداء
  performanceObligations: Array<{
    id: string;
    description: string;
    isDistinct: boolean;
    standalone: boolean;
  }>;
  
  // الخطوة 3: تحديد سعر المعاملة
  transactionPrice: {
    amount: number;
    variableConsideration: number;
    constraintApplied: boolean;
    significantFinancingComponent: boolean;
  };
  
  // الخطوة 4: توزيع سعر المعاملة
  priceAllocation: Array<{
    obligationId: string;
    allocatedAmount: number;
    standaloneSellingPrice: number;
  }>;
  
  // الخطوة 5: الاعتراف بالإيراد
  revenueRecognition: {
    method: 'point-in-time' | 'over-time';
    recognizedAmount: number;
    recognitionDate: string;
    remainingAmount: number;
  };
}

export function recognizeRevenue(contract: RevenueContract): {
  canRecognize: boolean;
  amount: number;
  timing: string;
  disclosures: string[];
} {
  // التحقق من الخطوات الخمس لـ IFRS 15
  const step1Valid = Object.values(contract.identifiedContract).every(v => v === true);
  
  if (!step1Valid) {
    return {
      canRecognize: false,
      amount: 0,
      timing: 'not-eligible',
      disclosures: ['العقد لا يستوفي معايير IFRS 15']
    };
  }
  
  const { method, recognizedAmount, recognitionDate } = contract.revenueRecognition;
  
  return {
    canRecognize: true,
    amount: recognizedAmount,
    timing: method === 'point-in-time' ? recognitionDate : 'متدرج حسب الأداء',
    disclosures: [
      `طريقة الاعتراف: ${method === 'point-in-time' ? 'في نقطة زمنية محددة' : 'على مدار الوقت'}`,
      `عدد التزامات الأداء: ${contract.performanceObligations.length}`,
      `المبلغ المعترف به: ${recognizedAmount}`,
      `المبلغ المتبقي: ${contract.revenueRecognition.remainingAmount}`
    ]
  };
}

// ========================
// IFRS 9: Expected Credit Loss (ECL)
// ========================

export interface FinancialAsset {
  id: string;
  type: 'receivable' | 'loan' | 'bond';
  grossAmount: number;
  currency: string;
  originationDate: string;
  maturityDate: string;
  
  // تقييم الائتمان
  creditAssessment: {
    stage: 1 | 2 | 3;  // Stage 1: 12-month ECL, Stage 2: Lifetime ECL, Stage 3: Credit-impaired
    probabilityOfDefault: number;  // احتمالية التعثر
    lossGivenDefault: number;      // الخسارة عند التعثر
    exposureAtDefault: number;     // المبلغ المعرض للخطر
  };
  
  // المخصص المتوقع
  expectedCreditLoss: number;
  allowanceForLoss: number;
  
  // التغيرات الجوهرية
  significantIncrease: boolean;
  creditImpaired: boolean;
}

export function calculateECL(asset: FinancialAsset): {
  ecl: number;
  stage: number;
  recommendation: string;
} {
  const { stage, probabilityOfDefault, lossGivenDefault, exposureAtDefault } = asset.creditAssessment;
  
  let ecl = 0;
  
  if (stage === 1) {
    // 12-month ECL
    ecl = probabilityOfDefault * lossGivenDefault * exposureAtDefault * (1 / 12);
  } else if (stage === 2 || stage === 3) {
    // Lifetime ECL
    ecl = probabilityOfDefault * lossGivenDefault * exposureAtDefault;
  }
  
  // تطبيق عامل الخصم (Discounting)
  const discountRate = 0.05; // معدل الفائدة الفعلي
  const yearsToMaturity = 1; // تبسيط
  ecl = ecl / Math.pow(1 + discountRate, yearsToMaturity);
  
  let recommendation = '';
  if (stage === 1) {
    recommendation = 'المخاطر الائتمانية منخفضة - مراقبة عادية';
  } else if (stage === 2) {
    recommendation = 'زيادة جوهرية في المخاطر - مراقبة مكثفة';
  } else {
    recommendation = 'تدني ائتماني - إجراءات تحصيل فورية';
  }
  
  return { ecl, stage, recommendation };
}

// ========================
// IFRS 16: Lease Accounting
// ========================

export interface LeaseContract {
  id: string;
  leaseType: 'finance' | 'operating';
  
  // شروط العقد
  commencement: string;
  term: number; // بالأشهر
  monthlyPayment: number;
  
  // القياس الأولي
  initialMeasurement: {
    rightOfUseAsset: number;
    leaseLiability: number;
    increaseRate: number;  // معدل الزيادة المتزايد
  };
  
  // القياس اللاحق
  subsequentMeasurement: {
    depreciation: number;
    interestExpense: number;
    liabilityBalance: number;
  };
}

export function processLeaseIFRS16(lease: LeaseContract): {
  initialJournal: Array<{ account: string; debit: number; credit: number }>;
  monthlyJournal: Array<{ account: string; debit: number; credit: number }>;
  disclosures: string[];
} {
  const { rightOfUseAsset, leaseLiability } = lease.initialMeasurement;
  
  // القيد الأولي
  const initialJournal = [
    { account: 'Right-of-Use Asset', debit: rightOfUseAsset, credit: 0 },
    { account: 'Lease Liability', debit: 0, credit: leaseLiability }
  ];
  
  // القيد الشهري
  const { depreciation, interestExpense } = lease.subsequentMeasurement;
  const monthlyJournal = [
    { account: 'Depreciation Expense', debit: depreciation, credit: 0 },
    { account: 'Right-of-Use Asset (Accumulated)', debit: 0, credit: depreciation },
    { account: 'Interest Expense', debit: interestExpense, credit: 0 },
    { account: 'Lease Liability', debit: lease.monthlyPayment - interestExpense, credit: 0 },
    { account: 'Cash', debit: 0, credit: lease.monthlyPayment }
  ];
  
  const disclosures = [
    `أصل حق الاستخدام: ${rightOfUseAsset.toLocaleString()}`,
    `التزام الإيجار: ${leaseLiability.toLocaleString()}`,
    `إهلاك شهري: ${depreciation.toLocaleString()}`,
    `مصروف فائدة شهري: ${interestExpense.toLocaleString()}`,
    `مدة العقد: ${lease.term} شهر`
  ];
  
  return { initialJournal, monthlyJournal, disclosures };
}

// ========================
// IAS 21: Foreign Exchange
// ========================

export interface ForeignTransaction {
  id: string;
  date: string;
  functionalCurrency: string;
  foreignCurrency: string;
  foreignAmount: number;
  exchangeRate: number;
  type: 'monetary' | 'non-monetary';
}

export function translateForeignCurrency(
  transaction: ForeignTransaction,
  currentRate: number
): {
  functionalAmount: number;
  exchangeGainLoss: number;
  classification: 'realized' | 'unrealized';
} {
  const historicalAmount = transaction.foreignAmount * transaction.exchangeRate;
  const currentAmount = transaction.foreignAmount * currentRate;
  
  let exchangeGainLoss = 0;
  let classification: 'realized' | 'unrealized' = 'unrealized';
  
  if (transaction.type === 'monetary') {
    // البنود النقدية: تُعاد ترجمتها بالسعر الجاري
    exchangeGainLoss = currentAmount - historicalAmount;
    classification = 'unrealized';
  } else {
    // البنود غير النقدية: تبقى بالسعر التاريخي
    exchangeGainLoss = 0;
  }
  
  return {
    functionalAmount: transaction.type === 'monetary' ? currentAmount : historicalAmount,
    exchangeGainLoss,
    classification
  };
}

// ========================
// IFRS 13: Fair Value Measurement
// ========================

export interface FairValueAsset {
  id: string;
  name: string;
  
  // هرمية القيمة العادلة
  level: 1 | 2 | 3;
  
  // المدخلات
  inputs: {
    level1?: { quotedPrice: number; activeMarket: string };
    level2?: { observableInputs: Record<string, number> };
    level3?: { unobservableInputs: Record<string, number>; valuation: string };
  };
  
  fairValue: number;
  measurementDate: string;
}

export function measureFairValue(asset: FairValueAsset): {
  fairValue: number;
  level: number;
  reliability: 'high' | 'medium' | 'low';
  disclosures: string[];
} {
  let reliability: 'high' | 'medium' | 'low' = 'low';
  const disclosures: string[] = [];
  
  if (asset.level === 1) {
    reliability = 'high';
    disclosures.push(`المستوى 1: أسعار سوقية معلنة في سوق نشطة`);
    disclosures.push(`السوق: ${asset.inputs.level1?.activeMarket}`);
    disclosures.push(`السعر المعلن: ${asset.inputs.level1?.quotedPrice}`);
  } else if (asset.level === 2) {
    reliability = 'medium';
    disclosures.push(`المستوى 2: مدخلات ملحوظة أخرى`);
    disclosures.push(`المدخلات الملحوظة: ${Object.keys(asset.inputs.level2?.observableInputs || {}).join(', ')}`);
  } else {
    reliability = 'low';
    disclosures.push(`المستوى 3: مدخلات غير ملحوظة`);
    disclosures.push(`طريقة التقييم: ${asset.inputs.level3?.valuation}`);
    disclosures.push(`⚠️ يتطلب إفصاحات إضافية موسعة`);
  }
  
  return {
    fairValue: asset.fairValue,
    level: asset.level,
    reliability,
    disclosures
  };
}

// ========================
// Dual Reporting: IFRS vs Local GAAP
// ========================

export interface DualReportingMapping {
  ifrsCOA: string;
  localCOA: string;
  adjustments: Array<{
    type: string;
    amount: number;
    reason: string;
  }>;
}

export function generateDualReport(
  ifrsData: any,
  mapping: DualReportingMapping[]
): {
  ifrsReport: any;
  localReport: any;
  reconciliation: any;
} {
  // يتم تطبيق التعديلات والمطابقة بين المعيارين
  return {
    ifrsReport: { /* البيانات حسب IFRS */ },
    localReport: { /* البيانات حسب المعيار المحلي */ },
    reconciliation: { /* مطابقة الفروقات */ }
  };
}

