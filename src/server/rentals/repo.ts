// src/server/rentals/repo.ts
export type RentalState =
  | "reserved" | "paid" | "docs_submitted" | "docs_verified"
  | "contract_generated" | "tenant_signed" | "owner_signed"
  | "accountant_checked" | "admin_approved" | "handover_ready" | "handover_completed";

export type RentalEvent =
  | "reserve" | "pay" | "submit_docs" | "verify_docs" | "generate_contract"
  | "sign_tenant" | "sign_owner" | "accountant_ok" | "admin_ok" | "handover_ready" | "handover_done";

export type DocKind = "id" | "passport" | "cr" | "iban";

export interface RentalDoc {
  id: string; kind: DocKind; name: string; path: string;
  ocr?: Record<string, any> | null;
  aiAnalysis?: { validity: boolean; expirationDate?: string; extractedData: Record<string,string>; confidence: number; };
  uploadedAt: number;
}

export interface HandoverReading { kind: "electricity" | "water"; reading: string; imagePath: string; notedAt: number; }

export interface Rental {
  id: string; propertyId: string; tenantId: string; amount: number; currency: string;
  state: RentalState; docs: RentalDoc[];
  handover?: { photos: string[]; bills: string[]; meters: HandoverReading[]; notes?: string; completedAt?: number; };
  history: Array<{ at: number; by: string; event: RentalEvent; to: RentalState; note?: string }>;
  createdAt: number; updatedAt: number;
}

export interface RentalRepository {
  load(id: string): Promise<Rental | null>;
  save(r: Rental): Promise<Rental>;
  listByProperty(propertyId: string, userId?: string): Promise<Rental[]>;
  listMine(userId: string): Promise<Rental[]>;
  listAll(): Promise<Rental[]>;
}
