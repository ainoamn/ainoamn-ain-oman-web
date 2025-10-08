export type ID = string;
export type Role = "ADMIN"|"LAW_FIRM_ADMIN"|"LAWYER"|"PARALEGAL"|"CLIENT"|"JUDGE"|"STAFF"|"PROPERTY_MANAGER"|"OWNER";
export type CaseStatus = "OPEN"|"ON_HOLD"|"CLOSED"|"ARCHIVED"|"PENDING"|"IN_PROGRESS"|"RESOLVED";
export type CaseStage = "FILING"|"HEARING"|"APPEAL"|"JUDGMENT"|"EXECUTION"|"ARCHIVED"|"INVESTIGATION"|"NEGOTIATION"|"SETTLEMENT";
export type CaseType = "RENTAL_DISPUTE"|"PAYMENT_DISPUTE"|"CONTRACT_BREACH"|"PROPERTY_DAMAGE"|"EVICTION"|"MAINTENANCE"|"INSURANCE"|"CRIMINAL"|"CIVIL"|"ADMINISTRATIVE"|"OTHER";
export type CasePriority = "LOW"|"MEDIUM"|"HIGH"|"URGENT"|"CRITICAL";
export type CaseCategory = "LEGAL"|"CRIMINAL"|"POLICE"|"PROSECUTION";
export type TransferType = "LAWYER_TO_LAWYER"|"TO_COURT"|"TO_POLICE"|"TO_PROCECUTION"|"TO_MEDIATION";
export type TransferStatus = "PENDING"|"ACCEPTED"|"REJECTED"|"COMPLETED";

export interface CaseNumber { 
  courtId: ID; 
  level: "FIRST"|"APPEAL"|"SUPREME"|"EXECUTION"; 
  number: string; 
  courtName?: string;
  registrationDate?: string;
}

export interface PropertyReference {
  propertyId: ID;
  propertyTitle?: string;
  buildingNumber?: string;
  address?: string;
  ownerId?: ID;
  tenantId?: ID;
  landNumber?: string;
  governorate?: string;
  region?: string;
  town?: string;
}

export interface LegalCase {
  id: ID; 
  tenantId: ID; 
  title: string; 
  clientId: ID; 
  primaryLawyerId: ID;
  numbers: CaseNumber[]; 
  status: CaseStatus; 
  stage: CaseStage;
  type: CaseType;
  priority: CasePriority;
  summary?: string; 
  description?: string;
  tags?: string[]; 
  propertyReference?: PropertyReference;
  estimatedValue?: number;
  actualCost?: number;
  expectedOutcome?: string;
  riskAssessment?: "LOW"|"MEDIUM"|"HIGH";
  aiInsights?: AIInsights;
  createdAt: string; 
  updatedAt: string;
  dueDate?: string;
  closedAt?: string;
  closedReason?: string;
  // Additional fields for new system
  plaintiff?: string;
  defendant?: string;
  courtNumber?: string;
  registrationDate?: string;
  hearingDate?: string;
  caseSummary?: string;
  legalBasis?: string;
  requestedRelief?: string;
  evidence?: string;
  witnesses?: string;
  expenses?: number;
  fees?: number;
  notes?: string;
  documents?: any[];
}

export interface AIInsights {
  caseComplexity: "SIMPLE"|"MODERATE"|"COMPLEX"|"VERY_COMPLEX";
  successProbability: number; // 0-100
  estimatedDuration: number; // days
  recommendedActions: string[];
  similarCases: string[];
  riskFactors: string[];
  opportunities: string[];
  legalPrecedents: string[];
  costEstimate: {
    min: number;
    max: number;
    average: number;
  };
  timeline: {
    phase: string;
    estimatedDays: number;
    dependencies: string[];
  }[];
}

export type AssignmentRole = "RESPONSIBLE"|"SUPERVISOR"|"VIEWER"|"COUNSEL"|"LEAD_COUNSEL";
export interface CaseAssignment { 
  id: ID; 
  tenantId: ID; 
  caseId: ID; 
  toLawyerId: ID; 
  role?: AssignmentRole; 
  reason?: string; 
  at: string;
  assignedBy?: ID;
  status?: "ACTIVE"|"INACTIVE"|"COMPLETED";
  dueDate?: string;
}

