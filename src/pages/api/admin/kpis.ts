// src/pages/api/admin/kpis.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type KPIs = { users: number; properties: number; tasks: number; revenue: number };

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "admin-kpis.json");

function readKPIs(): KPIs {
  try {
    if (!fs.existsSync(dataFile)) {
      return { users: 0, properties: 0, tasks: 0, revenue: 0 };
    }
    const raw = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(raw) as KPIs;
  } catch {
    return { users: 0, properties: 0, tasks: 0, revenue: 0 };
  }
}

function writeKPIs(kpi: KPIs) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(kpi, null, 2), "utf8");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json(readKPIs());
  }
  if (req.method === "POST" || req.method === "PUT") {
    const body = req.body || {};
    const current = readKPIs();
    const next: KPIs = {
      users: Number(body.users ?? current.users),
      properties: Number(body.properties ?? current.properties),
      tasks: Number(body.tasks ?? current.tasks),
      revenue: Number(body.revenue ?? current.revenue),
    };
    writeKPIs(next);
    return res.status(200).json(next);
  }
  return res.status(405).json({ error: "Method not allowed" });
}
