// src/pages/api/messages/[threadId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { addMessage, getThread } from "@/server/messages/store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { threadId } = req.query;
  const tid = Array.isArray(threadId) ? threadId[0] : threadId;
  if (!tid) return res.status(400).json({ error: "Missing threadId" });

  if (req.method === "GET") {
    const data = await getThread(String(tid));
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { senderId, text } = req.body || {};
    if (!senderId || !text) return res.status(400).json({ error: "Missing fields" });
    const msg = await addMessage(String(tid), String(senderId), String(text));
    const data = await getThread(String(tid));
    return res.status(200).json({ ok:true, last: msg, messages: data.messages });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
