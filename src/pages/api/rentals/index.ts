// src/pages/api/rentals/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { repo } from "@/server/rentals/workflow";
import type { Rental } from "@/server/rentals/repo";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = (req.headers["x-user-id"] as string) || "demo-user";
  if (req.method === "GET") {
    if ("mine" in req.query) return res.json({ items: await repo.listMine(userId) });
    if (req.query.propertyId) return res.json({ items: await repo.listByProperty(String(req.query.propertyId)) });
    return res.json({ items: await repo.listAll() });
  }
  if (req.method === "POST") {
    const b = req.body as Partial<Rental>;
    if (!b?.id || !b?.propertyId || !b?.tenantId) return res.status(400).json({ error: "missing_fields" });
    const r: Rental = {
      id: b.id!, propertyId: b.propertyId!, tenantId: b.tenantId!, amount: b.amount ?? 0, currency: b.currency ?? "OMR",
      state: "reserved", docs: [], history: [{ at: Date.now(), by: userId, event: "reserve", to: "reserved" }], createdAt: Date.now(), updatedAt: Date.now()
    };
    return res.json({ ok: true, rental: await repo.save(r) });
  }
  res.status(405).end();
}
