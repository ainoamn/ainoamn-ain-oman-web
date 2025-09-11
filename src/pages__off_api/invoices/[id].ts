// src/pages/api/invoices/[id].ts
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
  const id = String(req.query.id || "");
  const list = await readJson<Invoice[]>("invoices", []);
  const item = list.find(x => x.id === id || x.serial === id);
  if (!item) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
  return res.status(200).json({ ok: true, item });
}
