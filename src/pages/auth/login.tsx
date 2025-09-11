// src/pages/auth/login.tsx
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "@/components/layout/Layout";

export default function LoginPage(){
  const router = useRouter();
  const ret = (router.query.return as string) || "/";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const submit = async () => {
    const r = await fetch("/api/users/login", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ name, phone })
    });
    if (r.ok) {
      const d = await r.json();
      try {
        localStorage.setItem("ao_user_id", d.user.id);
        localStorage.setItem("ao_user_verified", d.user.verified ? "true" : "false");
      } catch {}
      window.location.href = ret;
    } else alert("فشل الدخول");
  };

  return (
    <Layout>
      <Head><title>تسجيل الدخول | Ain Oman</title></Head>
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-md mx-auto p-6 space-y-4">
          <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
          <label className="text-sm block">
            <div className="text-gray-600 mb-1">الاسم</div>
            <input className="border rounded p-2 w-full" value={name} onChange={e=>setName(e.target.value)} />
          </label>
          <label className="text-sm block">
            <div className="text-gray-600 mb-1">الهاتف</div>
            <input className="border rounded p-2 w-full" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+9689xxxxxxx" />
          </label>
          <button onClick={submit} className="px-4 py-2 rounded-xl bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white w-full">دخول</button>
        </div>
      </main>
    </Layout>
  );
}
