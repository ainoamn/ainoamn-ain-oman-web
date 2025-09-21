// src/app/admin/tasks/[id]/page.tsx
"use client";
// ملاحظة: هذه الصفحة تعيد استخدام نفس الكود كما في Pages Router.
// إذا رغبت، يمكنك لاحقًا استخراج المكوّن إلى src/components/TaskDetails.tsx واستيراده من الطريقتين.
// src/pages/admin/tasks/[id].tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";
import { useI18n } from "@/lib/i18n";

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "open" | "in_progress" | "blocked" | "done";
type ThreadItem = { id: string; author: string; text: string; at: string };
type LinkedEntity = { type: string; id: string };
type Attachment = { id: string; name: string; type?: string; size?: number; uploadedAt: string };
type Participant = { id: string; name: string; email?: string; whatsapp?: string; invitedAt: string };

type Task = {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  assignees?: string[];
  thread: ThreadItem[];
  participants?: Participant[];
  attachments?: Attachment[];
  calendarEvent?: { id: string; title: string; start?: string; end?: string; createdAt: string };
  link?: LinkedEntity;
};

const PRIORITIES: Priority[] = ["low","medium","high","urgent"];
const priorityLabels: Record<Priority, string> = { low: "منخفضة", medium: "متوسطة", high: "عالية", urgent: "عاجلة" };
const STATUS: Status[] = ["open","in_progress","blocked","done"];
const statusLabels: Record<Status,string> = { open: "مفتوحة", in_progress: "قيد التنفيذ", blocked: "معلقة", done: "مكتملة" };

function tt(k: string, def: string, i18n: any) { try { if (i18n?.t) { const v = i18n.t(k); if (typeof v === "string" && v && v !== k) return v; } } catch {} return def; }

