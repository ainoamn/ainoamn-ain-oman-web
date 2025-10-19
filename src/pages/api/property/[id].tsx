import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Minimal API placeholder for /api/property/[id]
  return res.status(404).json({ error: 'Not found' });
}
