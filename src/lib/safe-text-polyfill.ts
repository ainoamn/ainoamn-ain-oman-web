// root: src/lib/safe-text-polyfill.ts
import * as React from "react";

type Localized = { ar?: string; en?: string; [k: string]: unknown };
type Opts = { prefer?: "ar" | "en" };

function toText(v: any, prefer: "ar" | "en"): any {
  if (v == null) return v;
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return v;
  if (React.isValidElement(v)) return v;
  if (Array.isArray(v)) return v.map((x) => toText(x, prefer));
  if (v && typeof v === "object" && ("ar" in v || "en" in v)) {
    const loc = v as Localized;
    return (prefer === "ar" ? loc.ar : loc.en) ?? loc.ar ?? loc.en ?? "";
  }
  return v;
}

export function installSafeTextPolyfill(opts: Opts = { prefer: "ar" }) {
  if ((installSafeTextPolyfill as any).__installed) return;
  (installSafeTextPolyfill as any).__installed = true;

  const prefer = opts.prefer ?? "ar";
  const orig = React.createElement;

  (React as any).createElement = function patched(type: any, props: any, ...children: any[]) {
    const mapped = children.map((c) => toText(c, prefer));
    if (props && "children" in props && props.children !== undefined) {
      const ch = Array.isArray(props.children)
        ? props.children.map((c: any) => toText(c, prefer))
        : toText(props.children, prefer);
      props = { ...props, children: ch };
      return orig.apply(React, [type, props]);
    }
    return orig.apply(React, [type, props, ...mapped]);
  };
}
