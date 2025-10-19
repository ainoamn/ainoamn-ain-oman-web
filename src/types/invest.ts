export interface InvestmentOpportunity {
  id: string;
  title: string;
  type: string;
  city?: string;
  minTicket?: number;
  targetIRR?: number;
  durationMonths?: number;
  riskBand?: 'Low' | 'Medium' | 'High' | string;
  shortSummary?: string;
  description?: string;
}
