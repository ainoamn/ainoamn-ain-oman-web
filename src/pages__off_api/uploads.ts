// جذر الصفحة: src/pages/api/uploads.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import crypto from "crypto";

export const config = { api: { bodyParser: { sizeLimit: "25mb" } } };

const dataDir = path.join(process.cwd(), ".data", "uploads");

function mimeFromName(name?: string, fallback = "application/octet-stream") {
  const ext = (name || "").toLowerCase().split(".").pop() || "";
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
  return map[ext] || fallback;
}

function parseDataUrl(input: string) {
  const m = input.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return { mime: "", buf: Buffer.from(input, "base64") };
  return { mime: m[1], buf: Buffer.from(m[2], "base64") };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  try {
    if (!fs.existsSync(dataDir)) await fsp.mkdir(dataDir, { recursive: true });

    const { files } = req.body || {};
    if (!Array.isArray(files) || files.length === 0) return res.status(400).json({ error: "No files" });

    const day = new Date();
    const sub = path.join(
      String(day.getFullYear()),
      String(day.getMonth() + 1).padStart(2, "0"),
      String(day.getDate()).padStart(2, "0")
    );
    const targetDir = path.join(dataDir, sub);
    await fsp.mkdir(targetDir, { recursive: true });

    const out: Array<{ url: string; name: string; size: number; mime: string }> = [];

    for (const f of files) {
      const name = String(f?.name || "file");
      const data = String(f?.data || "");
      const id = crypto.randomBytes(8).toString("hex");
      const ext = name.includes(".") ? "." + name.split(".").pop() : "";
      const parsed = data.startsWith("data:")
        ? parseDataUrl(data)
        : { mime: "", buf: Buffer.from(data, "base64") };
      const mime = parsed.mime || mimeFromName(name);
      const filename = `${id}${ext || ""}`;
      const abs = path.join(targetDir, filename);
      await fsp.writeFile(abs, parsed.buf);
      out.push({ url: `/api/files/${sub}/${filename}`, name, size: parsed.buf.length, mime });
    }

    return res.status(200).json({ files: out });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Unknown error" });
  }
}
