import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/router";
import { useState } from "react";

const ROLES = [
  ["individual_tenant","مستأجر فردي"],
  ["corporate_tenant","مستأجر شركة"],
  ["basic_individual_landlord","مؤجر فردي عادي"],
  ["property_owner_individual_landlord","مؤجر فردي متعدد العقارات"],
  ["corporate_landlord","مؤجر شركة"],
  ["individual_property_manager","مدير عقارات فردي"],
  ["service_provider","مقدم خدمة"],
  ["admin_staff","موظف/إداري"],
  ["broker","وسيط عقاري"],
  ["investor","مستثمر"],
  ["sub_user","مستخدم فرعي"],
  ["super_admin","مشرف أعلى"],
] as const;

export default function RoleDev(){
  const { dir } = useI18n();
  const router = useRouter();
  const [busy,setBusy]=useState(false);
  const [custom,setCustom]=useState({ id:"", name:"", role:"individual_tenant" });

  async function go(role:string, name?:string){
    setBusy(true);
    try{
      const r = await fetch("/api/dev/impersonate",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ role, name }) });
      if(!r.ok){ alert("فشل التبديل"); return; }
      router.replace("/dashboard");
    } finally { setBusy(false); }
  }
  async function customLogin(){
    setBusy(true);
    try{
      const r = await fetch("/api/dev/impersonate",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(custom) });
      if(!r.ok){ alert("خطأ"); return; }
      router.replace("/dashboard");
    } finally { setBusy(false); }
  }
  async function logout(){
    await fetch("/api/auth/logout",{method:"POST"});
    location.reload();
  }

  return (
    <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
      <Head><title>محاكاة الأدوار</title></Head>
      <Header />

      <div className="container mx-auto px-4 py-10 flex-1">
        <h1 className="text-2xl font-bold mb-6">تجربة لوحات التحكم</h1>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {ROLES.map(([key,label])=>(
            <button
              key={key}
              disabled={busy}
              onClick={()=> go(key, label)}
              className="border rounded-2xl bg-white p-5 text-start hover:shadow transition"
            >
              <div className="text-lg font-semibold">{label}</div>
              <div className="text-slate-600 text-sm mt-1 font-mono">{key}</div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow max-w-xl">
          <div className="font-semibold mb-3">دخول مخصص</div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input className="border rounded px-3 py-2" placeholder="id" value={custom.id} onChange={e=> setCustom(v=>({...v,id:e.target.value}))}/>
            <input className="border rounded px-3 py-2" placeholder="name" value={custom.name} onChange={e=> setCustom(v=>({...v,name:e.target.value}))}/>
          </div>
          <select className="w-full border rounded px-3 py-2 mb-3" value={custom.role} onChange={e=> setCustom(v=>({...v,role:e.target.value}))}>
            {ROLES.map(([key,label])=> <option key={key} value={key}>{label}</option>)}
          </select>
          <div className="flex gap-2">
            <button disabled={busy} onClick={customLogin} className="px-4 py-2 rounded bg-teal-600 text-white">دخول</button>
            <button onClick={logout} className="px-3 py-2 rounded border">خروج</button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
