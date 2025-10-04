export type Visibility = "private" | "public" | "tenant";

export type ExtraRow = {
  label: string;
  value: string;
  image?: string;
  visibility: Visibility;
};

export type Unit = {
  id: string;
  unitNo: string;
  serialNo?: string;
  type?: string;
  area?: number;
  rentAmount?: number;
  currency?: string;
  status: "vacant" | "rented" | "under-maintenance";
  images?: string[];
  published?: boolean;
};

export type Property = {
  id: string;
  name: string;
  address: string;
  status: "vacant" | "rented" | "under-maintenance";
  image: string;
  units: Unit[];
  published: boolean;
  extra?: ExtraRow[];
};
import type { NextApiRequest, NextApiResponse } from "next";
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return res.status(200).json({ ok: true });
  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}
