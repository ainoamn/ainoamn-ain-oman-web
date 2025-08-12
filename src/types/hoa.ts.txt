export type ID = string;

export interface HOA {
  id: ID;
  propertyId?: ID;
  name: string;
  bylawsUrl?: string;
  createdBy: ID;
  status: "active" | "inactive";
  createdAt: string;
}

export interface HOAMembership {
  id: ID;
  hoaId: ID;
  userId: ID;
  unitId?: ID;
  role: "owner" | "board" | "manager" | "auditor";
  joinedAt: string;
}

export interface HOABoard {
  id: ID;
  hoaId: ID;
  termStart: string;
  termEnd?: string;
}

export interface HOABoardMember {
  id: ID;
  boardId: ID;
  userId: ID;
  position: "chair" | "vice" | "treasurer" | "secretary" | "member";
}

export interface HOAMeeting {
  id: ID;
  hoaId: ID;
  date: string; // ISO
  agenda: string;
  minutesUrl?: string;
  quorum?: number;
  status: "scheduled" | "completed" | "cancelled";
}

export type VoteType = "yesno" | "multi" | "weighted";
export interface HOAVote {
  id: ID;
  hoaId: ID;
  meetingId: ID;
  title: string;
  type: VoteType;
  options: string[];
  quorumRule?: number; // 0-1 ratio
  opensAt: string;
  closesAt: string;
}

export interface HOAVoteBallot {
  id: ID;
  voteId: ID;
  memberId: ID;
  choice: string;
  weight?: number;
  castAt: string;
}

export interface HOAFee {
  id: ID;
  hoaId: ID;
  title: string;
  amount: number;
  cycle: "monthly" | "quarterly" | "annual" | "oneoff";
  dueDate: string;
}

export interface HOAInvoice {
  id: ID;
  feeId: ID;
  memberId: ID;
  amount: number;
  status: "unpaid" | "paid" | "overdue";
  issuedAt: string;
  paidAt?: string;
  paymentRef?: string;
}

export interface HOATicket {
  id: ID;
  hoaId: ID;
  memberId: ID;
  category: "complaint" | "violation" | "maintenance";
  severity: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";
  title: string;
  description?: string;
  createdAt: string;
}

export interface HOADocument {
  id: ID;
  hoaId: ID;
  type: "bylaw" | "minutes" | "budget" | "ledger" | "misc";
  fileUrl: string;
  version?: string;
  createdAt: string;
}
