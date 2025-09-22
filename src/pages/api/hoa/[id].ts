import type { NextApiRequest, NextApiResponse } from "next";
function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query as { id?: string };
    if (req.method === "GET") {
      return res.status(200).json({
        id,
        name: "HOA تفاصيل",
        members: 120,
        openTickets: 4,
        collectionRate: 0.86,
      });
    }
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
