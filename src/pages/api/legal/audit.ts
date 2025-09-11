// src/pages/api/legal/audit.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Audit } from "@/server/legal/store";
import { contextFrom } from "@/lib/user-context";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = contextFrom(req);
  const caseId = (req.query.caseId as string) || "";
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }
  if (!caseId) return res.status(400).json({ error: "caseId required" });
  const list = Audit.listByCase(ctx.tenantId, caseId);
  return res.status(200).json(list);
}
