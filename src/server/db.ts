// src/server/db.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "open" | "in_progress" | "blocked" | "done";

export type Person = { name: string; email?: string; whatsapp?: string };
export type ThreadItem = { id: string; author: string; text: string; at: string };
export type Participant = { id: string; name: string; email?: string; whatsapp?: string; invitedAt: string };
export type Attachment = { id: string; name: string; type?: string; size?: number; file: string; uploadedAt: string };
export type LinkedEntity = { type: string; id: string };

export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  assignees?: string[];
  labels?: string[];
  owner?: Person;
  cc?: Person[];
  thread: ThreadItem[];
  participants?: Participant[];
  attachments?: Attachment[];
  calendarEvent?: { id: string; title: string; start?: string; end?: string; createdAt: string };
  link?: LinkedEntity;
};

type Store = { tasks: Task[] };

const DATA_DIR = path.join(process.cwd(), ".data");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");
const ATTACH_DIR = path.join(DATA_DIR, "tasks");

function ensureDir(p: string) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }
function safeName(s: string) { return s.replace(/[\/\\:*?"<>|]/g, "_"); }
function nowISO() { return new Date().toISOString().replace("T", " ").replace("Z", ""); }

let store: Store | null = null;
function loadStore(): Store {
  ensureDir(DATA_DIR);
  if (!fs.existsSync(TASKS_FILE)) {
    const fresh: Store = { tasks: [] };
    fs.writeFileSync(TASKS_FILE, JSON.stringify(fresh, null, 2), "utf-8");
    return fresh;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(TASKS_FILE, "utf-8"));
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.tasks)) throw new Error("bad");
    return parsed as Store;
  } catch {
    const fresh: Store = { tasks: [] };
    fs.writeFileSync(TASKS_FILE, JSON.stringify(fresh, null, 2), "utf-8");
    return fresh;
  }
}
function saveStore() { if (store) fs.writeFileSync(TASKS_FILE, JSON.stringify(store, null, 2), "utf-8"); }
function getStore(): Store { if (!store) store = loadStore(); if (!Array.isArray(store.tasks)) store.tasks = []; return store; }

export function getTask(id: string): Task | null {
  const s = getStore();
  const t = s.tasks.find(x => x.id === id);
  return t || null;
}

function newTask(id: string, patch?: Partial<Task>): Task {
  const base: Task = {
    id,
    title: patch?.title || `مهمة ${id}`,
    description: patch?.description || "",
    priority: (patch?.priority as Priority) || "medium",
    status: (patch?.status as Status) || "open",
    dueDate: patch?.dueDate,
    createdAt: patch?.createdAt || nowISO(),
    updatedAt: nowISO(),
    assignees: Array.isArray(patch?.assignees) ? patch.assignees : [],
    labels: Array.isArray(patch?.labels) ? patch.labels : [],
    owner: patch?.owner,
    cc: Array.isArray(patch?.cc) ? patch.cc : [],
    thread: [],
    participants: [],
    attachments: [],
    link: patch?.link,
  };
  return base;
}

export function upsertTask(task: Task) {
  const s = getStore();
  const i = s.tasks.findIndex(x => x.id === task.id);
  if (i >= 0) s.tasks[i] = task; else s.tasks.push(task);
  saveStore();
  return task;
}

export function patchTask(id: string, patch: Partial<Task>) {
  const s = getStore();
  let t = s.tasks.find(x => x.id === id);
  if (!t) { t = newTask(id, patch); s.tasks.push(t); }
  else {
    if (typeof patch.title === "string") t.title = patch.title;
    if (typeof patch.description === "string") t.description = patch.description;
    if (patch.priority) t.priority = patch.priority as Priority;
    if (patch.status) t.status = patch.status as Status;
    if (typeof patch.dueDate === "string" || patch.dueDate === undefined) t.dueDate = patch.dueDate;
    if (typeof patch.createdAt === "string") t.createdAt = patch.createdAt;
    if (Array.isArray(patch.assignees)) t.assignees = patch.assignees;
  if (Array.isArray(patch.labels)) t.labels = patch.labels;
    if (patch.link) t.link = patch.link as LinkedEntity;
    if (patch.owner) t.owner = patch.owner as Person;
    if (Array.isArray(patch.cc)) t.cc = patch.cc as Person[];
  }
  t.updatedAt = nowISO();
  saveStore();
  return t;
}

export function appendThread(id: string, author: string, text: string) {
  const s = getStore();
  let t = s.tasks.find(x => x.id === id);
  if (!t) t = patchTask(id, {});
  const item: ThreadItem = { id: crypto.randomUUID(), author, text, at: nowISO() };
  t.thread.push(item);
  t.updatedAt = nowISO();
  saveStore();
  return t;
}

