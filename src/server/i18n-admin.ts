// src/server/i18n-admin.ts  (أضِف desc للوصف)
import fs from "fs/promises";
import path from "path";

export type Dict = Record<string, string>;
export type Dicts = Record<string, Dict>;
export type KeyMeta = { routes?: string[]; selector?: string; icon?: string; visible?: boolean; desc?: string };
export type MetaMap = Record<string, KeyMeta>;

export const LOCALES_DIR = path.join(process.cwd(), "src", "locales");
const META_PATH = path.join(LOCALES_DIR, "_meta.json");

async function ensureDir() { await fs.mkdir(LOCALES_DIR, { recursive: true }); }
const fileOf = (l: string) => path.join(LOCALES_DIR, `${l}.json`);

export async function getLangs(): Promise<string[]> {
  await ensureDir();
  const files = await fs.readdir(LOCALES_DIR);
  return files.filter(f => f.endsWith(".json") && f !== "_meta.json").map(f => f.replace(/\.json$/,"")).sort();
}

export async function readDicts(): Promise<Dicts> {
  await ensureDir();
  const langs = await getLangs();
  const out: Dicts = {};
  for (const l of langs) {
    try { out[l] = JSON.parse(await fs.readFile(fileOf(l), "utf8") || "{}"); }
    catch { out[l] = {}; }
  }
  return out;
}

export async function readMeta(): Promise<MetaMap> {
  await ensureDir();
  try { return JSON.parse(await fs.readFile(META_PATH, "utf8") || "{}"); }
  catch { return {}; }
}

export async function writeAll(dicts: Dicts, meta: MetaMap) {
  await ensureDir();
  for (const [l, d] of Object.entries(dicts)) {
    const sorted = Object.fromEntries(Object.entries(d || {}).sort(([a],[b]) => a.localeCompare(b)));
    await fs.writeFile(fileOf(l), JSON.stringify(sorted, null, 2) + "\n", "utf8");
  }
  const metaSorted = Object.fromEntries(Object.entries(meta || {}).sort(([a],[b]) => a.localeCompare(b)));
  await fs.writeFile(META_PATH, JSON.stringify(metaSorted, null, 2) + "\n", "utf8");
}

export async function addLang(lang: string) {
  await ensureDir();
  const p = fileOf(lang);
  try { await fs.access(p); } catch { await fs.writeFile(p, "{}\n", "utf8"); }
}

export function unionKeys(dicts: Dicts): string[] {
  const s = new Set<string>();
  for (const d of Object.values(dicts)) for (const k of Object.keys(d || {})) s.add(k);
  return [...s].sort();
}