export default function Page({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params?.id as string | undefined;
  const i18n = useI18n?.() || null;
  const t = (k: string, def: string) => tt(k, def, i18n);
  const lang = (i18n as any)?.lang || "ar";
  const isRTL = ["ar","fa","ur"].includes(lang);

  const [item, setItem] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [type, setType] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");
  const [apiMissing, setApiMissing] = useState<boolean>(false);

  // Auto-refresh every 10s to mimic live chat
  useEffect(() => {
    if (!id) return;
    const h = setInterval(() => { loadRef.current?.(); }, 10000);
    return () => clearInterval(h);
  }, [id]);

  const loadRef = React.useRef<() => void | null>(null);
  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true); setError(null); setApiMissing(false);
      const r = await fetch(`/api/tasks/${encodeURIComponent(id)}`);
      if (r.status === 404) {
        const create = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patch: { title: `مهمة ${id}`, status: "open", priority: "medium" } })
        });
        if (create.ok) {
          const j = await create.json();
          setItem(j); setType(j?.link?.type || ""); setTargetId(j?.link?.id || ""); return;
        } else if (create.status === 404) {
          setApiMissing(true);
          const now = new Date().toISOString();
          const local: Task = { id, title: `مهمة ${id}`, description: "", priority: "medium", status: "open", createdAt: now, updatedAt: now, thread: [], attachments: [], participants: [] } as Task;
          setItem(local); return;
        } else {
          throw new Error(`HTTP ${create.status}`);
        }
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setItem(j);
      setType(j?.link?.type || ""); setTargetId(j?.link?.id || "");
    } catch (e: any) {
      setError(e?.message || "خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [id]);
  loadRef.current = load;
  useEffect(() => { load(); }, [load]);

  const handlePatch = useCallback(async (patch: Partial<Task>) => {
    if (apiMissing) { alert("واجهة API غير مثبتة بعد؛ تم تعطيل الحفظ مؤقتًا."); return; }
    if (!id) return;
    const r = await fetch(`/api/tasks/${encodeURIComponent(id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patch }) });
    if (r.ok) {
      const j = await r.json();
      setItem(j);
      window.dispatchEvent(new CustomEvent("task:updated", { detail: { id, patch } }));
    } else {
      alert(t("tasks.save_failed","تعذّر الحفظ"));
    }
  }, [id, apiMissing]);

  const handlePriorityChange = useCallback(async (p: Priority) => { await handlePatch({ priority: p }); }, [handlePatch]);
  const handleStatusChange = useCallback(async (s: Status) => { await handlePatch({ status: s }); }, [handlePatch]);

  const handlePrint = useCallback(() => { if (!id) return; window.open(`/api/tasks/${encodeURIComponent(id)}/print`, "_blank"); }, [id]);

  const handleAddToCalendar = useCallback(async () => {
    if (apiMissing) { alert("واجهة API غير مثبتة بعد؛ تم تعطيل التقويم مؤقتًا."); return; }
    if (!id) return;
    const r = await fetch(`/api/calendar/add`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId: id, start: item?.dueDate, end: item?.dueDate }) });
    if (!r.ok) return alert(t("tasks.calendar_failed","تعذّر الإضافة للتقويم"));
    alert(t("tasks.calendar_ok","تمت إضافة المهمة إلى تقويم الموقع."));
    await load();
  }, [id, item?.dueDate, load, apiMissing]);

  const handleSend = useCallback(async () => {
    if (apiMissing) { alert("واجهة API غير مثبتة بعد؛ تم تعطيل الإرسال مؤقتًا."); return; }
    if (!id) return;
    const to = prompt(t("tasks.prompt_destination","أدخل البريد أو رقم واتساب (مع رمز البلد):"));
    if (!to) return;
    try {
      setSending(true);
      const payload = { channel: to.includes("@") ? "email" : "whatsapp", to, text: `${t("tasks.details","تفاصيل المهمة")}: ${item?.title}\n${typeof window !== "undefined" ? location.origin : ""}/admin/tasks/${id}` };
      const r = await fetch(`/api/tasks/${encodeURIComponent(id)}/notify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error(t("tasks.send_failed","فشل الإرسال"));
      alert(t("tasks.send_ok","تم الإرسال بنجاح"));
      await load();
    } catch (e: any) {
      alert(e?.message || t("tasks.send_failed","تعذّر الإرسال"));
    } finally {
      setSending(false);
    }
  }, [id, item?.title, load, apiMissing]);

  const [invName, setInvName] = useState(""); const [invEmail, setInvEmail] = useState(""); const [invWA, setInvWA] = useState("");
  const invite = useCallback(async () => {
    if (apiMissing) { alert("واجهة API غير مثبتة بعد؛ تم تعطيل الدعوات مؤقتًا."); return; }
    if (!id) return;
    if (!invName.trim()) return alert("اكتب الاسم على الأقل");
    const r = await fetch(`/api/tasks/${encodeURIComponent(id)}/invite`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: invName.trim(), email: invEmail.trim() || undefined, whatsapp: invWA.trim() || undefined }) });
    if (!r.ok) return alert("تعذّر إرسال الدعوة");
    setInvName(""); setInvEmail(""); setInvWA(""); await load();
  }, [id, invName, invEmail, invWA, load, apiMissing]);

  const [uploading, setUploading] = useState(false);
  const onFiles = useCallback(async (files: FileList | null) => {
    if (apiMissing) { alert("واجهة API غير مثبتة بعد؛ تم تعطيل الرفع مؤقتًا."); return; }
    if (!id || !files || !files.length) return;
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        const buf = await f.arrayBuffer();
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        const r = await fetch(`/api/tasks/${encodeURIComponent(id)}/attachments`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: f.name, type: f.type, size: f.size, contentBase64: b64 })
        });
        if (!r.ok) {
          const e = await r.json().catch(()=>({}));
          alert(`فشل رفع ${f.name}: ${e?.error || r.status}`);
        }
      }
      await load();
    } finally { setUploading(false); }
  }, [id, load, apiMissing]);

  const removeAttachment = useCallback(async (attId: string) => {
    if (apiMissing) { alert("واجهة API غير مثبتة بعد؛ تم تعطيل الحذف مؤقتًا."); return; }
    if (!id) return;
    const r = await fetch(`/api/tasks/${encodeURIComponent(id)}/attachments`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attId }) });
    if (!r.ok) return alert("تعذّر حذف المرفق");
    await load();
  }, [id, load, apiMissing]);

  const [type1, setType1] = useState(item?.link?.type || ""); const [targetId1, setTargetId1] = useState(item?.link?.id || "");
  useEffect(() => { setType1(item?.link?.type || ""); setTargetId1(item?.link?.id || ""); }, [item?.link?.type, item?.link?.id]);
  const saveLink = useCallback(async () => {
    if (apiMissing) { alert("واجهة API غير مثبتة بعد؛ تم تعطيل الربط مؤقتًا."); return; }
    if (!id) return;
    if (!type1 || !targetId1) return alert(t("tasks.link_required","أدخل نوع الكيان ومعرّفه"));
    const r = await fetch(`/api/tasks/${encodeURIComponent(id)}/link`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: type1, targetId: targetId1 }) });
    if (!r.ok) return alert(t("tasks.link_failed","تعذّر ربط المهمة بالكيان"));
    alert(t("tasks.link_ok","تم الربط بنجاح")); await load();
  }, [id, type1, targetId1, load, apiMissing]);

  if (!id) return <div className="p-6">{t("tasks.no_id","لا يوجد معرّف للمهمة")}</div>;
  if (loading) return <div className="p-6">{t("tasks.loading","جارٍ التحميل…")}</div>;
  if (error) return <div className="p-6 text-red-600">{t("tasks.error_label","حدث خطأ")}: {error}</div>;
  if (!item) return <div className="p-6">{t("tasks.not_found","لم يتم العثور على المهمة")}</div>;

  return (
    <Layout>
      <div className={`p-4 md:p-6 space-y-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
        {apiMissing && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 text-amber-800 p-3 text-sm">
            تنبيه: لم يتم العثور على مسار واجهة برمجة التطبيقات الخاصة بالمهام. 
            رجاءً انسخ مجلد <code>/src/pages/api/tasks</code> بالكامل ومجلد <code>/src/server</code> من الحزمة المرفقة.
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{t("tasks.title","المهام / تفاصيل مهمة")}</h1>
            <div className="text-sm text-gray-500">{t("tasks.task_id","معرّف المهمة")} : {item.id}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={()=>setPreviewOpen(true)} className="px-3 py-2 rounded-lg border">{t("tasks.preview","معاينة")}</button>
            <button onClick={handleSend} disabled={sending || apiMissing} className="px-3 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-60">
              {sending ? t("tasks.sending","جارٍ الإرسال…") : t("tasks.send","إرسال")}
            </button>
            <button onClick={handlePrint} className="px-3 py-2 rounded-lg border">{t("tasks.print","طباعة / PDF")}</button>
            <button onClick={handleAddToCalendar} disabled={apiMissing} className="px-3 py-2 rounded-lg border">{t("tasks.add_calendar","إضافة للتقويم")}</button>
            <a href={`/api/tasks/${encodeURIComponent(id)}/ics`} className={`px-3 py-2 rounded-lg border ${apiMissing ? "pointer-events-none opacity-50" : ""}`} target="_blank" rel="noreferrer">ICS</a>
          </div>
        </div>

        <section className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
          <div className="2xl:col-span-2 space-y-4">

            {/* Details card */}
            <div className="rounded-2xl border p-4 space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">{t("tasks.field_title","العنوان")}</div>
                  <div className="text-lg font-semibold">{item.title}</div>
                </div>
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">{t("tasks.field_priority","الأولوية")}</div>
                    <select className="border rounded-lg px-3 py-2" value={item.priority} onChange={e => handlePriorityChange(e.target.value as Priority)}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{priorityLabels[p]}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">{t("tasks.field_status","الحالة")}</div>
                    <div className="flex gap-2 flex-wrap">
                      {STATUS.map(s => (
                        <button key={s} onClick={() => handleStatusChange(s)} className={`px-3 py-2 rounded-lg border ${item.status === s ? "bg-gray-900 text-white" : ""}`}>
                          {statusLabels[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><div className="text-gray-500">{t("tasks.created","تاريخ الإنشاء")}</div><div dir="ltr">{item.createdAt}</div></div>
                <div><div className="text-gray-500">{t("tasks.updated","آخر تحديث")}</div><div dir="ltr">{item.updatedAt}</div></div>
                <div><div className="text-gray-500">{t("tasks.due","تاريخ الاستحقاق")}</div><div dir="ltr">{item.dueDate || "—"}</div></div>
                <div><div className="text-gray-500">{t("tasks.calendar_event","الحدث في التقويم")}</div><div>{item.calendarEvent ? "✓" : "—"}</div></div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-gray-500">{t("tasks.description","الوصف")}</div>
                <div className="whitespace-pre-wrap">{item.description || "—"}</div>
              </div>
            </div>

            {/* Chat thread */}
            <div className="rounded-2xl border p-4 space-y-4">
              <h3 className="font-semibold">{t("tasks.thread","المحادثة")}</h3>
              <div className="space-y-3">
                {item.thread?.length ? item.thread.map(m => (
                  <div key={m.id} className={`flex ${m.author === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${m.author === "admin" ? "bg-indigo-600 text-white" : "bg-gray-100"} `}>
                      <div className="text-[11px] opacity-80 mb-1">{m.author} • <span dir="ltr">{m.at}</span></div>
                      <div className="whitespace-pre-wrap">{m.text}</div>
                    </div>
                  </div>
                )) : <div className="text-sm text-gray-500">{t("tasks.no_msgs","لا توجد رسائل بعد")}</div>}
              </div>
              <SendMessage taskId={item.id} onSent={load} disabled={apiMissing} />
            </div>

            {/* Attachments */}
            <div className="rounded-2xl border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">المرفقات</h3>
                <label className={`px-3 py-2 rounded-lg border cursor-pointer ${apiMissing ? "pointer-events-none opacity-50" : ""}`}>
                  {uploading ? "جارٍ الرفع…" : "رفع ملفات"}
                  <input type="file" multiple className="hidden" onChange={(e)=>onFiles(e.target.files)} disabled={apiMissing || uploading} />
                </label>
              </div>
              <div className="space-y-2 text-sm">
                {item.attachments?.length ? item.attachments.map(a => (
                  <div key={a.id} className="flex items-center justify-between border rounded-lg p-2">
                    <a className="text-indigo-600 underline break-all" href={`/api/tasks/${encodeURIComponent(item.id)}/file/${a.id}`} target="_blank" rel="noreferrer">{a.name}</a>
                    <button onClick={()=>removeAttachment(a.id)} className={`px-2 py-1 rounded-lg border ${apiMissing ? "pointer-events-none opacity-50" : ""}`}>حذف</button>
                  </div>
                )) : <div className="text-gray-500">لا توجد مرفقات بعد</div>}
              </div>
            </div>

          </div>

          {/* Side column */}
          <aside className="space-y-4">
            {/* Invite participants */}
            <div className="rounded-2xl border p-4 space-y-3">
              <h3 className="font-semibold">دعوة/مشاركة المهمة</h3>
              <div className="grid grid-cols-1 gap-2">
                <input className="border rounded-lg px-3 py-2" placeholder="الاسم" value={invName} onChange={e=>setInvName(e.target.value)} />
                <input className="border rounded-lg px-3 py-2" placeholder="البريد (اختياري)" value={invEmail} onChange={e=>setInvEmail(e.target.value)} />
                <input className="border rounded-lg px-3 py-2" placeholder="واتساب مع رمز البلد (اختياري)" value={invWA} onChange={e=>setInvWA(e.target.value)} />
                <button onClick={invite} className={`px-3 py-2 rounded-lg border ${apiMissing ? "pointer-events-none opacity-50" : ""}`}>إرسال دعوة</button>
              </div>
              <div className="text-sm text-gray-600">
                {item.participants?.length ? (
                  <div className="space-y-1">
                    {item.participants.map(p => <div key={p.id}>• {p.name} {p.email ? `(${p.email})` : ""} {p.whatsapp ? `| ${p.whatsapp}` : ""}</div>)}
                  </div>
                ) : "لا يوجد مشاركون بعد"}
              </div>
            </div>

            {/* Link task */}
            <div className="rounded-2xl border p-4 space-y-3">
              <h3 className="font-semibold">{t("tasks.link_title","ربط المهمة بحدث/كيان")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <input className="border rounded-lg px-3 py-2" placeholder={t("tasks.entity_type","نوع الكيان (مثال: property)")} value={type1} onChange={e=>setType1(e.target.value)} />
                <input className="border rounded-lg px-3 py-2" placeholder={t("tasks.entity_id","معرّف الكيان")} value={targetId1} onChange={e=>setTargetId1(e.target.value)} />
              </div>
              <div className="text-sm text-gray-600">{item.link ? `${item.link.type}#${item.link.id}` : t("tasks.no_link","لا يوجد ارتباط")}</div>
              <button onClick={saveLink} disabled={apiMissing} className="px-3 py-2 rounded-lg border">{t("tasks.save_link","حفظ الربط")}</button>
            </div>

            {/* Quick links */}
            <div className="rounded-2xl border p-4 space-y-2">
              <div className="text-sm text-gray-500">{t("tasks.quick_links","روابط سريعة")}</div>
              <a className="text-indigo-600 underline" href={`/admin/tasks/${encodeURIComponent(item.id)}`}>{t("tasks.task_link","رابط المهمة")}</a>
              <a className={`text-indigo-600 underline ${apiMissing ? "pointer-events-none opacity-50" : ""}`} href={`/api/tasks/${encodeURIComponent(item.id)}/print`} target="_blank" rel="noreferrer">{t("tasks.printable","نسخة للطباعة")}</a>
              <a className={`text-indigo-600 underline ${apiMissing ? "pointer-events-none opacity-50" : ""}`} href={`/api/tasks/${encodeURIComponent(item.id)}/ics`} target="_blank" rel="noreferrer">ICS</a>
            </div>
          </aside>
        </section>

        {/* Preview modal */}
        {previewOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white w-[min(900px,92vw)] max-h-[85vh] overflow-auto rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{t("tasks.preview_title","معاينة الإرسال")}</h3>
                <button onClick={()=>setPreviewOpen(false)} className="px-3 py-1 rounded-lg border">{t("tasks.close","إغلاق")}</button>
              </div>
              <div className="space-y-3 text-sm">
                <div><span className="text-gray-500">{t("tasks.field_title","العنوان")}:</span> {item?.title}</div>
                <div className="text-gray-500">{t("tasks.description","الوصف")}:</div>
                <div>{item?.description || "—"}</div>
                <div className="text-gray-500">{t("tasks.link","الرابط")}:</div>
                <div className="font-mono break-all">
                  {typeof window !== "undefined" ? `${location.origin}/admin/tasks/${id}` : `/admin/tasks/${id}`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function SendMessage({ taskId, onSent, disabled }: { taskId: string; onSent: () => void; disabled?: boolean }) {
  const [by, setBy] = useState("admin");
  const [text, setText] = useState("");

  const send = async () => {
    if (disabled) return alert("واجهة API غير مثبتة بعد؛ تم تعطيل الإرسال مؤقتًا.");
    if (!text.trim()) return;
    await fetch(`/api/tasks/${encodeURIComponent(taskId)}/thread`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ author: by, text: text.trim() }) });
    setText("");
    onSent();
  };

  return (
    <div className="flex gap-2">
      <input className="w-32 border rounded-lg px-3 py-2" placeholder="المرسل" value={by} onChange={(e)=>setBy(e.target.value)} />
      <input className="flex-1 border rounded-lg px-3 py-2" placeholder="أكتب ردًا…" value={text} onChange={(e)=>setText(e.target.value)} />
      <button onClick={send} className="px-3 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-60 hover:bg-indigo-700">إرسال</button>
    </div>
  );
}
