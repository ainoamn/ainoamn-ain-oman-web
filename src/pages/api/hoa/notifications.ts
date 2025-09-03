import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    return res.status(200).json({
      items: [
        { id: "N-1", message: "تذكير: اجتماع مجلس الإدارة السبت 7 مساءً", createdAt: "2025-08-29" },
        { id: "N-2", message: "فاتورة خدمات سبتمبر متاحة للعرض",           createdAt: "2025-09-01" },
      ],
    });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}
