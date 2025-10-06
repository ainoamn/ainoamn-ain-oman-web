import type { NextApiRequest, NextApiResponse } from "next";
import { Cases, uid, now, Audit, Analytics, Predictions } from "../../../../server/legal/store";
import { contextFrom } from "../../../../lib/user-context";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = contextFrom(req);
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const case_ = Cases.get(ctx.tenantId, id as string);
      if (!case_) {
        return res.status(404).json({ error: "Case not found" });
      }
      return res.status(200).json(case_);
    } catch (error) {
      console.error('Error getting case:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PUT") {
    try {
      const updates = req.body;
      const updatedCase = await Cases.upsertById(ctx.tenantId, id as string, updates);
      
      if (!updatedCase) {
        return res.status(404).json({ error: "Case not found" });
      }

      Audit.add({ 
        id: uid(), 
        tenantId: ctx.tenantId, 
        actorId: ctx.userId, 
        action: "caseUpdate", 
        entity: "case", 
        entityId: id as string, 
        at: now(), 
        meta: { 
          updates 
        } 
      });

      return res.status(200).json(updatedCase);
    } catch (error) {
      console.error('Error updating case:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const deleted = Cases.delete(ctx.tenantId, id as string);
      if (!deleted) {
        return res.status(404).json({ error: "Case not found" });
      }

      Audit.add({ 
        id: uid(), 
        tenantId: ctx.tenantId, 
        actorId: ctx.userId, 
        action: "caseDelete", 
        entity: "case", 
        entityId: id as string, 
        at: now(), 
        meta: { 
          deletedCase: deleted 
        } 
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting case:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
