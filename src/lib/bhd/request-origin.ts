import type { NextApiRequest } from "next";

export function requestOrigin(req: NextApiRequest): string {
  const proto =
    (typeof req.headers["x-forwarded-proto"] === "string"
      ? req.headers["x-forwarded-proto"].split(",")[0]
      : ""
    ).trim() || (process.env.NODE_ENV === "production" ? "https" : "http");
  const host =
    (typeof req.headers["x-forwarded-host"] === "string"
      ? req.headers["x-forwarded-host"].split(",")[0]
      : req.headers.host || "localhost:3000"
    ).trim();
  return `${proto}://${host}`;
}
