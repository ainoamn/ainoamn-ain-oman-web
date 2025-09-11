// src/pages/api/seq/next.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), ".data");
const countersFile = path.join(dataDir, "counters.json");

async function ensure() {
  if (!fs.existsSync(dataDir)) await fsp.mkdir(dataDir, { recursive: true });
  if (!fs.existsSync(countersFile))
    await fsp.writeFile(countersFile, JSON.stringify({}, null, 2), "utf8");
}

function formatSeq(prefix: string, n: number) {
  return `${prefix}-${String(n).padStart(6, "0")}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  try {
    await ensure();
    const { entity } = req.body || {};
    const map: Record<string, { prefix: string; key: string }> = {
      PROPERTY: { prefix: "AO-P", key: "PROPERTY" },
      TASK: { prefix: "AO-T", key: "TASK" },
    };
    const meta = map[String(entity || "").toUpperCase()] || map.PROPERTY;

    const raw = await fsp.readFile(countersFile, "utf8");
    const js = JSON.parse(raw || "{}");
    const cur = Number(js[meta.key] || 0) + 1;
    js[meta.key] = cur;
    await fsp.writeFile(countersFile, JSON.stringify(js, null, 2), "utf8");

    return res.status(200).json({ referenceNo: formatSeq(meta.prefix, cur), seq: cur });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Internal Error" });
  }
}
