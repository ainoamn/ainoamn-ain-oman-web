// يحوّل أي كائن {ar,en} إلى نص (العربية افتراضيًا) قبل إنشاء أي عنصر React
import * as React from "react";


type Localized = { ar?: string; en?: string; [k: string]: unknown };
const prefer: "ar" | "en" = "ar";


const isLocalized = (v: any): v is Localized => !!v && typeof v === "object" && ("ar" in v || "en" in v);
const pick = (v: any) => (isLocalized(v) ? (v.ar ?? v.en ?? "") : v);


const transform = (val: any): any => {
if (val == null || typeof val === "boolean") return val;
if (Array.isArray(val)) return val.map(transform);
if (React.isValidElement(val)) return val; // سيتعامل التصحيح مع الأبناء عبر props.children لاحقًا
if (typeof val === "object") return pick(val);
return val; // string | number | …
};


const orig = (React as any).createElement;
(React as any).createElement = function patchedCreateElement(type: any, props: any, ...children: any[]) {
if (props && Object.prototype.hasOwnProperty.call(props, "children")) {
const safeChildren = transform(props.children);
const nextProps = safeChildren === props.children ? props : { ...props, children: safeChildren };
// لا نمرر children كوسيط ثالث حتى لا تتكرر
return orig.apply(React, [type, nextProps, ...children]);
}
const mapped = children.length ? children.map(transform) : children;
return orig.apply(React, [type, props, ...mapped]);
};


export {}; // لا نصدّر شيئًا؛ مجرد تفعيل للتصحيح بمجرد الاستيراد