// src/pages/api/contracts/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readDb } from "@/server/db/jsonDb";


export default function handler(req: NextApiRequest, res: NextApiResponse) {
const db = readDb();
if (req.method === "GET") {
const { tenantId, landlordId } = req.query as { tenantId?: string; landlordId?: string };
const items = db.contracts.filter((c) => {
if (tenantId) return c.tenantId === tenantId;
if (landlordId) return c.landlordId === landlordId;
return true;
});
return res.json(items);
}
return res.status(405).end();
}
