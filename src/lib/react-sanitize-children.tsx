// root: src/lib/react-sanitize-children.tsx
import React, { isValidElement, cloneElement, ReactNode } from "react";

type Localized = { ar?: string; en?: string; [k: string]: unknown };
type Lang = "ar" | "en";

function isLocalized(v: any): v is Localized {
  return v && typeof v === "object" && ("ar" in v || "en" in v);
}

function pickLocalized(v: any, prefer: Lang) {
  if (isLocalized(v)) return (prefer === "ar" ? v.ar : v.en) ?? v.ar ?? v.en ?? "";
  return v;
}

function sanitizeValue(v: any, prefer: Lang): any {
  if (v == null || typeof v === "boolean") return v;
  if (typeof v === "string" || typeof v === "number") return v;
  if (Array.isArray(v)) return v.map((n) => sanitizeValue(n, prefer));
  if (isValidElement(v)) return sanitizeElement(v, prefer);
  if (typeof v === "function") return v; // اترك الدوال كما هي
  // لا تعدّل style / dangerouslySetInnerHTML لو صادفت كائنًا على مستوى props
  // عند استخدامه كـ child: ارجعه محليًا أو null لمنع كسر الرندر
  const picked = pickLocalized(v, prefer);
  if (picked !== v) return picked;
  return null; // يمنع تمرير كائن خام كابن لـ React
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
  const nextProps = sanitizeProps(el.props, prefer);
  const nextChildren = sanitizeValue(el.props?.children, prefer);
  return cloneElement(el, nextProps, nextChildren as any);
}

function sanitizeNode(node: any, prefer: Lang): any {
  return sanitizeValue(node, prefer);
}
function Sanitize({
  children,
  locale = "ar",
}: {
  children: ReactNode;
  locale?: Lang;
}) {
  return <>{sanitizeNode(children, locale)}</>;
}
