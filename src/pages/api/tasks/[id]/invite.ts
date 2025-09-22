/**
 * POST /api/tasks/[id]/invite
 * body: { emails?: string[], phones?: string[], message?: string }
 * يستخدم لوحة الإشعارات إن وُجدت قوالب task_invite، وإلا يسجّل في notifications-log.json.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), ".data");
const tplsFile = path.join(dataDir, "notifications-templates.json");
const logFile = path.join(dataDir, "notifications-log.json");

function ensureFiles() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(tplsFile)) fs.writeFileSync(tplsFile, "[]", "utf8");
  if (!fs.existsSync(logFile)) fs.writeFileSync(logFile, "[]", "utf8");
}
function readJson(p: string) { return JSON.parse(fs.readFileSync(p, "utf8")); }
function writeLog(items: any[]) { fs.writeFileSync(logFile, JSON.stringify(items, null, 2), "utf8"); }
function uuid() { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r=(Math.random()*16)|0, v=c==="x"?r:(r&0x3)|0x8; return v.toString(16); }); }
function findTplId(name: string, channel: "email" | "whatsapp", tpls: any[]) {
  const t = (tpls||[]).find((x: any) => x?.name === name && x?.channel === channel && x?.enabled);
  return t?.id || null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") { res.setHeader("Allow","POST"); return res.status(405).json({ error:"Method not allowed" }); }
    const taskId = String(req.query.id || "");
    const { emails = [], phones = [], message = "دعوة للمشاركة في مهمة" } = req.body || {};
    ensureFiles();
    const tpls = readJson(tplsFile);

    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const emailTpl = findTplId("task_invite", "email", tpls);
    const waTpl = findTplId("task_invite", "whatsapp", tpls);
    let usedProvider = false;

    for (const to of emails) {
      if (emailTpl) {
        await fetch(`${base}/api/admin/notifications/send`, { method:"POST", headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({ channel:"email", templateId: emailTpl, to, data:{ taskId, message } }) });
        usedProvider = true;
      }
    }
    for (const to of phones) {
      if (waTpl) {
        await fetch(`${base}/api/admin/notifications/send`, { method:"POST", headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({ channel:"whatsapp", templateId: waTpl, to, data:{ taskId, message } }) });
        usedProvider = true;
      }
    }

    if (!usedProvider) {
      const log = readJson(logFile);
      const now = new Date().toISOString();
      for (const to of emails) log.push({ id: uuid(), ts: now, channel:"email", to, templateId:"task_invite_ad_hoc", status:"sent", payload:{ subject:`دعوة مهمة ${taskId}`, body: message } });
      for (const to of phones) log.push({ id: uuid(), ts: now, channel:"whatsapp", to, templateId:"task_invite_ad_hoc", status:"sent", payload:{ body: message } });
      writeLog(log);
    }

    return res.status(200).json({ ok:true });
  } catch (e:any) {
    console.error(e); return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
