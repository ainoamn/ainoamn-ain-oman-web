import type { NextApiRequest, NextApiResponse } from "next";
import { Directory, uid, now, Audit } from "../../../server/legal/store";
import { contextFrom } from "../../../lib/user-context";
import type { DirectoryKind } from "../../../server/legal/types";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = contextFrom(req);
  const kind = (req.query.kind as DirectoryKind) || (req.body?.kind as DirectoryKind);

  if (req.method==="GET") {
    return res.status(200).json(Directory.list(ctx.tenantId, kind));
  }

  if (req.method==="POST") {
    const action = String(req.body?.action || "upsert");
    if (action==="upsert") {
      const id = String(req.body?.id || req.body?.subscriptionNo || uid());
      Directory.upsert({
        id,
        tenantId: ctx.tenantId,
        kind: kind || "CLIENT",
        subscriptionNo: String(req.body?.subscriptionNo || id),
        name: String(req.body?.name || "بدون اسم"),
        phoneNumbers: Array.isArray(req.body?.phoneNumbers) ? req.body.phoneNumbers : [],
        emails: Array.isArray(req.body?.emails) ? req.body.emails : [],
      });
      Audit.add({ id: uid(), tenantId: ctx.tenantId, actorId: ctx.userId, action: "upsert", entity: "directory", entityId: id, at: now(), meta: { kind } });
      return res.status(201).json({ id });
    }
    if (action==="import") {
      const entries: { subscriptionNo: string; name: string; id?: string }[] = Array.isArray(req.body?.entries) ? req.body.entries : [];
      const out = Directory.importMany(ctx.tenantId, kind || "CLIENT", entries);
      return res.status(201).json(out);
    }
    return res.status(400).json({ error:"invalid action" });
  }

  res.setHeader("Allow","GET,POST"); return res.status(405).end();
}
