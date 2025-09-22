// root: src/lib/next-auth-react-shim.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { id?: string; name?: string; email?: string; role?: string };
type Session = { user?: User } | null;

type Ctx = {
  session: Session;
  status: "loading" | "authenticated" | "unauthenticated";
  setSession: (s: Session) => void;
};

const AuthCtx = createContext<Ctx>({
  session: null,
  status: "unauthenticated",
  setSession: () => {},
});

function readProfile(): Session {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ao_profile");
    const prof = raw ? JSON.parse(raw) : {};
    const role = prof?.role || "owner";
    const name = prof?.name || "مالك";
    const email = prof?.email || "owner@example.com";
    return { user: { id: "local-owner", role, name, email } };
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(null);
  const [status, setStatus] = useState<Ctx["status"]>("loading");
  useEffect(() => {
    const s = readProfile();
    setSession(s);
    setStatus(s ? "authenticated" : "unauthenticated");
  }, []);
  const value = useMemo(() => ({ session, status, setSession }), [session, status]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useSession(): { data: Session; status: Ctx["status"] } {
  const ctx = useContext(AuthCtx);
  if (ctx.status === "unauthenticated" && typeof window !== "undefined") {
    const s = readProfile();
    if (s) return { data: s, status: "authenticated" };
  }
  return { data: ctx.session, status: ctx.status };
}

export async function signIn() {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("ao_profile");
    const prof = raw ? JSON.parse(raw) : { role: "owner", name: "مالك", email: "owner@example.com" };
    localStorage.setItem("ao_profile", JSON.stringify(prof));
    window.dispatchEvent(new StorageEvent("storage", { key: "ao_profile" }));
  }
  return { ok: true };
}

export async function signOut() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ao_profile");
    window.dispatchEvent(new StorageEvent("storage", { key: "ao_profile" }));
  }
  return { ok: true };
}
