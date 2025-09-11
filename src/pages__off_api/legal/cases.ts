import type { NextApiRequest, NextApiResponse } from "next";
import { Cases, uid, now, Audit } from "../../../server/legal/store";
import { contextFrom } from "../../../lib/user-context";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = contextFrom(req);

  if (req.method==="GET") {
    return res.status(200).json(Cases.listByTenant(ctx.tenantId));
  }

  if (req.method==="POST") {
    const { id, title, clientId, primaryLawyerId } = req.body||{};
    const c = Cases.create(
      ctx.tenantId,
      String(title || `قضية ${id||""}`.trim()),
      String(clientId || "C1"),
      String(primaryLawyerId || "U1"),
      id ? String(id) : undefined
    );
    Audit.add({ id: uid(), tenantId: ctx.tenantId, actorId: ctx.userId, action: "caseCreate", entity: "case", entityId: c.id, at: now() });
    return res.status(201).json(c);
  }

  if (req.method==="PUT") {
    const { id, ...patch } = req.body||{};
    if (!id) return res.status(400).json({ error: "id_required" });
    const updated = Cases.upsertById({ id: String(id), tenantId: ctx.tenantId, ...patch });
    Audit.add({ id: uid(), tenantId: ctx.tenantId, actorId: ctx.userId, action: "caseUpdate", entity: "case", entityId: updated.id, at: now(), meta: { upsert: true } });
    return res.status(200).json(updated);
  }

  res.setHeader("Allow","GET,POST,PUT"); return res.status(405).end();
}
