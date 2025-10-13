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

/** توليد رقم تسلسلي للقضايا القانونية بصيغة LEGAL-000001 */
export async function getNextLegalCaseNumber(): Promise<string> {
  return nextSerial("LEGAL", "LEGAL-");
}

/** توليد رقم تسلسلي للشكاوى بصيغة COMPLAINT-000001 */
export async function getNextComplaintNumber(): Promise<string> {
  return nextSerial("COMPLAINT", "COMPLAINT-");
}

/** توليد رقم تسلسلي للدعاوى القضائية بصيغة CASE-000001 */
export async function getNextCourtCaseNumber(): Promise<string> {
  return nextSerial("COURT-CASE", "CASE-");
}

/** توليد رقم تسلسلي للتحويلات بصيغة TRANSFER-000001 */
export async function getNextTransferNumber(): Promise<string> {
  return nextSerial("TRANSFER", "TRANSFER-");
}

// ========================
// النظام المالي - Financial System Serial Numbers
// ========================

/** توليد رقم تسلسلي للفواتير بصيغة INV-2025-000001 */
export async function getNextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  return nextSerial(`INV-${year}`, `INV-${year}-`);
}

/** توليد رقم تسلسلي للمدفوعات بصيغة PAY-2025-000001 */
export async function getNextPaymentNumber(): Promise<string> {
  const year = new Date().getFullYear();
  return nextSerial(`PAY-${year}`, `PAY-${year}-`);
}

/** توليد رقم تسلسلي للشيكات بصيغة CHK-2025-000001 */
export async function getNextCheckNumber(): Promise<string> {
  const year = new Date().getFullYear();
  return nextSerial(`CHK-${year}`, `CHK-${year}-`);
}

/** توليد رقم تسلسلي للقيود المحاسبية بصيغة JE-2025-000001 */
export async function getNextJournalEntryNumber(): Promise<string> {
  const year = new Date().getFullYear();
  return nextSerial(`JE-${year}`, `JE-${year}-`);
}

/** توليد رقم تسلسلي للإيصالات بصيغة REC-2025-000001 */
export async function getNextReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  return nextSerial(`REC-${year}`, `REC-${year}-`);
}