// src/pages/api/uploads/[name].ts
import type { NextApiRequest, NextApiResponse } from "next";

type Upload = { mime: string; buf: Buffer };
type Store = { files: Record<string, Upload> };
// @ts-ignore
global.__AIN_UPLOADS__ = (global.__AIN_UPLOADS__ || { files: {} }) as Store;
const store: Store = global.__AIN_UPLOADS__;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = String(req.query.name || "");
  const it = store.files[raw];
  if (!it) return res.status(404).end("not found");
  res.setHeader("Content-Type", it.mime || "application/octet-stream");
  res.setHeader("Cache-Control", "no-store");
  res.send(it.buf);
}
