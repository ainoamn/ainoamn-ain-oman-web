// src/pages/api/invoices/[id]/status.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson } from "@/server/fsdb";
import { requireAdminApi } from "@/server/auth";
import type { Invoice, Reservation } from "@/server/workflow";
import { pushNotification, onInvoicePaid } from "@/server/workflow";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminApi(req, res)) return;

  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const id = String(req.query.id || "");
  const { status } = req.body || {};
  if (!["unpaid", "paid", "canceled"].includes(status)) {
    return res.status(400).json({ ok: false, error: "BAD_STATUS" });
  }

  const invoices = await readJson<Invoice[]>("invoices", []);
  const idx = invoices.findIndex(x => x.id === id || x.serial === id);
  if (idx < 0) return res.status(404).json({ ok: false, error: "NOT_FOUND" });

  const inv = { ...invoices[idx] };
  inv.status = status as any;
  inv.paidAt = status === "paid" ? new Date().toISOString() : undefined;
  invoices[idx] = inv;
  await writeJson("invoices", invoices);

  // تحديث الحجز المقابل
  const reservations = await readJson<Reservation[]>("reservations", []);
  const ridx = reservations.findIndex(r => r.id === inv.reservationId);
  if (ridx >= 0) {
    reservations[ridx] = { ...reservations[ridx], status: status === "paid" ? "confirmed" : reservations[ridx].status };
    await writeJson("reservations", reservations);
  }

  // عند الدفع: إيصال + إشعارات + مهمة لاحقة
  if (status === "paid") {
    await onInvoicePaid(inv);
    await pushNotification({
      type: "payment_received",
      target: "admin",
      message: `تم تأشير الفاتورة ${inv.serial} كمدفوعة.`,
      data: { invoiceId: inv.id },
    });
  }

  return res.status(200).json({ ok: true, item: inv });
}
