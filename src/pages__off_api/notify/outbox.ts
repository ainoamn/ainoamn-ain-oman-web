// FILE: src/pages/api/notify/outbox.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "@/server/auth";
import { listOutbox } from "@/server/notify/store";

/** قراءة سجل الإرسال (outbox) */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminApi(req, res)) return;
  const items = await listOutbox(500);
  return res.status(200).json({ ok: true, items });
}
