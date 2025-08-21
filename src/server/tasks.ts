// src/server/tasks.ts
import { readJson, writeJson } from "@/server/fsdb";

// ————— أنواع وواجهات —————
export type ChecklistItem = { id: string; text: string; done: boolean };

export type TaskActivity = {
  id: string;
  type:
    | "create" | "update" | "status_change" | "comment" | "check" | "assign"
    | "priority_change" | "label_change" | "due_change" | "delete" | "subtask"
    | "invite" | "attach" | "link_change";
  by?: string;
  at: string;
  data?: any;
};

export type TaskAccessRole = "owner" | "editor" | "commenter" | "viewer";
export type TaskAccess = { user: string; role: TaskAccessRole }; // user = email أو رقم

export type TaskThreadMsg = { id: string; no: string; by?: string; at: string; text: string };

export type TaskLink = {
  type: "leasing" | "maintenance" | "rent" | "arrear" | "account" | "cheque" | "property" | "invoice" | "reservation";
  refId: string; // المعرّف/الرقم المرجعي
  title?: string;
};

export type Task = {
  id: string;
  serial: string;            // AO-T-000xxxx

  title: string;
  description?: string;

  // العلاقة/الهيكلة
  parentId?: string;         // مهام فرعية
  dependsOn?: string[];      // تبعيات

  // الحالة/الزمن
  status: "open" | "in_progress" | "blocked" | "done" | "canceled";
  priority: "low" | "medium" | "high" | "urgent";
  startDate?: string;        // ISO
  dueDate?: string;          // ISO
  reminders?: string[];      // ISO[]

  // التخصيص
  assignees?: string[];      // لاحقًا: userId
  watchers?: string[];
  labels?: string[];         // تسميات مرنة
  category?: string;         // فئة واحدة رئيسية (من قائمة الفئات)
  points?: number;

  // روابط بالنظام
  links?: TaskLink[];

  // تفاصيل إضافية
  checklist?: ChecklistItem[];
  commentsCount?: number;
  attachments?: { id: string; name: string; size: number; mime: string; url: string }[];

  // محادثة داخلية متسلسلة
  thread?: TaskThreadMsg[];  // (1), (1.1), (2)…

  // وصول/صلاحيات
  access?: TaskAccess[];

  // تتبّع
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  activity?: TaskActivity[];

  data?: any;
};

const FILE = "tasks";

// ————— مساعدات —————
function nowIso() { return new Date().toISOString(); }

function addActivity(t: Task, a: Omit<TaskActivity, "id" | "at">) {
  const act: TaskActivity = { id: `${Date.now()}-${Math.random()}`, at: nowIso(), ...a };
  t.activity = [act, ...(t.activity || [])];
}

async function nextSerial(entity: string) {
  // يستدعي خدمة الترقيم لدينا؛ مع بديل محلي عند التعذر
  const base = process.env.SEQ_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  try {
    const r = await fetch(`${base}/api/seq/next`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity })
    });
    const j = await r.json();
    if (r.ok && j?.serial) return String(j.serial);
  } catch {}
  const seq = await readJson<number>("seq-local-" + entity, 0);
  const n = seq + 1;
  await writeJson("seq-local-" + entity, n);
  return `${entity}-${String(n).padStart(7, "0")}`;
}

// ————— استعلام —————
export type TaskQuery = {
  q?: string;
  status?: Task["status"];
  priority?: Task["priority"];
  label?: string;
  assignee?: string;
  category?: string;
  dueBefore?: string;
  dueAfter?: string;
  parentId?: string | null; // null => المهام الجذرية
};

