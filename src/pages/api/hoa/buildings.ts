import type { NextApiRequest, NextApiResponse } from "next";
function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    return res.status(200).json([
      { id: "B-001", hoaId: "HOA-001", name: "برج المسرة A", address: "المعبيلة الجنوبية" },
    ]);
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}
