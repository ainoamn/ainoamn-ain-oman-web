// src/pages/api/admin/notifications.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export type Notification = {
  id: string;
  title: string;
  message?: string;
  level?: "info" | "success" | "warning" | "error";
  createdAt: string;
  read: boolean;
};

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "admin-notifications.json");

function readAll(): Notification[] {
  try {
    if (!fs.existsSync(dataFile)) return [];
    const raw = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAll(list: Notification[]) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(list, null, 2), "utf8");
}
function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const list = readAll();
    return res.status(200).json({ notifications: list });
  }

  if (req.method === "POST") {
    const { title, message, level } = req.body || {};
    if (!title) return res.status(400).json({ error: "title is required" });
    const list = readAll();
    const item: Notification = {
      id: crypto.randomUUID(),
      title: String(title),
      message: message ? String(message) : undefined,
      level: (["info", "success", "warning", "error"] as const).includes(level) ? level : "info",
      createdAt: new Date().toISOString(),
      read: false,
    };
    list.unshift(item);
    writeAll(list);
    return res.status(201).json({ notification: item });
  }

  if (req.method === "PATCH") {
    const { id, read } = req.body || {};
    if (!id) return res.status(400).json({ error: "id is required" });
    const list = readAll().map((n) => (n.id === id ? { ...n, read: Boolean(read) } : n));
    writeAll(list);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const id = (req.query?.id as string) || (req.body?.id as string);
    if (!id) return res.status(400).json({ error: "id is required" });
    const list = readAll().filter((n) => n.id !== id);
    writeAll(list);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
