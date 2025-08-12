import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hoaId } = req.query as { hoaId: string };
  // demo summary
  return res.status(200).json({
    id: hoaId,
    name: hoaId === "hoa_001" ? "مجمع الندى" : "Villa Park",
    members: 42,
    openTickets: 3,
    collectionRate: 0.86,
  });
}
