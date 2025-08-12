import type { NextApiRequest, NextApiResponse } from "next";

let REVIEWS = [
  { id: "RV-0001", author: "أحمد", rating: 5, comment: "تجربة ممتازة وسهلة.", date: "2025-08-01" },
  { id: "RV-0002", author: "مريم", rating: 4, comment: "واجهة رائعة.", date: "2025-08-05" },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json(REVIEWS);
  }
  if (req.method === "POST") {
    const { author, rating, comment } = req.body || {};
    const id = `RV-${String(REVIEWS.length + 1).padStart(4, "0")}`;
    const item = { id, author, rating: Number(rating) || 0, comment: comment || "", date: new Date().toISOString().slice(0,10) };
    REVIEWS.unshift(item);
    return res.status(201).json(item);
  }
  return res.status(405).json({ message: "Method Not Allowed" });
}