export async function listTasks(q: TaskQuery = {}) {
  const list = await readJson<Task[]>(FILE, []);
  return list.filter(t => {
    if (q.parentId === null && t.parentId) return false;
    if (q.parentId && t.parentId !== q.parentId) return false;
    if (q.status && t.status !== q.status) return false;
    if (q.priority && t.priority !== q.priority) return false;
    if (q.category && t.category !== q.category) return false;
    if (q.label && !(t.labels || []).includes(q.label)) return false;
    if (q.assignee && !(t.assignees || []).includes(q.assignee)) return false;
    if (q.dueBefore && t.dueDate && new Date(t.dueDate) > new Date(q.dueBefore)) return false;
    if (q.dueAfter && t.dueDate && new Date(t.dueDate) < new Date(q.dueAfter)) return false;
    if (q.q) {
      const s = q.q.toLowerCase();
      const hay = `${t.serial} ${t.title} ${t.description || ""} ${(t.labels || []).join(" ")} ${(t.assignees || []).join(" ")}`
        .toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });
}

export async function getTask(id: string) {
  const list = await readJson<Task[]>(FILE, []);
  return list.find(t => t.id === id || t.serial === id) || null;
}

export async function createTask(t: Partial<Task>) {
  const list = await readJson<Task[]>(FILE, []);

  const serialRaw = await nextSerial("TASK");
  const serial = serialRaw.startsWith("AO-T-") ? serialRaw : `AO-T-${serialRaw.split("-").pop()}`;

  const rec: Task = {
    id: `${Date.now()}`,
    serial,
    title: String(t.title || "مهمة جديدة"),
    description: t.description ? String(t.description) : undefined,
    parentId: t.parentId,
    dependsOn: t.dependsOn || [],
    status: t.status || "open",
    priority: t.priority || "medium",
    startDate: t.startDate,
    dueDate: t.dueDate,
    reminders: t.reminders || [],
    assignees: t.assignees || [],
    watchers: t.watchers || [],
    labels: t.labels || [],
    category: t.category || undefined,
    points: typeof t.points === "number" ? t.points : undefined,
    links: t.links || [],
    checklist: t.checklist || [],
    commentsCount: 0,
    attachments: t.attachments || [],
    thread: [],
    access: t.access || [{ user: t.createdBy || "admin", role: "owner" }],
    createdBy: t.createdBy || "admin",
    createdAt: nowIso(),
    data: t.data || {},
    activity: [],
  };
  addActivity(rec, { type: "create", by: t.createdBy || "admin", data: { title: rec.title, serial: rec.serial } });
  await writeJson(FILE, [rec, ...list]);
  return rec;
}

export async function updateTask(id: string, patch: Partial<Task>) {
  const list = await readJson<Task[]>(FILE, []);
  const idx = list.findIndex(x => x.id === id || x.serial === id);
  if (idx < 0) return null;
  const before = list[idx];
  const after: Task = { ...before, ...patch, updatedAt: nowIso() };

  if (patch.status && patch.status !== before.status)
    addActivity(after, { type: "status_change", data: { from: before.status, to: patch.status } });
  if (patch.priority && patch.priority !== before.priority)
    addActivity(after, { type: "priority_change", data: { from: before.priority, to: patch.priority } });
  if (patch.labels && patch.labels.join(",") !== (before.labels || []).join(","))
    addActivity(after, { type: "label_change", data: { labels: patch.labels } });
  if ((patch.dueDate || before.dueDate) && patch.dueDate !== before.dueDate)
    addActivity(after, { type: "due_change", data: { from: before.dueDate, to: patch.dueDate } });
  if (patch.parentId !== undefined && patch.parentId !== before.parentId)
    addActivity(after, { type: "subtask", data: { parentId: patch.parentId } });
  if (patch.links && JSON.stringify(patch.links) !== JSON.stringify(before.links))
    addActivity(after, { type: "link_change", data: { links: patch.links } });

  list[idx] = after;
  await writeJson(FILE, list);
  return after;
}

export async function deleteTask(id: string) {
  const list = await readJson<Task[]>(FILE, []);
  const keep = list.filter(t => t.id !== id && t.parentId !== id);
  const removed = list.length - keep.length;
  if (removed > 0) await writeJson(FILE, keep);
  return removed > 0;
}

export async function bulkUpdate(ids: string[], patch: Partial<Task>) {
  const list = await readJson<Task[]>(FILE, []);
  const set = new Set(ids);
  const out = list.map(t => {
    if (!set.has(t.id) && !set.has(t.serial)) return t;
    const changed = { ...t, ...patch, updatedAt: nowIso() } as Task;
    if (patch.status && patch.status !== t.status)
      addActivity(changed, { type: "status_change", data: { from: t.status, to: patch.status } });
    return changed;
  });
  await writeJson(FILE, out);
  return out.filter(t => set.has(t.id) || set.has(t.serial));
}

// ————— محادثة داخلية متسلسلة —————
export async function addThreadMessage(taskId: string, text: string, by?: string, parentNo?: string) {
  const list = await readJson<Task[]>(FILE, []);
  const idx = list.findIndex(x => x.id === taskId || x.serial === taskId);
  if (idx < 0) return null;
  const t = list[idx];

  // توليد رقم متسلسل للمحادثة: 1, 2, 3 أو 1.1, 1.2 …
  let nextNo = "1";
  const thread = t.thread || [];
  if (parentNo) {
    const children = thread.filter(m => m.no.startsWith(parentNo + "."));
    const n = children.length + 1;
    nextNo = `${parentNo}.${n}`;
  } else {
    const roots = thread.filter(m => !m.no.includes("."));
    nextNo = String(roots.length + 1);
  }

  const msg: TaskThreadMsg = { id: `${Date.now()}-${Math.random()}`, no: nextNo, at: nowIso(), by, text };
  t.thread = [...thread, msg];
  t.updatedAt = nowIso();
  addActivity(t, { type: "comment", by, data: { no: nextNo } });

  list[idx] = t;
  await writeJson(FILE, list);
  return msg;
}
