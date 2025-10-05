// src/lib/fsdb.ts
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

export const DATA_DIR = path.join(process.cwd(), ".data");

export async function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) await fsp.mkdir(DATA_DIR, { recursive: true });
}

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  await ensureDir();
  try {
    const p = path.join(DATA_DIR, file);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(await fsp.readFile(p, "utf8"));
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(file: string, value: T): Promise<void> {
  await ensureDir();
  const p = path.join(DATA_DIR, file);
  await fsp.writeFile(p, JSON.stringify(value, null, 2), "utf8");
}

export function uid(prefix: string) {
  return `${prefix}-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`;
}
