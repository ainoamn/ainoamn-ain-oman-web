// src/hooks/useAuth.ts
import { useMemo } from "react";
import { RolePermissions, type Role, type Permission, can } from "@/lib/authz/permissions";

type User = { id: string; name: string; roles: Role[] };

const defaultUser: User = { id: "u-1", name: "Admin", roles: ["admin"] };

export function useAuth(user?: Partial<User>) {
  const merged = { ...defaultUser, ...user, roles: user?.roles?.length ? user.roles : defaultUser.roles } as User;
  const permissions = useMemo<Permission[]>(() => {
    const set = new Set<Permission>();
    for (const r of merged.roles) for (const p of RolePermissions[r]) set.add(p);
    return Array.from(set);
  }, [merged.roles]);

  return {
    user: merged,
    roles: merged.roles,
    permissions,
    has: (p: Permission | Permission[]) => can(permissions, p),
  };
}
