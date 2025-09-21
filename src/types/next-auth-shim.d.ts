// root: src/types/next-auth-shim.d.ts
declare module "next-auth/react" {
  import * as React from "react";
  type Session = { user?: { id?: string; name?: string; email?: string; role?: string } } | null;
  export function useSession(): { data: Session; status: "loading" | "authenticated" | "unauthenticated" };
  export function signIn(provider?: string, opts?: any): Promise<{ ok: boolean }>;
  export function signOut(): Promise<{ ok: boolean }>;
  export function SessionProvider(props: { children: React.ReactNode }): JSX.Element;
}
