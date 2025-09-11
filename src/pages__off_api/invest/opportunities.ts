import type { NextApiRequest, NextApiResponse } from "next";
import type { InvestmentOpportunity } from "@/types/invest";

const DATA: InvestmentOpportunity[] = [
  { id: "op_001", title: "Al Khuwair Offices - Equity", type: "Equity", city: "Muscat", minTicket: 2000, targetIRR: 14, durationMonths: 36, riskBand: "Medium", shortSummary: "تطوير مكاتب في الخوير مع عقود إيجار مسبقة." },
  { id: "op_002", title: "Seeb Retail - Debt", type: "Debt", city: "Seeb", minTicket: 1000, targetIRR: 11, durationMonths: 18, riskBand: "Low", shortSummary: "تمويل ديون لمحلات تجزئة مع ضمان إيجاري." },
  { id: "op_003", title: "REIT Oman Yield Fund", type: "REIT", city: "Muscat", minTicket: 500, targetIRR: 9, durationMonths: 0, riskBand: "Low", shortSummary: "صندوق ريت مُولّد للدخل مع توزيعات ربع سنوية." },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  return res.status(200).json(DATA);
}
