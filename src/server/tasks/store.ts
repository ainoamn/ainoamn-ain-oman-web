// FILE: src/server/tasks/store.ts
import fs from "fs";
import path from "path";

/** ——— اكتشاف جذر المشروع بثبات عبر package.json ——— */
function findProjectRoot(startDir: string): string {
  let dir = startDir;
  for (let i = 0; i < 12; i++) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}
const projectRoot = findProjectRoot(__dirname);

/** مسار التخزين الموحّد */
const dataDir = path.join(projectRoot, ".data");
const filePath = path.join(dataDir, "tasks.json");

/** ذاكرة مشتركة داخل العملية */
let cache: Task[] | null = null;

/** الأنواع */
export type TaskStatus = "open" | "in_progress" | "blocked" | "done" | "canceled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type ChecklistItem = { id: string; text: string; done: boolean };
export type Attachment = { id: string; name: string; size?: number; mime?: string; url: string };
export type TaskLink = { type: "property" | "maintenance" | "event" | "lease" | "invoice" | "legal_case"; refId: string; title?: string };

export type Task = {
  id: string;
  serial?: string;
  title: string;
  description?: string;
  parentId?: string;
  dependsOn?: string[];
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string;
  dueDate?: string;
  reminders?: string[];
  assignees?: string[];
  watchers?: string[];           // << مراقبون لتلقي الإشعارات
  labels?: string[];
  category?: string;
  points?: number;
  links?: TaskLink[];
  checklist?: ChecklistItem[];
  commentsCount?: number;
  attachments?: Attachment[];
  thread?: { id: string; no?: string; by?: string; at: string; text: string }[];
  access?: { user: string; role: "owner" | "editor" | "commenter" | "viewer" }[];
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  data?: any;
};

/** تهيئة التخزين */
function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf8");
}

/** تحميل/كتابة */
function load(): Task[] {
  if (cache) return cache;
  ensureStore();
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const arr = JSON.parse(raw);
    cache = Array.isArray(arr) ? (arr as Task[]) : [];
  } catch {
    cache = [];
  }
  return cache!;
}
function commit(items: Task[]) {
  cache = items;
  ensureStore();
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf8");
}

/** أدوات */
function pad(n: number, w = 6) { return String(n).padStart(w, "0"); }
function nextId(existing: Task[]): string {
  let max = 0;
  for (const t of existing) {
    const m = String(t.id || "").match(/AO-T-(\d+)/i);
    if (m) {
      const v = parseInt(m[1], 10);
      if (v > max) max = v;
    }
  }
  return `AO-T-${pad(max + 1)}`;
}
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r=(Math.random()*16)|0, v=c==="x"?r:(r&0x3)|0x8; return v.toString(16);
  });
}

