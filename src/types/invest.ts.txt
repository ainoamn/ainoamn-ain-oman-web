export type ID = string;

export type OpportunityType = "Equity" | "Debt" | "REIT";
export type RiskBand = "Low" | "Medium" | "High";

export interface InvestmentOpportunity {
  id: ID;
  title: string;
  propertyId?: ID;
  type: OpportunityType;
  city?: string;
  country?: string;
  minTicket: number;
  targetIRR: number; // percentage e.g., 14 means 14%
  durationMonths: number;
  riskBand: RiskBand;
  thumbnailUrl?: string;
  tags?: string[];
  docs?: string[];
  shortSummary?: string;
}

export interface Subscription {
  id: ID;
  opportunityId: ID;
  userId: ID;
  amount: number;
  status: "reserved" | "paid" | "allocated";
  createdAt: string;
}

export interface InvestorProfile {
  id: ID;
  userId: ID;
  kycStatus: "pending" | "approved" | "rejected";
  riskScore?: number; // 0 - 100
  preferences?: Record<string, unknown>;
}
