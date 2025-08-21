// FILE: src/pages/api/notify/send.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "@/server/auth";
import { enqueue } from "@/server/notify/store";

/** نقطة عامة لإرسال إشعار/رسالة (تُسجّل في outbox) */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdminApi(req, res)) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  const { channel, to, subject, text, taskId } = (req.body || {}) as any;
  if (!channel || !to || !text) return res.status(400).json({ ok: false, error: "MISSING_DATA" });

  const saved = await enqueue({ channel, to, subject, text, taskId });
  return res.status(200).json({ ok: true, item: saved });
}
