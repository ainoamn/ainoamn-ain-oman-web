// src/server/properties/store.ts
import fs from "fs";
import path from "path";

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
  status?: "vacant" | "reserved" | "rented" | "hidden" | "draft";
  createdAt?: string;
  updatedAt?: string;
};

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, ".data");
const FILE = path.join(DATA_DIR, "properties.json");

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]", "utf8");
}

export function readAll(): Property[] {
  ensure();
  const raw = fs.readFileSync(FILE, "utf8");
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    // إصلاح تلقائي عند فساد الملف
    fs.writeFileSync(FILE, "[]", "utf8");
    return [];
  }
}

export function writeAll(items: Property[]) {
  ensure();
  fs.writeFileSync(FILE, JSON.stringify(items, null, 2), "utf8");
}

export function upsert(p: Property) {
  const list = readAll();
  const i = list.findIndex((x) => String(x.id) === String(p.id));
  if (i === -1) list.unshift(p);
  else list[i] = p;
  writeAll(list);
}

export function getById(id: string): Property | null {
  const list = readAll();
  return list.find((x) => String(x.id) === String(id)) || null;
}
