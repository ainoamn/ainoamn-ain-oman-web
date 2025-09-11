export type ID = string;
export type Role = "ADMIN"|"LAW_FIRM_ADMIN"|"LAWYER"|"PARALEGAL"|"CLIENT"|"JUDGE"|"STAFF";
export type CaseStatus = "OPEN"|"ON_HOLD"|"CLOSED";
export type CaseStage = "FILING"|"HEARING"|"APPEAL"|"JUDGMENT"|"EXECUTION"|"ARCHIVED";

export interface CaseNumber { courtId: ID; level: "FIRST"|"APPEAL"|"SUPREME"|"EXECUTION"; number: string; }

export interface LegalCase {
  id: ID; tenantId: ID; title: string; clientId: ID; primaryLawyerId: ID;
  numbers: CaseNumber[]; status: CaseStatus; stage: CaseStage;
  summary?: string; tags?: string[]; createdAt: string; updatedAt: string;
}

export type AssignmentRole = "RESPONSIBLE"|"SUPERVISOR"|"VIEWER";
export interface CaseAssignment { id: ID; tenantId: ID; caseId: ID; toLawyerId: ID; role?: AssignmentRole; reason?: string; at: string; }

export interface CaseStageHistory { id: ID; tenantId: ID; caseId: ID; from?: CaseStage; to: CaseStage; at: string; note?: string; by?: ID; voided?: boolean; voidReason?: string; }

export type DocumentConfidentiality = "PUBLIC"|"INTERNAL"|"SECRET";
export interface CaseDocument { id: ID; tenantId: ID; caseId: ID; name: string; mime: string; size: number; dataUrl?: string; url?: string; version: number; uploadedBy: ID; confidentiality: DocumentConfidentiality; createdAt: string; voided?: boolean; voidReason?: string; }

export interface CaseMessage { id: ID; tenantId: ID; caseId: ID; by: ID; text: string; at: string; voided?: boolean; voidReason?: string; }

export type DirectoryKind = "LAWYER"|"CLIENT"|"OWNER";
export interface DirectoryPerson { id: ID; tenantId: ID; kind: DirectoryKind; subscriptionNo: string; name: string; phoneNumbers?: string[]; emails?: string[]; createdAt: string; updatedAt: string; }

export interface Expense { id: ID; tenantId: ID; caseId: ID; by: ID; label: string; amount: number; at: string; voided?: boolean; voidReason?: string; }

export interface AuditLog { id: ID; tenantId: ID; actorId: ID; action: string; entity: "case"|"document"|"message"|"assignment"|"stage"|"directory"|"expense"; entityId: ID; meta?: Record<string, unknown>; at: string; }
