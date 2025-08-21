// src/server/taskCategories.ts
import { readJson, writeJson } from "@/server/fsdb";

export type TaskCategory = { id: string; name: string; color?: string; icon?: string; order?: number };

const FILE = "task-categories";

export async function listCategories() {
  return await readJson<TaskCategory[]>(FILE, []);
}

export async function createCategory(name: string, color?: string, icon?: string) {
  const list = await readJson<TaskCategory[]>(FILE, []);
  const c: TaskCategory = { id: `${Date.now()}`, name, color, icon, order: list.length + 1 };
  await writeJson(FILE, [...list, c]);
  return c;
}

export async function deleteCategory(id: string) {
  const list = await readJson<TaskCategory[]>(FILE, []);
  const keep = list.filter(x => x.id !== id);
  await writeJson(FILE, keep);
  return list.length !== keep.length;
}
