/**
 * API: POST /api/admin/notifications/send
 * Simulates sending (email/whatsapp) & appends to log
 * Location: src/pages/api/admin/notifications/send.ts
 */
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import {
  NotificationTemplate,
  SendRequest,
  SendLogItem,
} from "@/types/notifications";

const dataDir = path.join(process.cwd(), ".data");
const tplsFile = path.join(dataDir, "notifications-templates.json");
const logFile = path.join(dataDir, "notifications-log.json");
const MAX_LOG = 1000;

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function ensure() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(tplsFile)) fs.writeFileSync(tplsFile, "[]", "utf8");
  if (!fs.existsSync(logFile)) fs.writeFileSync(logFile, "[]", "utf8");
}

function readTemplates(): NotificationTemplate[] {
  ensure();
  return JSON.parse(fs.readFileSync(tplsFile, "utf8"));
}

function readLog(): SendLogItem[] {
  ensure();
  return JSON.parse(fs.readFileSync(logFile, "utf8"));
}

function writeLog(items: SendLogItem[]) {
  ensure();
  fs.writeFileSync(logFile, JSON.stringify(items.slice(-MAX_LOG), null, 2), "utf8");
}

function render(str: string, data: Record<string, any> = {}) {
  return String(str).replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_m, k) => {
    const v = data[k];
    return v === undefined || v === null ? `{{${k}}}` : String(v);
  });
}
function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = req.body as SendRequest;
    if (!body || !body.channel || !body.templateId || !body.to) {
      return res.status(400).json({ error: "Missing channel/templateId/to" });
    }

    const tpls = readTemplates();
    const tpl = tpls.find((t) => t.id === body.templateId && t.channel === body.channel);
    if (!tpl) return res.status(404).json({ error: "Template not found" });
    if (!tpl.enabled) return res.status(400).json({ error: "Template disabled" });

    // Simulate provider send
    const subject = tpl.channel === "email" ? render(tpl.subject || "", body.data || {}) : undefined;
    const content = render(tpl.body, body.data || {});
    const previewUrl =
      tpl.channel === "email"
        ? `preview://email/${tpl.id}/${uuid()}`
        : `whatsapp://send?phone=${encodeURIComponent(body.to)}`;

    // Append to log
    const entry: SendLogItem = {
      id: uuid(),
      ts: new Date().toISOString(),
      channel: tpl.channel,
      to: body.to,
      templateId: tpl.id,
      status: "sent",
      previewUrl,
      payload: {
        subject,
        body: content,
        data: body.data || {},
      },
    };
    const current = readLog();
    current.push(entry);
    writeLog(current);

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
