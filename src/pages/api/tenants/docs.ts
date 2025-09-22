// src/pages/api/tenants/docs.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readDb, writeDb } from "@/server/db/jsonDb";
import type { TenantDoc } from "@/types/domain";


export default function handler(req: NextApiRequest, res: NextApiResponse) {
const db = readDb();


if (req.method === "GET") {
const { contractId } = req.query as { contractId?: string };
const items = db.tenantDocs.filter((d) => (contractId ? d.contractId === contractId : true));
return res.json(items);
}


if (req.method === "POST") {
const { contractId, type, number, expiryDate, fileUrl } = req.body || {};
if (!contractId || !type) return res.status(400).json({ error: "contractId, type required" });
const doc: TenantDoc = {
id: `DOC-${Date.now()}`,
contractId,
type,
number,
expiryDate,
fileUrl,
verified: false,
createdAt: Date.now(),
updatedAt: Date.now(),
};
db.tenantDocs.push(doc);
writeDb(db);
return res.status(201).json(doc);
}


if (req.method === "PUT") {
const { id, ...patch } = req.body || {};
const idx = db.tenantDocs.findIndex((d) => d.id === id);
if (idx === -1) return res.status(404).json({ error: "not found" });
db.tenantDocs[idx] = { ...db.tenantDocs[idx], ...patch, updatedAt: Date.now() };
writeDb(db);
return res.json(db.tenantDocs[idx]);
}


return res.status(405).end();
}