/**
 * API: GET /api/payments
 * Location: src/pages/api/payments/index.ts
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { readArray } from "@/server/jsonStore";
import type { Payment } from "@/types/billing";

const FILE = "payments.json";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const items = readArray<Payment>(FILE);
      items.sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1));
      return res.status(200).json(items);
    }
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
