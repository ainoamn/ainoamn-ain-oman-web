import { globby } from "globby";
import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const LOCALES_DIR = path.join(SRC, "locales");
const FILES = await globby([
  "src/**/*.{ts,tsx,js,jsx}",
  "!**/node_modules/**",
  "!**/.next/**"
]);

const KEY_RE = /(?:(?:\btt|\bt)\s*\(\s*|["'`])((?:nav|common|auctions|partners|invest|faq|footer|subs|badges)\.[a-zA-Z0-9_.-]+)["'`]\s*(?:,|\))/g;

const keys = new Set();
for (const f of FILES) {
  const s = await fs.readFile(f, "utf8");
  for (const m of s.matchAll(KEY_RE)) keys.add(m[1]);
}

await fs.mkdir(LOCALES_DIR, { recursive: true });

async function loadJson(p) {
  try { return JSON.parse(await fs.readFile(p, "utf8")); } catch { return {}; }
}
function sortObj(o) { return Object.fromEntries(Object.entries(o).sort(([a],[b]) => a.localeCompare(b))); }

const enPath = path.join(LOCALES_DIR, "en.json");
const arPath = path.join(LOCALES_DIR, "ar.json");
const en = await loadJson(enPath);
const ar = await loadJson(arPath);

for (const k of keys) {
  if (!(k in en)) en[k] = k.replaceAll("_", " ");
  if (!(k in ar)) ar[k] = ""; // اتركه فارغًا للمراجعة أو الترجمة اليدوية
}

await fs.writeFile(enPath, JSON.stringify(sortObj(en), null, 2));
await fs.writeFile(arPath, JSON.stringify(sortObj(ar), null, 2));

console.log(`Merged ${keys.size} keys into locales/en.json and locales/ar.json`);
