/**
 * TaskInvitePanel
 * إرسال دعوة بالمشاركة في المهمة عبر البريد/الواتساب باستخدام لوحة الإشعارات.
 * يتوقع وجود قوالب باسم task_invite (email/whatsapp) في /admin/notifications.
 */
import { useState } from "react";

async function postInvite(taskId: string, emails: string[], phones: string[], message?: string) {
  const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emails, phones, message }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j?.error || "فشل إرسال الدعوات");
  }
}

export default function TaskInvitePanel({ taskId, onDone }: { taskId: string; onDone?: () => void }) {
  const [emails, setEmails] = useState("");
  const [phones, setPhones] = useState("");
  const [message, setMessage] = useState("تمت دعوتك للمشاركة في مهمة.");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    try {
      setBusy(true); setMsg(null);
      const eList = emails.split(/[,\s;]+/).map(s => s.trim()).filter(Boolean);
      const pList = phones.split(/[,\s;]+/).map(s => s.trim()).filter(Boolean);
      await postInvite(taskId, eList, pList, message);
      setMsg("تم إرسال الدعوات.");
      onDone?.();
    } catch (e: any) {
      setMsg(e?.message || "تعذر الإرسال");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
      <div className="text-sm text-gray-600">إرسال دعوات للمشاركة</div>
      <input className="w-full rounded-lg border border-gray-300 p-2" placeholder="بريد إلكتروني (مفصول بفواصل)" value={emails} onChange={(e)=>setEmails(e.target.value)} />
      <input className="w-full rounded-lg border border-gray-300 p-2" placeholder="أرقام واتساب (E.164 مثل +9689xxxxxxx، مفصول بفواصل)" value={phones} onChange={(e)=>setPhones(e.target.value)} />
      <textarea className="w-full rounded-lg border border-gray-300 p-2" rows={3} placeholder="رسالة قصيرة (اختياري)" value={message} onChange={(e)=>setMessage(e.target.value)} />
      <div className="flex items-center gap-2">
        <button onClick={submit} disabled={busy} className="rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-60">
          {busy ? "جارٍ الإرسال…" : "إرسال الدعوات"}
        </button>
        {msg && <div className="text-xs text-gray-600">{msg}</div>}
      </div>
    </div>
  );
}
4) API لإرسال دعوات المهمة (يستعمل لوحة الإشعارات)
TXT: src/pages/api/tasks/[id]/invite.ts

