// src/pages/api/rentals/contracts/generate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { transition } from "@/server/rentals/workflow";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method!=="POST") return res.status(405).end();
  const { rentalId } = req.body || {}; if (!rentalId) return res.status(400).json({ error:"missing_rentalId" });
  try { await transition(rentalId, "generate_contract", (req.headers["x-user-id"] as string)||"system"); res.json({ ok:true }); }
  catch(e:any){ res.status(400).json({ error:e?.message||"failed" }); }
}
