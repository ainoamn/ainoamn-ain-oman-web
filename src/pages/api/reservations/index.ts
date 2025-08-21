import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type Reservation = {
  id: string;
  projectId: string;
  unitId?: string;
  name?: string;
  phone?: string;
  note?: string;
  createdAt: string;
};

const DATA_PATH = path.join(process.cwd(), "data", "reservations.json");
function readAll(): Reservation[] { if (!fs.existsSync(DATA_PATH)) return []; return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8") || "[]"); }
function writeAll(arr: Reservation[]) { fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true }); fs.writeFileSync(DATA_PATH, JSON.stringify(arr, null, 2), "utf-8"); }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const items = readAll();
      const projectId = String(req.query.projectId || "");
      const unitId = String(req.query.unitId || "");
      const filtered = items.filter(x => (!projectId || x.projectId === projectId) && (!unitId || x.unitId === unitId));
      return res.status(200).json({ items: filtered });
    }
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body?.projectId) return res.status(400).json({ ok: false, error: "projectId_required" });
      const all = readAll();
      const id = "RSV-" + Date.now().toString(36);
      const item: Reservation = { id, projectId: body.projectId, unitId: body.unitId, name: body.name, phone: body.phone, note: body.note, createdAt: new Date().toISOString() };
      all.push(item); writeAll(all);
      return res.status(200).json({ ok: true, item });
    }
    res.setHeader("Allow", "GET,POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "server_error", message: e?.message });
  }
}
