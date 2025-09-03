import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Product = { id:string; name:string; priceOMR:number; durationDays:number; category?:string; description?:string; icon?:string; highlight?:boolean; stockLimit?:number|null };
type Order = { id:string; serial:string; userId:string; name:string; adProductId:string; state:"pending"|"approved"|"rejected"; startAt:number|null; endAt:number|null; priceOMR:number; discount?:any; finalPriceOMR:number; createdAt:number };

function toInput(ms:number|null){ if(!ms) return ""; const d=new Date(ms); const p=(n:number)=> String(n).padStart(2,"0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;}
function fromInput(s:string){ if(!s) return null; const t=new Date(s).getTime(); return Number.isFinite(t)? t : null; }

export default function AdminAds(){
  const { dir } = useI18n();
  const [products,setProducts]=useState<Product[]>([]);
  const [orders,setOrders]=useState<Order[]>([]);
  const [form,setForm]=useState<Product>({ id:"", name:"", priceOMR:0, durationDays:7, category:"generic", description:"", icon:"", highlight:false, stockLimit:null });

  const pIndex = useMemo(()=> Object.fromEntries(products.map(p=>[p.id,p])), [products]);
  const now=Date.now();
  const activeByProduct = useMemo(()=>{ const m:Record<string,number>={}; orders.forEach(o=>{ if(o.state==="approved"&&o.endAt&&o.endAt>now){ m[o.adProductId]=(m[o.adProductId]||0)+1 }}); return m; },[orders,now]);

  async function load(){
    const [p,o] = await Promise.all([
      fetch("/api/ad-products").then(r=>r.json()),
      fetch("/api/ad-orders").then(r=>r.json()),
    ]);
    setProducts(p.items||[]);
    setOrders(o.items||[]);
  }
  useEffect(()=>{ load(); },[]);

  const saveProduct = async ()=>{
    if(!form.name.trim()) return alert("اسم النوع مطلوب");
    const payload = { ...form, id: form.id?.trim()||undefined };
    await fetch("/api/ad-products",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
    setForm({ id:"", name:"", priceOMR:0, durationDays:7, category:"generic", description:"", icon:"", highlight:false, stockLimit:null });
    await load();
  };
  const editProduct = (p:Product)=> setForm({ ...p });
  const deleteProduct = async (id:string)=>{ if(!confirm("حذف النوع؟")) return; await fetch(`/api/ad-products/${encodeURIComponent(id)}`,{ method:"DELETE" }); await load(); };

  const setLocalOrder = (id:string, patch:Partial<Order>)=> setOrders(arr=> arr.map(o=> o.id===id? { ...o, ...patch } : o));
  const persistOrder = async (o:Order)=>{ await fetch(`/api/ad-orders/${encodeURIComponent(o.id)}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(o) }); await load(); };

  return (
    <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
      <Head><title>إدارة الإعلانات</title></Head>
      <Header />

      <div className="container mx-auto px-4 py-8 flex-1 w-full">
        <h1 className="text-2xl font-bold mb-6">أنواع الإعلانات</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl p-5 shadow">
            <h2 className="font-semibold mb-3">{form.id? "تعديل نوع":"إضافة نوع"}</h2>
            <div className="space-y-3">
              <input className="w-full border rounded p-2" placeholder="الاسم" value={form.name} onChange={e=> setForm({...form, name:e.target.value})}/>
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full border rounded p-2" type="number" placeholder="السعر (ر.ع)" value={form.priceOMR} onChange={e=> setForm({...form, priceOMR:Number(e.target.value)})}/>
                <input className="w-full border rounded p-2" type="number" placeholder="المدة (أيام)" value={form.durationDays} onChange={e=> setForm({...form, durationDays:Number(e.target.value)})}/>
              </div>
              <input className="w-full border rounded p-2" placeholder="التصنيف (اختياري)" value={form.category||""} onChange={e=> setForm({...form, category:e.target.value})}/>
              <input className="w-full border rounded p-2" placeholder="أيقونة (إيموجي/رابط)" value={form.icon||""} onChange={e=> setForm({...form, icon:e.target.value})}/>
              <textarea className="w-full border rounded p-2" placeholder="الوصف" value={form.description} onChange={e=> setForm({...form, description:e.target.value})}/>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!form.highlight} onChange={e=> setForm({...form, highlight:e.target.checked})}/><span>تمييز</span></label>
              <input className="w-full border rounded p-2" type="number" placeholder="حد السعة (اختياري)" value={form.stockLimit ?? ""} onChange={e=> setForm({ ...form, stockLimit: e.target.value===""? null : Number(e.target.value) })}/>
              <div className="flex gap-2 mt-2">
                <button onClick={saveProduct} className="px-4 py-2 bg-teal-600 text-white rounded">{form.id? "حفظ":"إضافة"}</button>
                {form.id && <button onClick={()=> setForm({ id:"", name:"", priceOMR:0, durationDays:7, category:"generic", description:"", icon:"", highlight:false, stockLimit:null })} className="px-3 py-2 border rounded">إلغاء</button>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow">
            <h2 className="font-semibold mb-3">الأنواع</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {products.map(p=>(
                <div key={p.id} className="border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {p.icon?.startsWith("http")? <img src={p.icon} alt="" className="w-7 h-7 rounded"/> : <span className="text-2xl">{p.icon||"•"}</span>}
                    <div className="font-semibold">{p.name} {p.highlight?"⭐":""}</div>
                  </div>
                  <div className="text-sm text-slate-600">{p.description}</div>
                  <div className="mt-2 text-sm">{p.priceOMR} ر.ع — {p.durationDays} يوم</div>
                  {Number.isFinite(p.stockLimit as any) && <div className="text-xs mt-1">السعة: {activeByProduct[p.id]||0} / {p.stockLimit}</div>}
                  <div className="mt-3 flex gap-2">
                    <button onClick={()=> editProduct(p)} className="px-3 py-1 rounded bg-slate-700 text-white">تعديل</button>
                    <button onClick={()=> deleteProduct(p.id)} className="px-3 py-1 rounded bg-rose-600 text-white">حذف</button>
                  </div>
                </div>
              ))}
              {products.length===0 && <div className="text-slate-500">لا توجد أنواع بعد.</div>}
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6">طلبات الإعلانات</h1>
        <div className="bg-white rounded-xl p-5 shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left border-b">
              <th className="p-2">الرقم</th><th className="p-2">المستخدم</th><th className="p-2">النوع</th>
              <th className="p-2">الحالة</th><th className="p-2">بداية</th><th className="p-2">نهاية</th>
              <th className="p-2">السعر</th><th className="p-2">الخصم</th><th className="p-2">الإجمالي</th><th className="p-2">حفظ</th>
            </tr></thead>
            <tbody>
              {orders.map(o=>{
                const p = pIndex[o.adProductId];
                const disc = o.discount ? (o.discount.percentOff? `${o.discount.percentOff}%` : (o.discount.amountOff? `${o.discount.amountOff} ر.ع` : o.discount.code)) : "—";
                return (
                  <tr key={o.id} className="border-b">
                    <td className="p-2 font-mono">{o.serial}</td>
                    <td className="p-2"><a href={`/admin/users/${encodeURIComponent(o.userId)}`} className="text-teal-700 underline">{o.name} ({o.userId})</a></td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {p?.icon?.startsWith("http")? <img src={p.icon} alt="" className="w-5 h-5 rounded"/> : <span className="text-lg">{p?.icon||"•"}</span>}
                        <span>{p?.name || o.adProductId}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <select className="border rounded px-2 py-1" value={o.state} onChange={e=> setLocalOrder(o.id,{ state: e.target.value as Order["state"] })}>
                        <option value="pending">معلق</option><option value="approved">موافق عليه</option><option value="rejected">مرفوض</option>
                      </select>
                    </td>
                    <td className="p-2"><input type="datetime-local" className="border rounded px-2 py-1" value={toInput(o.startAt)} onChange={e=> setLocalOrder(o.id,{ startAt: fromInput(e.target.value) })}/></td>
                    <td className="p-2"><input type="datetime-local" className="border rounded px-2 py-1" value={toInput(o.endAt)} onChange={e=> setLocalOrder(o.id,{ endAt: fromInput(e.target.value) })}/></td>
                    <td className="p-2">{o.priceOMR}</td>
                    <td className="p-2">{disc}</td>
                    <td className="p-2">{o.finalPriceOMR}</td>
                    <td className="p-2"><button onClick={()=> persistOrder(o)} className="px-3 py-1 rounded bg-teal-600 text-white">حفظ</button></td>
                  </tr>
                );
              })}
              {orders.length===0 && <tr><td colSpan={10} className="p-4 text-center text-slate-500">لا توجد طلبات</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </main>
  );
}
