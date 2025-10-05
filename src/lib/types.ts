// src/lib/types.ts
export type Visibility = "private" | "public" | "tenant";

export type BuildingExtra = {
  label: string;
  value: string;
  image?: string;      // اسم ملف مرفوع أو رابط
  visibility: Visibility;
};

export type BuildingServices = {
  powerMeter?: string;
  waterMeter?: string;
  phoneMeter?: string;
  others?: BuildingExtra[];
};

export type UnitInfo = {
  id: string;
  unitNo: string;
  powerMeter?: string;
  waterMeter?: string;
  hasInternet?: boolean;
  hasParking?: boolean;
  parkingCount?: number;
  area?: number;
  rooms?: number;
  baths?: number;
  hall?: number;
  type?: "house"|"villa"|"apartment"|"shop"|"other";
  rentAmount?: number;      // الإيجار الشهري القياسي
  currency?: string;
  status?: "vacant"|"reserved"|"leased";
  amenities?: string[];     // خدمات/مميزات أخرى
  image?: string;           // اسم ملف الصورة للوحدة
  allowedPeriods?: ("daily"|"weekly"|"monthly"|"quarterly"|"semiannual"|"annual")[];
};

export type Building = {
  id: string;
  buildingNo: string;
  address: string;
  unitsCount: number;
  units: UnitInfo[];
  published?: boolean;
  createdAt: string;
  updatedAt: string;
  // جديد:
  images?: string[];     // أسماء ملفات أو روابط. مطلوب >=4 في واجهة الإدخال
  video?: string;        // اسم ملف أو رابط
  services?: BuildingServices;
  extras?: BuildingExtra[];
};

export type TenantPersonType = "omani"|"expat"|"company";

export type TenantProfile = {
  id: string;
  kind: TenantPersonType;
  name: string;
  phone: string;
  altPhone?: string;
  email?: string;
  address?: string;
  nationalId?: string;
  passportNo?: string;
  crNumber?: string;
  // حفظ أسماء الملفات المرفوعة
  docIdFront?: string;
  docIdBack?: string;
  docPassport?: string;
  docCR?: string;
  docPartnersIds?: string[];
  docSignatoriesIds?: string[];
};

export type PaymentMethod = "cash"|"transfer"|"cheque";

export type ChequeInfo = {
  chequeNo: string;
  chequeDate: string; // ISO
  amount: number;
  status: "paid"|"pending"|"returned"|"refunded";
  image?: string;     // صورة الشيك
};

export type MeterSnapshot = {
  powerReading?: number;
  powerImage?: string;
  powerBillAmount?: number;
  powerBillPaid?: boolean;
  waterReading?: number;
  waterImage?: string;
  waterBillAmount?: number;
  waterBillPaid?: boolean;
};

export type BookingStatus = "pending"|"reserved"|"leased"|"cancelled"|"accounting"|"management";

export type Booking = {
  id: string;
  bookingNumber: string;
  buildingId: string;
  unitId: string;
  startDate: string;
  durationMonths: number;
  endDate?: string;
  status: BookingStatus;
  createdAt: string;
  totalRent: number;
  deposit?: number;
  depositPaid?: boolean;
  depositReceiptNo?: string;
  depositPaymentMethod?: PaymentMethod;
  paymentMethod?: PaymentMethod;
  cheque?: ChequeInfo|null;       // توافقًا للخلف
  cheques?: ChequeInfo[];         // شيكات الإيجار حسب المدة
  guaranteeCheques?: ChequeInfo[];// شيكات ضمان إن وجدت
  municipalityFee3pct?: number;
  meters?: MeterSnapshot|null;
  tenant: TenantProfile;
  contractSnapshot?: {
    templateId: string;
    templateName: string;
    bodyAr: string;
    bodyEn: string;
    fields: Record<string,string>;
    resolvedAt: string;
  }|null;
};
