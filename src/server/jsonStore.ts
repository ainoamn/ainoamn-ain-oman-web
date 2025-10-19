import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), ".data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export function readArray<T = any>(fileName: string): T[] {
  const p = path.join(dataDir, fileName);
  if (!fs.existsSync(p)) { fs.writeFileSync(p, "[]", "utf8"); return []; }
  const raw = fs.readFileSync(p, "utf8");
  try { return JSON.parse(raw) as T[]; } catch { return []; }
}

export function writeArray<T = any>(fileName: string, arr: T[]) {
  const p = path.join(dataDir, fileName);
  fs.writeFileSync(p, JSON.stringify(arr, null, 2), "utf8");
}

export function upsert<T extends { id?: string | number } = any>(fileName: string, item: T) {
  const arr = readArray<T>(fileName);
  const idx = arr.findIndex(x => x.id === item.id);
  if (idx >= 0) arr[idx] = { ...arr[idx], ...item } as T;
  else arr.unshift(item);
  writeArray(fileName, arr);
  return item;
}
