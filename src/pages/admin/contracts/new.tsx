// src/pages/admin/contracts/new.tsx
import Head from "next/head";
import InstantLink from '@/components/InstantLink';
import { useEffect, useMemo, useState } from "react";
// Header is now handled by MainLayout in _app.tsx


type Template = { id:string; name:string; scope:"unified"|"per-unit"; bodyAr:string; bodyEn:string; fields:{key:string;labelAr:string;labelEn:string;required?:boolean}[] };
type Property = { id:string; referenceNo?:string; title?:string|{ar?:string;en?:string} };
function tTitle(t?:Property["title"]){ return typeof t==="string"?t:(t?.ar||t?.en||""); }

export default function AdminNewContractPage(){
  const [templates,setTemplates]=useState<Template[]>([]);
  const [properties,setProperties]=useState<Property[]>([]);
  const [loading,setLoading]=useState(true); const [err,setErr]=useState<string|null>(null);

  // form
  const [templateId,setTemplateId]=useState("");
  const [scope,setScope]=useState<"unified"|"per-unit">("per-unit");
  const [propertyId,setPropertyId]=useState("");
  const [tenantName,setTenantName]=useState(""); const [tenantPhone,setTenantPhone]=useState(""); const [tenantEmail,setTenantEmail]=useState("");
  const [ownerName,setOwnerName]=useState("");  const [ownerPhone,setOwnerPhone]=useState(""); const [ownerEmail,setOwnerEmail]=useState("");
  const [startDate,setStartDate]=useState(""); const [duration,setDuration]=useState<number| "">("");
  const [amount,setAmount]=useState<number|"">("");
  const [fields,setFields]=useState<Record<string,string>>({});

  useEffect(()=>{ (async()=>{
    try{
      const [tr,pr] = await Promise.all([fetch("/api/contract-templates"), fetch("/api/properties")]);
      const tjs = tr.ok? await tr.json():{items:[]};
      const pjs = pr.ok? await pr.json():{items:[]};
      setTemplates(Array.isArray(tjs.items)?tjs.items:[]);
      setProperties(Array.isArray(pjs.items)?pjs.items:[]);
    }catch{ setErr("تعذّر جلب البيانات"); } finally{ setLoading(false); }
  })(); },[]);

  const selectedTemplate = useMemo(()=> templates.find(t=>t.id===templateId) || null, [templates, templateId]);

  function onFieldChange(k:string,v:string){ setFields(s=>({ ...s, [k]: v })); }

  async function submit(){
    if(!templateId) return alert("اختر قالباً");
    if(scope==="per-unit" && !propertyId) return alert("اختر وحدة");
    const body = {
      templateId, scope, propertyId: scope==="per-unit"? propertyId : undefined,
      fields,
      parties:{ owner:{name:ownerName, phone:ownerPhone, email:ownerEmail}, tenant:{name:tenantName, phone:tenantPhone, email:tenantEmail} },
      startDate: startDate || undefined, durationMonths: duration? Number(duration): undefined,
      totals: amount!==""? { amount: Number(amount), currency:"OMR" } : undefined,
      status: "draft"
    };
    const r = await fetch("/api/contracts",{ method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    if(r.ok && d?.item?.id){ window.location.href = `/admin/contracts/${encodeURIComponent(d.item.id)}`; }
    else alert(d?.error || "فشل إنشاء العقد");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head><title>عقد جديد</title></Head>
      
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">إنشاء عقد</h1>
          <InstantLink href="/admin/contracts" className="btn">رجوع</InstantLink>
        </div>

        {loading? <div>جارٍ التحميل…</div> : err? <div className="text-red-600">{err}</div> : (
          <div className="grid lg:grid-cols-3 gap-4">
            <section className="lg:col-span-2 border rounded-2xl p-3 space-y-3">
              <div className="grid sm:grid-cols-2 gap-2">
                <select className="form-input" value={templateId} onChange={e=>setTemplateId(e.target.value)}>
                  <option value="">اختر القالب</option>
                  {templates.map(t=><option key={t.id} value={t.id}>{t.name} ({t.scope==="unified"?"موحّد":"للوحدة"})</option>)}
                </select>
                <select className="form-input" value={scope} onChange={e=>setScope(e.target.value as any)}>
                  <option value="per-unit">مخصص لوحدة</option>
                  <option value="unified">موحّد لكل الوحدات</option>
                </select>
              </div>

              {scope==="per-unit" && (
                <select className="form-input" value={propertyId} onChange={e=>setPropertyId(e.target.value)}>
                  <option value="">اختر الوحدة</option>
                  {properties.map(p=><option key={p.id} value={String(p.id)}>{p.referenceNo || p.id} — {tTitle(p.title)}</option>)}
                </select>
              )}

              <div className="grid sm:grid-cols-3 gap-2">
                <input className="form-input" placeholder="اسم المالك" value={ownerName} onChange={e=>setOwnerName(e.target.value)} />
                <input className="form-input" placeholder="هاتف المالك" value={ownerPhone} onChange={e=>setOwnerPhone(e.target.value)} />
                <input className="form-input" placeholder="بريد المالك" value={ownerEmail} onChange={e=>setOwnerEmail(e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                <input className="form-input" placeholder="اسم المستأجر" value={tenantName} onChange={e=>setTenantName(e.target.value)} />
                <input className="form-input" placeholder="هاتف المستأجر" value={tenantPhone} onChange={e=>setTenantPhone(e.target.value)} />
                <input className="form-input" placeholder="بريد المستأجر" value={tenantEmail} onChange={e=>setTenantEmail(e.target.value)} />
              </div>

              <div className="grid sm:grid-cols-3 gap-2">
                <input className="form-input" type="date" placeholder="بداية العقد" value={startDate} onChange={e=>setStartDate(e.target.value)} />
                <input className="form-input" type="number" placeholder="المدة بالأشهر" value={duration} onChange={e=>setDuration(e.target.value?Number(e.target.value):"")} />
                <input className="form-input" type="number" placeholder="القيمة الإجمالية" value={amount} onChange={e=>setAmount(e.target.value?Number(e.target.value):"")} />
              </div>

              {selectedTemplate && (
                <div className="space-y-2">
                  <div className="font-semibold">حقول القالب</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {selectedTemplate.fields.map(f=>(
                      <input key={f.key} className="form-input" required={!!f.required}
                        placeholder={`${f.labelAr} / ${f.labelEn}`} value={fields[f.key]||""}
                        onChange={e=>onFieldChange(f.key,e.target.value)} />
                    ))}
                  </div>
                </div>
              )}

              <button className="btn btn-primary" onClick={submit}>إنشاء العقد</button>
            </section>

            <section className="border rounded-2xl p-3 space-y-2">
              <div className="font-semibold">معاينة سريعة</div>
              {selectedTemplate ? (
                <>
                  <Preview lang="ar" body={selectedTemplate.bodyAr} fields={fields} />
                  <Preview lang="en" body={selectedTemplate.bodyEn} fields={fields} />
                </>
              ) : <div className="text-sm text-gray-600">اختر قالبًا لعرض المعاينة.</div>}
            </section>
          </div>
        )}
      </main>
      
    </div>
  );
}

function Preview({lang, body, fields}:{lang:"ar"|"en"; body:string; fields:Record<string,string>}){
  const html = useMemo(()=>{
    let out = body || "";
    Object.entries(fields||{}).forEach(([k,v])=>{
      const re = new RegExp(`{{\\s*${k}\\s*}}`,"g");
      out = out.replace(re, String(v||""));
    });
    return out;
  },[body,fields]);
  return (
    <div className="border rounded-lg p-2 bg-gray-50">
      <div className="text-xs text-gray-500">{lang==="ar"?"العربية":"English"}</div>
      <div className="text-sm whitespace-pre-wrap">{html}</div>
    </div>
  );
}
