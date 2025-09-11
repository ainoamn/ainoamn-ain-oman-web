// src/server/messages/store.ts
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

export type Message = {
  id: string;
  propertyId: string;
  fromId: string;
  toId: string;
  text: string;
  ts: string; // ISO
};

const dataDir = path.join(process.cwd(), ".data");
const filePath = path.join(dataDir, "messages.json");

async function ensure() {
  if (!fs.existsSync(dataDir)) await fsp.mkdir(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) await fsp.writeFile(filePath, JSON.stringify({ items: [] }, null, 2), "utf8");
}

export async function addMessage(m: Omit<Message,"id"|"ts"> & { ts?: string }) {
  await ensure();
  const raw = await fsp.readFile(filePath, "utf8");
  const js = JSON.parse(raw || "{}");
  const items: Message[] = Array.isArray(js.items) ? js.items : [];
  const msg: Message = {
    id: String(Date.now()),
    ts: m.ts || new Date().toISOString(),
    ...m,
  };
  items.push(msg);
  await fsp.writeFile(filePath, JSON.stringify({ items }, null, 2), "utf8");
  return msg;
}

export async function listByProperty(propertyId: string) {
  await ensure();
  const raw = await fsp.readFile(filePath, "utf8");
  const js = JSON.parse(raw || "{}");
  const items: Message[] = Array.isArray(js.items) ? js.items : [];
  return items.filter((x) => String(x.propertyId) === String(propertyId)).sort((a,b)=>a.ts.localeCompare(b.ts));
}

export async function listThreadsForUser(userId: string) {
  await ensure();
  const raw = await fsp.readFile(filePath, "utf8");
  const js = JSON.parse(raw || "{}");
  const items: Message[] = Array.isArray(js.items) ? js.items : [];
  const threads = new Map<string, { propertyId:string; withId:string; lastText:string; lastTs:string }>();
  for (const m of items) {
    if (m.fromId !== userId && m.toId !== userId) continue;
    const withId = m.fromId === userId ? m.toId : m.fromId;
    const key = `${m.propertyId}::${withId}`;
    const cur = threads.get(key);
    if (!cur || cur.lastTs < m.ts) {
      threads.set(key, { propertyId: m.propertyId, withId, lastText: m.text, lastTs: m.ts });
    }
  }
  return Array.from(threads.entries()).map(([key, v]) => ({ threadId:key, ...v }))
    .sort((a,b)=> b.lastTs.localeCompare(a.lastTs));
}
