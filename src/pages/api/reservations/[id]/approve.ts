/**
 * API: POST /api/reservations/[id]/approve
 * - Set status=approved
 * - Create invoice (unpaid)
 * - Send notifications if templates exist
 * Location: src/pages/api/reservations/[id]/approve.ts
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { readArray, writeArray } from "@/server/jsonStore";
import type { Reservation, Invoice } from "@/types/billing";
import { nextSerial } from "@/lib/seq";
import fs from "fs";
import path from "path";

const RES_FILE = "reservations.json";
const INV_FILE = "invoices.json";
const dataDir = path.join(process.cwd(), ".data");
const tplsFile = path.join(dataDir, "notifications-templates.json");

function findTplIdByName(name: string, channel: "email" | "whatsapp"): string | null {
  try {
    if (!fs.existsSync(tplsFile)) return null;
    const arr = JSON.parse(fs.readFileSync(tplsFile, "utf8"));
    const t = (arr || []).find((x: any) => x?.name === name && x?.channel === channel && x?.enabled);
    return t?.id || null;
  } catch { return null; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const id = String(req.query.id || "");
    const list = readArray<Reservation>(RES_FILE);
    const item = list.find((x) => x.id === id);
    if (!item) return res.status(404).json({ error: "Reservation not found" });

    item.status = "approved";
    item.updatedAt = new Date().toISOString();
    writeArray<Reservation>(RES_FILE, list);

    // Create invoice
    const invoiceId = await nextSerial("INVOICE");
    const inv: Invoice = {
      id: invoiceId,
      reservationId: item.id,
      propertyId: item.propertyId,
      customerName: item.customerName,
      amount: item.amount,
      currency: item.currency,
      status: "unpaid",
      dueDate: undefined,
      createdAt: new Date().toISOString(),
      paidAt: undefined,
    };
    const invList = readArray<Invoice>(INV_FILE);
    invList.push(inv);
    writeArray<Invoice>(INV_FILE, invList);

    item.invoiceId = inv.id;
    writeArray<Reservation>(RES_FILE, list);

    // Notifications (best effort)
    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      // reservation_approved
      const t1Email = findTplIdByName("reservation_approved", "email");
      if (t1Email && item.email) {
        await fetch(`${base}/api/admin/notifications/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: "email",
            templateId: t1Email,
            to: item.email,
            data: { customer: item.customerName, property: item.propertyId, date: new Date().toISOString(), amount: item.amount, currency: item.currency },
          }),
        });
      }
      const t1Wa = findTplIdByName("reservation_approved", "whatsapp");
      if (t1Wa && item.phone) {
        await fetch(`${base}/api/admin/notifications/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: "whatsapp",
            templateId: t1Wa,
            to: item.phone,
            data: { customer: item.customerName, property: item.propertyId, date: new Date().toISOString(), amount: item.amount, currency: item.currency },
          }),
        });
      }
      // invoice_issued
      const t2Wa = findTplIdByName("invoice_issued", "whatsapp");
      if (t2Wa && item.phone) {
        await fetch(`${base}/api/admin/notifications/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: "whatsapp",
            templateId: t2Wa,
            to: item.phone,
            data: { customer: item.customerName, invoice: inv.id, amount: inv.amount, currency: inv.currency, payUrl: `${base}/admin/billing/invoices` },
          }),
        });
      }
    } catch {}

    return res.status(200).json({ ok: true, invoice: inv });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
