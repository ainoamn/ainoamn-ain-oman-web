// src/server/requests/store.ts
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

export type RequestItem = {
  id: string;
  propertyId: string;
  ownerId?: string | null; // مالك العقار
  userId: string;          // طالب المعاينة/الحجز
  type: "viewing" | "booking";
  name: string;
  phone: string;
  date?: string | null;    // viewing
  time?: string | null;    // viewing
  months?: number | null;  // booking
  note?: string | null;
  status: "pending" | "approved" | "declined" | "proposed";
  proposedDate?: string | null;
  proposedTime?: string | null;
  createdAt: string;
  updatedAt: string;
};

const dataDir = path.join(process.cwd(), ".data");
const filePath = path.join(dataDir, "requests.json");

async function ensure() {
  if (!fs.existsSync(dataDir)) await fsp.mkdir(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) await fsp.writeFile(filePath, JSON.stringify({ items: [] }, null, 2), "utf8");
}

export async function createRequest(input: Omit<RequestItem, "id"|"status"|"createdAt"|"updatedAt">) {
  await ensure();
  const raw = await fsp.readFile(filePath, "utf8");
  const js = JSON.parse(raw || "{}");
  const items: RequestItem[] = Array.isArray(js.items) ? js.items : [];
  const now = new Date().toISOString();
  const it: RequestItem = {
    id: String(Date.now()),
    status: "pending",
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  items.unshift(it);
  await fsp.writeFile(filePath, JSON.stringify({ items }, null, 2), "utf8");
  return it;
}

export async function listRequests() {
  await ensure();
  const raw = await fsp.readFile(filePath, "utf8");
  const js = JSON.parse(raw || "{}");
  const items: RequestItem[] = Array.isArray(js.items) ? js.items : [];
  return items.sort((a,b)=> b.createdAt.localeCompare(a.createdAt));
}

export async function updateRequest(id: string, patch: Partial<RequestItem>) {
  await ensure();
  const raw = await fsp.readFile(filePath, "utf8");
  const js = JSON.parse(raw || "{}");
  const items: RequestItem[] = Array.isArray(js.items) ? js.items : [];
  const idx = items.findIndex(x => String(x.id) === String(id));
  if (idx < 0) return null;
  items[idx] = { ...items[idx], ...patch, updatedAt: new Date().toISOString() };
  await fsp.writeFile(filePath, JSON.stringify({ items }, null, 2), "utf8");
  return items[idx];
}

export async function updateViewing(id: string, patch: Partial<RequestItem>) {
  return updateRequest(id, patch);
}

export async function createViewing(input: Omit<RequestItem, "id"|"status"|"createdAt"|"updatedAt"|"type"> & { date: string; time: string }) {
  return createRequest({ ...input, type: 'viewing' });
}

export async function listViewingsByUser(userId: string) {
  const all = await listRequests();
  return all.filter(x => x.userId === userId && x.type === 'viewing');
}

export async function listViewingsForOwner(ownerId: string) {
  const all = await listRequests();
  return all.filter(x => x.ownerId === ownerId && x.type === 'viewing');
}

// --- booking helpers (lightweight wrappers used by API routes)
export async function createBooking(input: Omit<RequestItem, "id"|"status"|"createdAt"|"updatedAt"|"type"> & { months: number; start?: string | null; depositMonths?: number; depositOMR?: number }) {
  const payload: any = { ...input, type: 'booking' };
  if (typeof (input as any).start !== 'undefined') payload.date = (input as any).start;
  if (typeof (input as any).depositMonths !== 'undefined') payload.proposedDate = undefined; // placeholder
  return createRequest(payload);
}

export async function listBookingsByUser(userId: string) {
  const all = await listRequests();
  return all.filter(x => x.userId === userId && x.type === 'booking');
}

export async function listBookingsForOwner(ownerId: string) {
  const all = await listRequests();
  return all.filter(x => x.ownerId === ownerId && x.type === 'booking');
}
