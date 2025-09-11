// src/pages/api/requests/viewings/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createViewing, listViewingsByUser, listViewingsForOwner } from "@/server/requests/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { userId, ownerId } = req.query as { userId?: string; ownerId?: string };
    if (!userId && !ownerId) return res.status(400).json({ error: "Missing userId or ownerId" });
    if (userId) {
      const items = await listViewingsByUser(String(userId));
      return res.status(200).json({ items });
    }
    const items = await listViewingsForOwner(String(ownerId));
    return res.status(200).json({ items });
  }

  if (req.method === "POST") {
    const { propertyId, ownerId, userId, name, phone, date, time, note } = req.body || {};
    if (!propertyId || !ownerId || !userId || !name || !phone || !date || !time) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const item = await createViewing({ propertyId, ownerId, userId, name, phone, date, time, note });
    return res.status(200).json({ item });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