/**
 * POST /api/tasks/[id]/invite
 * body: { emails?: string[], phones?: string[], message?: string }
 * يحاول استخدام قوالب task_invite (email/whatsapp)؛ وإن لم يجد، يسجل في notifications-log مباشرةً.
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
function uuid() { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
  const r = (Math.random()*16)|0, v = c==="x" ? r : (r&0x3)|0x8; return v.toString(16);
});}

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

    // نحاول استخدام لوحة الإشعارات إن توفّرت
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

    // إن لم تتوفر قوالب، نسجل مباشرةً في سجل الإشعارات كـ "sent"
    if (!usedProvider) {
      const log = readJson(logFile);
      const now = new Date().toISOString();
      for (const to of emails) log.push({ id: uuid(), ts: now, channel:"email", to, templateId:"task_invite_ad_hoc", status:"sent", payload:{ subject:`دعوة مهمة ${taskId}`, body: message } });
      for (const to of phones) log.push({ id: uuid(), ts: now, channel:"whatsapp", to, templateId:"task_invite_ad_hoc", status:"sent", payload:{ body: message } });
      writeLog(log);
    }

    return res.status(200).json({ ok:true });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
ملاحظة: لو عندك قوالب task_invite في /admin/notifications سيستخدمها؛ وإلا يسجّل الإرسال في notifications-log.json كحل بديل.

5) (اختياري) إضافة قوالب جاهزة للدعوات
لو تحب إضافتها فورًا، افتح /admin/notifications وأضف قالبين:

اسم: task_invite — قناة: email — موضوع: “دعوة للمشاركة في مهمة {{taskId}}” — النص: “{{message}}”

اسم: task_invite — قناة: whatsapp — النص: “{{message}} (مهمة: {{taskId}})”

أو عدّل ملف القوالب مباشرةً (إن أردت ذلك أخبرني أجهّز لك TXT يحقنهم تلقائيًا).

6) كيف أدمجها داخل صفحة المهام الحالية؟
في صفحة عرض/تحرير المهمة الواحدة (داخل /admin/tasks حيث يظهر محرر المهمة):

في أعلى المحرر بجانب عنوان المهمة:

import TaskQuickActions from "@/components/tasks/TaskQuickActions";
import TaskExportButtons from "@/components/tasks/TaskExportButtons";
import TaskInvitePanel from "@/components/tasks/TaskInvitePanel";

// داخل JSX للمهمة المحددة currentTask:
<TaskQuickActions
  taskId={currentTask.id}
  status={currentTask.status}
  priority={currentTask.priority}
  onChanged={reloadTask}
/>

<div className="mt-2">
  <TaskExportButtons taskId={currentTask.id} />
</div>

<div className="mt-4">
  <TaskInvitePanel taskId={currentTask.id} onDone={reloadTask} />
</div>
استبدل currentTask وreloadTask بما عندك (الدالة التي تعيد تحميل المهمة بعد التعديل).

جاهز نكمّل؟
إذا تحب، الخطوة التالية على نفس صفحة المهام:

تلوين زر الحالة ديناميكيًا حسب الأولوية (الألوان التي اعتمدناها).

فلاتر متقدّمة (حسب الفئة/المكلّف/التسميات/الحالة) مع حفظ آخر اختيار محليًا.

طباعة PDF تشمل المحادثة والمرفقات (لو أردتها الآن أضيف لك API دمج مع مولّد PDF لديك وواجهة “خيارات التصدير”).

قل لي كيف تحب نرتّب الأولويات داخل الـ/ admin/tasks، وأنا أكمّل عليها مباشرةً.

أنت قلت:
(اختياري) إضافة قوالب جاهزة للدعوات

 إضاف فورًا، افتح /admin/notifications وأضف قالبين:

اسم: task_invite — قناة: email — موضوع: “دعوة للمشاركة في مهمة {{taskId}}” — النص: “{{message}}”

اسم: task_invite — قناة: whatsapp — النص: “{{message}} (مهمة: {{taskId}})”

تلوين زر الحالة ديناميكيًا حسب الأولوية (الألوان التي اعتمدناها).

فلاتر متقدّمة (حسب الفئة/المكلّف/التسميات/الحالة) مع حفظ آخر اختيار محليًا.

طباعة PDF تشمل المحادثة والمرفقات (لو أردتها الآن أضيف لك API دمج مع مولّد PDF لديك وواجهة “خيارات التصدير”).
قال ChatGPT:
عبد الحميد — تمام! نرجّع التركيز كله على الـمهام وننفّذ لك البنود الأربعة الآن، بصيغة TXT قابلة للنسخ:

قوالب إشعارات جاهزة task_invite (email/whatsapp).

زر/شارة حالة ملوّن حسب الأولوية (منخفضة=أخضر، متوسطة=كهرماني، مرتفعة=برتقالي، عاجلة=أحمر).

شريط فلاتر متقدّم مع حفظ الاختيارات محليًا.

PDF للمهمة يتضمن المحادثة والمرفقات + واجهة “خيارات التصدير”.

انسخ كل قسم إلى ملفه، وعدّل مسارات الاستيراد لو كنت لا تستخدم alias @/.

1) قوالب إشعار task_invite (زرع فوري)
TXT: src/pages/api/admin/notifications/seed-task-invite.ts

/**
 * GET /api/admin/notifications/seed-task-invite
 * يضيف/يحدّث قالبين task_invite (email/whatsapp) إن لم يكونا موجودين.
 */
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
    upsert({
      channel: "email",
      name: "task_invite",
      description: "دعوة للمشاركة في مهمة (بريد)",
      lang: "ar",
      enabled: true,
      subject: "دعوة للمشاركة في مهمة {{taskId}}",
      body: "{{message}}",
      variables: [{ name:"taskId", required:true }, { name:"message", required:true }],
    });
    upsert({
      channel: "whatsapp",
      name: "task_invite",
      description: "دعوة للمشاركة في مهمة (واتساب)",
      lang: "ar",
      enabled: true,
      body: "{{message}} (مهمة: {{taskId}})",
      variables: [{ name:"taskId", required:true }, { name:"message", required:true }],
    });
    writeAll(arr);
    return res.status(200).json({ ok:true, count: arr.length });
  } catch (e:any) {
    console.error(e); return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
بعد التشغيل، افتح: /api/admin/notifications/seed-task-invite مرة واحدة.

2) شارة حالة ملوّنة حسب الأولوية
