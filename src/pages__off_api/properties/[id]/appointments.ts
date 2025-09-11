import type { NextApiRequest, NextApiResponse } from "next";
import { AppointmentsStore } from "../../../../server/appointments/store";
import { getSessionUser as realGetSessionUser } from "../../../../server/auth/session";

function getSessionUserSafe(req: NextApiRequest) {
  try {
    const u = realGetSessionUser(req);
    if (u && (u as any).id && (u as any).role) return u;
  } catch {}
  return { id: "demo-user", role: "user" as const };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const propertyId = String(req.query.id || "");
    if (!propertyId) return res.status(400).json({ error: "missing_property_id" });

    const me = getSessionUserSafe(req);
    const isManager = me.role === "admin" || me.role === "owner";

    if (req.method === "GET") {
      const scope = String(req.query.scope || "");
      const items = isManager && scope === "all"
        ? AppointmentsStore.listByProperty(propertyId)
        : AppointmentsStore.listByUser(me.id, propertyId);
      return res.status(200).json({ ok: true, role: me.role, items });
    }

    if (req.method === "POST") {
      const { name, phone, date, time, note } = req.body || {};
      if (!name || !phone || !date || !time) {
        return res.status(400).json({ error: "missing_fields" });
      }
      const appt = AppointmentsStore.create({
        propertyId,
        userId: me.id,
        name,
        phone,
        date,
        time,
        note: note || "",
        status: "pending",
      });
      return res.status(201).json({ ok: true, item: appt });
    }

    res.setHeader("Allow", "GET,POST");
    return res.status(405).json({ error: "method_not_allowed" });
  } catch (e: any) {
    console.error("API /properties/[id]/appointments error:", e);
    return res.status(500).json({ error: "internal_error", detail: String(e?.message || e) });
  }
}
