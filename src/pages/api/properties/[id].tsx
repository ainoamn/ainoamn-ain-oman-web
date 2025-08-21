/**
 * API: GET /api/properties/[id]
 * يدعم البحث بـ id الرقمي أو serial مثل AO-P-000001
 */
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), ".data");
const file = path.join(dataDir, "properties.json");
function ensure() { if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true }); if (!fs.existsSync(file)) fs.writeFileSync(file, "[]", "utf8"); }
function readAll(): any[] { ensure(); return JSON.parse(fs.readFileSync(file, "utf8")); }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "Method not allowed" });
    }
    const id = String(req.query.id || "");
    const items = readAll();
    const byNum = items.find((x) => String(x.id) === id);
    const bySerial = items.find((x) => String(x.serial) === id);
    const item = byNum || bySerial;
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.status(200).json({ item });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
