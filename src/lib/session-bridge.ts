// src/lib/session-bridge.ts
/* eslint-disable no-console */
export type AinUser = {
  id: string;
  name: string;
  role: string;
  plan?: { id: string; period: "/mo" | "/yr" } | null;
  features?: string[];
};

const AUTH_KEY = "ain_auth";
const TOKEN_KEY = "auth_token";
const EV = "ain_auth:change";

function safeParse<T>(s: string | null): T | null {
  if (!s) return null;
  try { return JSON.parse(s) as T; } catch { return null; }
}
function uniq(a: string[] = []): string[] { return Array.from(new Set(a.filter(Boolean))); }

export function getAinAuth(): AinUser | null {
  if (typeof window === "undefined") return null;
  return safeParse<AinUser>(localStorage.getItem(AUTH_KEY));
}
export function setAinAuth(u: AinUser | null): void {
  if (typeof window === "undefined") return;
  if (u) localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  else localStorage.removeItem(AUTH_KEY);
  try { window.dispatchEvent(new CustomEvent(EV)); } catch (_e) {}
}
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setAuthToken(v: string | null): void {
  if (typeof window === "undefined") return;
  if (v) localStorage.setItem(TOKEN_KEY, v);
  else localStorage.removeItem(TOKEN_KEY);
}
function deriveFromToken(tok: string | null): AinUser | null {
  if (!tok) return null;
  const obj = safeParse<AinUser & { token?: string }>(tok);
  if (obj && obj.id) {
    const { id, name, role, features, plan } = obj;
    return { id, name: name || String(id), role: role || "user", features: uniq(features), plan: plan || null };
  }
  return { id: tok, name: tok, role: "user", features: [], plan: null };
}
export function unifySession(): AinUser | null {
  if (typeof window === "undefined") return null;
  const a = getAinAuth();
  const t = getAuthToken();
  const b = deriveFromToken(t);
  if (!a && !b) return null;
  const merged: AinUser = {
    id: a?.id || b?.id || "guest",
    name: a?.name || b?.name || "Guest",
    role: a?.role || b?.role || "user",
    plan: a?.plan ?? b?.plan ?? null,
    features: uniq([...(a?.features || []), ...(b?.features || [])]),
  };
  setAinAuth(merged);
  setAuthToken(JSON.stringify(merged));
  return merged;
}
export function addFeatures(features: string[]): AinUser | null {
  const cur = getAinAuth();
  if (!cur) return null;
  const merged = { ...cur, features: uniq([...(cur.features || []), ...features]) };
  setAinAuth(merged);
  setAuthToken(JSON.stringify(merged));
  return merged;
}
export function onSessionChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => cb();
  const s = (e: StorageEvent) => { if (e.key === AUTH_KEY || e.key === TOKEN_KEY) cb(); };
  window.addEventListener(EV, h);
  window.addEventListener("storage", s);
  return () => { window.removeEventListener(EV, h); window.removeEventListener("storage", s); };
}
export function ensureUnifiedOnLoad(): void {
  try { unifySession(); } catch (_e) {}
}
export function requireFeature(navigate: (url: string) => void, feature: string, returnPath: string): void {
  const u = getAinAuth();
  const ok = !!u && Array.isArray(u.features) && u.features.includes(feature);
  if (!ok) {
    const qs = new URLSearchParams({ need: feature, return: returnPath });
    navigate(`/subscriptions?${qs.toString()}`);
  }
}
export function redirectAfterLogin(navigateReplace: (url: string) => void, fallback: string = "/dashboard"): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const r = url.searchParams.get("return");
  navigateReplace(r || fallback);
}
