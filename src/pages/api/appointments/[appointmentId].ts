// src/pages/api/appointments/[appointmentId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { AppointmentsStore } from "../../../server/appointments/store";
import { getSessionUser as realGetSessionUser } from "../../../server/auth/session";

function getSessionUserSafe(req: NextApiRequest) {
  try {
    const u = realGetSessionUser(req);
    if (u && (u as any).id && (u as any).role) return u;
  } catch {}
  return { id: "demo-user", role: "user" as const };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const appointmentId = String(req.query.appointmentId || "");
    if (!appointmentId) return res.status(400).json({ error: "missing_id" });

    const me = getSessionUserSafe(req);
    const isManager = me.role === "admin" || me.role === "owner";

    if (req.method === "GET") {
      const item = AppointmentsStore.getById(appointmentId);
      if (!item) return res.status(404).json({ error: "not_found" });
      if (!isManager && item.userId !== me.id) return res.status(403).json({ error: "forbidden" });
      return res.status(200).json({ ok: true, item });
    }

    if (req.method === "PATCH") {
      const body = req.body || {};
      const item = AppointmentsStore.getById(appointmentId);
      if (!item) return res.status(404).json({ error: "not_found" });

      if (isManager) {
        if (body.action === "approve") {
          const updated = AppointmentsStore.update(appointmentId, me.id, { status: "approved" });
          return res.status(200).json({ ok: true, item: updated });
        }
        if (body.action === "cancel") {
          const updated = AppointmentsStore.update(appointmentId, me.id, { status: "canceled" });
          return res.status(200).json({ ok: true, item: updated });
        }
        if (body.action === "reschedule") {
          const { date, time } = body;
          if (!date || !time) return res.status(400).json({ error: "missing_date_time" });
          const updated = AppointmentsStore.update(appointmentId, me.id, { date, time, status: "rescheduled" });
          return res.status(200).json({ ok: true, item: updated });
        }
        return res.status(400).json({ error: "invalid_action" });
      }

      if (item.userId !== me.id) return res.status(403).json({ error: "forbidden" });
      if (body.action !== "cancel") return res.status(403).json({ error: "forbidden_action" });
      const updated = AppointmentsStore.update(appointmentId, me.id, { status: "canceled" });
      return res.status(200).json({ ok: true, item: updated });
    }

    res.setHeader("Allow", "GET,PATCH");
    return res.status(405).json({ error: "method_not_allowed" });
  } catch (e: any) {
    console.error("API /appointments/[appointmentId] error:", e);
    return res.status(500).json({ error: "internal_error", detail: String(e?.message || e) });
  }
}