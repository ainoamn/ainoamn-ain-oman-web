// واجهة موحّدة للصلاحيات والهوية تعتمد RBAC من permissions.ts
import { useAuth as useAuthHook } from "@/hooks/useAuth";
import {
  RolePermissions,
  type Role,
  type Permission as RBACPermission,
  can,
} from "@/lib/authz/permissions";

export type Permission = RBACPermission;

export type CurrentUser = {
  id: string;
  name: string;
  role?: string;       // توافق قديم
  roles?: Role[];      // المعتمد حالياً
  features?: string[]; // غير مستخدمة للمنح
  subscription?: { planId?: string; features?: string[] } | null;
};

// Backwards-compatible application user shape used in some modules
export type AppUser = CurrentUser & {
  // many places in the codebase read a simple `plan` string
  plan?: "free" | "pro" | "enterprise" | "basic" | "business" | string | null;
};

export function hasPermission(
  user: CurrentUser | null | undefined,
  need: Permission | Permission[]
): boolean {
  if (!user) return false;
  const roles: Role[] =
    (user.roles && user.roles.length ? user.roles : undefined) ??
    (user.role ? ([user.role] as Role[]) : ([] as Role[]));

  const set = new Set<RBACPermission>();
  for (const r of roles) for (const p of (RolePermissions[r] || [])) set.add(p);
  return can(Array.from(set), need);
}

export const useAuth = useAuthHook;
