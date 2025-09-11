// src/types/appointments.ts

export type AppointmentStatus = "pending" | "approved" | "canceled" | "rescheduled";

export type Appointment = {
  id: string;                // مثال: AO-A-000001
  propertyId: string;        // معرف العقار
  userId: string;            // صاحب الطلب
  name: string;
  phone: string;
  date: string;              // YYYY-MM-DD
  time: string;              // HH:MM
  note?: string;
  status: AppointmentStatus;
  createdAt: number;         // ms
  updatedAt?: number;        // ms
  history?: Array<{
    at: number;
    by: string;              // userId أو role
    action: "create"|"approve"|"cancel"|"reschedule"|"update";
    payload?: Record<string, unknown>;
  }>;
};

export type SessionUser = {
  id: string;
  role: "user" | "owner" | "admin";
  name?: string;
};
