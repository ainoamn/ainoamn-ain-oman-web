import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), ".data");
const file = path.join(dataDir, "notifications-templates.json");
function ensure() { if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true }); if (!fs.existsSync(file)) fs.writeFileSync(file, "[]", "utf8"); }
function readAll(): any[] { ensure(); return JSON.parse(fs.readFileSync(file, "utf8")); }
function writeAll(arr: any[]) { ensure(); fs.writeFileSync(file, JSON.stringify(arr, null, 2), "utf8"); }
function uuid() { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r=(Math.random()*16)|0, v=c==="x"?r:(r&0x3)|0x8; return v.toString(16); }); }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") { res.setHeader("Allow","GET"); return res.status(405).json({ error:"Method not allowed" }); }
    const arr = readAll();
    const upsert = (tpl: any) => {
      const i = arr.findIndex((t:any)=>t.name===tpl.name && t.channel===tpl.channel);
      if (i>=0) arr[i] = { ...arr[i], ...tpl, updatedAt: new Date().toISOString() };
      else arr.push({ id: uuid(), ...tpl, updatedAt: new Date().toISOString() });
    };
    upsert({ channel:"email", name:"task_invite", description:"دعوة للمشاركة في مهمة (بريد)", lang:"ar", enabled:true, subject:"دعوة للمشاركة في مهمة {{taskId}}", body:"{{message}}", variables:[{name:"taskId",required:true},{name:"message",required:true}] });
    upsert({ channel:"whatsapp", name:"task_invite", description:"دعوة للمشاركة في مهمة (واتساب)", lang:"ar", enabled:true, body:"{{message}} (مهمة: {{taskId}})", variables:[{name:"taskId",required:true},{name:"message",required:true}] });
    writeAll(arr);
    return res.status(200).json({ ok:true, count: arr.length });
  } catch (e:any) {
    console.error(e); return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
