/**
 * API: POST /api/invoices/[id]/pay
 * - Marks invoice paid
 * - Creates payment
 * - Sends optional notifications
 * Location: src/pages/api/invoices/[id]/pay.ts
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { readArray, writeArray } from "@/server/jsonStore";
import type { Invoice, Payment } from "@/types/billing";
import { nextSerial } from "@/lib/seq";
import fs from "fs";
import path from "path";

const INV_FILE = "invoices.json";
const PAY_FILE = "payments.json";
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
    const invs = readArray<Invoice>(INV_FILE);
    const inv = invs.find((x) => x.id === id);
    if (!inv) return res.status(404).json({ error: "Invoice not found" });
    if (inv.status === "paid") return res.status(400).json({ error: "Invoice already paid" });

    const b = req.body || {};
    if (typeof b?.amount !== "number" || !b?.method) {
      return res.status(400).json({ error: "Missing amount/method" });
    }

    const payId = await nextSerial("PAYMENT");
    const paidAt = new Date().toISOString();
    const p: Payment = {
      id: payId,
      invoiceId: inv.id,
      amount: Number(b.amount),
      currency: inv.currency,
      method: b.method,
      paidAt,
      receiptNote: b?.note ? String(b.note) : undefined,
    };
    const pays = readArray<Payment>(PAY_FILE);
    pays.push(p);
    writeArray<Payment>(PAY_FILE, pays);

    inv.status = "paid";
    inv.paidAt = paidAt;
    writeArray<Invoice>(INV_FILE, invs);

    // Notifications (optional best-effort)
    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const tWa = findTplIdByName("payment_received", "whatsapp");
      if (tWa) {
        await fetch(`${base}/api/admin/notifications/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: "whatsapp",
            templateId: tWa,
            to: "+96800000000", // ضع رقم العميل إن توفر لديك
            data: { invoice: inv.id, amount: p.amount, currency: p.currency },
          }),
        });
      }
    } catch {}

    return res.status(200).json({ ok: true, payment: p });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
