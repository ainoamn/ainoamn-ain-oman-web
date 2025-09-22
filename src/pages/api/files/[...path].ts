// جذر الصفحة: src/pages/api/files/[...path].ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const root = path.join(process.cwd(), ".data", "uploads");

function mimeFromExt(p: string) {
  const ext = p.toLowerCase().split(".").pop() || "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    webm: "video/webm",
    pdf: "application/pdf",
  };
  return map[ext] || "application/octet-stream";
}
function handler(req: NextApiRequest, res: NextApiResponse) {
  const parts = req.query.path;
  const rel = Array.isArray(parts) ? parts.join("/") : String(parts || "");
  const abs = path.join(root, rel);

  if (!abs.startsWith(root)) return res.status(400).end("Bad path");
  if (!fs.existsSync(abs)) return res.status(404).end("Not found");

  res.setHeader("Content-Type", mimeFromExt(abs));
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  fs.createReadStream(abs).pipe(res);
}
