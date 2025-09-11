import type { NextApiRequest, NextApiResponse } from "next";

type Result =
  | { ok: true; id: string; received: Record<string, any> }
  | { ok: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result>
) {
  if (req.method === "POST") {
    const id = `CNT-${Math.floor(Date.now() / 1000)}`;
    return res
      .status(200)
      .json({ ok: true, id, received: (req.body as Record<string, any>) ?? {} });
  }
  res.setHeader("Allow", "POST");
  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}
