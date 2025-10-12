// src/types/contacts.ts - أنواع بيانات العملاء والموردين وجهات الاتصال

export type ContactType = 'customer' | 'vendor' | 'employee' | 'other';

export interface Contact {
  id: string;
  type: ContactType;
  
  // معلومات أساسية
  name: string;
  displayName?: string;
  companyName?: string;
  taxId?: string;                      // الرقم الضريبي
  commercialRegistration?: string;     // السجل التجاري
  
  // معلومات الاتصال
  email: string;
  phone: string;
  mobile?: string;
  fax?: string;
  website?: string;
  
  // العنوان
  address: {
    street?: string;
    city?: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  
  // المعلومات المالية
  currency: 'OMR' | 'USD' | 'EUR' | 'SAR' | 'AED';
  paymentTerms: number;                // شروط الدفع (أيام)
  creditLimit: number;                 // حد الائتمان
  currentBalance: number;              // الرصيد الحالي
  
  // التصنيف
  category?: string;
  tags?: string[];
  
  // الحالة
  isActive: boolean;
  isVerified: boolean;
  
  // ملاحظات
  notes?: string;
  
  // التواريخ
  createdAt: string;
  updatedAt: string;
}

export interface Beneficiary {
  id: string;
  contactId?: string;                  // ربط بجهة اتصال
  
  // معلومات المستفيد
  name: string;
  accountHolderName: string;
  
  // معلومات البنك
  bankName: string;
  bankCountry: string;
  bankSwiftCode?: string;              // SWIFT/BIC Code
  branchName?: string;
  branchCode?: string;
  
  // معلومات الحساب
  accountNumber: string;
  iban: string;
  ibanVerified: boolean;               // تم التحقق من IBAN
  ibanValidationDate?: string;
  
  // معلومات إضافية مستخرجة من IBAN
  extractedData?: {
    bankCode: string;
    branchCode: string;
    accountType: string;
    checkDigits: string;
  };
  
  // نوع الحساب
  accountType: 'checking' | 'savings' | 'business';
  currency: 'OMR' | 'USD' | 'EUR' | 'SAR' | 'AED';
  
  // التفعيل
  isActive: boolean;
  isPreferred: boolean;                // مستفيد مفضل
  
  // الأمان
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  
  // الإحصائيات
  totalTransactions: number;
  totalAmount: number;
  lastUsedDate?: string;
  
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  iban?: string;
  
  // البنك
  bankName: string;
  bankCode?: string;
  branchName?: string;
  swiftCode?: string;
  
  // النوع والعملة
  accountType: 'current' | 'savings' | 'business' | 'loan';
  currency: 'OMR' | 'USD' | 'EUR' | 'SAR' | 'AED';
  
  // الأرصدة
  openingBalance: number;
  currentBalance: number;
  availableBalance: number;
  overdraftLimit: number;
  
  // الربط المحاسبي
  accountingAccountId: string;         // ربط بحساب محاسبي
  
  // الحالة
  isActive: boolean;
  isPrimary: boolean;                  // حساب رئيسي
  
  // التواريخ
  openedDate: string;
  lastReconciliationDate?: string;
  
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

// وظائف التحقق من IBAN
export function validateIBAN(iban: string): boolean {
  // إزالة المسافات
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  
  // التحقق من الطول (22 حرف للعمان)
  if (cleanIBAN.length < 15 || cleanIBAN.length > 34) return false;
  
  // التحقق من بداية IBAN برمز الدولة
  if (!/^[A-Z]{2}[0-9]{2}/.test(cleanIBAN)) return false;
  
  return true;
}

export function extractIBANData(iban: string): {
  country: string;
  checkDigits: string;
  bankCode: string;
  branchCode?: string;
  accountNumber: string;
  isValid: boolean;
} {
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  
  if (!validateIBAN(cleanIBAN)) {
    return {
      country: '',
      checkDigits: '',
      bankCode: '',
      accountNumber: '',
      isValid: false
    };
  }
  
  // IBAN عُماني: OM + 2 digits + 3 digits bank + 15 digits account
  // مثال: OM23 001 123456789012345
  const country = cleanIBAN.substring(0, 2);
  const checkDigits = cleanIBAN.substring(2, 4);
  const bankCode = cleanIBAN.substring(4, 7);
  const accountNumber = cleanIBAN.substring(7);
  
  return {
    country,
    checkDigits,
    bankCode,
    accountNumber,
    isValid: true
  };
}

export function getBankNameFromCode(code: string): string {
  const banks: Record<string, string> = {
    '001': 'بنك مسقط',
    '002': 'البنك الوطني العُماني',
    '003': 'بنك صحار الدولي',
    '004': 'بنك ظفار',
    '005': 'البنك الأهلي العُماني',
    '006': 'بنك نزوى',
    '007': 'بنك بروة',
    '008': 'البنك العربي',
    '009': 'بنك مسقط الإسلامي'
  };
  
  return banks[code] || 'بنك غير معروف';
}

