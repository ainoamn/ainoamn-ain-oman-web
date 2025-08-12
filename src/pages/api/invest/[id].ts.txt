import type { NextApiRequest, NextApiResponse } from "next";
import type { InvestmentOpportunity } from "@/types/invest";

const DATA: Record<string, InvestmentOpportunity> = {
  op_001: { id: "op_001", title: "Al Khuwair Offices - Equity", type: "Equity", city: "Muscat", minTicket: 2000, targetIRR: 14, durationMonths: 36, riskBand: "Medium", shortSummary: "تطوير مكاتب في الخوير مع عقود إيجار مسبقة." },
  op_002: { id: "op_002", title: "Seeb Retail - Debt", type: "Debt", city: "Seeb", minTicket: 1000, targetIRR: 11, durationMonths: 18, riskBand: "Low", shortSummary: "تمويل ديون لمحلات تجزئة مع ضمان إيجاري." },
  op_003: { id: "op_003", title: "REIT Oman Yield Fund", type: "REIT", city: "Muscat", minTicket: 500, targetIRR: 9, durationMonths: 0, riskBand: "Low", shortSummary: "صندوق ريت مُولّد للدخل مع توزيعات ربع سنوية." },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  const op = DATA[id];
  if (!op) return res.status(404).json({ error: "Not found" });
  return res.status(200).json(op);
}
