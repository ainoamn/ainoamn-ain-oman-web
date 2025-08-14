// src/pages/api/property/[id]/negotiate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson } from "@/server/fsdb";

type Negotiation = {
  id: string;
  propertyId: string;
  name: string;
  phone: string;
  offer?: number;
  note?: string;
  createdAt: string;
};

const FILE = "negotiations";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  try {
    const propertyId = String(req.query.id || "");
    const { name, phone, offer, note } = req.body || {};
    if (!name || !phone) {
      return res.status(400).json({ ok: false, error: "الاسم/الهاتف مطلوب" });
    }
    const rec: Negotiation = {
      id: `${Date.now()}`,
      propertyId,
      name: String(name),
      phone: String(phone),
      offer: typeof offer === "number" ? offer : undefined,
      note: note ? String(note) : undefined,
      createdAt: new Date().toISOString(),
    };
    const list = await readJson<Negotiation[]>(FILE, []);
    await writeJson(FILE, [rec, ...list]);
    return res.status(200).json({ ok: true, item: rec });
  } catch (e) {
    console.error("negotiate error:", e);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}
