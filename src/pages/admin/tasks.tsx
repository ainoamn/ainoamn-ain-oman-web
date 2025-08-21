// src/pages/admin/tasks.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { useI18n } from "@/lib/i18n";

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "open" | "in_progress" | "done";

type Message = { id: string; by: string; text: string; ts: string };
type Attachment = { name: string; type: string; dataUrl: string };

type Task = {
  id: string; // AO-T-######
  title: string;
  priority: Priority;
  status: Status;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  dueDate?: string;  // ISO
  assignees?: string[];
  labels?: string[];
  messages: Message[];
  attachments: Attachment[];
};

function nextSerial(existing: Task[]): string {
  const prefix = "AO-T-";
  const nums = existing
    .map((t) => ((t.id || "").startsWith(prefix) ? Number((t.id || "").slice(prefix.length)) : 0))
    .filter((n) => Number.isFinite(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `${prefix}${String(max + 1).padStart(6, "0")}`;
}

function loadTasksSafe(): Task[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("ao_tasks");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem("ao_tasks");
    return [];
  }
}
function saveTasksSafe(list: Task[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("ao_tasks", JSON.stringify(list));
  } catch {}
}

function priorityBadge(p: Priority): string {
  switch (p) {
    case "low": return "bg-green-100 text-green-800";
    case "medium": return "bg-yellow-100 text-yellow-800";
    case "high": return "bg-orange-100 text-orange-800";
    case "urgent": return "bg-red-100 text-red-800";
  }
}

export default function AdminTasksPage() {
  // i18n من الملف المركزي
  const _i18n = (useI18n() as any) || {};
  const t = (k: string, def: string) => {
    try { const v = _i18n?.t?.(k); return typeof v === "string" && v ? v : def; }
    catch { return def; }
  };
  const lang: string = _i18n?.lang || "ar";
  const setLang = (l: string) => _i18n?.setLang?.(l);
  const dir: "rtl" | "ltr" = _i18n?.dir || (["ar","fa","ur"].includes(lang) ? "rtl" : "ltr");
  const SUPPORTED: string[] = _i18n?.SUPPORTED_LANGS || ["ar","en","fr","hi","fa","ur"];

  const [view, setView] = useState<"list" | "board">("list");
  const [q, setQ] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<Task | null>(null);

  // حقول الإنشاء (متحكم بها)
  const [newTitle, setNewTitle] = useState("");
  const [newPrio, setNewPrio] = useState<Priority>("medium");
  const [newDue, setNewDue] = useState<string>("");

  const [warn, setWarn] = useState<string>("");

  useEffect(() => { setTasks(loadTasksSafe()); }, []);
  useEffect(() => { saveTasksSafe(tasks); }, [tasks]);

  const filtered = useMemo(() => {
    const base = q.trim().toLowerCase();
    return base
      ? tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(base) ||
            t.id.toLowerCase().includes(base) ||
            (t.labels || []).some((L) => L.toLowerCase().includes(base))
        )
      : tasks;
  }, [q, tasks]);

  const grouped = useMemo(
    () => ({
      open: filtered.filter((t) => t.status === "open"),
      in_progress: filtered.filter((t) => t.status === "in_progress"),
      done: filtered.filter((t) => t.status === "done"),
    }),
    [filtered]
  );

  function createTask() {
    const title = newTitle.trim();
    if (!title) {
      setWarn(t("tasks.requiredTitle", "أدخل عنوان المهمة"));
      return;
    }
    const now = new Date().toISOString();
    const task: Task = {
      id: nextSerial(tasks),
      title,
      priority: newPrio,
      status: "open",
      createdAt: now,
      updatedAt: now,
      dueDate: newDue ? new Date(newDue).toISOString() : undefined,
      messages: [],
      attachments: [],
      assignees: [],
      labels: [],
    };
    setTasks((prev) => [task, ...prev]);
    setSelected(task);
    setNewTitle("");
    setNewPrio("medium");
    setNewDue("");
    setWarn("");
  }

  function updateTask(partial: Partial<Task>) {
    if (!selected) return;
    const updated = { ...selected, ...partial, updatedAt: new Date().toISOString() } as Task;
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelected(updated);
  }

  function addMessage(text: string, by = "admin") {
    if (!selected || !text.trim()) return;
    const nextIndex = (selected.messages.length + 1).toString();
    const msg: Message = { id: nextIndex, by, text, ts: new Date().toISOString() };
    updateTask({ messages: [...selected.messages, msg] });
  }

  function addAttachment(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const att: Attachment = { name: file.name, type: file.type, dataUrl: reader.result as string };
      updateTask({ attachments: [...(selected?.attachments || []), att] });
    };
    reader.readAsDataURL(file);
  }

  function exportICS(task: Task) {
    const dtstamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dtstart = task.dueDate ? new Date(task.dueDate) : new Date();
    const y = dtstart.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Ain Oman//Tasks//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${task.id}@ain-oman`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${y}`,
      `SUMMARY:${task.title}`,
      `DESCRIPTION:Priority=${task.priority}; Status=${task.status}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${task.id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <main dir={dir} lang={lang} className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {/* Breadcrumbs */}
          <nav className="text-sm mb-4 flex items-center gap-3">
            <Link className="underline" href="/">{t("common.home","الرئيسية")}</Link>
            <span>/</span>
            <Link className="underline" href="/properties">{t("properties.title","العقارات")}</Link>
            <span>/</span>
            <span className="text-gray-500">{t("tasks.title","لوحة المهام")}</span>
          </nav>

          <header className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">{t("tasks.title","لوحة المهام")}</h1>
            <div className="flex items-center gap-2">
              <select
                value={lang}
                onChange={(e) => setLang?.(e.target.value)}
                className="border rounded px-2 py-1"
              >
                {SUPPORTED.map((L) => (
                  <option key={L} value={L}>{L}</option>
                ))}
              </select>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1 rounded border ${view === "list" ? "bg-gray-900 text-white" : "bg-white"}`}
              >
                {t("tasks.listView","قائمة")}
              </button>
              <button
                onClick={() => setView("board")}
                className={`px-3 py-1 rounded border ${view === "board" ? "bg-gray-900 text-white" : "bg-white"}`}
              >
                {t("tasks.boardView","لوح")}
              </button>
            </div>
          </header>

          {/* Create */}
          <div className="bg-white rounded-2xl shadow p-4 mb-6">
            <form
              className="grid grid-cols-1 md:grid-cols-5 gap-3"
              onSubmit={(e) => { e.preventDefault(); createTask(); }}
              autoComplete="off"
            >
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="border rounded px-3 py-2 md:col-span-2"
                placeholder={t("tasks.newTask","مهمة جديدة")}
                aria-label={t("tasks.newTask","مهمة جديدة")}
              />
              <select
                value={newPrio}
                onChange={(e) => setNewPrio(e.target.value as Priority)}
                className="border rounded px-3 py-2"
                aria-label={t("tasks.priority","الأولوية")}
              >
                <option value="low">{t("tasks.low","منخفضة")}</option>
                <option value="medium">{t("tasks.medium","متوسطة")}</option>
                <option value="high">{t("tasks.high","عالية")}</option>
                <option value="urgent">{t("tasks.urgent","عاجلة")}</option>
              </select>
              <input
                type="datetime-local"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
                className="border rounded px-3 py-2"
                aria-label={t("tasks.dueDate","تاريخ الاستحقاق")}
              />
              <button
                type="submit"
                onClick={createTask} // دعم إضافي في حال تعطّل onSubmit بسبب wrapper خارجي
                disabled={!newTitle.trim()}
                className={`rounded-xl px-4 py-2 text-white ${!newTitle.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{ background: "var(--brand-700, #115e59)" }}
                title={!newTitle.trim() ? t("tasks.requiredTitle","أدخل عنوان المهمة") : ""}
              >
                {t("tasks.create","إنشاء")}
              </button>
            </form>
            {warn && <div className="text-sm text-red-600 mt-2">{warn}</div>}
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("tasks.search","بحث...")}
              className="w-full border rounded px-3 py-2"
              aria-label={t("tasks.search","بحث...")}
            />
          </div>

          {/* List / Board */}
          {view === "list" ? (
            <div className="bg-white rounded-2xl shadow overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="text-start p-2">{t("tasks.id","#")}</th>
                    <th className="text-start p-2">{t("tasks.newTask","مهمة جديدة")}</th>
                    <th className="text-start p-2">{t("tasks.priority","الأولوية")}</th>
                    <th className="text-start p-2">{t("tasks.status","الحالة")}</th>
                    <th className="text-start p-2">{t("tasks.createdAt","تاريخ الإنشاء")}</th>
                    <th className="text-start p-2">{t("tasks.actions","إجراء")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="p-2">{it.id}</td>
                      <td className="p-2">{it.title}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded ${priorityBadge(it.priority)}`}>
                          {t(`tasks.${it.priority}`, it.priority)}
                        </span>
                      </td>
                      <td className="p-2">{t(`tasks.${it.status}`, it.status)}</td>
                      <td className="p-2">{new Date(it.createdAt).toLocaleString()}</td>
                      <td className="p-2">
                        <button
                          onClick={() => setSelected(it)}
                          className="px-3 py-1 rounded border"
                          style={{ borderColor: "var(--brand-700, #115e59)" }}
                        >
                          {t("tasks.view","فتح")}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td className="p-4 text-center text-gray-500" colSpan={6}>—</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["open","in_progress","done"] as Status[]).map((col) => (
                <div key={col} className="bg-white rounded-2xl shadow p-3">
                  <div className="font-semibold mb-2">{t(`tasks.${col}`, col)}</div>
                  <div className="space-y-2">
                    {grouped[col].map((card) => (
                      <div
                        key={card.id}
                        className="border rounded-xl p-3 cursor-pointer hover:shadow"
                        onClick={() => setSelected(card)}
                        style={{ borderColor: "var(--brand-700, #115e59)" }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{card.title}</div>
                          <span className={`text-xs px-2 py-1 rounded ${priorityBadge(card.priority)}`}>
                            {t(`tasks.${card.priority}`, card.priority)}
                          </span>
                        </div>
                        {card.dueDate && (
                          <div className="text-xs text-gray-600 mt-1">
                            {t("tasks.dueDate","تاريخ الاستحقاق")}: {new Date(card.dueDate).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                    {!grouped[col].length && <div className="text-sm text-gray-400">—</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Drawer / Modal */}
          {selected && (
            <div className="fixed inset-0 bg-black/30 flex items-end md:items-center justify-center z-50">
              <div className="bg-white w-full md:max-w-3xl rounded-t-2xl md:rounded-2xl shadow-xl p-4 max-h-[85vh] overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold">
                    {selected.title} <span className="text-gray-400">({selected.id})</span>
                  </div>
                  <button onClick={() => setSelected(null)} className="px-3 py-1 rounded border">
                    {t("common.close","إغلاق")}
                  </button>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div>
                    <label className="text-xs text-gray-600">{t("tasks.priority","الأولوية")}</label>
                    <select
                      value={selected.priority}
                      onChange={(e) => updateTask({ priority: e.target.value as Priority })}
                      className="w-full border rounded px-2 py-1"
                    >
                      <option value="low">{t("tasks.low","منخفضة")}</option>
                      <option value="medium">{t("tasks.medium","متوسطة")}</option>
                      <option value="high">{t("tasks.high","عالية")}</option>
                      <option value="urgent">{t("tasks.urgent","عاجلة")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">{t("tasks.status","الحالة")}</label>
                    <select
                      value={selected.status}
                      onChange={(e) => updateTask({ status: e.target.value as Status })}
                      className="w-full border rounded px-2 py-1"
                    >
                      <option value="open">{t("tasks.open","مفتوحة")}</option>
                      <option value="in_progress">{t("tasks.in_progress","قيد التنفيذ")}</option>
                      <option value="done">{t("tasks.done","منجزة")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">{t("tasks.dueDate","تاريخ الاستحقاق")}</label>
                    <input
                      type="datetime-local"
                      value={selected.dueDate ? new Date(selected.dueDate).toISOString().slice(0, 16) : ""}
                      onChange={(e) =>
                        updateTask({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })
                      }
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => exportICS(selected)}
                      className="w-full rounded-xl px-3 py-2 text-white"
                      style={{ background: "var(--brand-600, #14b8a6)" }}
                    >
                      {t("tasks.exportICS","تصدير ICS")}
                    </button>
                  </div>
                </div>

                {/* Assignees + Labels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <TokenInput
                    label={t("tasks.assignees","المكلّفون")}
                    tokens={selected.assignees || []}
                    onAdd={(val) => updateTask({ assignees: [...(selected.assignees || []), val] })}
                    onRemove={(i) => {
                      const next = [...(selected.assignees || [])];
                      next.splice(i, 1);
                      updateTask({ assignees: next });
                    }}
                  />
                  <TokenInput
                    label={t("tasks.labels","التصنيفات")}
                    tokens={selected.labels || []}
                    onAdd={(val) => updateTask({ labels: [...(selected.labels || []), val] })}
                    onRemove={(i) => {
                      const next = [...(selected.labels || [])];
                      next.splice(i, 1);
                      updateTask({ labels: next });
                    }}
                  />
                </div>

                {/* Attachments */}
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">{t("tasks.addAttachment","مرفقات")}</div>
                  <input
                    type="file"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) addAttachment(f);
                    }}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selected.attachments || []).map((a, idx) => (
                      <a key={idx} href={a.dataUrl} download={a.name} className="text-xs underline">
                        {a.name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Thread */}
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">{t("tasks.messages","المراسلات")}</div>
                  <div className="space-y-2 mb-2 max-h-60 overflow-auto border rounded p-2">
                    {(selected.messages || []).map((m) => (
                      <div key={m.id} className="border rounded p-2">
                        <div className="text-xs text-gray-500 flex items-center justify-between">
                          <span>#{m.id} — {m.by}</span>
                          <span>{new Date(m.ts).toLocaleString()}</span>
                        </div>
                        <div className="whitespace-pre-wrap">{m.text}</div>
                      </div>
                    ))}
                    {!selected.messages.length && <div className="text-sm text-gray-400">—</div>}
                  </div>
                  <SendBox onSend={(text) => addMessage(text, "admin")} sendLabel={t("tasks.send","إرسال")} />
                </div>

                {/* Footer actions */}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => window.print()} className="px-4 py-2 rounded-xl border">
                    {t("tasks.print","طباعة")}
                  </button>
                  <button
                    onClick={() => { updateTask({}); setSelected(null); }}
                    className="px-4 py-2 rounded-2xl text-white"
                    style={{ background: "var(--brand-700, #115e59)" }}
                  >
                    {t("common.save","حفظ")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}

function TokenInput({
  label, tokens, onAdd, onRemove,
}: { label: string; tokens: string[]; onAdd: (v: string) => void; onRemove: (i: number) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="flex gap-2">
        <input ref={ref} className="border rounded px-2 py-1 flex-1" />
        <button
          type="button"
          onClick={() => {
            const v = (ref.current?.value || "").trim();
            if (v) { onAdd(v); if (ref.current) ref.current.value = ""; }
          }}
          className="px-3 py-1 rounded border"
        >
          +
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {tokens.map((t, i) => (
          <span key={i} className="text-xs bg-gray-100 rounded px-2 py-1">
            {t} <button className="ms-1" onClick={() => onRemove(i)} type="button">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

function SendBox({ onSend, sendLabel }: { onSend: (text: string) => void; sendLabel: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="flex items-start gap-2">
      <textarea
        ref={ref}
        className="border rounded px-2 py-2 flex-1"
        rows={3}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            const v = (ref.current?.value || "").trim();
            if (v) { onSend(v); if (ref.current) ref.current.value = ""; }
          }
        }}
      />
      <button
        type="button"
        onClick={() => {
          const v = (ref.current?.value || "").trim();
          if (v) { onSend(v); if (ref.current) ref.current.value = ""; }
        }}
        className="px-3 py-2 rounded-xl text-white"
        style={{ background: "var(--brand-600, #14b8a6)" }}
      >
        {sendLabel}
      </button>
    </div>
  );
}
