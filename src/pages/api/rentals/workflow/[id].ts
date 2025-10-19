// src/pages/api/rentals/workflow/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson } from "@/server/fsdb";

type RentalWorkflow = { id: string; events: { at: string; event: string; payload?: any }[] };
const FILE = "rental_workflow.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id || "");
  const list = await readJson<RentalWorkflow[]>(FILE, []);
  const i = list.findIndex(x => x.id === id);

  if (req.method === "POST") {
    const body = req.body || {};
    const ev = { at: new Date().toISOString(), event: String(body.event || ""), payload: body || {} };
    if (i >= 0) list[i].events.push(ev);
    else list.push({ id, events: [ev] });
    await writeJson(FILE, list);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "GET") {
    if (i < 0) return res.status(200).json({ id, events: [] });
    return res.status(200).json(list[i]);
  }

  return res.status(405).end();
}
