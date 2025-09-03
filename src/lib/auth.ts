import { useEffect, useState } from "react";
import type { Role } from "./rbac";

export type SessionUser = { id: string; name: string; role: Role } | null;

export function useAuth() {
  const [user, setUser] = useState<SessionUser>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const r = await fetch("/api/session");
      const d = await r.json();
      setUser(d.user || null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
  }

  useEffect(() => {
    refresh();
  }, []);

  return { user, loading, refresh, logout };
}
