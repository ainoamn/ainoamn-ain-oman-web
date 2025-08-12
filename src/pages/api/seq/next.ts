// src/pages/api/seq/next.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { issueNextSerial, type EntityKey } from "@/lib/serialNumbers";

type PostBody = {
  entity: EntityKey;           // مثال: "PROPERTY" | "AUCTION" | ...
  year?: number;               // اختياري
  width?: number;              // اختياري (عدد الخانات)
  prefixOverride?: string;     // اختياري
  resetPolicy?: "yearly" | "never"; // اختياري
  resourceIdHint?: string;     // اختياري: لأغراض التتبع
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // نسمح بـ POST فقط
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = (req.body || {}) as PostBody;

    if (!body.entity) {
      return res.status(400).json({ ok: false, error: "Missing 'entity' field" });
    }

    const actorId =
      (req.headers["x-user-id"] as string | undefined) ||
      null;

    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      null;

    const userAgent = req.headers["user-agent"] || null;

    const result = await issueNextSerial(body.entity, {
      year: body.year,
      width: body.width,
      prefixOverride: body.prefixOverride,
      resetPolicy: body.resetPolicy ?? "yearly",
      audit: {
        actorId,
        ip: typeof ip === "string" ? ip : null,
        userAgent: typeof userAgent === "string" ? userAgent : null,
        resourceIdHint: body.resourceIdHint ?? null,
        detailsJson: null,
      },
    });

    return res.status(200).json({
      ok: true,
      entity: result.entity,
      year: result.year,
      counter: result.counter,
      serial: result.serial,
    });
  } catch (err: any) {
    console.error("SEQ_NEXT_ERROR", err);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}
