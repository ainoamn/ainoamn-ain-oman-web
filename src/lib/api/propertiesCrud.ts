/* واجهة عميل موحّدة وشاملة لإدارة العقارات والوحدات والربط مع بقية الوحدات.
   لا تعتمد على أي تغيير في الصفحات الحالية.
   تعمل مع /api/properties و/api/properties/[id] و/api/property/featured.
*/
export type Id = string;

export type Unit = {
  id?: Id;
  title?: string;
  ref?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  rent?: number;
  salePrice?: number;
  status?: string; // available | rented | sold | maintenance | ...
  images?: string[];
  coverIndex?: number;
  meta?: Record<string, any>;
};

export type PropertyPayload = {
  id?: Id;
  referenceNo?: string;
  title?: string;
  description?: string;
  type?: string;
  category?: string;
  address?: string;
  city?: string;
  country?: string;
  location?: { lat?: number; lng?: number; label?: string };
  tags?: string[];
  featured?: boolean;
  status?: string;
  coverIndex?: number;
  images?: (string | File)[];
  units?: Unit[];
  ownerId?: string;
  meta?: Record<string, any>;
};

export type ListOptions = {
  q?: string;
  limit?: number;
  tag?: string;
};

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${txt}`);
  }
  return res.json();
}

/** ========== Properties ========== */
export async function listProperties(opts: ListOptions = {}) {
  const u = new URL("/api/properties", window.location.origin);
  if (opts.q) u.searchParams.set("q", opts.q);
  if (opts.limit) u.searchParams.set("limit", String(opts.limit));
  const res = await fetch(u.toString(), { cache: "no-store" });
  const data = await json<{ items: any[] }>(res);
  return data.items;
}

export async function listFeatured(limit = 8, tag = "featured") {
  const u1 = new URL("/api/properties/featured", window.location.origin);
  u1.searchParams.set("limit", String(limit));
  u1.searchParams.set("tag", tag);
  // دعم المسار القديم /api/property/featured
  const u2 = new URL("/api/property/featured", window.location.origin);
  u2.searchParams.set("limit", String(limit));
  u2.searchParams.set("tag", tag);

  // جرّب الجديد ثم القديم للتوافق
  try {
    const res = await fetch(u1.toString(), { cache: "no-store" });
    const j = await json<{ items: any[] }>(res);
    return j.items;
  } catch {
    const res = await fetch(u2.toString(), { cache: "no-store" });
    const j = await json<{ items: any[] }>(res);
    return j.items;
  }
}

export async function getProperty(id: Id) {
  const res = await fetch(`/api/properties/${encodeURIComponent(id)}`, { cache: "no-store" });
  const j = await json<{ item: any }>(res);
  return j.item;
}

export async function createProperty(data: PropertyPayload) {
  const hasFiles =
    Array.isArray(data.images) && data.images.some((x) => typeof x !== "string" && x instanceof File);
  const hasDataUrls =
    Array.isArray(data.images) && data.images.some((x) => typeof x === "string" && x.startsWith("data:image/"));

  if (hasFiles || hasDataUrls) {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === "images") return;
      form.append(k, typeof v === "string" ? v : JSON.stringify(v));
    });
    (data.images || []).forEach((img) => {
      if (typeof img === "string") form.append("images", img); // DataURL سيُعالَج في API
      else form.append("images", img as File);
    });
    const res = await fetch("/api/properties", { method: "POST", body: form });
    const j = await json<{ item: any }>(res);
    return j.item;
  } else {
    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data || {}),
    });
    const j = await json<{ item: any }>(res);
    return j.item;
  }
}

export async function updateProperty(id: Id, data: Partial<PropertyPayload>) {
  const hasFiles =
    Array.isArray(data.images) && data.images.some((x) => typeof x !== "string" && x instanceof File);
  const hasDataUrls =
    Array.isArray(data.images) && data.images.some((x) => typeof x === "string" && x.startsWith("data:image/"));

  if (hasFiles || hasDataUrls) {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === "images") return;
      form.append(k, typeof v === "string" ? v : JSON.stringify(v));
    });
    (data.images || []).forEach((img) => {
      if (typeof img === "string") form.append("images", img);
      else form.append("images", img as File);
    });
    const res = await fetch(`/api/properties/${encodeURIComponent(id)}`, { method: "PUT", body: form });
    const j = await json<{ item: any }>(res);
    return j.item;
  } else {
    const res = await fetch(`/api/properties/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data || {}),
    });
    const j = await json<{ item: any }>(res);
    return j.item;
  }
}

export async function deleteProperty(id: Id) {
  const res = await fetch(`/api/properties/${encodeURIComponent(id)}`, { method: "DELETE" });
  await json<any>(res);
  return true;
}

/** ========== Units helpers ========== */
export async function addUnit(propertyId: Id, unit: Unit) {
  const p = await getProperty(propertyId);
  const units = Array.isArray(p.units) ? [...p.units] : [];
  const id = unit.id || `U-${Date.now()}`;
  units.push({ ...unit, id });
  return updateProperty(propertyId, { units });
}

export async function updateUnit(propertyId: Id, unitId: Id, patch: Partial<Unit>) {
  const p = await getProperty(propertyId);
  const units = (p.units || []).map((u: Unit) => (u.id === unitId ? { ...u, ...patch } : u));
  return updateProperty(propertyId, { units });
}

export async function removeUnit(propertyId: Id, unitId: Id) {
  const p = await getProperty(propertyId);
  const units = (p.units || []).filter((u: Unit) => u.id !== unitId);
  return updateProperty(propertyId, { units });
}

export async function setCover(propertyId: Id, idx: number) {
  return updateProperty(propertyId, { coverIndex: idx });
}

/** ========== Cross-module linking via propertyId ========== */
export async function createTaskForProperty(propertyId: Id, payload: any) {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, propertyId }),
  });
  const j = await json<{ item: any }>(res);
  return j.item;
}

export async function referToLegal(propertyId: Id, payload: any) {
  const res = await fetch("/api/legal/cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, propertyId }),
  });
  const j = await json<{ item: any }>(res);
  return j.item;
}

export async function createInvoiceForProperty(propertyId: Id, invoice: any) {
  const res = await fetch("/api/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...invoice, propertyId }),
  });
  const j = await json<{ item: any }>(res);
  return j.item;
}

/** ========== Utilities ========== */
export function toFormData(obj: Record<string, any>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj || {})) {
    if (v instanceof File) f.append(k, v);
    else if (Array.isArray(v) || typeof v === "object") f.append(k, JSON.stringify(v));
    else f.append(k, String(v));
  }
  return f;
}
