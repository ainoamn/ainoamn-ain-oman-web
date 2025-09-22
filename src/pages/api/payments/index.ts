/**
 * API: GET /api/payments
 * Location: src/pages/api/payments/index.ts
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { readArray, pushArray } from "@/server/jsonStore";
import type { Payment } from "@/types/billing";
import { getById as getPropertyById, upsert as upsertProperty } from "@/server/properties/store";

// ملف التخزين
const FILE = "payments.json";

// ملاحظة: أضفت POST اختياريًا لربط الدفع بالحجز وتحديث حالة العقار.
// إن كان عندك نسخة قديمة تقبل GET فقط، يمكنك الإبقاء عليها وحذف بلوك POST أدناه.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const items = readArray<Payment>(FILE);
      items.sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1));
      return res.status(200).json(items);
    }

    if (req.method === "POST") {
      const p = req.body as Partial<Payment> | undefined;
      if (!p?.bookingId || !p?.amount || !p?.paidAt) {
        return res.status(400).json({ error: "bookingId, amount, paidAt required" });
      }
      const item: Payment = {
        id: p.id || `PY-${Date.now()}`,
        bookingId: String(p.bookingId),
        amount: Number(p.amount),
        method: p.method || "online",
        paidAt: String(p.paidAt),
        meta: p.meta || {},
      } as Payment;

      pushArray<Payment>(FILE, item);

      // تحديث حالة العقار (اختياري) إن أردت
      if (p.propertyId) {
        const prop = getPropertyById(String(p.propertyId));
        if (prop) upsertProperty({ ...prop, status: "reserved", updatedAt: new Date().toISOString() });
      }

      return res.status(201).json({ item });
    }

    res.setHeader("Allow", "GET,POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
