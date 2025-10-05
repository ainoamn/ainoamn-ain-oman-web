import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      return res.status(200).json([
        { id: "HOA-001", name: "جمعية الملاك - برج المسرة", status: "active" },
      ]);
    }
    if (req.method === "POST") {
      // استقبل بيانات الإنشاء لاحقًا من req.body
      return res.status(201).json({ ok: true });
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