export function addParticipant(id: string, p: { name: string; email?: string; whatsapp?: string; }) {
  const s = getStore();
  let t = s.tasks.find(x => x.id === id);
  if (!t) t = patchTask(id, {});
  const pp: Participant = { id: crypto.randomUUID(), name: p.name, email: p.email, whatsapp: p.whatsapp, invitedAt: nowISO() };
  t.participants = t.participants || [];
  t.participants.push(pp);
  t.updatedAt = nowISO();
  saveStore();
  return t;
}

export function addAttachment(id: string, a: { name: string; type?: string; size?: number; contentBase64: string }) {
  const s = getStore();
  let t = s.tasks.find(x => x.id === id);
  if (!t) t = patchTask(id, {});
  ensureDir(ATTACH_DIR);
  const taskDir = path.join(ATTACH_DIR, safeName(id));
  ensureDir(taskDir);
  const attId = crypto.randomUUID();
  const extFile = safeName(`${attId}-${a.name}`);
  const filePath = path.join(taskDir, extFile);
  const b = Buffer.from(a.contentBase64, "base64");
  fs.writeFileSync(filePath, b);
  const att: Attachment = { id: attId, name: a.name, type: a.type, size: a.size ?? b.length, file: extFile, uploadedAt: nowISO() };
  t.attachments = t.attachments || [];
  t.attachments.push(att);
  t.updatedAt = nowISO();
  saveStore();
  return { attachment: att, task: t };
}

export function getAttachmentPath(id: string, attId: string): { path: string; name: string; type?: string } | null {
  const t = getTask(id);
  if (!t || !t.attachments) return null;
  const a = t.attachments.find(x => x.id === attId);
  if (!a) return null;
  const p = path.join(ATTACH_DIR, safeName(id), a.file);
  if (!fs.existsSync(p)) return null;
  return { path: p, name: a.name, type: a.type };
}

export function removeAttachment(id: string, attId: string) {
  const s = getStore();
  let t = s.tasks.find(x => x.id === id);
  if (!t) t = patchTask(id, {});
  t.attachments = t.attachments || [];
  const idx = t.attachments.findIndex(x => x.id === attId);
  if (idx >= 0) {
    const a = t.attachments[idx];
    const p = path.join(ATTACH_DIR, safeName(id), a.file);
    if (fs.existsSync(p)) try { fs.unlinkSync(p); } catch {}
    t.attachments.splice(idx, 1);
    t.updatedAt = nowISO();
    saveStore();
    return t;
  } else throw new Error("attachment_not_found");
}

// ====== تحويل المهمة ======
export function transferTask(id: string, from: Person | null, to: Person, addCcSelf: boolean) {
  const s = getStore();
  let t = s.tasks.find(x => x.id === id);
  if (!t) t = patchTask(id, {});
  const prevOwner = t.owner?.name ? t.owner : null;
  t.owner = to;
  t.cc = t.cc || [];
  if (addCcSelf && from) {
    if (!t.cc.find(p => p.name === from.name && p.email === from.email && p.whatsapp === from.whatsapp)) {
      t.cc.push(from);
    }
  }
  if (prevOwner && prevOwner.name !== to.name) {
    if (!t.cc.find(p => p.name === prevOwner.name && p.email === prevOwner.email && p.whatsapp === prevOwner.whatsapp)) {
      t.cc.push(prevOwner);
    }
  }
  t.updatedAt = nowISO();
  appendThread(id, "system", `تم تحويل المهمة إلى ${to.name}${to.email?` (${to.email})`:""}${to.whatsapp?` | ${to.whatsapp}`:""}${addCcSelf && from ? `؛ وتمت إضافة ${from.name} كـ CC.`:""}`);
  saveStore();
  return t;
}

// ====== جديد: قائمة المهام مع فلترة وفرز الأحدث ======
export function listTasks(filter?: { q?: string; status?: Status | "all"; priority?: Priority | "all" }) {
  const s = getStore();
  let xs = Array.from(s.tasks);
  if (filter?.q && filter.q.trim()) {
    const q = filter.q.trim();
    xs = xs.filter(t =>
      t.id.includes(q) ||
      (t.title || "").includes(q) ||
      (t.description || "").includes(q)
    );
  }
  if (filter?.status && filter.status !== "all") {
    xs = xs.filter(t => t.status === filter.status);
  }
  if (filter?.priority && filter.priority !== "all") {
    xs = xs.filter(t => t.priority === filter.priority);
  }
  xs.sort((a,b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  return xs;
}

// Export a prisma stub from the shared prisma client so other modules can import { prisma } from '../server/db'
export { default as prisma } from '../lib/prisma';
