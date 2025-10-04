import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/properties/featured";

export default function legacyProxy(req: NextApiRequest, res: NextApiResponse) {
  return (handler as any)(req, res);
}
