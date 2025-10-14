// src/pages/admin/login.tsx
import { useState } from "react";
import Head from "next/head";

import { useRouter } from "next/router";

export default function AdminLoginPage() {
  const [key, setKey] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: any) => {
    e.preventDefault();
    setErr(null);
    try {
      const r = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) {
        setErr("المفتاح غير صحيح");
        return;
      }
      router.push("/admin/actions");
    } catch {
      setErr("خطأ غير متوقع");
    }
  };

  return (
    <>
      <Head><title>تسجيل دخول المدير</title></Head>
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">تسجيل دخول المدير</h1>
        <form onSubmit={submit} className="grid gap-3">
          <input
            type="password"
            className="border rounded p-2"
            placeholder="ADMIN_KEY"
            value={key}
            onChange={(e)=>setKey(e.target.value)}
            required
          />
          {err && <div className="text-red-600 text-sm">{err}</div>}
          <button className="px-4 py-2 rounded bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white">دخول</button>
        </form>
      </div>
    </>
  );
}