/** API */
export async function listTasks(): Promise<Task[]> {
  const arr = load().slice();
  arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return arr;
}
export async function readTaskById(id: string): Promise<Task | null> {
  const arr = load();
  return arr.find((t) => String(t.id) === String(id)) || null;
}
export async function createTask(input: Partial<Task>): Promise<Task> {
  const arr = load();
  const now = new Date().toISOString();
  const id = input.id || nextId(arr);
  const item: Task = {
    id,
    serial: input.serial,
    title: String(input.title || "مهمة"),
    description: input.description ? String(input.description) : "",
    status: (input.status as TaskStatus) || "open",
    priority: (input.priority as TaskPriority) || "medium",
    category: input.category ? String(input.category) : undefined,
    assignees: Array.isArray(input.assignees) ? input.assignees.map(String) : [],
    watchers: Array.isArray(input.watchers) ? input.watchers.map(String) : [],
    labels: Array.isArray(input.labels) ? input.labels.map(String) : [],
    links: Array.isArray(input.links) ? input.links : [],
    attachments: Array.isArray(input.attachments) ? input.attachments : [],
    checklist: Array.isArray(input.checklist) ? input.checklist : [],
    thread: Array.isArray(input.thread) ? input.thread : [],
    createdAt: input.createdAt || now,
    updatedAt: now,
  };
  arr.push(item);
  commit(arr);
  return item;
}
export async function updateTask(id: string, patch: Partial<Task>): Promise<Task> {
  const arr = load();
  const i = arr.findIndex((t) => String(t.id) === String(id));
  if (i < 0) throw new Error("NOT_FOUND");
  const curr = arr[i];
  const updated: Task = {
    ...curr,
    ...patch,
    id: curr.id,
    assignees: patch.assignees ? patch.assignees.map(String) : curr.assignees,
    watchers: patch.watchers ? patch.watchers.map(String) : curr.watchers,
    labels: patch.labels ? patch.labels.map(String) : curr.labels,
    links: patch.links ? patch.links : curr.links,
    updatedAt: new Date().toISOString(),
  };
  arr[i] = updated;
  commit(arr);
  return updated;
}
export async function bulkUpdate(ids: string[], patch: Partial<Task>): Promise<Task[]> {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const arr = load();
  const set = new Set(ids.map(String));
  const out: Task[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (set.has(String(arr[i].id))) {
      const curr = arr[i];
      const updated: Task = {
        ...curr,
        ...patch,
        id: curr.id,
        assignees: patch.assignees ? patch.assignees.map(String) : curr.assignees,
        watchers: patch.watchers ? patch.watchers.map(String) : curr.watchers,
        labels: patch.labels ? patch.labels.map(String) : curr.labels,
        links: patch.links ? patch.links : curr.links,
        updatedAt: new Date().toISOString(),
      };
      arr[i] = updated;
      out.push(updated);
    }
  }
  commit(arr);
  return out;
}
export async function deleteTask(id: string): Promise<boolean> {
  const arr = load();
  const left = arr.filter((t) => String(t.id) !== String(id));
  const changed = left.length !== arr.length;
  if (changed) commit(left);
  return changed;
}
export async function addThreadMessage(id: string, by: string | undefined, text: string): Promise<Task> {
  const arr = load();
  const i = arr.findIndex((t) => String(t.id) === String(id));
  if (i < 0) throw new Error("NOT_FOUND");
  const task = arr[i];
  const list = Array.isArray(task.thread) ? task.thread : [];
  const no = String(list.length + 1);
  const msg = { id: uuid(), no, by, at: new Date().toISOString(), text };
  task.thread = [...list, msg];
  task.updatedAt = new Date().toISOString();
  arr[i] = task;
  commit(arr);
  return task;
}

// ========== الدوال الجديدة لنظام التقاضي ==========

/** إنشاء مهام تلقائية للقضايا القانونية */
export async function createLegalTasks(caseId: string, caseData: any): Promise<Task[]> {
  const tasks: Task[] = [];
  
  // مهمة المتابعة الأساسية
  const mainTask = await createTask({
    title: `متابعة القضية ${caseData.caseNumber}`,
    description: caseData.description,
    priority: caseData.priority || 'high',
    links: [
      {
        type: 'legal_case',
        refId: caseId,
        title: caseData.title
      }
    ],
    assignees: caseData.assignedToId ? [caseData.assignedToId] : [],
    watchers: caseData.clientId ? [caseData.clientId] : []
  });
  tasks.push(mainTask);

  // مهمة للموعد النهائي إذا كان موجوداً
  if (caseData.deadline) {
    const deadlineTask = await createTask({
      title: `الموعد النهائي للقضية ${caseData.caseNumber}`,
      description: `الموعد النهائي: ${new Date(caseData.deadline).toLocaleDateString()}`,
      priority: 'urgent',
      dueDate: caseData.deadline,
      links: [
        {
          type: 'legal_case',
          refId: caseId,
          title: caseData.title
        }
      ],
      assignees: caseData.assignedToId ? [caseData.assignedToId] : [],
      watchers: caseData.clientId ? [caseData.clientId] : []
    });
    tasks.push(deadlineTask);
  }

  return tasks;
}

/** البحث عن المهام المرتبطة بقضية قانونية */
export async function findTasksByLegalCase(caseId: string): Promise<Task[]> {
  const allTasks = await listTasks();
  return allTasks.filter(task => 
    task.links?.some(link => link.type === 'legal_case' && link.refId === caseId)
  );
}
