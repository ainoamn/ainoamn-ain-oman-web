// src/pages/auth/login.tsx
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "@/components/layout/Layout";

export default function LoginStub() {
  const router = useRouter();
  const [uid, setUid] = useState<string>(typeof window!=="undefined" ? localStorage.getItem("ao_uid") || "" : "");
  const [name, setName] = useState<string>(typeof window!=="undefined" ? localStorage.getItem("ao_name") || "" : "");
  const [phone, setPhone] = useState<string>(typeof window!=="undefined" ? localStorage.getItem("ao_phone") || "" : "");
  const [owner, setOwner] = useState<boolean>(false);

  const save = () => {
    if (!uid.trim()) { alert("أدخل معرف المستخدم"); return; }
    localStorage.setItem("ao_uid", uid.trim());
    localStorage.setItem("ao_name", name.trim() || "مستخدم");
    localStorage.setItem("ao_phone", phone.trim());
    if (owner) localStorage.setItem("ao_owner", "1"); else localStorage.removeItem("ao_owner");
    alert("تم الحفظ");
    router.push("/");
  };

  return (
    <Layout>
      <Head><title>تسجيل الدخول (تجريبي)</title></Head>
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">تسجيل الدخول (تجريبي)</h1>
          <div className="space-y-3">
            <label className="text-sm block">
              <div className="text-gray-600 mb-1">معرف المستخدم</div>
              <input className="border rounded p-2 w-full" value={uid} onChange={e=>setUid(e.target.value)} placeholder="u-1001" />
            </label>
            <label className="text-sm block">
              <div className="text-gray-600 mb-1">الاسم</div>
              <input className="border rounded p-2 w-full" value={name} onChange={e=>setName(e.target.value)} placeholder="الاسم" />
            </label>
            <label className="text-sm block">
              <div className="text-gray-600 mb-1">الهاتف</div>
              <input className="border rounded p-2 w-full" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+9689xxxxxxx" />
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={owner} onChange={()=>setOwner(v=>!v)} />
              حساب مالك عقار
            </label>
            <div className="flex gap-2">
              <button onClick={save} className="px-4 py-2 rounded bg-[var(--brand-800)] hover:bg-[var(--brand-700)] text-white">حفظ</button>
              <button onClick={()=>{ localStorage.removeItem("ao_uid"); localStorage.removeItem("ao_name"); localStorage.removeItem("ao_phone"); localStorage.removeItem("ao_owner"); alert("تم تسجيل الخروج"); }} className="px-4 py-2 rounded border">تسجيل خروج</button>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
