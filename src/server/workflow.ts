// @ts-nocheck
// src/server/workflow.ts
import { readJson, writeJson } from "@/server/fsdb";
import { sendEmail, sendWhatsapp } from "@/server/notify";
import { generateReceiptPDF } from "@/server/pdf";
import { createTask } from "@/server/tasks";

export type Invoice = {
  id: string;
  serial: string;            // AO-INV-0000xxx
  reservationId: string;
  propertyId: string;
  unitId?: string;
  currency: "OMR";
  subtotal: number;          // قبل الخصم والرسوم
  discount: number;          // خصم
  serviceFee: number;        // رسوم خدمة
  amount: number;            // الإجمالي بعد التعديلات
  status: "unpaid" | "paid" | "canceled";
  items: { title: string; qty: number; price: number; total: number }[];
  issuedAt: string;          // ISO
  dueAt?: string;            // ISO
  paidAt?: string;           // ISO
  couponCode?: string;
  serviceFeePercent?: number;
  receiptUrl?: string;       // يُملأ عند الدفع
};

export type Reservation = {
  id: string;
  propertyId: string;
  unitId?: string;
  name: string;
  phone: string;
  email?: string;
  startDate: string; // yyyy-mm-dd
  periodMonths?: number;
  periodDays?: number;
  note?: string;
  createdAt: string;
  status?: "pending" | "approved" | "rejected" | "confirmed";
  invoiceId?: string;
};

export type PropertyLike = {
  id: number | string;
  priceOMR?: number;
  purpose?: "rent" | "sale";
  rentalType?: "daily" | "monthly" | "yearly" | null;
  title?: string;
};

const NOTIF_FILE = "notifications";
type Notification = {
  id: string;
  type: "reservation_created" | "invoice_issued" | "reservation_status_changed" | "payment_received";
  target: "admin" | "landlord" | "tenant";
  message: string;
  data?: any;
  createdAt: string;
  read?: boolean;
};

export async function pushNotification(n: Omit<Notification, "id" | "createdAt" | "read">) {
  const list = await readJson<Notification[]>(NOTIF_FILE, []);
  const rec: Notification = {
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
    ...n,
  };
  await writeJson(NOTIF_FILE, [rec, ...list]);
  return rec;
}

async function nextSerial(entity: string) {
  const base = process.env.SEQ_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  try {
    const r = await fetch(`${base}/api/seq/next`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity }),
    });
    const j = await r.json();
    if (r.ok && j?.serial) return String(j.serial);
  } catch {}
  const seq = await readJson<number>("seq-local-" + entity, 0);
  const n = seq + 1;
  await writeJson("seq-local-" + entity, n);
  return `${entity}-${String(n).padStart(7, "0")}`;
}

export function baseAmount(prop: PropertyLike, res: Reservation) {
  const price = prop.priceOMR ?? 0;
  if (prop.purpose === "rent") {
    if (prop.rentalType === "daily") {
      const days = res.periodDays ?? 0;
      return { subtotal: price * days, items: [{ title: "إيجار (يومي)", qty: days || 1, price, total: price * (days || 1) }] };
    }
    if (prop.rentalType === "yearly") {
      return { subtotal: price, items: [{ title: "إيجار (سنوي)", qty: 1, price, total: price }] };
    }
    const months = res.periodMonths ?? 0;
    return { subtotal: price * months, items: [{ title: "إيجار (شهري)", qty: months || 1, price, total: price * (months || 1) }] };
  } else {
    const percent = Number(process.env.SALE_DEPOSIT_PERCENT || 5);
    const deposit = Math.round(((price * percent) / 100) * 1000) / 1000;
    return { subtotal: deposit, items: [{ title: `عربون (${percent}%)`, qty: 1, price: deposit, total: deposit }] };
  }
}