export interface CaseStageHistory { 
  id: ID; 
  tenantId: ID; 
  caseId: ID; 
  from?: CaseStage; 
  to: CaseStage; 
  at: string; 
  note?: string; 
  by?: ID; 
  voided?: boolean; 
  voidReason?: string;
  duration?: number; // days spent in previous stage
  nextAction?: string;
  documents?: string[]; // document IDs
}

export type DocumentConfidentiality = "PUBLIC"|"INTERNAL"|"CONFIDENTIAL"|"SECRET"|"CLASSIFIED";
export type DocumentType = "CONTRACT"|"EVIDENCE"|"CORRESPONDENCE"|"COURT_FILING"|"LEGAL_OPINION"|"EXPERT_REPORT"|"OTHER";
export interface CaseDocument { 
  id: ID; 
  tenantId: ID; 
  caseId: ID; 
  name: string; 
  mime: string; 
  size: number; 
  dataUrl?: string; 
  url?: string; 
  version: number; 
  uploadedBy: ID; 
  confidentiality: DocumentConfidentiality;
  documentType: DocumentType;
  description?: string;
  tags?: string[];
  relatedDocuments?: ID[];
  aiExtractedText?: string;
  aiSummary?: string;
  createdAt: string; 
  voided?: boolean; 
  voidReason?: string;
  lastModified?: string;
  checksum?: string;
  // Additional fields for new system
  type?: string;
  uploadedAt?: string;
}

export interface CaseMessage { 
  id: ID; 
  tenantId: ID; 
  caseId: ID; 
  by: ID; 
  text: string; 
  at: string; 
  voided?: boolean; 
  voidReason?: string;
  messageType?: "INTERNAL"|"CLIENT_COMMUNICATION"|"COURT_COMMUNICATION"|"EXPERT_COMMUNICATION";
  attachments?: string[]; // document IDs
  recipients?: ID[];
  priority?: CasePriority;
  isRead?: boolean;
  replyTo?: ID;
  // Additional fields for new system
  content?: string;
  type?: "update"|"comment"|"status_change"|"document_added"|"expense_added";
  createdBy?: ID;
  createdAt?: string;
}

export type DirectoryKind = "LAWYER"|"CLIENT"|"OWNER"|"JUDGE"|"EXPERT"|"WITNESS"|"COURT_STAFF";
export interface DirectoryPerson { 
  id: ID; 
  tenantId: ID; 
  kind: DirectoryKind; 
  subscriptionNo: string; 
  name: string; 
  phoneNumbers?: string[]; 
  emails?: string[]; 
  address?: string;
  specialization?: string[];
  experience?: number; // years
  rating?: number; // 1-5
  availability?: "AVAILABLE"|"BUSY"|"UNAVAILABLE";
  hourlyRate?: number;
  createdAt: string; 
  updatedAt: string;
  notes?: string;
  cases?: ID[]; // case IDs
  // Additional fields for new system
  phone?: string;
  email?: string;
}

export interface Expense { 
  id: ID; 
  tenantId: ID; 
  caseId: ID; 
  by: ID; 
  label: string; 
  amount: number; 
  at: string; 
  voided?: boolean; 
  voidReason?: string;
  category?: "LEGAL_FEES"|"COURT_FEES"|"EXPERT_FEES"|"TRAVEL"|"RESEARCH"|"DOCUMENTATION"|"OTHER";
  description?: string;
  receiptUrl?: string;
  approvedBy?: ID;
  approvedAt?: string;
  reimbursable?: boolean;
  // Additional fields for new system
  type?: 'legal_fee'|'court_fee'|'document_fee'|'travel'|'other';
  date?: string;
  status?: 'pending'|'paid'|'rejected';
  receipt?: string;
  createdBy?: ID;
}

