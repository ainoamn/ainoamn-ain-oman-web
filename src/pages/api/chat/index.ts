// src/pages/api/chat/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { readJson, writeJson } from "../../../server/fsdb";

type ChatTarget = "owner" | "admin";
type Message = { id: string; from: "user"|"owner"|"system"|"admin"; text: string; at: string };
type Thread = { id: string; subject?: string; pageUrl?: string; propertyId?: number; target: ChatTarget; createdAt: string; messages: Message[] };

const FILE = "chat.json";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const threads = readJson<Thread[]>(FILE, []);

  if (req.method === "GET") {
    return res.status(200).json({ threads });
  }

  if (req.method === "POST") {
    const { threadId, message, subject, pageUrl, propertyId, target = "admin" } = req.body || {};
    const now = new Date().toISOString();

    if (!threadId) {
      const id = `t_${Date.now()}`;
      const msg: Message = { id: `m_${Date.now()}`, from: "user", text: String(message ?? "مرحبا"), at: now };
      const t: Thread = { id, subject, pageUrl, propertyId: propertyId ? Number(propertyId) : undefined, target, createdAt: now, messages: [msg] };
      threads.unshift(t);
      writeJson(FILE, threads);
      return res.status(201).json({ ok: true, threadId: id, createdAt: now, messageId: msg.id });
    } else {
      const t = threads.find(x => x.id === String(threadId));
      if (!t) return res.status(404).json({ ok: false, error: "thread_not_found" });
      const msg: Message = { id: `m_${Date.now()}`, from: "user", text: String(message ?? ""), at: now };
      t.messages.push(msg);
      writeJson(FILE, threads);
      return res.status(200).json({ ok: true, threadId, messageId: msg.id, at: now });
    }
  }

  return res.status(405).json({ ok: false, error: "method_not_allowed" });
}
