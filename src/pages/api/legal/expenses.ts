import type { NextApiRequest, NextApiResponse } from "next";
import { Expenses, uid, now, Audit, Cases } from "../../../server/legal/store";
import { contextFrom } from "../../../lib/user-context";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = contextFrom(req);
  const caseId = (req.query.caseId as string) || (req.body?.caseId as string);

  if (req.method==="GET") {
    if (!caseId) return res.status(400).json({ error:"caseId required"});
    return res.status(200).json(Expenses.list(ctx.tenantId, caseId));
  }

  if (req.method==="POST") {
    const action = String(req.body?.action||"add");
    if (action==="add") {
      if (!caseId) return res.status(400).json({ error:"caseId required"});
      if (!Cases.get(ctx.tenantId, caseId)) Cases.upsertById({ id: caseId, tenantId: ctx.tenantId });
      const label = String(req.body?.label||""); const amount = Number(req.body?.amount||0);
      if (!label || !(amount>0)) return res.status(400).json({ error:"invalid" });
      const e = Expenses.add({ id: uid(), tenantId: ctx.tenantId, caseId, by: ctx.userId, label, amount, at: now() });
      Audit.add({ id: uid(), tenantId: ctx.tenantId, actorId: ctx.userId, action: "expense", entity: "expense", entityId: e.id, at: now(), meta: { caseId } });
      return res.status(201).json(e);
    }
    if (action==="void") {
      const id = String(req.body?.id||""); const reason = String(req.body?.reason||"voided");
      const e = Expenses.void(id, reason); if (!e) return res.status(404).json({ error:"not_found" }); return res.status(200).json(e);
    }
    return res.status(400).json({ error:"invalid_action" });
  }

  res.setHeader("Allow","GET,POST"); return res.status(405).end();
}
