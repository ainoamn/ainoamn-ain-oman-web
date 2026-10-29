import { BhdPrivacyGate } from "@/components/bhd/BhdPrivacyGate";
import { BhdSilentSso } from "@/components/bhd/BhdSilentSso";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

/** Mounts silent SSO + privacy gate once AuthProvider is available. */
export function BhdAccountIsolation() {
  const { user } = useAuth();
  const [productSub, setProductSub] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/me", { cache: "no-store", credentials: "include" })
      .then((r) => r.json().catch(() => ({})))
      .then((body: { user?: { id?: string } | null }) => {
        if (!cancelled && body.user?.id) setProductSub(body.user.id);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  return (
    <>
      <BhdSilentSso />
      {productSub || user ? (
        <BhdPrivacyGate productSub={productSub} productEmail={user?.email ?? null} />
      ) : null}
    </>
  );
}
