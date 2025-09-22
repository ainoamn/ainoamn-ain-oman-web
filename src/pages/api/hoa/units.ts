import type { NextApiRequest, NextApiResponse } from "next";

type Unit = {
  id: string;
  buildingId: string;
  name: string;
  owner?: string;
  area?: number;
  balance?: number;
  createdAt?: string;
};

const sample: Unit[] = [
  { id: "U-101", buildingId: "B-001", name: "الدور 1 - شقة 1", owner: "أحمد", area: 120, balance: 0 },
  { id: "U-102", buildingId: "B-001", name: "الدور 1 - شقة 2", owner: "سمية", area: 115, balance: 72.5 },
];
function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const { buildingId } = req.query as { buildingId?: string };
      const data = buildingId ? sample.filter(u => u.buildingId === buildingId) : sample;
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const { buildingId, name, owner, area, balance } = (req.body ?? {}) as Partial<Unit>;
      if (!buildingId || !name) {
        return res.status(400).json({ error: "buildingId and name are required" });
      }
      const newUnit: Unit = {
        id: "U-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        buildingId,
        name,
        owner,
        area: typeof area === "string" ? parseFloat(area) : area,
        balance: typeof balance === "string" ? parseFloat(balance) : balance ?? 0,
        createdAt: new Date().toISOString(),
      };
      return res.status(201).json(newUnit);
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Units API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
