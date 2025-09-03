import type { NextApiRequest, NextApiResponse } from "next";

type Doc = { id: string; title: string; expiry?: string };

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const docs: Doc[] = [
      { id: "DOC-1", title: "عقد صيانة المصاعد", expiry: "2025-09-20" },
      { id: "DOC-2", title: "وثيقة التأمين",     expiry: "2025-10-10" },
    ];
    return res.status(200).json(docs);
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}
