import { readDb, writeDb } from "@/db/jsonDb";

export type Property = {
  id: string;
  referenceNo?: string;
  title?: string | { ar?: string; en?: string };
  priceOMR?: number;
  province?: string; state?: string; village?: string;
  published?: boolean;
  status?: "vacant" | "reserved" | "leased" | "hidden" | "draft";
  coverIndex?: number;
  images?: string[];
  units?: any[];
  tags?: string[];
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

const COLL = "properties";

function ensure(db: any) {
  if (!db[COLL]) db[COLL] = [];
  return db;
}

export function getAll(): Property[] {
  const db = ensure(readDb());
  return db[COLL] as Property[];
}

export function getById(id: string): Property | null {
  return getAll().find((x) => x.id === id) || null;
}

export function upsert(doc: Partial<Property>): Property {
  const db = ensure(readDb());
  const arr: Property[] = db[COLL];
  const now = new Date().toISOString();

  if (!doc.id) throw new Error("id required");
  const idx = arr.findIndex((x) => x.id === doc.id);
  if (idx === -1) {
    const created: Property = {
      id: String(doc.id),
      createdAt: doc.createdAt || now,
      updatedAt: now,
      ...doc,
    } as Property;
    arr.push(created);
    db[COLL] = arr;
    writeDb(db);
    return created;
  } else {
    const merged: Property = { ...arr[idx], ...doc, updatedAt: now } as Property;
    arr[idx] = merged;
    db[COLL] = arr;
    writeDb(db);
    return merged;
  }
}

export function remove(id: string): boolean {
  const db = ensure(readDb());
  const arr: Property[] = db[COLL];
  const next = arr.filter((x) => x.id !== id);
  db[COLL] = next;
  writeDb(db);
  return true;
}
