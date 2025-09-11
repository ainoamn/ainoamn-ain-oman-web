// src/pages/api/reservations/[id]/status.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson } from "@/server/fsdb";
import { requireAdminApi } from "@/server/auth";
import type { Reservation } from "@/server/workflow";
import { pushNotification } from "@/server/workflow";
export const config = { runtime: "nodejs" };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminApi(req, res)) return;

  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const id = String(req.query.id || "");
  const { status } = req.body || {};
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ ok: false, error: "BAD_STATUS" });
  }

  const list = await readJson<Reservation[]>("reservations", []);
  const idx = list.findIndex(r => r.id === id);
  if (idx < 0) return res.status(404).json({ ok: false, error: "NOT_FOUND" });

  const rec = { ...list[idx], status };
  list[idx] = rec;
  await writeJson("reservations", list);

  await pushNotification({
    type: "reservation_status_changed",
    target: "tenant",
    message: status === "approved" ? "تمت الموافقة على حجزك." : "تم رفض طلب الحجز.",
    data: { reservationId: rec.id, status },
  });

  return res.status(200).json({ ok: true, item: rec });
}