function applyAdjustments(subtotal: number, couponCode?: string, serviceFeePercent?: number) {
  let discount = 0;
  if (couponCode) {
    // مثال بسيط: إذا الكوبون "DEFAULT" خذ النسبة من البيئة
    const pc = Number(process.env.COUPON_DEFAULT_PERCENT || 0);
    if (couponCode.toUpperCase() === "DEFAULT" && pc > 0) {
      discount = Math.round((subtotal * pc / 100) * 1000) / 1000;
    }
    // لاحقًا: جدول قسائم متكامل
  }
  const feePercent = typeof serviceFeePercent === "number" ? serviceFeePercent : Number(process.env.SERVICE_FEE_PERCENT || 0);
  const serviceFee = Math.round((subtotal * feePercent / 100) * 1000) / 1000;
  const amount = Math.max(0, Math.round((subtotal - discount + serviceFee) * 1000) / 1000);
  return { discount, serviceFee, amount, serviceFeePercent: feePercent };
}

export async function issueInvoiceForReservation(
  res: Reservation,
  prop: PropertyLike,
  opts?: { couponCode?: string; serviceFeePercent?: number; notifyToEmail?: string; notifyToPhone?: string }
) {
  const { subtotal, items } = baseAmount(prop, res);
  const adj = applyAdjustments(subtotal, opts?.couponCode, opts?.serviceFeePercent);
  const serial = await nextSerial("INVOICE");

  const inv: Invoice = {
    id: `${Date.now()}`,
    serial: serial.startsWith("AO-INV-") ? serial : `AO-INV-${String(Date.now()).slice(-7)}`,
    reservationId: res.id,
    propertyId: String(prop.id),
    unitId: res.unitId,
    currency: "OMR",
    subtotal,
    discount: adj.discount,
    serviceFee: adj.serviceFee,
    amount: adj.amount,
    status: "unpaid",
    items,
    issuedAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    couponCode: opts?.couponCode,
    serviceFeePercent: adj.serviceFeePercent,
  };

  const invoices = await readJson<Invoice[]>("invoices", []);
  await writeJson("invoices", [inv, ...invoices]);

  await pushNotification({
    type: "invoice_issued",
    target: "tenant",
    message: `تم إصدار فاتورة رقم ${inv.serial} لحجزك.`,
    data: { invoiceId: inv.id, reservationId: res.id },
  });

  // بريد/واتساب للمستأجر (إن توفرت بيانات اتصال)
  const toEmail = opts?.notifyToEmail || res.email;
  const toPhone = opts?.notifyToPhone || res.phone || process.env.WHATSAPP_DEFAULT_TO;
  const invLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/admin/invoices?open=${encodeURIComponent(inv.id)}`;

  if (toEmail) {
    await sendEmail({
      to: toEmail,
      subject: `فاتورة ${inv.serial}`,
      text: `تم إصدار فاتورة لحجزك. الإجمالي: ${inv.amount} OMR.\nرابط المتابعة: ${invLink}`,
    }).catch(() => null);
  }
  if (toPhone) {
    await sendWhatsapp({
      to: toPhone,
      body: `تم إصدار فاتورة (${inv.serial}) لحجزك. الإجمالي: ${inv.amount} OMR.\n${invLink}`,
    }).catch(() => null);
  }

  return inv;
}

export async function onInvoicePaid(inv: Invoice) {
  // توليد إيصال PDF
  const pdf = await generateReceiptPDF({
    serial: inv.serial,
    invoiceId: inv.id,
    amount: inv.amount,
    currency: inv.currency,
    status: "paid",
    issuedAt: inv.issuedAt,
    paidAt: inv.paidAt,
    items: inv.items,
  });

  // حفظ رابط الإيصال داخل الفاتورة
  const list = await readJson<Invoice[]>("invoices", []);
  const idx = list.findIndex(x => x.id === inv.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], receiptUrl: pdf.apiUrl };
    await writeJson("invoices", list);
  }

  // إشعار + مهمة متابعة "تسليم"
  await pushNotification({
    type: "payment_received",
    target: "tenant",
    message: `تم استلام الدفع للفاتورة ${inv.serial}.`,
    data: { invoiceId: inv.id, receiptUrl: pdf.apiUrl },
  });

  await createTask({
    title: "تأكيد التسليم/التسكين بعد الدفع",
    description: `فاتورة: ${inv.serial} — عقار: ${inv.propertyId}${inv.unitId ? ` / ${inv.unitId}` : ""}`,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    data: { invoiceId: inv.id, propertyId: inv.propertyId, unitId: inv.unitId },
  });
}
