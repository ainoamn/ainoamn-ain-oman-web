// @ts-nocheck
/**
 * API: GET/DELETE /api/admin/notifications/log
 * - GET: ?page=1&pageSize=50
 * Location: src/pages/api/admin/notifications/log.ts
 */
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { PaginatedLogs, SendLogItem } from "@/types/notifications";

const dataDir = path.join(process.cwd(), ".data");
const logFile = path.join(dataDir, "notifications-log.json");

function ensure() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(logFile)) fs.writeFileSync(logFile, "[]", "utf8");
}

function readLog(): SendLogItem[] {
  ensure();
  return JSON.parse(fs.readFileSync(logFile, "utf8"));
}

function writeLog(items: SendLogItem[]) {
  ensure();
  fs.writeFileSync(logFile, JSON.stringify(items, null, 2), "utf8");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
      const pageSize = Math.max(1, Math.min(200, parseInt(String(req.query.pageSize || "50"), 10) || 50));
      const all = readLog();
      const total = all.length;
      const start = (page - 1) * pageSize;
      const items = all.slice().reverse().slice(start, start + pageSize); // newest first
      const payload: PaginatedLogs = { page, pageSize, total, items };
      return res.status(200).json(payload);
    }

    if (req.method === "DELETE") {
      writeLog([]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET,DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
