// src/pages/api/property/[id]/reserve.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson } from "@/server/fsdb";
import { issueInvoiceForReservation, pushNotification, type Reservation, type PropertyLike } from "@/server/workflow";
import { createTask } from "@/server/tasks";

function parseISO(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(+d)) return null;
  d.setHours(0,0,0,0);
  return d;
}
function addMonths(d: Date, months: number) { const dt = new Date(d); dt.setMonth(dt.getMonth() + months); return dt; }
function addDays(d: Date, days: number) { const dt = new Date(d); dt.setDate(dt.getDate() + days); return dt; }
function endDate(start: Date, months?: number, days?: number) {
  if (months && months > 0) { const ed = addMonths(start, months); ed.setDate(ed.getDate() - 1); return ed; }
  if (days && days > 0) { const ed = addDays(start, days - 1); return ed; }
  return start;
}
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) { return aStart <= bEnd && bStart <= aEnd; }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const propertyId = String(req.query.id || "");
    const { name, phone, email, startDate, periodMonths, periodDays, note, unitId, couponCode, serviceFeePercent } = req.body || {};

    if (!name || !phone) {
      return res.status(400).json({ ok: false, error: "REQUIRED_NAME_PHONE" });
    }

    const s = parseISO(startDate);
    const months = typeof periodMonths === "number" ? periodMonths : undefined;
    const days = typeof periodDays === "number" ? periodDays : undefined;

    if ((months || days) && !s) {
      return res.status(400).json({ ok: false, error: "BAD_DATE" });
    }

    // منع التعارض
    if (s && (months || days)) {
      const e = endDate(s, months, days);
      const list = await readJson<Reservation[]>("reservations", []);
      const same = list.filter(x => String(x.propertyId) === propertyId && (unitId ? String(x.unitId) === String(unitId) : true));
      const conflicts = same.filter((r) => {
        const rs = parseISO(r.startDate)!;
        const re = endDate(rs, r.periodMonths, r.periodDays);
        return overlaps(s, e, rs, re);
      });
      if (conflicts.length > 0) {
        return res.status(409).json({ ok: false, error: "UNAVAILABLE", conflicts });
      }
    }

    // إنشاء سجل الحجز
    const rec: Reservation = {
      id: `${Date.now()}`,
      propertyId,
      unitId: unitId ? String(unitId) : undefined,
      name: String(name),
      phone: String(phone),
      email: email ? String(email) : undefined,
      startDate: s ? s.toISOString().slice(0,10) : new Date().toISOString().slice(0,10),
      periodMonths: months,
      periodDays: days,
      note: note ? String(note) : undefined,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    const list = await readJson<Reservation[]>("reservations", []);
    await writeJson("reservations", [rec, ...list]);

    // جلب بيانات العقار لحساب الفاتورة
    let prop: PropertyLike | null = null;
    const stored = await readJson<any[]>("properties", []);
    prop = stored.find(p => String(p?.id) === propertyId) || null;
    if (!prop) {
      try {
        const mod: any = await import("@/lib/demoData").catch(() => ({}));
        const arr: any[] = mod?.PROPERTIES || mod?.properties || [];
        prop = arr.find(p => String(p?.id) === propertyId) || null;
      } catch {}
    }
    prop = prop || { id: propertyId, priceOMR: 0, purpose: "rent", rentalType: "monthly" };

    // إصدار فاتورة مرتبطة بالحجز (مع كوبون/رسوم)
    const invoice = await issueInvoiceForReservation(rec, prop, {
      couponCode,
      serviceFeePercent: typeof serviceFeePercent === "number" ? serviceFeePercent : undefined,
      notifyToEmail: rec.email,
      notifyToPhone: rec.phone,
    });

    // تحديث الحجز برقم الفاتورة
    const after = await readJson<Reservation[]>("reservations", []);
    const idx = after.findIndex(r => r.id === rec.id);
    if (idx >= 0) {
      after[idx] = { ...after[idx], invoiceId: invoice.id };
      await writeJson("reservations", after);
    }

    // إشعار إداري
    await pushNotification({
      type: "reservation_created",
      target: "admin",
      message: `طلب حجز جديد على عقار ${propertyId}.`,
      data: { reservationId: rec.id, invoiceId: invoice.id },
    });

    // مهمة متابعة تلقائية
    await createTask({
      title: "متابعة حجز جديد",
      description: `العميل: ${rec.name} — هاتف: ${rec.phone} — عقار: ${propertyId}${rec.unitId ? ` / ${rec.unitId}` : ""}`,
      dueDate: s ? s.toISOString() : new Date().toISOString(),
      data: { reservationId: rec.id, invoiceId: invoice.id, propertyId },
    });

    return res.status(200).json({ ok: true, item: { ...rec, invoiceId: invoice.id }, invoice });
  } catch (e) {
    console.error("reserve error:", e);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}
