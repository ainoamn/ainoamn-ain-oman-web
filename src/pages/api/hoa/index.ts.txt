import type { NextApiRequest, NextApiResponse } from "next";

const HOAS = [
  { id: "hoa_001", name: "مجمع الندى", status: "active" },
  { id: "hoa_002", name: "Villa Park", status: "inactive" },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json(HOAS);
  }
  if (req.method === "POST") {
    const { name } = req.body || {};
    const id = "hoa_" + Math.random().toString(36).slice(2, 8);
    HOAS.push({ id, name, status: "active" });
    return res.status(201).json({ id, name });
  }
  return res.status(405).end();
}
