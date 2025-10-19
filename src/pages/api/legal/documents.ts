import type { NextApiRequest, NextApiResponse } from "next";
import { Documents, uid, now, Audit } from "../../../server/legal/store";
import { contextFrom } from "../../../lib/user-context";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = contextFrom(req);

  if (req.method === "GET") {
    try {
      const { caseId } = req.query;
      const documents = Documents.list(ctx.tenantId, caseId as string);
      return res.status(200).json(documents);
    } catch (error) {
      console.error('Error getting documents:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { caseId, name, type, size, url } = req.body;
      
      if (!caseId || !name || !url) {
        return res.status(400).json({ error: "Case ID, name, and URL are required" });
      }

      const document = Documents.add(ctx.tenantId, caseId, {
        name,
        type: type || 'document',
        size: size || 0,
        url,
        uploadedBy: ctx.userId,
        mime: type || 'application/octet-stream',
        version: 1,
        confidentiality: 'INTERNAL',
        documentType: 'OTHER',
        createdAt: new Date().toISOString()
      });

      Audit.add({ 
        id: uid(), 
        tenantId: ctx.tenantId, 
        actorId: ctx.userId, 
        action: "documentAdd", 
        entity: "document", 
        entityId: document.id, 
        at: now(), 
        meta: { 
          caseId,
          documentName: document.name,
          documentType: document.type
        } 
      });

      return res.status(201).json(document);
    } catch (error) {
      console.error('Error adding document:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