export interface AuditLog { 
  id: ID; 
  tenantId: ID; 
  actorId: ID; 
  action: string; 
  entity: "case"|"document"|"message"|"assignment"|"stage"|"directory"|"expense"|"property"; 
  entityId: ID; 
  meta?: Record<string, unknown>; 
  at: string;
  ipAddress?: string;
  userAgent?: string;
  severity?: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL";
}

// New interfaces for advanced features
export interface LegalAnalytics {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  averageResolutionTime: number;
  successRate: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  casesByType: Record<CaseType, number>;
  casesByStatus: Record<CaseStatus, number>;
  casesByStage: Record<CaseStage, number>;
  topPerformingLawyers: Array<{
    lawyerId: ID;
    name: string;
    casesWon: number;
    successRate: number;
    revenue: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    casesOpened: number;
    casesClosed: number;
    revenue: number;
    expenses: number;
  }>;
  // Additional fields for new system
  openCases?: number;
  inProgressCases?: number;
  resolvedCases?: number;
}

export interface CasePrediction {
  caseId: ID;
  predictedOutcome: "WIN"|"LOSE"|"SETTLEMENT"|"DISMISSAL";
  confidence: number; // 0-100
  estimatedDuration: number; // days
  estimatedCost: number;
  riskFactors: string[];
  recommendedStrategy: string[];
  similarCases: Array<{
    caseId: ID;
    title: string;
    outcome: string;
    duration: number;
    cost: number;
  }>;
}

export interface LegalWorkflow {
  id: ID;
  name: string;
  description: string;
  caseType: CaseType;
  stages: Array<{
    stage: CaseStage;
    name: string;
    description: string;
    estimatedDays: number;
    requiredDocuments: string[];
    actions: string[];
    assignees: string[];
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CaseTransfer {
  id: ID;
  caseId: ID;
  tenantId: ID;
  transferNumber: string;
  transferType: TransferType;
  fromLawyerId?: ID;
  toLawyerId?: ID;
  toCourtId?: ID;
  toPoliceStationId?: ID;
  toProsecutionId?: ID;
  reason: string;
  status: TransferStatus;
  documents: ID[];
  notes?: string;
  transferredBy: ID;
  transferredAt: string;
  acceptedAt?: string;
  acceptedBy?: ID;
  rejectedAt?: string;
  rejectedBy?: ID;
  rejectionReason?: string;
}

export interface LegalAppointment {
  id: ID;
  caseId: ID;
  tenantId: ID;
  title: string;
  description?: string;
  appointmentType: "HEARING"|"MEETING"|"CONSULTATION"|"FILING"|"EVIDENCE_COLLECTION"|"OTHER";
  scheduledAt: string;
  duration: number; // minutes
  location?: string;
  participants: Array<{
    id: ID;
    name: string;
    role: "LAWYER"|"CLIENT"|"JUDGE"|"WITNESS"|"EXPERT"|"OTHER";
    status: "CONFIRMED"|"PENDING"|"DECLINED";
  }>;
  reminders: Array<{
    id: ID;
    type: "EMAIL"|"SMS"|"PUSH";
    scheduledAt: string;
    sent: boolean;
  }>;
  status: "SCHEDULED"|"CONFIRMED"|"CANCELLED"|"COMPLETED"|"RESCHEDULED";
  createdBy: ID;
  createdAt: string;
  updatedAt: string;
}

export interface LegalTask {
  id: ID;
  caseId: ID;
  tenantId: ID;
  title: string;
  description?: string;
  taskType: "DOCUMENT_PREPARATION"|"RESEARCH"|"FILING"|"FOLLOW_UP"|"MEETING_PREP"|"EVIDENCE_COLLECTION"|"OTHER";
  priority: CasePriority;
  status: "PENDING"|"IN_PROGRESS"|"COMPLETED"|"CANCELLED";
  assignedTo: ID;
  assignedBy: ID;
  dueDate?: string;
  completedAt?: string;
  completedBy?: ID;
  notes?: string;
  relatedDocuments: ID[];
  createdAt: string;
  updatedAt: string;
}
