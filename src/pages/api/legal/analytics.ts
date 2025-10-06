import type { NextApiRequest, NextApiResponse } from "next";
import { Analytics, Predictions, Workflows } from "../../../server/legal/store";
import { contextFrom } from "../../../lib/user-context";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = contextFrom(req);

  if (req.method === "GET") {
    const { type, caseId } = req.query;
    
    try {
      if (type === "overview") {
        const analytics = Analytics.generate(ctx.tenantId);
        return res.status(200).json(analytics);
      }
      
      if (type === "prediction" && caseId) {
        const prediction = Predictions.generate(ctx.tenantId, String(caseId));
        return res.status(200).json(prediction);
      }
      
      if (type === "workflows") {
        const workflows = Workflows.list(ctx.tenantId);
        return res.status(200).json(workflows);
      }
      
      return res.status(400).json({ error: "Invalid type parameter" });
    } catch (error) {
      console.error("Analytics error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    const { type, ...data } = req.body;
    
    try {
      if (type === "createWorkflow") {
        const workflow = Workflows.create(ctx.tenantId, data);
        return res.status(201).json(workflow);
      }
      
      return res.status(400).json({ error: "Invalid type parameter" });
    } catch (error) {
      console.error("Analytics POST error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", "GET,POST");
  return res.status(405).end();
}
