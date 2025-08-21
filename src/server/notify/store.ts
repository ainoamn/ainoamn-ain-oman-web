// FILE: src/server/notify/store.ts
import fs from "fs";
import path from "path";

/** جذر المشروع */
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
const filePath = path.join(dataDir, "outbox.json");

export type Channel = "email" | "whatsapp" | "sms" | "push";
export type OutboxItem = {
  id: string;
  at: string;
  channel: Channel;
  to: string;
  subject?: string;
  text: string;
  taskId?: string;
};

function ensure() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf8");
}
function readAll(): OutboxItem[] {
  ensure();
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as OutboxItem[]) : [];
  } catch { return []; }
}
function writeAll(items: OutboxItem[]) {
  ensure();
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf8");
}
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r=(Math.random()*16)|0, v=c==="x"?r:(r&0x3)|0x8; return v.toString(16);
  });
}

/** سجّل إرسال (محاكاة إرسال) */
export async function enqueue(item: Omit<OutboxItem, "id" | "at">): Promise<OutboxItem> {
  const all = readAll();
  const out: OutboxItem = { id: uuid(), at: new Date().toISOString(), ...item };
  all.unshift(out);
  writeAll(all);
  return out;
}
export async function listOutbox(limit = 200): Promise<OutboxItem[]> {
  const all = readAll();
  return all.slice(0, limit);
}
