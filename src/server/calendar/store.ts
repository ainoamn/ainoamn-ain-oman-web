// FILE: src/server/calendar/store.ts
import fs from "fs";
import path from "path";
import type { Task } from "@/server/tasks/store";

/** إيجاد جذر المشروع عبر package.json */
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
const dataDir = path.join(projectRoot, ".data");
const filePath = path.join(dataDir, "calendar.json");

export type CalEvent = {
  id: string;
  title: string;
  start: string; // ISO
  end?: string;  // ISO
  url?: string;  // رابط داخلي للمهمة
  taskId?: string;
};

function ensure() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf8");
}
function readAll(): CalEvent[] {
  ensure();
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as CalEvent[]) : [];
  } catch { return []; }
}
function writeAll(items: CalEvent[]) {
  ensure();
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf8");
}
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r=(Math.random()*16)|0, v=c==="x"?r:(r&0x3)|0x8; return v.toString(16);
  });
}

export async function addEvent(ev: Omit<CalEvent, "id">): Promise<CalEvent> {
  const all = readAll();
  const out: CalEvent = { id: uuid(), ...ev };
  all.unshift(out);
  writeAll(all);
  return out;
}

/** يبني حدثًا مناسبًا من مهمة */
export async function addEventFromTask(task: Task): Promise<CalEvent> {
  const start = task.startDate || task.createdAt || new Date().toISOString();
  const end = task.dueDate || undefined;
  const title = `مهمة: ${task.title}`;
  const url = `/admin/tasks/${task.id}`;
  return addEvent({ title, start, end, url, taskId: task.id });
}
