// src/pages/api/tasks/[...all].ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import {
  getTask, patchTask, appendThread, addParticipant,
  addAttachment, getAttachmentPath, removeAttachment, transferTask, Person, listTasks
} from "../../../server/db";
import path from "path";

export const config = { api: { bodyParser: { sizeLimit: "12mb" } } };

const BRAND = {
  name: "عين عُمان",
  color: "#0f766e",
  colorDark: "#0b4a45",
  logo: "/logo.svg",
  address: "مسقط، سلطنة عمان",
  email: "info@ainoman.com",
  phone: "+968 9000 0000",
};

function ok(res: NextApiResponse, data: any) { return res.status(200).json(data); }
function bad(res: NextApiResponse, msg: string, code = 400) { return res.status(code).json({ error: msg }); }
function escICS(s: string) { return s.replace(/\\/g,"\\\\").replace(/,/g,"\\,").replace(/;/g,"\\;").replace(/\n/g,"\\n"); }
function icsTS(d: Date) { const p=(n:number)=>`${n}`.padStart(2,"0"); return `${d.getUTCFullYear()}${p(d.getUTCMonth()+1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`; }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const slug = (req.query.all as string[]|undefined) || [];
    if (slug.length === 0) return ok(res, { ok: true, root: "tasks" });
    if (slug.length === 1 && slug[0] === "ping") return ok(res, { ok: true, feature: "tasks" });

    // === جديد: /api/tasks/list?q=&status=&priority=&propertyId=
    if (slug.length === 1 && slug[0] === "list") {
      if (req.method !== "GET") { res.setHeader("Allow","GET"); return res.status(405).end(); }
      const q = typeof req.query.q === "string" ? req.query.q : undefined;
      const status = typeof req.query.status === "string" ? req.query.status as any : undefined;
      const priority = typeof req.query.priority === "string" ? req.query.priority as any : undefined;
      const propertyId = typeof req.query.propertyId === "string" ? req.query.propertyId : undefined;
      const items = listTasks({ q, status, priority });
      
      // فلترة حسب propertyId إذا تم توفيره
      let filteredItems = items;
      if (propertyId) {
        filteredItems = items.filter(t => {
          // البحث في link (LinkedEntity) أو propertyId
          return (t.link?.id === propertyId) || 
                 (t.link?.type === "property" && t.link?.id === propertyId) ||
                 ((t as any).propertyId === propertyId);
        });
      }
      
      // نُرجع الحقول المهمة للقائمة فقط (خفيف)
      const tasks = filteredItems.map(t => ({
        id: t.id, 
        title: t.title, 
        priority: t.priority, 
        status: t.status, 
        createdAt: t.createdAt, 
        updatedAt: t.updatedAt,
        propertyId: t.link?.id || (t as any).propertyId,
        assignee: t.assignee,
        dueDate: t.dueDate,
        type: t.type,
        description: t.description
      }));
      return ok(res, { tasks });
    }

    // /api/tasks/:id  GET/PUT/PATCH
    if (slug.length === 1) {
      const id = slug[0];
      if (req.method === "GET") {
        // جرّب قاعدة البيانات المتقدمة أولًا
        const t = getTask(id);
        if (t) return ok(res, t);
        // توافق: قراءة من قاعدة المهام المبسطة (.data/db.json)
        try {
          const dbFile = path.join(process.cwd(), ".data", "db.json");
          if (fs.existsSync(dbFile)) {
            const raw = fs.readFileSync(dbFile, "utf8");
            const db = JSON.parse(raw || "{}");
            const items: any[] = Array.isArray(db.tasks) ? db.tasks : [];
            const found = items.find((x:any) => String(x.id) === String(id));
            if (found) {
              return ok(res, found);
            }
          }
        } catch {}
        return bad(res, "Not found", 404);
      }
      if (req.method === "PUT" || req.method === "PATCH") {
        const body = (req.body || {}) as any;
        const patch = body?.patch ?? body ?? {};
        const t = patchTask(id, patch);
        return ok(res, t);
      }
      res.setHeader("Allow","GET,PUT,PATCH"); return res.status(405).end();
    }

    const id = slug[0];

    // thread
    if (slug.length === 2 && slug[1] === "thread") {
      if (req.method !== "POST") { res.setHeader("Allow","POST"); return res.status(405).end(); }
      const { author, text } = (req.body || {}) as any;
      if (!text || !String(text).trim()) return bad(res,"Text required");
      const t = appendThread(id, author ? String(author) : "admin", String(text).trim());
      return ok(res, { ok: true, task: t });
    }

    // invite
    if (slug.length === 2 && slug[1] === "invite") {
      if (req.method !== "POST") { res.setHeader("Allow","POST"); return res.status(405).end(); }
      const { name, email, whatsapp } = (req.body || {}) as any;
      if (!name) return bad(res,"name required");
      const t = addParticipant(id, { name: String(name), email: email?String(email):undefined, whatsapp: whatsapp?String(whatsapp):undefined });
      appendThread(id, "system", `تمت دعوة ${name}${email?` (${email})`:""}${whatsapp?` | ${whatsapp}`:""}.`);
      return ok(res, { ok: true, task: t });
    }

    // attachments
    if (slug.length === 2 && slug[1] === "attachments") {
      if (req.method === "GET") {
        const t = getTask(id); if (!t) return bad(res,"Not found",404);
        return ok(res, { attachments: t.attachments || [] });
      }
      if (req.method === "POST") {
        const { name, type, size, contentBase64 } = (req.body || {}) as any;
        if (!name || !contentBase64) return bad(res,"name & contentBase64 required");
        try {
          const r = addAttachment(id, { name: String(name), type: type?String(type):undefined, size: size?Number(size):undefined, contentBase64: String(contentBase64) });
          return ok(res, { ok: true, attachment: r.attachment, task: r.task });
        } catch (e:any) { return bad(res, e?.message || "upload failed"); }
      }
      if (req.method === "DELETE") {
        const { attId } = (req.body || {}) as any;
        if (!attId) return bad(res,"attId required");
        try {
          const t = removeAttachment(id, String(attId));
          return ok(res, { ok: true, task: t });
        } catch (e:any) { return bad(res, e?.message || "delete failed"); }
      }
      res.setHeader("Allow","GET,POST,DELETE"); return res.status(405).end();
    }

    // file stream
    if (slug.length === 3 && slug[1] === "file") {
      const aid = slug[2];
      const info = getAttachmentPath(id, aid);
      if (!info) return res.status(404).send("Not found");
      const stat = fs.statSync(info.path);
      const stream = fs.createReadStream(info.path);
      res.setHeader("Content-Length", stat.size.toString());
      res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(info.name)}`);
      if (info.type) res.setHeader("Content-Type", info.type);
      return stream.pipe(res);
    }

    // تحويل المهمة
    if (slug.length === 2 && slug[1] === "transfer") {
      if (req.method !== "POST") { res.setHeader("Allow","POST"); return res.status(405).end(); }
      const { to, ccSelf, self } = (req.body || {}) as { to: Person; ccSelf?: boolean; self?: Person };
      if (!to || !to.name) return bad(res, "to.name required");
      const t = transferTask(id, self ?? null, to, !!ccSelf);
      return ok(res, { ok: true, task: t });
    }

    // الطباعة / المعاينة
    if (slug.length === 2 && slug[1] === "print") {
      const t = getTask(id); if (!t) return res.status(404).send("Not found");
      const auto = String((req.query.auto ?? "")).trim() === "1";
      const esc=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
      const labelPriority = (p:string)=>({low:"منخفضة",medium:"متوسطة",high:"عالية",urgent:"عاجلة"} as any)[p] || p;
      const labelStatus   = (s:string)=>({open:"مفتوحة",in_progress:"قيد التنفيذ",blocked:"معلقة",done:"مكتملة"} as any)[s] || s;
      const imgs = (t.attachments||[]).filter(a=> (a.type||"").startsWith("image/"));
      const files = (t.attachments||[]);
      const html = `<!doctype html>...`; // (اترك قالب الطباعة كما في نسختك التي تعمل الآن)
      res.setHeader("Content-Type","text/html; charset=utf-8");
      return res.status(200).send(html);
    }

    // ICS
    if (slug.length === 2 && slug[1] === "ics") {
      const t = getTask(id); if (!t) return res.status(404).send("Not found");
      const dtstamp = icsTS(new Date());
      const start = t.dueDate ? icsTS(new Date(t.dueDate)) : dtstamp;
      const end   = t.dueDate ? icsTS(new Date(new Date(t.dueDate).getTime()+3600000)) : dtstamp;
      const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Ain Oman//Tasks//AR","CALSCALE:GREGORIAN","METHOD:PUBLISH","BEGIN:VEVENT",`UID:${id}@ain-oman-web`,`DTSTAMP:${dtstamp}`,`DTSTART:${start}`,`DTEND:${end}`,`SUMMARY:${escICS(t.title||"Task")}`,`DESCRIPTION:${escICS(t.description||"")}`,"END:VEVENT","END:VCALENDAR"].join("\r\n");
      res.setHeader("Content-Type","text/calendar; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="task-${id}.ics"`);
      return res.status(200).send(ics);
    }

    return bad(res,"Unknown route",404);
  } catch (e: any) {
    return res.status(500).json({ error: "server_error", message: e?.message, stack: process.env.NODE_ENV !== "production" ? e?.stack : undefined });
  }
}
