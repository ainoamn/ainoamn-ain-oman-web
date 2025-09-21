// root: src/pages/api/properties/[id]/appointments.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Status = "pending" | "approved" | "canceled" | "rescheduled";
type Appointment = {
  id: string; propertyId: string; name: string; phone: string;
  date: string; time: string; note?: string;
  status: Status; createdAt: number; updatedAt?: number;
};

type Store = { appts: Appointment[]; };
declare global { var __AIN_OMAN_APPTS__: Store | undefined; }
function store(): Store {
  if (!global.__AIN_OMAN_APPTS__) global.__AIN_OMAN_APPTS__ = { appts: [] };
  return global.__AIN_OMAN_APPTS__;
}
function uid(prefix: string){ return prefix + "-" + new Date().toISOString().replace(/[-:.TZ]/g,"").slice(0,14); }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id || "");
  if (!id) return res.status(400).json({ error: "Missing property id" });

  if (req.method === "GET") {
    const items = store().appts.filter(a => a.propertyId === id);
    return res.status(200).json({ role: "owner", items });
  }

  if (req.method === "POST") {
    const b = req.body || {};
    const item: Appointment = {
      id: uid("A"),
      propertyId: id,
      name: String(b.name || ""),
      phone: String(b.phone || ""),
      date: String(b.date || ""),
      time: String(b.time || ""),
      note: b.note ? String(b.note) : undefined,
      status: "pending",
      createdAt: Date.now(),
    };
    store().appts.push(item);
    return res.status(201).json({ item });
  }

  res.setHeader("Allow","GET,POST");
  return res.status(405).json({ error: "Method Not Allowed" });
}
