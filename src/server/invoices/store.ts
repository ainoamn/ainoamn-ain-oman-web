import { readDb, writeDb } from "@/db/jsonDb";

export type Invoice = {
  id: string;
  propertyId: string;
  kind: "rent" | "service" | "sale";
  total: number;
  currency: string; // "OMR" ...
  dueDate?: string;
  paid?: boolean;
  createdAt: string;
  updatedAt: string;
  meta?: Record<string, any>;
};

const COLL = "invoices";

function genId() {
  return `AO-INV-${Date.now()}`;
}

export function list(filter?: { propertyId?: string }) {
  const db = readDb();
  const arr: Invoice[] = db[COLL] || [];
  if (filter?.propertyId) return arr.filter((x) => x.propertyId === filter.propertyId);
  return arr;
}

export function get(id: string) {
  return list().find((x) => x.id === id) || null;
}

export function upsert(doc: Partial<Invoice>) {
  const db = readDb();
  const arr: Invoice[] = db[COLL] || [];
  const now = new Date().toISOString();
  if (!doc.id) {
    const item: Invoice = {
      id: genId(),
      propertyId: String(doc.propertyId || ""),
      kind: (doc.kind as any) || "service",
      total: Number(doc.total || 0),
      currency: String(doc.currency || "OMR"),
      dueDate: doc.dueDate,
      paid: !!doc.paid,
      createdAt: now,
      updatedAt: now,
      meta: doc.meta || {},
    };
    arr.push(item);
    db[COLL] = arr;
    writeDb(db);
    return item;
  } else {
    const idx = arr.findIndex((x) => x.id === doc.id);
    if (idx === -1) throw new Error("Invoice not found");
    const merged: Invoice = { ...arr[idx], ...doc, updatedAt: now } as Invoice;
    arr[idx] = merged;
    db[COLL] = arr;
    writeDb(db);
    return merged;
  }
}

export function remove(id: string) {
  const db = readDb();
  const arr: Invoice[] = db[COLL] || [];
  const next = arr.filter((x) => x.id !== id);
  db[COLL] = next;
  writeDb(db);
  return true;
}
