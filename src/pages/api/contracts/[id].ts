// src/pages/api/contracts/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readDb, writeDb } from "@/server/db/jsonDb";


export default function handler(req: NextApiRequest, res: NextApiResponse) {
const { id } = req.query as { id: string };
const db = readDb();
const idx = db.contracts.findIndex((x) => x.id === id);
if (idx === -1) return res.status(404).json({ error: "not found" });


if (req.method === "GET") return res.json(db.contracts[idx]);


if (req.method === "PUT") {
const { action, reason } = req.body || {};
const c = db.contracts[idx];


if (action === "tenant_accept") {
c.status = "awaiting_landlord_approve";
c.tenantAcceptedAt = Date.now();
} else if (action === "landlord_approve") {
c.status = "active";
c.landlordApprovedAt = Date.now();
// تحويل حالة العقار إلى leased
const prop = db.properties.find((p) => p.id === c.propertyId);
if (prop) prop.status = "leased";
} else if (action === "landlord_reject") {
c.status = "rejected";
c.rejectionReason = reason || "";
// إعادة العقار إلى vacant
const prop = db.properties.find((p) => p.id === c.propertyId);
if (prop) prop.status = "vacant";
}
c.updatedAt = Date.now();
writeDb(db);
return res.json(c);
}


return res.status(405).end();
}