// src/lib/auth.ts
import { useAuth as useAuthCtx } from "@/context/AuthContext";

export type Permission = string;

export type CurrentUser = {
  id: string;
  name: string;
  role: string;
  features?: string[];
  subscription?: { planId?: string; features?: string[] } | null;
};

export function hasPermission(
  user: CurrentUser | null | undefined,
  perm: Permission
): boolean {
  if (!user) return false;
  const f1 = Array.isArray(user.features) ? user.features : [];
  const f2 = Array.isArray(user.subscription?.features)
    ? (user.subscription!.features as string[])
    : [];
  const all = new Set<string>([...f1, ...f2]);
  return all.has(perm);
}

// حافظ على نفس اسم الدالة hook كي لا تغيّر بقية الملفات
export const useAuth = useAuthCtx;
