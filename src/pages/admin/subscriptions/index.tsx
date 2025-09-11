// src/pages/admin/subscriptions/index.tsx
import Head from "next/head";
import React, { useEffect, useMemo, useState } from "react";

/* مفاتيح التخزين المشتركة مع widgets */
const LS_FEATURES = "ain.features.registry";
const LS_PLANS = "ain.subscriptions.plans";

/* أنواع */
type Feature = { key:string; label:string; iconKey:string; source:"widget"|"adminLink"; meta?:Record<string,any> };
type Plan = { id:string; name:string; price?:string; features:string[] };

/* أدوات */
function loadJSON<T>(key: string, fallback: T, validate?: (v:any)=>boolean): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    if (validate && !validate(v)) throw new Error("invalid");
    return v as T;
  } catch {
    try { localStorage.removeItem(key); } catch {}
    return fallback;
  }
}
function saveJSON<T>(key:string, v:T){ if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(v)); }

/* مكوّن */
export default function AdminSubscriptionsPage(){
  const [features, setFeatures] = useState<Feature[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [newName, setNewName] = useState(""); const [newPrice, setNewPrice] = useState("");

  useEffect(()=>{
    const feats = loadJSON<Feature[]>(LS_FEATURES, [], Array.isArray);
    const defaults: Plan[] = [
      { id:"basic", name:"Basic", price:"0", features:[] },
      { id:"standard", name:"Standard", price:"9.9", features:[] },
      { id:"pro", name:"Pro", price:"29.9", features:[] },
    ];
    setFeatures(feats);
    setPlans(loadJSON<Plan[]>(LS_PLANS, defaults, Array.isArray));
    const onChange = ()=> setFeatures(loadJSON<Feature[]>(LS_FEATURES, [], Array.isArray));
    window.addEventListener("ain:features:change", onChange);
    return ()=> window.removeEventListener("ain:features:change", onChange);
  },[]);

  // ضمان اتساق الخطط عند تغيّر الميزات
  useEffect(()=>{
    if (plans.length === 0) return;
    const featKeys = new Set(features.map(f=>f.key));
    const fixed = plans.map(p=> ({ ...p, features: p.features.filter(k=>featKeys.has(k)) }));
    setPlans(fixed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [features.map(f=>f.key).join("|")]);

  const savePlans = ()=> saveJSON(LS_PLANS, plans);

  const togglePlanFeature = (planId:string, featureKey:string)=>{
    setPlans(prev=> prev.map(p=>{
      if (p.id !== planId) return p;
      const has = p.features.includes(featureKey);
      return { ...p, features: has ? p.features.filter(k=>k!==featureKey) : [...p.features, featureKey] };
    }));
  };

  const addPlan = ()=>{
    const name = newName.trim(); if(!name) return;
    const id = name.toLowerCase().replace(/\s+/g, "-");
    const price = newPrice.trim();
    if (plans.some(p=>p.id===id)) return;
    const next = [...plans, { id, name, price, features:[] }];
    setPlans(next); setNewName(""); setNewPrice("");
  };
  const removePlan = (id:string)=> setPlans(prev=> prev.filter(p=>p.id!==id));
  const renamePlan = (id:string, name:string)=> setPlans(prev=> prev.map(p=> p.id===id?{...p, name}:p));
  const pricePlan = (id:string, price:string)=> setPlans(prev=> prev.map(p=> p.id===id?{...p, price}:p));

  const grouped = useMemo(()=>{
    return {
      widgets: features.filter(f=>f.source==="widget"),
      links: features.filter(f=>f.source==="adminLink"),
    };
  }, [features]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-gray-950" dir="rtl">
      <Head><title>إدارة الباقات والميزات | Ain Oman</title></Head>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">الباقات والميزات</h1>
            <p className="text-sm text-gray-500">أي عنصر تضيفه من لوحة الأدمن → عناصر لوحة المستخدم، يظهر هنا كميزة قابلة للتفعيل لكل باقة.</p>
          </div>
          <button onClick={savePlans} className="btn btn-primary">حفظ التغييرات</button>
        </div>

        {/* إدارة الباقات */}
        <section className="border rounded-2xl p-4 bg-white dark:bg-gray-900 dark:border-gray-800">
          <h3 className="text-base font-semibold mb-3">إضافة باقة</h3>
          <div className="grid sm:grid-cols-[2fr_1fr_auto] gap-2">
            <input className="input" placeholder="اسم الباقة" value={newName} onChange={e=>setNewName(e.target.value)} />
            <input className="input" placeholder="السعر (اختياري)" value={newPrice} onChange={e=>setNewPrice(e.target.value)} />
            <button className="btn btn-secondary" onClick={addPlan}>إضافة</button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="text-start py-2">المعرّف</th>
                  <th className="text-start py-2">الاسم</th>
                  <th className="text-start py-2">السعر</th>
                  <th className="text-start py-2">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(p=>(
                  <tr key={p.id} className="border-t">
                    <td className="py-2">{p.id}</td>
                    <td className="py-2">
                      <input className="input" value={p.name} onChange={e=>renamePlan(p.id, e.target.value)} />
                    </td>
                    <td className="py-2">
                      <input className="input" value={p.price||""} onChange={e=>pricePlan(p.id, e.target.value)} />
                    </td>
                    <td className="py-2">
                      <button className="btn btn-secondary text-xs text-rose-600" onClick={()=>removePlan(p.id)}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* مصفوفة الميزات × الباقات */}
        <section className="border rounded-2xl p-4 bg-white dark:bg-gray-900 dark:border-gray-800">
          <h3 className="text-base font-semibold mb-3">الميزات حسب المصدر</h3>

          {/* ودجات لوحة المستخدم */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-2">عناصر لوحة المستخدم</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-start py-2">الميزة</th>
                    {plans.map(p=> <th key={p.id} className="text-center py-2">{p.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {grouped.widgets.map(f=>(
                    <tr key={f.key} className="border-t">
                      <td className="py-2">{f.label}</td>
                      {plans.map(p=>{
                        const checked = p.features.includes(f.key);
                        return (
                          <td key={p.id} className="text-center py-2">
                            <input type="checkbox" checked={checked} onChange={()=>togglePlanFeature(p.id, f.key)} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* روابط إدارية مضافة */}
          <div>
            <h4 className="text-sm font-semibold mb-2">روابط إدارية مضافة</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-start py-2">الميزة</th>
                    {plans.map(p=> <th key={p.id} className="text-center py-2">{p.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {grouped.links.map(f=>(
                    <tr key={f.key} className="border-t">
                      <td className="py-2">{f.label}</td>
                      {plans.map(p=>{
                        const checked = p.features.includes(f.key);
                        return (
                          <td key={p.id} className="text-center py-2">
                            <input type="checkbox" checked={checked} onChange={()=>togglePlanFeature(p.id, f.key)} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button onClick={savePlans} className="btn btn-primary">حفظ التغييرات</button>
        </div>
      </div>
    </main>
  );
}
