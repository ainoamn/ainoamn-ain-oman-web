// src/pages/api/task-categories/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "@/server/auth";
import { createCategory, deleteCategory, listCategories } from "@/server/taskCategories";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminApi(req, res)) return;

  if (req.method === "GET") {
    const items = await listCategories();
    return res.status(200).json({ ok: true, items });
  }
  if (req.method === "POST") {
    const { name, color, icon } = req.body || {};
    if (!name) return res.status(400).json({ ok: false, error: "NAME_REQUIRED" });
    const item = await createCategory(String(name), color ? String(color) : undefined, icon ? String(icon) : undefined);
    return res.status(200).json({ ok: true, item });
  }
  if (req.method === "DELETE") {
    const id = String(req.query.id || req.body?.id || "");
    if (!id) return res.status(400).json({ ok: false, error: "ID_REQUIRED" });
    const ok = await deleteCategory(id);
    return res.status(200).json({ ok: true, deleted: ok });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  res.status(405).json({ ok: false, error: "Method Not Allowed" });
}
