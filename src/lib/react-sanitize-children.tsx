// root: src/lib/react-sanitize-children.tsx
import React, { isValidElement, cloneElement, ReactNode } from "react";

type Localized = { ar?: string; en?: string; [k: string]: unknown };
type Lang = "ar" | "en";

function isLocalized(v: any): v is Localized {
  return v && typeof v === "object" && ("ar" in v || "en" in v);
}

function pickLocalized(v: any, prefer: Lang) {
  if (isLocalized(v)) return (prefer === "ar" ? v.ar : v.en) ?? v.ar ?? v.en ?? "";
  // إذا لم يكن الكائن localized، ارجع null لمنع عرض الكائن كما هو
  if (v && typeof v === "object" && !Array.isArray(v) && !isValidElement(v)) return null;
  return v;
}

function sanitizeValue(v: any, prefer: Lang): any {
  if (v == null || typeof v === "boolean") return v;
  if (typeof v === "string" || typeof v === "number") return v;
  if (Array.isArray(v)) return v.map((n) => sanitizeValue(n, prefer));
  if (isValidElement(v)) return sanitizeElement(v, prefer);
  if (typeof v === "function") return v; // اترك الدوال كما هي
  
  // إذا كان كائناً (ليس array أو element)، حاول استخراج نص محلي أو ارجع null
  if (v && typeof v === "object") {
    const picked = pickLocalized(v, prefer);
    // إذا تم استخراج نص محلي، ارجعه
    if (picked !== v && (typeof picked === "string" || typeof picked === "number" || picked == null)) {
      return picked;
    }
    // إذا لم يتم استخراج نص محلي، ارجع null لمنع عرض الكائن
    return null;
  }
  
  return v;
}

function sanitizeProps(props: Record<string, any>, prefer: Lang) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(props || {})) {
    if (k === "children") continue;
    if (k === "style" || k === "dangerouslySetInnerHTML") { out[k] = v; continue; }
    out[k] = sanitizeValue(v, prefer);
  }
  return out;
}

function sanitizeElement(el: React.ReactElement, prefer: Lang) {
  const nextProps = sanitizeProps(el.props as Record<string, any>, prefer);
  const nextChildren = sanitizeValue((el.props as any)?.children, prefer);
  return cloneElement(el, nextProps, nextChildren as any);
}

function sanitizeNode(node: any, prefer: Lang): any {
  return sanitizeValue(node, prefer);
}

export default function Sanitize({
  children,
  locale = "ar",
}: {
  children: ReactNode;
  locale?: Lang;
}) {
  return <>{sanitizeNode(children, locale)}</>;
}
