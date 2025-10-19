import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return res.status(501).json({ message: "Watermarking via API is not implemented. Use client-side applyWatermark()." });
  }
  return res.status(405).json({ message: "Method Not Allowed" });
}
