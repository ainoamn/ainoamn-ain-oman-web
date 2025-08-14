// src/lib/api/propertiesCrud.ts
import { promises as fs } from "fs";
import path from "path";
// نستخدم نفس مُولِّد التسلسل المستخدم في /api/seq/next
// (موجود لديك سابقًا حسب تتبّع الأخطاء)
import { issueNextSerial } from "@/lib/serialNumbers";

export type PropertyRecord = {
  id: string;                 // معرف داخلي
  referenceNo: string;        // الرقم المتسلسل الرسمي
  title?: string;
  city?: string;
  area?: number;
  beds?: number;
  baths?: number;
  price?: number;
  image?: string;
  type?: string;              // سكني/تجاري/...
  featured?: boolean;
  createdAt: string;          // ISO
  updatedAt: string;          // ISO
  [k: string]: any;           // أي حقول إضافية
};

const DATA_DIR = path.join(process.cwd(), "data", ".data");
const FILE_PATH = path.join(DATA_DIR, "properties.json");

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.writeFile(FILE_PATH, "[]", "utf8");
  }
}

export async function listProperties(): Promise<PropertyRecord[]> {
  await ensureDataFile();
  const raw = await fs.readFile(FILE_PATH, "utf8");
  const arr = (raw ? JSON.parse(raw) : []) as PropertyRecord[];
  return arr.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createProperty(
  payload: Record<string, any>
): Promise<PropertyRecord> {
  await ensureDataFile();

  // 1) توليد رقم مرجعي رسمي للكيان PROPERTY
  const seq = await issueNextSerial("PROPERTY");
  if (!seq?.ok || !seq.serial) {
    throw new Error(seq?.error || "Failed to issue serial");
  }

  // 2) بناء السجل
  const id = `prop_${Date.now()}`;
  const now = new Date().toISOString();
  const rec: PropertyRecord = {
    id,
    referenceNo: seq.serial, // مثل PR-2025-000001
    createdAt: now,
    updatedAt: now,
    ...payload,
  };

  // 3) كتابة إلى الملف
  const items = await listProperties();
  items.unshift(rec);
  await fs.writeFile(FILE_PATH, JSON.stringify(items, null, 2), "utf8");

  return rec;
}
