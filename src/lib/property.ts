// root: src/lib/property.ts
export type Purpose = "rent" | "sale";
export type Category = "residential" | "commercial" | "industrial" | "agricultural" | "multi" | "existing";
export type PropertyType = "apartment" | "villa" | "land" | "office" | "shop";

export function normalizeUsage<T extends Record<string, any>>(b: T): T {
  const purpose = normalizePurpose((b as any).purpose);
  const category = normalizeCategory((b as any).category, (b as any).type);
  const type = normalizeType((b as any).type, category);
  return { ...b, ...(purpose?{purpose}:{}), ...(category?{category}:{}), ...(type?{type}:{}) } as T;
}
export function normalizePurpose(v: any): Purpose | undefined {
  if (!v) return undefined; const s = String(v).toLowerCase().trim();
  if (["rent","إيجار","ايجار"].includes(s)) return "rent";
  if (["sale","بيع"].includes(s)) return "sale";
  return undefined;
}
export function normalizeCategory(v: any, type?: any): Category | undefined {
  const t = String(v || "").toLowerCase().trim();
  if (["residential","سكني","سكنى"].includes(t)) return "residential";
  if (["commercial","تجاري"].includes(t)) return "commercial";
  if (["industrial","صناعي"].includes(t)) return "industrial";
  if (["agricultural","زراعي"].includes(t)) return "agricultural";
  if (["multi","متعدد"].includes(t)) return "multi";
  if (["existing","قائم"].includes(t)) return "existing";
  const ty = String(type || "").toLowerCase();
  if (["office","shop"].includes(ty)) return "commercial";
  if (["land"].includes(ty)) return "agricultural";
  if (["apartment","villa"].includes(ty)) return "residential";
  return undefined;
}
export function normalizeType(v: any, category?: any): PropertyType | undefined {
  const s = String(v || "").toLowerCase().trim();
  if (["apartment","شقة"].includes(s)) return "apartment";
  if (["villa","فيلا","فيلّا"].includes(s)) return "villa";
  if (["land","أرض","ارض"].includes(s)) return "land";
  if (["office","مكتب"].includes(s)) return "office";
  if (["shop","محل"].includes(s)) return "shop";
  const c = String(category || "").toLowerCase();
  if (c === "commercial") return "office";
  if (c === "agricultural") return "land";
  if (c === "residential") return "apartment";
  return undefined;
}
