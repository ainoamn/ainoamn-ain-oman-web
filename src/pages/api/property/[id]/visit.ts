// src/pages/api/property/[id]/visit.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson } from "@/server/fsdb";

type Visit = {
  id: string;
  propertyId: string;
  name: string;
  phone: string;
  date: string; // ISO (yyyy-mm-dd)
  time: string; // HH:mm
  createdAt: string;
};

const FILE = "visits";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  try {
    const propertyId = String(req.query.id || "");
    const { name, phone, date, time } = req.body || {};
    if (!name || !phone || !date || !time) {
      return res.status(400).json({ ok: false, error: "الاسم/الهاتف/التاريخ/الوقت مطلوب" });
    }
    const rec: Visit = {
      id: `${Date.now()}`,
      propertyId,
      name: String(name),
      phone: String(phone),
      date: String(date),
      time: String(time),
      createdAt: new Date().toISOString(),
    };
    const list = await readJson<Visit[]>(FILE, []);
    await writeJson(FILE, [rec, ...list]);
    return res.status(200).json({ ok: true, item: rec });
  } catch (e) {
    console.error("visit error:", e);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}
