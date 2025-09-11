// src/pages/api/conversations/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { listThreadsForUser } from "@/server/messages/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = String(req.headers["x-user-id"] || "guest");
  const items = await listThreadsForUser(userId);
  return res.status(200).json({ items });
}
