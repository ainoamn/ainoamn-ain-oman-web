// root: src/server/properties/store.ts
import fs from "fs";
import path from "path";
import { normalizeUsage, type Usage } from "@/lib/property";

export type Property = {
  id: string;
  referenceNo?: string;
  title?: { ar?: string; en?: string };
  priceOMR?: number;
  province?: string;
  state?: string;
  village?: string;
  purpose?: "sale" | "rent" | "investment";
  type?: "apartment" | "villa" | "land" | "office" | "shop";
  usage?: Usage;            // سكني/تجاري/زراعي/سياحي
  images?: string[];        // روابط عامة تحت public/
  status?: "vacant" | "reserved" | "rented" | "hidden" | "draft";
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

const DATA_DIR = path.resolve(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "properties.json");

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]", "utf8");
}

function readAllRaw(): Property[] {
  ensure();
  try { const arr = JSON.parse(fs.readFileSync(FILE, "utf8")); return Array.isArray(arr) ? arr : []; }
  catch { fs.writeFileSync(FILE, "[]", "utf8"); return []; }
}

function writeAll(items: Property[]) {
  ensure();
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(items, null, 2), "utf8");
  fs.renameSync(tmp, FILE);
}

export function readAll(): Property[] { return readAllRaw(); }

export function getById(id: string): Property | null {
  return readAllRaw().find((p) => String(p.id) === String(id)) || null;
}

export function upsert(item: Property): Property {
  const list = readAllRaw();
  const i = list.findIndex((p) => String(p.id) === String(item.id));
  const now = new Date().toISOString();
  const normalized: Property = {
    ...item,
    usage: normalizeUsage((item as any).usage ?? (item as any).category ?? (item as any).segment),
    images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
    updatedAt: item.updatedAt || now,
  };
  if (i >= 0) list[i] = { ...list[i], ...normalized };
  else list.unshift({ createdAt: now, ...normalized });
  writeAll(list);
  return i >= 0 ? (list[i] as Property) : (list[0] as Property);
}
