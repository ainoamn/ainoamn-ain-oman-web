// src/pages/api/exchange.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  // أسعار تجريبية: 1 OMR كم يساوي من العملات الأخرى
  res.status(200).json({
    base: "OMR",
    rates: {
      OMR: 1,
      AED: 9.55,
      SAR: 9.75,
      USD: 2.60
    },
    updatedAt: new Date().toISOString()
  });
}
