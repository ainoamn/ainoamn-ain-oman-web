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
  const all = getAll();
  console.log('getById: Looking for ID:', id);
  console.log('getById: Available IDs:', all.map(p => p.id));
  console.log('getById: Total properties:', all.length);

  // البحث المباشر
  let property = all.find((x) => x.id === id);
  if (property) {
    console.log('getById: Found by direct match');
    return property;
  }

  // البحث بـ referenceNo
  property = all.find((x) => x.referenceNo === id);
  if (property) {
    console.log('getById: Found by referenceNo');
    return property;
  }

  // البحث في المصفوفات
  property = all.find((x) => {
    if (Array.isArray(x.referenceNo) && x.referenceNo.includes(id)) {
      return true;
    }
    return false;
  });

  if (property) {
    console.log('getById: Found in referenceNo array');
    return property;
  }

  // البحث بـ ID كرقم (للتوافق مع الأرقام)
  const numericId = String(Number(id));
  if (numericId !== 'NaN') {
    property = all.find((x) => String(x.id) === numericId);
    if (property) {
      console.log('getById: Found by numeric ID match');
      return property;
    }
  }

  // البحث الجزئي
  property = all.find((x) => String(x.id).includes(id) || id.includes(String(x.id)));
  if (property) {
    console.log('getById: Found by partial match');
    return property;
  }

  console.log('getById: Not found');
  return null;
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
