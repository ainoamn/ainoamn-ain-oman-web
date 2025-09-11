/**
 * API: GET/POST /api/invoices
 * Location: src/pages/api/invoices/index.ts
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { readArray, writeArray } from "@/server/jsonStore";
import type { Invoice } from "@/types/billing";
import { nextSerial } from "@/lib/seq";

const FILE = "invoices.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const items = readArray<Invoice>(FILE);
      items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      return res.status(200).json(items);
    }

    if (req.method === "POST") {
      const b = req.body || {};
      if (!b?.reservationId || typeof b?.amount !== "number" || !b?.currency || !b?.customerName || !b?.propertyId) {
        return res.status(400).json({ error: "Missing reservationId/amount/currency/customerName/propertyId" });
      }
      const id = await nextSerial("INVOICE");
      const inv: Invoice = {
        id,
        reservationId: String(b.reservationId),
        propertyId: String(b.propertyId),
        customerName: String(b.customerName),
        amount: Number(b.amount),
        currency: b.currency,
        status: "unpaid",
        dueDate: b.dueDate ? String(b.dueDate) : undefined,
        createdAt: new Date().toISOString(),
        paidAt: undefined,
      };
      const arr = readArray<Invoice>(FILE);
      arr.push(inv);
      writeArray<Invoice>(FILE, arr);
      return res.status(201).json(inv);
    }

    res.setHeader("Allow", "GET,POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
