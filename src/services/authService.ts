// @ts-nocheck
// src/services/authService.ts
export type AuthUser = {
  id: string;
  tenantId: string;
  name: string;
  roles: ("ADMIN" | "LAW_FIRM_ADMIN" | "LAWYER" | "PARALEGAL" | "CLIENT" | "STAFF")[];
  avatarUrl?: string;
};

const STORAGE_KEY = "auth:user";

function readLocal(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
}

function writeLocal(u: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (!u) window.localStorage.removeItem(STORAGE_KEY);
  else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
}

/** افتراضي للتطوير */
const FALLBACK_USER: AuthUser = {
  id: "U1",
  tenantId: "TENANT-1",
  name: "مستخدم تجريبي",
  roles: ["LAWYER"],
};

export const authService = {
  /** يُستدعى على العميل فقط */
  async login(email: string, _password: string): Promise<AuthUser> {
    // منطق بسيط للتطوير: يحدد الدور من البريد
    const lower = (email || "").toLowerCase();
    const isClient = lower.includes("client") || lower.includes("عميل");
    const isAdmin = lower.includes("admin");
    const user: AuthUser = {
      id: isClient ? "C1" : isAdmin ? "A1" : "U1",
      tenantId: "TENANT-1",
      name: isClient ? "عميل المنصّة" : isAdmin ? "مدير المنصّة" : "محامي المنصّة",
      roles: isClient ? ["CLIENT"] : isAdmin ? ["ADMIN"] : ["LAWYER"],
    };
    writeLocal(user);
    return user;
  },

  async logout(): Promise<void> { writeLocal(null); },

  /** يرجّع المستخدم الحالي أو افتراضيًا */
  async current(): Promise<AuthUser> {
    return readLocal() || FALLBACK_USER;
  },

  /** صحيح/خطأ */
  async isAuthenticated(): Promise<boolean> {
    return !!readLocal();
  },

  /** رؤوس API الموحّدة */
  async headers(): Promise<Record<string, string>> {
    const u = await this.current();
    return {
      "x-tenant-id": u.tenantId,
      "x-user-id": u.id,
      "x-roles": u.roles.join(","),
    };
  },
};
