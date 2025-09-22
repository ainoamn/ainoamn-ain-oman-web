import type { NextApiRequest, NextApiResponse } from "next";

type Ticket = { id: string; by: string; type: string; status: "open" | "in_progress" | "done"; createdAt: string };
function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const items: Ticket[] = [
        { id: "REQ-1001", by: "U-102", type: "صيانة تسريب",   status: "open",         createdAt: "2025-08-30" },
        { id: "REQ-1002", by: "U-209", type: "فحص الكهرباء",  status: "in_progress",  createdAt: "2025-08-28" },
      ];
      return res.status(200).json({ items });
    }
    if (req.method === "POST") {
      // استقبل لاحقًا from req.body
      return res.status(201).json({ ok: true });
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}
