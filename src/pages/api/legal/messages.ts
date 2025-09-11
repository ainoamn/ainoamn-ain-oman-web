import type { NextApiRequest, NextApiResponse } from "next";
import { Messages, uid, now, Audit, Cases } from "../../../server/legal/store";
import { contextFrom } from "../../../lib/user-context";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = contextFrom(req);
  const caseId = (req.query.caseId as string) || (req.body?.caseId as string);

  if (req.method==="GET") {
    if (!caseId) return res.status(400).json({ error:"caseId required"});
    return res.status(200).json(Messages.list(ctx.tenantId, caseId));
  }

  if (req.method==="POST") {
    const action = String(req.body?.action||"create");
    if (action==="create") {
      if (!caseId) return res.status(400).json({ error:"caseId required" });
      if (!Cases.get(ctx.tenantId, caseId)) Cases.upsertById({ id: caseId, tenantId: ctx.tenantId });
      const text = String(req.body?.text||"").trim(); if (!text) return res.status(400).json({ error:"invalid" });
      const m = Messages.add({ id: uid(), tenantId: ctx.tenantId, caseId, by: ctx.userId, text, at: now() });
      Audit.add({ id: uid(), tenantId: ctx.tenantId, actorId: ctx.userId, action: "message", entity: "message", entityId: m.id, at: now(), meta: { caseId } });
      return res.status(201).json(m);
    }
    if (action==="void") {
      const id = String(req.body?.id||""); const reason = String(req.body?.reason||"voided");
      const m = Messages.update(id, { voided: true, voidReason: reason }); if (!m) return res.status(404).json({ error:"not_found" }); return res.status(200).json(m);
    }
    return res.status(400).json({ error:"invalid_action" });
  }

  res.setHeader("Allow","GET,POST"); return res.status(405).end();
}
