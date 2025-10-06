// src/server/serialNumbers.ts
import "server-only";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "counters.json");

async function load(): Promise<Record<string, number>> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const txt = await readFile(FILE, "utf8");
    return JSON.parse(txt) as Record<string, number>;
  } catch {
    return {};
  }
}

async function save(obj: Record<string, number>) {
  await writeFile(FILE, JSON.stringify(obj, null, 2), "utf8");
}

/** تُرجِع الرقم الحالي بدون زيادة */
export async function getCurrentSequenceNumber(key = "AO-T") {
  const map = await load();
  return map[key] ?? 0;
}

/** إعادة تعيين العداد لقيمة معيّنة */
export async function resetCounter(key: string, value: number) {
  if (!key) throw new Error("key required");
  if (!Number.isFinite(value) || value < 0) throw new Error("invalid value");
  const map = await load();
  map[key] = Math.floor(value);
  await save(map);
  return map[key];
}

/** اختيارية: توليد الرقم التالي مع بادئة */
export async function nextSerial(key = "AO-T", prefix = "AO-T-") {
  const map = await load();
  const n = (map[key] ?? 0) + 1;
  map[key] = n;
  await save(map);
  return `${prefix}${String(n).padStart(6, "0")}`;
}

/** اختيارية: معاينة الرقم التالي دون حفظ */
export async function peekSerial(key = "AO-T", prefix = "AO-T-") {
  const map = await load();
  const n = (map[key] ?? 0) + 1;
  return `${prefix}${String(n).padStart(6, "0")}`;
}
export async function getNextSerialNumber(type: string): Promise<string> {
  // منطق توليد الرقم التسلسلي - مثال مبسط
  const prefix = type === 'booking' ? 'B' : 'INV';
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
}

/** توليد رقم تسلسلي لمهام النظام بصيغة AO-T-000001 */
export async function getNextSequenceNumber(): Promise<string> {
  return nextSerial("AO-T", "AO-T-");
}