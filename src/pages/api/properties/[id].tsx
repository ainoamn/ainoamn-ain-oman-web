// src/pages/api/properties/[id].tsx
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson } from "../../../server/fsdb"; // ← هنا التغيير
import { PROPERTIES } from "../../../lib/demoData";

const FILE = "properties.json";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const num = Number(id);
  if (Number.isNaN(num)) return res.status(400).json({ ok: false, error: "bad_id" });

  const stored = readJson<any[]>(FILE, []);
  const fromStored = stored.find(p => Number(p.id) === num);
  const fromDemo = PROPERTIES.find(p => Number(p.id) === num);

  const item = fromStored || fromDemo;
  if (!item) return res.status(404).json({ ok: false, error: "not_found" });

  return res.status(200).json({ ok: true, item });
}
