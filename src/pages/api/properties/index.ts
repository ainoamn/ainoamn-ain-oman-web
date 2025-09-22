// src/pages/api/properties/index.ts
import type { NextApiRequest, NextApiResponse } from "next";

// نفس مخزن المباني المستخدم سابقًا
type Unit = {
  id: string;
  unitNo: string;
  rentAmount?: number;
  currency?: string;
  status?: "vacant" | "reserved" | "leased";
  published?: boolean;
  image?: string;
  images?: string[];
};
type Building = {
  id: string;
  buildingNo: string;
  address: string;
  images?: string[];
  coverIndex?: number;
  published?: boolean;
  archived?: boolean;
  units: Unit[];
  createdAt: string;
  updatedAt: string;
};
type DB = { buildings: Building[] };
// @ts-ignore
global.__AIN_DB__ = global.__AIN_DB__ || ({ buildings: [] } as DB);
const db: DB = global.__AIN_DB__;

function resolveSrc(name?: string) {
  if (!name) return "";
  if (/^https?:\/\//.test(name) || name.startsWith("data:") || name.startsWith("/")) return name;
  return `/uploads/${name}`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET /api/properties?published=1
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  const publishedOnly = String(req.query.published || "1") === "1";
  const includeArchived = String(req.query.includeArchived || "0") === "1";

  const items = db.buildings
    .filter((b) => (includeArchived || !b.archived) && (!publishedOnly || !!b.published))
    .flatMap((b) => {
      const coverList = b.images || [];
      const cover =
        coverList[(typeof b.coverIndex === "number" ? b.coverIndex : 0) || 0] || coverList[0] || "";
      return (b.units || [])
        .filter((u) => (!publishedOnly || !!u.published))
        .map((u) => ({
          id: `${b.id}::${u.id}`, // معرف تركيبي آمن للقائمة
          buildingId: b.id,
          unitId: u.id,
          buildingNo: b.buildingNo,
          unitNo: u.unitNo,
          address: b.address,
          image: resolveSrc(u.image || u.images?.[0] || cover),
          rentAmount: u.rentAmount || 0,
          currency: u.currency || "OMR",
          status: u.status || "vacant",
        }));
    });

  return res.json({ items });
}
