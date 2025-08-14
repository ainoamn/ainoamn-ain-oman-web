// src/pages/api/notifications/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson } from "@/server/fsdb";
import { requireAdminApi } from "@/server/auth";

type Notification = {
  id: string;
  type: string;
  target: "admin" | "landlord" | "tenant";
  message: string;
  data?: any;
  createdAt: string;
  read?: boolean;
};

const FILE = "notifications";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // يمكن لاحقًا فلترة حسب target/المستخدم. حاليًا للمشرف فقط.
    if (!requireAdminApi(req, res)) return;
    const list = await readJson<Notification[]>(FILE, []);
    return res.status(200).json({ ok: true, items: list });
  }

  if (req.method === "POST") {
    if (!requireAdminApi(req, res)) return;
    const body = req.body || {};
    const list = await readJson<Notification[]>(FILE, []);
    const rec: Notification = {
      id: `${Date.now()}`,
      type: String(body.type || "custom"),
      target: body.target === "landlord" ? "landlord" : body.target === "tenant" ? "tenant" : "admin",
      message: String(body.message || ""),
      data: body.data || undefined,
      createdAt: new Date().toISOString(),
      read: false,
    };
    await writeJson(FILE, [rec, ...list]);
    return res.status(200).json({ ok: true, item: rec });
  }

  if (req.method === "PUT") {
    // تعليم كمقروء: { ids: string[] }
    if (!requireAdminApi(req, res)) return;
    const body = req.body || {};
    const ids: string[] = Array.isArray(body.ids) ? body.ids.map(String) : [];
    const list = await readJson<Notification[]>(FILE, []);
    const out = list.map(n => (ids.includes(n.id) ? { ...n, read: true } : n));
    await writeJson(FILE, out);
    return res.status(200).json({ ok: true, items: out });
  }

  res.setHeader("Allow", "GET, POST, PUT");
  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}
