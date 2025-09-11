import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useI18n } from "@/lib/i18n";

type User = { id:string; name:string; status:"active"|"restricted"|"banned" };
type Sub = { id:string; serial:string; planId:string; state:string; startAt:number|null; endAt:number|null; finalPriceOMR:number };
type AdOrder = { id:string; serial:string; adProductId:string; state:string; startAt:number|null; endAt:number|null; finalPriceOMR:number };

export default function AdminUserPage(){
  const { dir } = useI18n();
  const router = useRouter();
  const uid = String(router.query.id||"");
  const [user,setUser]=useState<User|null>(null);
  const [subs,setSubs]=useState<Sub[]>([]);
  const [ads,setAds]=useState<AdOrder[]>([]);

  async function load(){
    if(!uid) return;
    const u = await fetch(`/api/users/${encodeURIComponent(uid)}`).then(r=>r.ok?r.json():null).catch(()=>null);
    if(u?.item) setUser(u.item);
    const s = await fetch(`/api/subscriptions?userId=${encodeURIComponent(uid)}`).then(r=>r.json());
    const a = await fetch(`/api/ad-orders?userId=${encodeURIComponent(uid)}`).then(r=>r.json());
    setSubs(s.items||[]); setAds(a.items||[]);
  }
  useEffect(()=>{ load(); },[uid]);

  const setStatus = async (status:User["status"])=>{
    if(!user) return;
    await fetch(`/api/users/${encodeURIComponent(user.id)}`, { method:"PUT", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ status }) });
    await load();
  };

  return (
    <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
      <Head><title>بيانات المستخدم</title></Head>
      <Header />
      <div className="container mx-auto px-4 py-8 flex-1 w-full">
        <h1 className="text-2xl font-bold mb-4">بيانات المستخدم</h1>
        {!user ? <div>جاري التحميل…</div> : (
          <div className="bg-white rounded-xl p-5 shadow mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{user.name}</div>
                <div className="text-sm text-slate-500">{user.id}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">الحالة:</span>
                <select className="border rounded px-2 py-1" value={user.status} onChange={e=> setStatus(e.target.value as User["status"])}>
                  <option value="active">نشط</option>
                  <option value="restricted">مقيّد</option>
                  <option value="banned">محظور</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold mb-2">اشتراكات المستخدم</h2>
        <div className="bg-white rounded-xl p-5 shadow mb-8 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left border-b"><th className="p-2">الرقم</th><th className="p-2">الخطة</th><th className="p-2">الحالة</th><th className="p-2">بداية</th><th className="p-2">نهاية</th><th className="p-2">الإجمالي</th></tr></thead>
            <tbody>
              {subs.map(s=>(
                <tr key={s.id} className="border-b">
                  <td className="p-2 font-mono">{s.serial}</td>
                  <td className="p-2">{s.planId}</td>
                  <td className="p-2">{s.state}</td>
                  <td className="p-2">{s.startAt? new Date(s.startAt).toLocaleString(): "—"}</td>
                  <td className="p-2">{s.endAt? new Date(s.endAt).toLocaleString(): "—"}</td>
                  <td className="p-2">{s.finalPriceOMR}</td>
                </tr>
              ))}
              {subs.length===0 && <tr><td colSpan={6} className="p-4 text-center text-slate-500">لا توجد اشتراكات</td></tr>}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold mb-2">طلبات الإعلانات</h2>
        <div className="bg-white rounded-xl p-5 shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left border-b"><th className="p-2">الرقم</th><th className="p-2">النوع</th><th className="p-2">الحالة</th><th className="p-2">بداية</th><th className="p-2">نهاية</th><th className="p-2">الإجمالي</th></tr></thead>
            <tbody>
              {ads.map(o=>(
                <tr key={o.id} className="border-b">
                  <td className="p-2 font-mono">{o.serial}</td>
                  <td className="p-2">{o.adProductId}</td>
                  <td className="p-2">{o.state}</td>
                  <td className="p-2">{o.startAt? new Date(o.startAt).toLocaleString(): "—"}</td>
                  <td className="p-2">{o.endAt? new Date(o.endAt).toLocaleString(): "—"}</td>
                  <td className="p-2">{o.finalPriceOMR}</td>
                </tr>
              ))}
              {ads.length===0 && <tr><td colSpan={6} className="p-4 text-center text-slate-500">لا توجد طلبات</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </main>
  );
}
