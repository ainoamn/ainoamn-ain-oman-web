// src/pages/api/tasks/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getNextSequenceNumber } from "@/server/serialNumbers";
import fs from "fs";
import path from "path";

// تخزين بسيط متوافق
const DB = path.resolve(process.cwd(), ".data", "db.json");
function ensure() {
  const dir = path.dirname(DB);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({}, null, 2), "utf8");
}
function readDb(): any {
  try { ensure(); return JSON.parse(fs.readFileSync(DB, "utf8") || "{}"); }
  catch { return {}; }
}
function writeDb(db: any) {
  ensure();
  fs.writeFileSync(DB, JSON.stringify(db ?? {}, null, 2), "utf8");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // دعم CORS البسيط إن لزم
  if (req.method === "OPTIONS") return res.status(204).end();

  // LIST: تُستخدمها /admin/tasks
  if (req.method === "GET") {
    const propertyId = req.query.propertyId ? String(req.query.propertyId) : "";
    const db = readDb();
    const items: any[] = Array.isArray(db.tasks) ? db.tasks : [];
    const filtered = propertyId ? items.filter((t) => String(t.propertyId) === propertyId) : items;
    filtered.sort((a, b) =>
      String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || ""))
    );
    return res.status(200).json({ items: filtered });
  }

  // CREATE: يحافظ على سلوكك الحالي ويضيف حفظًا محليًا لضمان الظهور
  if (req.method === "POST") {
    try {
      const taskData = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const serialNumber = await getNextSequenceNumber();

      const now = new Date().toISOString();
      const task = {
        ...taskData,
        id: serialNumber,            // معرّف المهمة المعتمد
        serial: serialNumber,        // توافقًا مع تسلسل داخلي إن استُخدم
        createdAt: now,
        updatedAt: now,
      };

      // حفظ محلي متوافق لظهور القائمة في /admin/tasks
      const db = readDb();
      db.tasks = Array.isArray(db.tasks) ? db.tasks : [];
      db.tasks.push(task);
      writeDb(db);

      // مخرجات كما في كودك
      return res.status(201).json({ ok: true, task });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "Failed to create task" });
    }
  }

  // طرق أخرى غير مدعومة هنا
  res.setHeader("Allow", "GET,POST,OPTIONS");
  return res.status(405).end();
}
