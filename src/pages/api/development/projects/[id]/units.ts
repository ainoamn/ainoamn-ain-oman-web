import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type Project = { id: string; units?: any[] };

const DATA_PATH = path.join(process.cwd(), "data", "development.projects.json");
function readAll(): Project[] {
  if (!fs.existsSync(DATA_PATH)) return [];
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8") || "[]");
}
function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }
    const id = String(req.query.id || "");
    const all = readAll();
    const prj = all.find(p => p.id === id);
    return res.status(200).json({ items: prj?.units || [] });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "server_error", message: e?.message });
  }
}
