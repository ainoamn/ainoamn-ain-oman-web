// src/pages/api/ui/actions.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson } from "@/server/fsdb";
import { requireAdminApi } from "@/server/auth";

type ActionId = "chat_owner" | "chat_admin" | "book_visit" | "negotiate" | "book_unit" | "link";
type ActionDef = { id: string; label: string; visible: boolean; order: number; action: ActionId; href?: string };

const FILE = "ui-actions";

const DEFAULT_ACTIONS: ActionDef[] = [
  { id: "chat_owner",  label: "دردشة مع المالك",   visible: true, order: 1, action: "chat_owner" },
  { id: "chat_admin",  label: "تواصل مع الإدارة",  visible: true, order: 2, action: "chat_admin" },
  { id: "book_visit",  label: "طلب معاينة",        visible: true, order: 3, action: "book_visit" },
  { id: "negotiate",   label: "مناقشة السعر",      visible: true, order: 4, action: "negotiate" },
  { id: "book_unit",   label: "حجز العقار",        visible: true, order: 5, action: "book_unit" },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const items = await readJson<ActionDef[]>(FILE, DEFAULT_ACTIONS);
      return res.status(200).json({ items });
    }

    if (req.method === "PUT") {
      if (!requireAdminApi(req, res)) return;
      const body = req.body;
      if (!Array.isArray(body)) {
        return res.status(400).json({ ok: false, error: "Body must be an array of actions" });
      }
      const cleaned: ActionDef[] = body.map((x: any, i: number) => ({
        id: String(x?.id || `action_${i}`),
        label: String(x?.label || "زر"),
        visible: Boolean(x?.visible),
        order: Number.isFinite(+x?.order) ? +x.order : i + 1,
        action: (["chat_owner","chat_admin","book_visit","negotiate","book_unit","link"].includes(x?.action) ? x.action : "link") as ActionId,
        href: x?.href ? String(x.href) : undefined,
      }));
      await writeJson(FILE, cleaned);
      return res.status(200).json({ ok: true, items: cleaned });
    }

    if (req.method === "POST") {
      if (!requireAdminApi(req, res)) return;
      await writeJson(FILE, DEFAULT_ACTIONS);
      return res.status(200).json({ ok: true, items: DEFAULT_ACTIONS });
    }

    res.setHeader("Allow", "GET, PUT, POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (e) {
    console.error("api/ui/actions error:", e);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}
