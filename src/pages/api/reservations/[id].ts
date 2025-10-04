import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/bookings/[id]";

export default function compat(req: NextApiRequest, res: NextApiResponse) {
  return (handler as any)(req, res);
}
