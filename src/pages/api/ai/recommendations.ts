// src/pages/api/ai/recommendations.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getRecommendations } from "../../../lib/ai";
function handler(req: NextApiRequest, res: NextApiResponse) {
  const input = {
    userId: (req.query.userId as string) || undefined,
    context: (req.query.context as any) || "browse",
    propertyId: (req.query.propertyId as string) || undefined,
    limit: req.query.limit ? Number(req.query.limit) : 6
  };
  const data = getRecommendations(input);
  res.status(200).json({ items: data });
}