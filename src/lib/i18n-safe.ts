import { useI18n as useI18nRaw } from "@/lib/i18n";

type TFn = (key: string, fallback?: string, vars?: Record<string, any>) => string;

export function useTSafe() {
  try {
    const ctx: any = (typeof useI18nRaw === "function" ? useI18nRaw() : {}) ?? {};
    const dir: "rtl" | "ltr" = (ctx.dir as any) ?? "rtl";
    const lang: string = ctx.lang ?? "ar";
    const tRaw: any = ctx.t;
    
    const t: TFn = (key, fallback, vars) => {
      if (typeof tRaw === "function") {
        return tRaw(key, fallback, vars);
      }
      return fallback ?? key;
    };
    
    return { t, dir, lang };
  } catch (error) {
    console.warn("i18n context not available, using fallback", error);
    return {
      t: (key: string, fallback?: string) => fallback ?? key,
      dir: "rtl" as const,
      lang: "ar"
    };
  }
}