// src/pages/api/invoices/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson } from "@/server/fsdb";
import { requireAdminApi } from "@/server/auth";
import type { Invoice } from "@/server/workflow";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminApi(req, res)) return;
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  const list = await readJson<Invoice[]>("invoices", []);
  return res.status(200).json({ ok: true, items: list });
}
