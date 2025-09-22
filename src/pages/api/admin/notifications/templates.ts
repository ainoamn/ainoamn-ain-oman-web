/**
 * API: GET/PUT /api/admin/notifications/templates
 * Stores templates in .data/notifications-templates.json
 * Location: src/pages/api/admin/notifications/templates.ts
 */
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { NotificationTemplate } from "@/types/notifications";

const dataDir = path.join(process.cwd(), ".data");
const file = path.join(dataDir, "notifications-templates.json");

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const DEFAULTS: NotificationTemplate[] = [
  {
    id: "reservation_approved_email",
    channel: "email",
    name: "reservation_approved",
    description: "إشعار موافقة الحجز (بريد)",
    lang: "ar",
    enabled: true,
    subject: "تمت الموافقة على حجزك للعقار {{property}}",
    body:
      "عزيزي {{customer}},\n\n" +
      "تمت الموافقة على حجزك للعقار: {{property}} بتاريخ {{date}}.\n" +
      "الرسوم: {{amount}} {{currency}}.\n\n" +
      "شكراً لاستخدامك عين عُمان.",
    variables: [
      { name: "customer", example: "عبد الحميد", required: true },
      { name: "property", example: "شقة رقم 12", required: true },
      { name: "date", example: "2025-08-15", required: true },
      { name: "amount", example: "60" },
      { name: "currency", example: "OMR" },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "invoice_issued_whatsapp",
    channel: "whatsapp",
    name: "invoice_issued",
    description: "إشعار إصدار فاتورة (واتساب)",
    lang: "ar",
    enabled: true,
    body:
      "عزيزي {{customer}}، تم إصدار فاتورة رقم {{invoice}} بمبلغ {{amount}} {{currency}}.\n" +
      "رابط الدفع: {{payUrl}}",
    variables: [
      { name: "customer", example: "عبد الحميد", required: true },
      { name: "invoice", example: "AO-I-000123", required: true },
      { name: "amount", example: "120" },
      { name: "currency", example: "OMR" },
      { name: "payUrl", example: "https://example.com/pay/INV123" },
    ],
    updatedAt: new Date().toISOString(),
  },
];

function ensureFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(DEFAULTS, null, 2), "utf8");
  }
}

function readAll(): NotificationTemplate[] {
  ensureFile();
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeAll(t: NotificationTemplate[]) {
  ensureFile();
  fs.writeFileSync(file, JSON.stringify(t, null, 2), "utf8");
}

function sanitize(tpls: any[]): NotificationTemplate[] {
  return (Array.isArray(tpls) ? tpls : [])
    .map((t) => ({
      id: typeof t.id === "string" && t.id.length ? t.id : uuid(),
      channel: t.channel === "email" ? "email" : "whatsapp",
      name: String(t.name || ""),
      description: t.description ? String(t.description) : undefined,
      lang: t.lang ? String(t.lang) : undefined,
      enabled: typeof t.enabled === "boolean" ? t.enabled : true,
      subject:
        t.channel === "email" ? (t.subject ? String(t.subject) : "(بدون عنوان)") : undefined,
      body: String(t.body || ""),
      variables: Array.isArray(t.variables) ? t.variables : [],
      updatedAt: new Date().toISOString(),
    }))
    .filter((t) => t.name && t.body);
}
function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      return res.status(200).json(readAll());
    }
    if (req.method === "PUT") {
      const body = req.body;
      if (!Array.isArray(body)) return res.status(400).json({ error: "Invalid body" });
      const tpls = sanitize(body);
      writeAll(tpls);
      return res.status(200).json({ ok: true });
    }
    res.setHeader("Allow", "GET,PUT");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
