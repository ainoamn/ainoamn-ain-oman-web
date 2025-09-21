// src/types/rentals.ts
export type RentalState = 
  | "reserved"              // تم الحجز
  | "paid"                  // تم الدفع
  | "docs_submitted"        // تم رفع المستندات
  | "docs_verified"         // تم التحقق
  | "contract_generated"    // تم توليد العقد
  | "tenant_signed"         // توقيع المستأجر
  | "owner_signed"          // توقيع المالك/المدير
  | "accountant_checked"    // اعتماد المحاسب
  | "admin_approved"        // موافقة المدير الإداري
  | "handover_ready"        // جاهز للتسليم
  | "handover_completed";   // تم التسليم

export type RentalEvent = 
  | "reserve" 
  | "pay" 
  | "submit_docs" 
  | "verify_docs" 
  | "generate_contract" 
  | "sign_tenant" 
  | "sign_owner" 
  | "accountant_ok" 
  | "admin_ok" 
  | "handover_ready" 
  | "handover_done";

export type DocKind = "id" | "passport" | "cr" | "iban";

export interface RentalDoc {
  id: string;
  kind: DocKind;
  name: string;
  path: string;
  ocr?: Record<string, any> | null;
  aiAnalysis?: {
    validity: boolean;
    expirationDate?: string;
    extractedData: Record<string, string>;
    confidence: number;
  };
  uploadedAt: number;
}

export interface HandoverReading {
  kind: "electricity" | "water";
  reading: string;
  imagePath: string;
  notedAt: number;
}

export interface Rental {
  id: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  currency: string;
  state: RentalState;
  docs: RentalDoc[];
  handover?: {
    photos: string[];
    bills: string[];
    meters: HandoverReading[];
    notes?: string;
    completedAt?: number;
  };
  history: Array<{
    at: number;
    by: string;
    event: RentalEvent;
    to: RentalState;
    note?: string;
  }>;
  createdAt: number;
  updatedAt: number;
}