/**
 * API DEV: GET /api/dev/seed-properties
 * يضيف 3 عقارات تجريبية إذا كان الملف فارغاً.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
const dataDir = path.join(process.cwd(), ".data");
const file = path.join(dataDir, "properties.json");
function ensure() { if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true }); if (!fs.existsSync(file)) fs.writeFileSync(file, "[]", "utf8"); }
function readAll(): any[] { ensure(); return JSON.parse(fs.readFileSync(file, "utf8")); }
function writeAll(arr: any[]) { ensure(); fs.writeFileSync(file, JSON.stringify(arr, null, 2), "utf8"); }
function pad(n: number, w = 6) { return String(n).padStart(w, "0"); }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") { res.setHeader("Allow","GET"); return res.status(405).json({ error: "Method not allowed" }); }
    const arr = readAll();
    if (arr.length > 0) return res.status(200).json({ ok: true, items: arr, note: "already seeded" });
    const base = (i: number) => ({
      id: i,
      serial: `AO-P-${pad(i)}`,
      title: `شقة رقم ${i}`,
      description: "وصف تجريبي",
      priceMonthly: 60 + i * 5,
      currency: "OMR",
      purpose: "rent",
      rentalType: "monthly",
      location: i % 2 ? "مسقط - السيب" : "مسقط - بوشر",
      image: "https://images.unsplash.com/photo-1505692952047-1a78307da8ab",
      beds: 2, baths: 2, area: 120 + i * 10, rating: 4.5,
      lat: 23.5859, lng: 58.4059,
      amenities: ["مواقف","تكييف مركزي","إنترنت عالي السرعة"],
      attractions: ["قريب من البحر","قريب من المدارس"],
    });
    const items = [base(1), base(2), base(3)];
    writeAll(items);
    return res.status(200).json({ ok: true, items });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
