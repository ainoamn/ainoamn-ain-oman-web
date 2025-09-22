// src/pages/api/chat/[threadId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson } from "../../../server/fsdb";

const FILE = "chat.json";
function handler(req: NextApiRequest, res: NextApiResponse) {
  const { threadId } = req.query;
  const threads = readJson<any[]>(FILE, []);
  const t = threads.find((x) => x.id === String(threadId));
  if (!t) return res.status(404).json({ ok: false, error: "thread_not_found" });

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, thread: t });
  }

  if (req.method === "POST") {
    const { message, from = "user" } = req.body || {};
    const msg = { id: `m_${Date.now()}`, from, text: String(message ?? ""), at: new Date().toISOString() };
    t.messages.push(msg);
    writeJson(FILE, threads);
    return res.status(200).json({ ok: true, messageId: msg.id });
  }

  return res.status(405).json({ ok: false, error: "method_not_allowed" });
}
