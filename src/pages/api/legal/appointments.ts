import type { NextApiRequest, NextApiResponse } from "next";
import { Appointments, uid, now, Audit } from "../../../server/legal/store";
import { contextFrom } from "../../../lib/user-context";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = contextFrom(req);

  if (req.method === "GET") {
    const { caseId, date } = req.query;
    let appointments = Appointments.list(ctx.tenantId, caseId as string);
    
    // Filter by date if provided
    if (date) {
      const targetDate = new Date(date as string).toDateString();
      appointments = appointments.filter(a => 
        new Date(a.scheduledAt).toDateString() === targetDate
      );
    }
    
    return res.status(200).json(appointments);
  }

  if (req.method === "POST") {
    const appointmentData = req.body;
    
    try {
      const appointment = Appointments.create(ctx.tenantId, {
        tenantId: ctx.tenantId,
        caseId: appointmentData.caseId,
        title: appointmentData.title,
        description: appointmentData.description,
        appointmentType: appointmentData.appointmentType,
        scheduledAt: appointmentData.scheduledAt,
        duration: appointmentData.duration || 60,
        location: appointmentData.location,
        participants: appointmentData.participants || [],
        reminders: appointmentData.reminders || [],
        status: "SCHEDULED",
        createdBy: ctx.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      Audit.add({
        id: uid(),
        tenantId: ctx.tenantId,
        actorId: ctx.userId,
        action: "appointmentCreate",
        entity: "case",
        entityId: appointment.id,
        at: now(),
        meta: {
          caseId: appointment.caseId,
          appointmentType: appointment.appointmentType,
          scheduledAt: appointment.scheduledAt
        }
      });

      return res.status(201).json(appointment);
    } catch (error) {
      console.error("Appointment creation error:", error);
      return res.status(500).json({ error: "Failed to create appointment" });
    }
  }

  if (req.method === "PATCH") {
    const { id, action, ...data } = req.body;
    
    if (!id) return res.status(400).json({ error: "id_required" });
    
    try {
      let result;
      
      switch (action) {
        case "updateStatus":
          result = Appointments.updateStatus(ctx.tenantId, id, data.status);
          break;
        default:
          return res.status(400).json({ error: "invalid_action" });
      }
      
      if (!result) return res.status(404).json({ error: "appointment_not_found" });
      
      Audit.add({
        id: uid(),
        tenantId: ctx.tenantId,
        actorId: ctx.userId,
        action: `appointment_${action}`,
        entity: "case",
        entityId: id,
        at: now(),
        meta: data
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Appointment update error:", error);
      return res.status(500).json({ error: "Failed to update appointment" });
    }
  }

  res.setHeader("Allow", "GET,POST,PATCH");
  return res.status(405).end();
}
