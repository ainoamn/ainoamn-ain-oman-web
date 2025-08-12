import type { NextApiRequest, NextApiResponse } from "next";

type Auction = { id: string; title: string; endAt: string; current: number; minStep: number };
let AUCTIONS: Auction[] = [
  { id: "AUC-5001", title: "مزايدة: فيلا بوشر", endAt: new Date(Date.now()+86400000).toISOString(), current: 120000, minStep: 1000 },
  { id: "AUC-5002", title: "أرض صناعية صحار", endAt: new Date(Date.now()+4*3600*1000).toISOString(), current: 68000, minStep: 500 },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json(AUCTIONS);
  }
  if (req.method === "POST") {
    const { id, bid } = req.body || {};
    const item = AUCTIONS.find((a) => a.id === id);
    if (!item) return res.status(404).json({ message: "Auction not found" });
    const nbid = Number(bid) || 0;
    if (nbid < item.current + item.minStep) return res.status(400).json({ message: "Bid too low" });
    item.current = nbid;
    return res.status(200).json(item);
  }
  return res.status(405).json({ message: "Method Not Allowed" });
}