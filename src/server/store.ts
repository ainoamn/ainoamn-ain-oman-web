// src/server/store.ts
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, ".data");
const FILE_BOOKINGS = path.join(DATA_DIR, "bookings.json");

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE_BOOKINGS)) fs.writeFileSync(FILE_BOOKINGS, "[]", "utf8");
}

export type Booking = {
  id: string;
  propertyId: string;
  customerId: string;
  ownerId?: string|null;
  start: string;
  months: number;
  status: "awaiting_payment"|"pending"|"confirmed"|"declined";
  amountOMR?: number;
  createdAt: string;
};

export function readBookings(): Booking[] {
  ensure();
  return JSON.parse(fs.readFileSync(FILE_BOOKINGS, "utf8") || "[]");
}
export function writeBookings(items: Booking[]) {
  ensure();
  fs.writeFileSync(FILE_BOOKINGS, JSON.stringify(items, null, 2), "utf8");
}
