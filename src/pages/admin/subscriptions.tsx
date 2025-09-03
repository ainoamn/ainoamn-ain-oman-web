import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Period = "/mo" | "/yr";
type Plan = { id:string; name:string; priceOMR:number; period:Period; annualDiscountPercent?:number; highlight?:boolean; description?:string; icon?:string; capabilities?:Record<string,any>; stockLimit?:number|null };
type Sub = { id:string; serial:string; userId:string; name:string; planId:string; state:"pending"|"active"|"declined"|"banned"; startAt:number|null; endAt:number|null; promoted:boolean; priceOMR:number; discount?:any; finalPriceOMR:number; billingPeriod:Period; payment:{method:string;status:string}; createdAt:number; remainingMs?:number|null };
type Task = { id:string; title:string; description:string; status:"open"|"done" };

function toInput(ms:number|null){ if(!ms) return ""; const d=new Date(ms); const p=(n:number)=>String(n).padStart(2,"0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;}
function fromInput(s:string){ if(!s) return null; const t=new Date(s).getTime(); return Number.isFinite(t)? t : null; }
function fmtRemain(ms?:number|null){ if(ms==null) return "—"; const d=Math.ceil(ms/(24*60*60*1000)); return d<=0? "انتهى": `${d} يوم`; }
const yr = (t:number)=>{ const d=new Date(t); d.setFullYear(d.getFullYear()+1); return d.getTime(); };
const mo = (t:number)=>{ const d=new Date(t); d.setMonth(d.getMonth()+1); return d.getTime(); };

export default function AdminSubscriptions(){
  const { dir } = useI18n();
  const [plans,setPlans]=useState<Plan[]>([]);
  const [subs,setSubs]=useState<Sub[]>([]);
  const [tasks,setTasks]=useState<Task[]>([]);
  const [form,setForm]=useState<Plan>({ id:"", name:"", priceOMR:0, period:"/mo", annualDiscountPercent:10, highlight:false, description:"", icon:"", capabilities:{ includesCreateAuction:false, includesFeaturedAds:false, maxListings:10 }, stockLimit:null });

  const planById = useMemo(()=> Object.fromEntries(plans.map(p=>[p.id,p])), [plans]);
  const now=Date.now();
  const activeByPlan = useMemo(()=>{ const m:Record<string,number>={}; subs.forEach(s=>{ if(s.state==="active"&&s.endAt&&s.endAt>now){ m[s.planId]=(m[s.planId]||0)+1 }}); return m; },[subs,now]);

  async function load(scan=false){
    const [p,s,t] = await Promise.all([
      fetch("/api/plans").then(r=>r.json()),
      fetch(`/api/subscriptions${scan? "?scan=1":""}`).then(r=>r.json()),
      fetch("/api/tasks").then(r=>r.json()),
    ]);
    setPlans(p.items||[]); setSubs(s.items||[]); setTasks(t.items||[]);
  }
  useEffect(()=>{ load(); },[]);

  const savePlan = async ()=>{
    if(!form.name.trim()) return alert("اسم الباقة مطلوب");
    const payload={...form, capabilities: form.capabilities||{}};
    if(!form.id) await fetch("/api/plans",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    else await fetch(`/api/plans/${encodeURIComponent(form.id)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    setForm({ id:"", name:"", priceOMR:0, period:"/mo", annualDiscountPercent:10, highlight:false, description:"", icon:"", capabilities:{ includesCreateAuction:false, includesFeaturedAds:false, maxListings:10 }, stockLimit:null });
    await load();
  };
  const editPlan = (p:Plan)=> setForm({ ...p, capabilities:{ ...(p.capabilities||{}) }});
  const deletePlan = async (id:string)=>{ if(!confirm("حذف الباقة؟")) return; await fetch(`/api/plans/${encodeURIComponent(id)}`,{method:"DELETE"}); await load(); };

  const setLocal = (id:string, patch:Partial<Sub>)=> setSubs(arr=> arr.map(s=> s.id===id? { ...s, ...patch } : s));
  const persistSub = async (s:Sub)=>{ await fetch(`/api/subscriptions/${encodeURIComponent(s.id)}`,{ method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(s)}); await load(); };

  const approve = (s:Sub)=> {
    const start = s.startAt ?? Date.now();
    const end = s.endAt ?? (s.billingPeriod==="/yr"? yr(start): mo(start));
    setLocal(s.id, { state:"active", startAt:start, endAt:end });
  };

  return (
    <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
      <Head><title>لوحة التحكم - الباقات والاشتراكات</title></Head>
      <Header />

      <div className="container mx-auto px-4 py-8 flex-1 w-full">

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">إدارة الباقات</h1>
          <button onClick={()=> load(true)} className="px-3 py-2 rounded bg-teal-600 text-white">فحص قرب الانتهاء</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-1 bg-white rounded-xl p-5 shadow">
            <h2 className="font-semibold mb-3">{form.id? "تعديل باقة":"إضافة باقة"}</h2>
            <div className="space-y-3">
              <input className="w-full border rounded p-2" placeholder="اسم الباقة" value={form.name} onChange={e=> setForm({...form, name:e.target.value})}/>
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full border rounded p-2" placeholder="السعر الشهري (ر.ع)" type="number" value={form.priceOMR} onChange={e=> setForm({...form, priceOMR:Number(e.target.value)})}/>
                <select className="w-full border rounded p-2" value={form.period} onChange={e=> setForm({...form, period:e.target.value as Period})}>
                  <option value="/mo">شهري (افتراضي)</option><option value="/yr">سنوي (افتراضي)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full border rounded p-2" placeholder="خصم سنوي %" type="number" value={form.annualDiscountPercent ?? 10} onChange={e=> setForm({...form, annualDiscountPercent:Number(e.target.value)})}/>
                <input className="w-full border rounded p-2" placeholder="حد السعة (اختياري)" type="number" value={form.stockLimit ?? ""} onChange={e=> setForm({...form, stockLimit: e.target.value===""? null : Number(e.target.value) })}/>
              </div>
              <input className="w-full border rounded p-2" placeholder="إيموجي/رابط الأيقونة" value={form.icon||""} onChange={e=> setForm({...form, icon:e.target.value})}/>
              <textarea className="w-full border rounded p-2" placeholder="وصف" value={form.description} onChange={e=> setForm({...form, description:e.target.value})}/>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!form.capabilities?.includesCreateAuction} onChange={e=> setForm({...form, capabilities:{...(form.capabilities||{}), includesCreateAuction:e.target.checked}})}/><span>إنشاء مزادات</span></label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!form.capabilities?.includesFeaturedAds} onChange={e=> setForm({...form, capabilities:{...(form.capabilities||{}), includesFeaturedAds:e.target.checked}})}/><span>إعلانات مميزة</span></label>
              <label className="block"><span className="block mb-1">حد الإعلانات</span><input type="number" className="w-full border rounded p-2" value={Number(form.capabilities?.maxListings??10)} onChange={e=> setForm({...form, capabilities:{...(form.capabilities||{}), maxListings:Number(e.target.value)}})}/></label>
              <div className="flex gap-2 mt-2">
                <button onClick={savePlan} className="px-4 py-2 bg-teal-600 text-white rounded">{form.id? "حفظ":"إضافة"}</button>
                {form.id && <button onClick={()=> setForm({ id:"", name:"", priceOMR:0, period:"/mo", annualDiscountPercent:10, highlight:false, description:"", icon:"", capabilities:{ includesCreateAuction:false, includesFeaturedAds:false, maxListings:10 }, stockLimit:null })} className="px-3 py-2 border rounded">إلغاء</button>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow">
            <h2 className="font-semibold mb-3">الباقات</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {plans.map(p=>(
                <div key={p.id} className="border rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {p.icon?.startsWith("http")? <img src={p.icon} alt="" className="w-7 h-7 rounded"/> : <span className="text-2xl">{p.icon||"•"}</span>}
                    <div className="font-semibold">{p.name} {p.highlight?"⭐":""}</div>
                  </div>
                  <div className="text-sm text-slate-600">{p.description}</div>
                  <div className="mt-2 text-sm">شهري: {p.priceOMR} ر.ع — سنوي: {(p.priceOMR*12*(1-(p.annualDiscountPercent??10)/100)).toFixed(3)} ر.ع</div>
                  {Number.isFinite(p.stockLimit as any) && <div className="text-xs mt-1">السعة: {activeByPlan[p.id]||0} / {p.stockLimit}</div>}
                  <div className="mt-3 flex gap-2">
                    <button onClick={()=>editPlan(p)} className="px-3 py-1 rounded bg-slate-700 text-white">تعديل</button>
                    <button onClick={()=>deletePlan(p.id)} className="px-3 py-1 rounded bg-rose-600 text-white">حذف</button>
                  </div>
                </div>
              ))}
              {plans.length===0 && <div className="text-slate-500">لا توجد باقات.</div>}
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6">الاشتراكات</h1>
        <div className="bg-white rounded-xl p-5 shadow mb-10 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left border-b">
              <th className="p-2">الرقم</th><th className="p-2">المستخدم</th><th className="p-2">الباقة</th><th className="p-2">الفوترة</th><th className="p-2">الحالة</th><th className="p-2">بداية</th><th className="p-2">نهاية</th><th className="p-2">المتبقي</th><th className="p-2">الإجمالي</th><th className="p-2">إجراءات</th><th className="p-2">حفظ</th>
            </tr></thead>
            <tbody>
              {subs.map(s=>{
                const plan = planById[s.planId];
                return (
                  <tr key={s.id} className="border-b">
                    <td className="p-2 font-mono">{s.serial}</td>
                    <td className="p-2">
                      <a href={`/admin/users/${encodeURIComponent(s.userId)}`} className="text-teal-700 underline">
                        {s.name} ({s.userId})
                      </a>
                    </td>
                    <td className="p-2">{plan?.name || s.planId}</td>
                    <td className="p-2">{s.billingPeriod==="/yr"?"سنوي":"شهري"}</td>
                    <td className="p-2">
                      <select className="border rounded px-2 py-1" value={s.state} onChange={e=> setLocal(s.id,{ state: e.target.value as Sub["state"] })}>
                        <option value="pending">معلق</option><option value="active">مفعل</option><option value="declined">مرفوض</option><option value="banned">محظور</option>
                      </select>
                    </td>
                    <td className="p-2"><input type="datetime-local" className="border rounded px-2 py-1" value={toInput(s.startAt)} onChange={e=> setLocal(s.id,{ startAt: fromInput(e.target.value) })}/></td>
                    <td className="p-2"><input type="datetime-local" className="border rounded px-2 py-1" value={toInput(s.endAt)} onChange={e=> setLocal(s.id,{ endAt: fromInput(e.target.value) })}/></td>
                    <td className="p-2">{fmtRemain(s.remainingMs)}</td>
                    <td className="p-2">{s.finalPriceOMR}</td>
                    <td className="p-2 whitespace-nowrap">
                      <button onClick={()=> approve(s)} className="px-3 py-1 rounded bg-emerald-600 text-white me-2">تفعيل فوري</button>
                      <button onClick={()=> setLocal(s.id,{ state:"declined" })} className="px-3 py-1 rounded bg-rose-600 text-white">رفض</button>
                    </td>
                    <td className="p-2"><button onClick={()=> persistSub(s)} className="px-3 py-1 rounded bg-teal-600 text-white">حفظ</button></td>
                  </tr>
                );
              })}
              {subs.length===0 && <tr><td colSpan={11} className="p-4 text-center text-slate-500">لا توجد اشتراكات</td></tr>}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold mb-3">المهام</h2>
        <div className="bg-white rounded-xl p-5 shadow">
          {tasks.length===0? <div className="text-slate-500 text-sm">لا توجد مهام</div> : (
            <ul className="list-disc ps-5 text-sm space-y-1">
              {tasks.map(t=> <li key={t.id}>{t.title} — <span className="text-slate-500">{t.status==="done"?"منجزة":"مفتوحة"}</span></li>)}
            </ul>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
