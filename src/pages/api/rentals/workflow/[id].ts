// src/pages/api/rentals/workflow/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { transition } from "@/server/rentals/workflow";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const id = req.query.id as string; const { event, note } = req.body || {};
  try { const rental = await transition(id, event, (req.headers["x-user-id"] as string) || "system", note); res.json({ ok: true, rental }); }
  catch (e:any){ res.status(400).json({ error: e?.message || "transition_failed" }); }
}
