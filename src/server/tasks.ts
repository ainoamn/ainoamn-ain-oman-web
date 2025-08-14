// src/server/tasks.ts
import { readJson, writeJson } from "@/server/fsdb";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: "open" | "in_progress" | "done" | "canceled";
  assignee?: string;         // لاحقًا: userId
  dueDate?: string;          // ISO
  data?: any;
  createdAt: string;
  updatedAt?: string;
};

const FILE = "tasks";

export async function createTask(t: Omit<Task, "id" | "createdAt" | "status"> & { status?: Task["status"] }) {
  const list = await readJson<Task[]>(FILE, []);
  const rec: Task = {
    id: `${Date.now()}`,
    status: t.status || "open",
    createdAt: new Date().toISOString(),
    ...t,
  };
  await writeJson(FILE, [rec, ...list]);
  return rec;
}

export async function listTasks() {
  return await readJson<Task[]>(FILE, []);
}

export async function setTaskStatus(id: string, status: Task["status"]) {
  const list = await readJson<Task[]>(FILE, []);
  const idx = list.findIndex(x => x.id === id);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], status, updatedAt: new Date().toISOString() };
  await writeJson(FILE, list);
  return list[idx];
}
