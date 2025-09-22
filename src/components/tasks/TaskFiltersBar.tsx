/**
 * TaskFiltersBar — فلاتر متقدّمة + حفظ آخر اختيار في localStorage
 * الاستخدام:
 * <TaskFiltersBar initial={saved} onChange={(filters)=>loadTasks(filters)} />
 */
import { useEffect, useMemo, useState } from "react";

export type TaskFilters = {
  q?: string;
  status?: string[];       // ["open","in_progress","done"]
  priorities?: string[];   // ["low","medium","high","urgent"]
  assignees?: string[];    // user ids/emails
  categories?: string[];   // names/ids
  labels?: string[];       // tags
};

const LS_KEY = "ao_task_filters_v1";
const BTN = "rounded-lg px-2 py-1 text-xs ring-1 ring-gray-200 hover:bg-gray-50";

export default function TaskFiltersBar({
  initial,
  onChange,
  options,
}: {
  initial?: TaskFilters;
  onChange: (f: TaskFilters) => void;
  options?: {
    assignees?: { id: string; name: string }[];
    categories?: string[];
    labels?: string[];
  };
}) {
  const [f, setF] = useState<TaskFilters>(initial || { status: ["open","in_progress"], priorities: [] });
//   useEffect(()=>{ // تحميل آخر اختيار إن لم تُمرره من الخارج
    if (initial) return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setF(JSON.parse(raw));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(()=>{
    onChange(f);
    try { localStorage.setItem(LS_KEY, JSON.stringify(f)); } catch {}
  }, [f, onChange]);

  const toggle = (key: keyof TaskFilters, value: string) => {
    setF(prev => {
      const arr = new Set([...(prev[key] as string[] || [])]);
      arr.has(value) ? arr.delete(value) : arr.add(value);
      return { ...prev, [key]: Array.from(arr) };
    });
  };

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-200 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          className="rounded-lg border border-gray-300 p-2"
          placeholder="بحث..."
          value={f.q || ""}
          onChange={(e)=>setF({ ...f, q: e.target.value })}
        />

//         {/* الحالة */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">الحالة:</span>
          {["open","in_progress","done"].map(s => (
            <button key={s} className={`${BTN} ${f.status?.includes(s) ? "bg-gray-50" : ""}`} onClick={()=>toggle("status", s)}>
              {s==="open"?"مفتوحة":s==="in_progress"?"قيد العمل":"منجزة"}
            </button>
          ))}
        </div>

//         {/* الأولوية */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">الأولوية:</span>
          {[
            ["low","منخفضة"],["medium","متوسطة"],["high","مرتفعة"],["urgent","عاجلة"],
          ].map(([v,l])=>(
            <button key={v} className={`${BTN} ${f.priorities?.includes(v) ? "bg-gray-50" : ""}`} onClick={()=>toggle("priorities", v)}>
              {l}
            </button>
          ))}
        </div>

//         {/* المكلّفون */}
        <div className="md:col-span-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">المكلّفون:</span>
          {(options?.assignees || []).map(u => (
            <button key={u.id} className={`${BTN} ${f.assignees?.includes(u.id) ? "bg-gray-50" : ""}`} onClick={()=>toggle("assignees", u.id)}>
              {u.name}
            </button>
          ))}
        </div>

//         {/* الفئات */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">الفئات:</span>
          {(options?.categories || []).map(c => (
            <button key={c} className={`${BTN} ${f.categories?.includes(c) ? "bg-gray-50" : ""}`} onClick={()=>toggle("categories", c)}>
              {c}
            </button>
          ))}
        </div>

//         {/* التسميات */}
        <div className="md:col-span-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">التسميات:</span>
          {(options?.labels || []).map(t => (
            <button key={t} className={`${BTN} ${f.labels?.includes(t) ? "bg-gray-50" : ""}`} onClick={()=>toggle("labels", t)}>
              #{t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button className={BTN} onClick={()=>setF({})}>مسح</button>
        <button className={BTN} onClick={()=>onChange(f)}>تطبيق</button>
      </div>
    </div>
  );
}
// دمج سريع داخل صفحة /admin/tasks لديك:

import TaskFiltersBar, { type TaskFilters } from "@/components/tasks/TaskFiltersBar";

function AdminTasksPage() {
  // ...
  const [filters, setFilters] = useState<TaskFilters>({});
  const load = async (f: TaskFilters) => {
//     // مثال: تحويل الفلاتر إلى باراميترات واستدعاء API /api/tasks
    const params = new URLSearchParams();
    if (f.q) params.set("q", f.q);
    if (f.status?.length) params.set("status", f.status.join(","));
    if (f.priorities?.length) params.set("priorities", f.priorities.join(","));
    if (f.assignees?.length) params.set("assignees", f.assignees.join(","));
    if (f.categories?.length) params.set("categories", f.categories.join(","));
    if (f.labels?.length) params.set("labels", f.labels.join(","));
    const r = await fetch(`/api/tasks?${params.toString()}`, { cache:"no-store" });
    // setTasks(await r.json());
  };

//   useEffect(()=>{ load(filters); }, []); // تحميل أولي

  return (
    <>
      <TaskFiltersBar
//         initial={undefined} // سيقرأ من localStorage
        options={{ assignees:[{id:"ali",name:"علي"},{id:"fatma",name:"فاطمة"}], categories:["صيانة","إيجارات","تحصيل"], labels:["مستعجل","خارجي","VIP"] }}
        onChange={(f)=>{ setFilters(f); load(f); }}
      />
//       {/* جدول/لوح المهام */}
    </>
  );
}
// إن أردت دعم الفلاتر في الـAPI، أضف قراءة للـquery params داخل /api/tasks لتصفية النتائج (إن لم تكن موجودة لديك).

// 4) PDF للمهمة (مع المحادثة والمرفقات) + “خيارات التصدير”
// 4.1 مولّد PDF بسيط (Node)
// يعتمد على pdfkit. إن لم تكن مثبتة:

npm i pdfkit @types/pdfkit
TXT: src/server/pdf/taskPdf.ts

/**
 * مولّد PDF للمهمة: يطبع المهمة + المحادثة + قائمة المرفقات (روابط)
 */
import PDFDocument from "pdfkit";
import { Readable } from "stream";

export type TaskForPdf = {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  assignees?: string[];
  labels?: string[];
  createdAt?: string;
  updatedAt?: string;
  thread?: { id: string; author: string; ts: string; text: string }[];
  attachments?: { id: string; name: string; url: string }[];
};

export function taskToPdfStream(task: TaskForPdf): Readable {
  const doc = new PDFDocument({ margin: 50 });
  const stream = doc as unknown as Readable;

  const H = (t: string) => { doc.moveDown(0.4).fontSize(14).fillColor("#111").text(t, { underline: false }); };
  const P = (t?: string) => { if (!t) return; doc.moveDown(0.2).fontSize(10).fillColor("#333").text(t); };
  const L = () => doc.moveDown(0.3).strokeColor("#ddd").lineWidth(1).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width-doc.page.margins.right, doc.y).stroke();

//   // الرأس
  doc.fontSize(18).fillColor("#0a0a0a").text(`Task ${task.id}: ${task.title}`, { align: "left" });
  P(`Status: ${task.status || "-" } • Priority: ${task.priority || "-" } • Category: ${task.category || "-" }`);
  P(`Assignees: ${(task.assignees||[]).join(", ") || "-"}`);
  P(`Labels: ${(task.labels||[]).join(", ") || "-"}`);
  P(`Created: ${task.createdAt || "-"} • Updated: ${task.updatedAt || "-"}`);
  L();

//   // الوصف
  H("الوصف");
  P(task.description || "-");
  L();

//   // المحادثة
  H("المحادثة");
  if (!task.thread || task.thread.length === 0) {
    P("— لا توجد رسائل —");
  } else {
    for (const m of task.thread) {
      P(`[${m.ts}] ${m.author}: ${m.text}`);
    }
  }
  L();

//   // المرفقات
  H("المرفقات");
  if (!task.attachments || task.attachments.length === 0) {
    P("— لا توجد مرفقات —");
  } else {
    for (const a of task.attachments) {
      P(`• ${a.name} — ${a.url}`);
    }
  }

  doc.end();
  return stream;
}
// 4.2 API الطباعة (يدعم خيارات includeThread/includeAttachments)
TXT: src/pages/api/tasks/[id]/print.ts

/**
 * GET /api/tasks/[id]/print?includeThread=1&includeAttachments=1
 * يُرجع PDF يعرض المهمة + المحادثة + المرفقات (روابط).
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { taskToPdfStream, type TaskForPdf } from "@/server/pdf/taskPdf";
import { readFileSync, existsSync } from "fs";
import path from "path";

// // مثال: إن كنت تخزن المهام في .data/tasks.json
function readTaskById(id: string): any | null {
  try {
    const file = path.join(process.cwd(), ".data", "tasks.json");
    if (!existsSync(file)) return null;
    const arr = JSON.parse(readFileSync(file, "utf8"));
    return (arr || []).find((t: any) => String(t.id) === String(id)) || null;
  } catch { return null; }
}

// // (اختياري) قراءة محادثة/مرفقات من ملفات منفصلة أو ضمن نفس الكائن
function readThreadForTask(t: any): any[] { return Array.isArray(t?.thread) ? t.thread : []; }
function readAttachmentsForTask(t: any): any[] {
//   // إن كنت تخزنها في t.attachments أو في ملف .data/task-attachments.json عدّل هذه الدالة
  return Array.isArray(t?.attachments) ? t.attachments : [];
}

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") { res.setHeader("Allow","GET"); return res.status(405).json({ error:"Method not allowed" }); }

    const id = String(req.query.id || "");
    const includeThread = String(req.query.includeThread || "1") !== "0";
    const includeAttachments = String(req.query.includeAttachments || "1") !== "0";

    const t = readTaskById(id);
    if (!t) return res.status(404).json({ error:"Task not found" });

    const payload: TaskForPdf = {
      id: t.id,
      title: t.title || "(بدون عنوان)",
      description: t.description || "",
      status: t.status || "open",
      priority: t.priority || "medium",
      category: t.category || "",
      assignees: t.assignees || [],
      labels: t.labels || [],
      createdAt: t.createdAt || "",
      updatedAt: t.updatedAt || "",
      thread: includeThread ? readThreadForTask(t).map((m:any)=>({
        id: m.id || "", author: m.author || "—", ts: m.ts || "", text: m.text || ""
      })) : [],
      attachments: includeAttachments ? readAttachmentsForTask(t).map((a:any)=>({
        id: a.id || "", name: a.name || "file", url: a.url || a.path || "#"
      })) : [],
    };

    const stream = taskToPdfStream(payload);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="task-${id}.pdf"`);
    // @ts-ignore
    stream.pipe(res);
  } catch (e:any) {
    console.error(e); return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
// 4.3 واجهة “خيارات التصدير” (تتحكم في المعلمات)
