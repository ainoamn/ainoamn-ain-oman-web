import type { NextApiRequest, NextApiResponse } from "next";
import { getAll } from "@/server/properties/store";
import { HOMEPAGE } from "@/lib/homepage-config";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const limit = Math.max(1, Math.min(50, Number(req.query.limit || HOMEPAGE.limits.featured)));
  const tag = String(req.query.tag || HOMEPAGE.featuredTag).toLowerCase();

  const items = getAll()
    .filter((p: any) => {
      const flags = [
        p?.featured === true,
        String(p?.status || "").toLowerCase() === "featured",
        Array.isArray(p?.tags) && p.tags.map((x: any) => String(x).toLowerCase()).includes(tag),
      ];
      return flags.some(Boolean);
    })
    .sort((a: any, b: any) => String(b?.updatedAt || b?.createdAt || "").localeCompare(String(a?.updatedAt || a?.createdAt || "")))
    .slice(0, limit);

  return res.status(200).json({ items });
}
