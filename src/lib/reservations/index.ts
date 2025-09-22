/**
 * API: GET/POST /api/reservations
 * Location: src/pages/api/reservations/index.ts
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { readArray, writeArray, upsert } from "@/server/jsonStore";
import type { Reservation } from "@/types/billing";
import { nextSerial } from "@/lib/seq";

const FILE = "reservations.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const items = readArray<Reservation>(FILE);
      items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      return res.status(200).json(items);
    }

    if (req.method === "POST") {
      const b = req.body || {};
      if (!b?.propertyId || !b?.customerName || typeof b?.amount !== "number" || !b?.currency) {
        return res.status(400).json({ error: "Missing propertyId/customerName/amount/currency" });
      }
      const now = new Date().toISOString();
      const id = await nextSerial("RESERVATION");
      const item: Reservation = {
        id,
        propertyId: String(b.propertyId),
        customerName: String(b.customerName),
        phone: b.phone ? String(b.phone) : undefined,
        email: b.email ? String(b.email) : undefined,
        startDate: b.startDate ? String(b.startDate) : undefined,
        days: b.days ? Number(b.days) : undefined,
        amount: Number(b.amount),
        currency: b.currency,
        notes: b.notes ? String(b.notes) : undefined,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      };
      upsert<Reservation>(FILE, item);

      // (اختياري) فتح مهمة متابعة — تجاهل الخطأ إن وجد
      // try { await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/tasks`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ title:`حجز جديد ${item.id}`, description:`عقار: ${item.propertyId} | عميل: ${item.customerName}`, priority:"متوسطة", category:"الحجوزات" }) }); } catch (_e) {}

      return res.status(201).json(item);
    }

    res.setHeader("Allow", "GET,POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
