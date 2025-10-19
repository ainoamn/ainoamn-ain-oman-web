// src/pages/api/ai/valuation.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { estimateValuation } from "../../../lib/ai";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const area = Number(req.query.area ?? 0);
  const location = (req.query.location as string) ?? "";
  const rooms = Number(req.query.rooms ?? 0);
  const price = estimateValuation({ area, location, rooms });
  res.status(200).json({ suggestedPrice: price, currency: "OMR" });
}
