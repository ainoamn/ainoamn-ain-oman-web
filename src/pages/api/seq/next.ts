// src/pages/api/seq/next.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { nextSerial } from "@/server/serialNumbers";

type Data = { serial: string; value: number; prefix: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data | { error: string }>) {
  const method = req.method || "GET";
  if (method !== "GET" && method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // prefix can come from query (?ns=AO-T) or JSON body { ns: "AO-T" }
  const nsFromQuery = typeof req.query.ns === "string" ? req.query.ns : undefined;
  const nsFromBody = typeof (req.body?.ns) === "string" ? req.body.ns : undefined;
  const prefix = nsFromQuery || nsFromBody || "AO-T";

  try {
    const { serial, value } = await nextSerial(prefix);
    return res.status(200).json({ serial, value, prefix });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
}
