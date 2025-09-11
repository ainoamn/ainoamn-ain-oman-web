// src/pages/api/requests/bookings/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createBooking, listBookingsByUser, listBookingsForOwner } from "@/server/requests/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { userId, ownerId } = req.query as { userId?: string; ownerId?: string };
    if (!userId && !ownerId) return res.status(400).json({ error: "Missing userId or ownerId" });
    if (userId) {
      const items = await listBookingsByUser(String(userId));
      return res.status(200).json({ items });
    }
    const items = await listBookingsForOwner(String(ownerId));
    return res.status(200).json({ items });
  }

  if (req.method === "POST") {
    const { propertyId, ownerId, userId, name, phone, start, months, note, depositMonths, depositOMR } = req.body || {};
    if (!propertyId || !ownerId || !userId || !name || !phone || !start || !months || !depositMonths || typeof depositOMR!=="number") {
      return res.status(400).json({ error: "Missing fields" });
    }
    const item = await createBooking({ propertyId, ownerId, userId, name, phone, start, months: Number(months), note, depositMonths: Number(depositMonths), depositOMR: Number(depositOMR) });
    return res.status(200).json({ item });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
