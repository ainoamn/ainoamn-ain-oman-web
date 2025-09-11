// src/server/appointments/store.ts
import fs from "fs";
import path from "path";

export type AppointmentStatus = "pending" | "approved" | "canceled" | "rescheduled";
export type Appointment = {
  id: string;
  propertyId: string;
  userId: string;
  name: string;
  phone: string;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:MM
  note?: string;
  status: AppointmentStatus;
  createdAt: number;
  updatedAt?: number;
  history?: Array<{ at: number; by: string; action: "create"|"approve"|"cancel"|"reschedule"|"update"; payload?: Record<string, unknown> }>;
};

const dataDir = path.join(process.cwd(), ".data");
const apptsFile = path.join(dataDir, "appointments.json");
const countersFile = path.join(dataDir, "counters.json");

type DBShape = { appointments: Appointment[] };
type Counters = Record<string, number>;

function ensureFiles() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(apptsFile)) fs.writeFileSync(apptsFile, JSON.stringify({ appointments: [] }, null, 2), "utf-8");
  if (!fs.existsSync(countersFile)) fs.writeFileSync(countersFile, JSON.stringify({}, null, 2), "utf-8");
}

function safeReadJSON<T>(file: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }
}

function loadDB(): DBShape {
  ensureFiles();
  return safeReadJSON<DBShape>(apptsFile, { appointments: [] });
}
function saveDB(db: DBShape) {
  ensureFiles();
  fs.writeFileSync(apptsFile, JSON.stringify(db, null, 2), "utf-8");
}

function nextSerial(prefix: string) {
  ensureFiles();
  const counters = safeReadJSON<Counters>(countersFile, {});
  counters[prefix] = (counters[prefix] || 0) + 1;
  fs.writeFileSync(countersFile, JSON.stringify(counters, null, 2), "utf-8");
  return `${prefix}-${String(counters[prefix]).padStart(6, "0")}`;
}

export const AppointmentsStore = {
  create(input: Omit<Appointment, "id"|"createdAt"|"updatedAt"|"history"|"status"> & { status?: AppointmentStatus }): Appointment {
    const db = loadDB();
    const id = nextSerial("AO-A");
    const now = Date.now();
    const appt: Appointment = {
      id,
      propertyId: input.propertyId,
      userId: input.userId,
      name: input.name,
      phone: input.phone,
      date: input.date,
      time: input.time,
      note: input.note || "",
      status: input.status || "pending",
      createdAt: now,
      updatedAt: now,
      history: [{ at: now, by: input.userId, action: "create", payload: { date: input.date, time: input.time } }],
    };
    db.appointments.unshift(appt);
    saveDB(db);
    return appt;
  },

  listByProperty(propertyId: string): Appointment[] {
    return loadDB().appointments.filter(a => a.propertyId === propertyId);
  },

  listByUser(userId: string, propertyId?: string): Appointment[] {
    return loadDB().appointments.filter(a => a.userId === userId && (!propertyId || a.propertyId === propertyId));
  },

  getById(id: string): Appointment | undefined {
    return loadDB().appointments.find(a => a.id === id);
  },

  update(apptId: string, by: string, patch: Partial<Pick<Appointment, "status"|"date"|"time"|"note">>): Appointment | undefined {
    const db = loadDB();
    const i = db.appointments.findIndex(a => a.id === apptId);
    if (i < 0) return;
    const now = Date.now();
    const prev = db.appointments[i];
    const next: Appointment = {
      ...prev,
      ...("status" in patch ? { status: patch.status! } : {}),
      ...("date" in patch ? { date: patch.date! } : {}),
      ...("time" in patch ? { time: patch.time! } : {}),
      ...("note" in patch ? { note: patch.note! } : {}),
      updatedAt: now,
      history: [...(prev.history || []), { at: now, by, action: "update", payload: patch }],
    };
    db.appointments[i] = next;
    saveDB(db);
    return next;
  },
};
