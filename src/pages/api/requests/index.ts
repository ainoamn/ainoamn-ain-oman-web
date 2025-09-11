// src/pages/api/requests/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createRequest, listRequests } from "@/server/requests/store";
import { getById } from "@/server/properties/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = String(req.headers["x-user-id"] || "");
  if (req.method === "GET") {
    const items = await listRequests();
    return res.status(200).json({ items });
  }

  if (req.method === "POST") {
    if (!userId) return res.status(401).json({ error: "Auth required" });
    const { propertyId, type, name, phone, date, time, months, note } = req.body || {};
    if (!propertyId || !type || !name || !phone) return res.status(400).json({ error: "Missing fields" });

    const prop = await getById(String(propertyId));
    const ownerId = prop?.ownerId || `owner-${propertyId}`;

    const it = await createRequest({
      propertyId: String(propertyId),
      ownerId,
      userId,
      type: String(type) as any,
      name: String(name),
      phone: String(phone),
      date: date ? String(date) : null,
      time: time ? String(time) : null,
      months: months ? Number(months) : null,
      note: note ? String(note) : null,
    });
    return res.status(200).json({ item: it });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
