import type { NextApiRequest, NextApiResponse } from "next";
import { Cases, uid, now, Audit, Analytics, Predictions } from "../../../server/legal/store";
import { contextFrom } from "../../../lib/user-context";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = contextFrom(req);

  if (req.method==="GET") {
    const { propertyId, analytics, prediction } = req.query;
    
    // Get analytics
    if (analytics === "true") {
      const analyticsData = Analytics.generate(ctx.tenantId);
      return res.status(200).json(analyticsData);
    }
    
    // Get prediction for specific case
    if (prediction && typeof prediction === "string") {
      try {
        const predictionData = Predictions.generate(ctx.tenantId, prediction);
        return res.status(200).json(predictionData);
      } catch (error) {
        return res.status(404).json({ error: "Case not found" });
      }
    }
    
    // Get cases by property
    if (propertyId && typeof propertyId === "string") {
      const propertyCases = Cases.listByProperty(ctx.tenantId, propertyId);
      return res.status(200).json(propertyCases);
    }
    
    // Get all cases
    const cases = Cases.listByTenant(ctx.tenantId);
    return res.status(200).json(cases);
  }

  if (req.method==="POST") {
             const { 
               id, 
               title, 
               clientId, 
               primaryLawyerId, 
               type, 
               priority, 
               propertyReference, 
               description,
               plaintiff,
               defendant,
               courtNumber,
               registrationDate,
               hearingDate,
               caseSummary,
               legalBasis,
               requestedRelief,
               evidence,
               witnesses,
               estimatedValue,
               expectedOutcome,
               expenses,
               fees,
               notes
             } = req.body||{};
    
             const c = await Cases.create(
               ctx.tenantId,
               String(title || `قضية ${id||""}`.trim()),
               String(clientId || "C1"),
               String(primaryLawyerId || "U1"),
               {
                 id: id ? String(id) : undefined,
                 type,
                 priority,
                 propertyReference,
                 description,
                 plaintiff,
                 defendant,
                 courtNumber,
                 registrationDate,
                 hearingDate,
                 caseSummary,
                 legalBasis,
                 requestedRelief,
                 evidence,
                 witnesses,
                 estimatedValue,
                 expectedOutcome,
                 expenses,
                 fees,
                 notes
               }
             );
    
    Audit.add({ 
      id: uid(), 
      tenantId: ctx.tenantId, 
      actorId: ctx.userId, 
      action: "caseCreate", 
      entity: "case", 
      entityId: c.id, 
      at: now(),
      meta: { 
        caseType: c.type,
        priority: c.priority,
        propertyId: propertyReference?.propertyId
      }
    });
    
    return res.status(201).json(c);
  }

  if (req.method==="PUT") {
    const { id, ...patch } = req.body||{};
    if (!id) return res.status(400).json({ error: "id_required" });
    
    const updated = await Cases.upsertById(ctx.tenantId, String(id), patch);
    
    Audit.add({ 
      id: uid(), 
      tenantId: ctx.tenantId, 
      actorId: ctx.userId, 
      action: "caseUpdate", 
      entity: "case", 
      entityId: updated.id, 
      at: now(), 
      meta: { 
        upsert: true,
        updatedFields: Object.keys(patch)
      }
    });
    
    return res.status(200).json(updated);
  }

  if (req.method==="PATCH") {
    const { id, action, ...data } = req.body||{};
    if (!id) return res.status(400).json({ error: "id_required" });
    
    let result;
    
    switch (action) {
      case "updateStatus":
        result = Cases.updateStatus(ctx.tenantId, String(id), data.status, data.reason);
        break;
      case "updateStage":
        result = Cases.updateStage(ctx.tenantId, String(id), data.stage, data.note, ctx.userId);
        break;
      case "generateAIInsights":
        result = Cases.generateAIInsights(ctx.tenantId, String(id));
        break;
      default:
        return res.status(400).json({ error: "invalid_action" });
    }
    
    if (!result) return res.status(404).json({ error: "case_not_found" });
    
    Audit.add({ 
      id: uid(), 
      tenantId: ctx.tenantId, 
      actorId: ctx.userId, 
      action: `case_${action}`, 
      entity: "case", 
      entityId: String(id), 
      at: now(),
      meta: data
    });
    
    return res.status(200).json(result);
  }

  res.setHeader("Allow","GET,POST,PUT,PATCH"); 
  return res.status(405).end();
}
