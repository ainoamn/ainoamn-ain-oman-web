// src/components/admin/HeaderFooterEditor.tsx
"use client";
import { useState } from "react";
import { useCustomization } from "@/contexts/CustomizationContext";

export default function HeaderFooterEditor() {
  const { header, footer, updateHeader, updateFooter, addNotification } = useCustomization();

  const [newMenu, setNewMenu] = useState({ label: "", href: "" });
  const [newSection, setNewSection] = useState({ title: "", links: [{ label: "", href: "" }] });
  const [newPartner, setNewPartner] = useState({ name: "", logo: "", url: "" });
  const [newPay, setNewPay] = useState({ name: "", icon: "" });
  const [notif, setNotif] = useState("");

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6">إدارة الهيدر والفوتر</h1>

      {/* الألوان */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-3">ألوان الهيدر</h2>
          <div className="flex items-center gap-4 mb-3">
            <label className="text-sm w-32">خلفية</label>
            <input type="color" value={header.backgroundColor} onChange={(e)=>updateHeader({ backgroundColor: e.target.value })} />
            <input type="text" className="border rounded px-2 py-1 flex-1" value={header.backgroundColor} onChange={(e)=>updateHeader({ backgroundColor: e.target.value })}/>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm w-32">لون النص</label>
            <input type="color" value={header.textColor} onChange={(e)=>updateHeader({ textColor: e.target.value })} />
            <input type="text" className="border rounded px-2 py-1 flex-1" value={header.textColor} onChange={(e)=>updateHeader({ textColor: e.target.value })}/>
          </div>
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-3">الفوتر</h2>
          <div className="flex items-center gap-4 mb-3">
            <label className="text-sm w-32">شفافية اللون</label>
            <input type="range" min={20} max={100} step={5} value={footer.transparency} onChange={(e)=>updateFooter({ transparency: parseInt(e.target.value) })} className="flex-1"/>
            <span className="text-sm w-12 text-right">{footer.transparency}%</span>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm w-32">لون النص</label>
            <input type="color" value={footer.textColor} onChange={(e)=>updateFooter({ textColor: e.target.value })} />
            <input type="text" className="border rounded px-2 py-1 flex-1" value={footer.textColor} onChange={(e)=>updateFooter({ textColor: e.target.value })}/>
          </div>
        </section>
      </div>

      {/* الإشعارات */}
      <section className="border rounded-lg p-4 mt-6">
        <h2 className="font-semibold mb-3">إشعار علوي</h2>
        <div className="flex gap-2">
          <input type="text" className="border rounded px-3 py-2 flex-1" placeholder="رسالة الإشعار" value={notif} onChange={(e)=>setNotif(e.target.value)} />
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={()=>{ if(notif.trim()) { addNotification(notif.trim()); setNotif(""); }}}>إرسال</button>
        </div>
      </section>

      {/* قوائم الهيدر */}
      <section className="border rounded-lg p-4 mt-6">
        <h2 className="font-semibold mb-3">قوائم الهيدر</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {header.menuItems.map((m, i)=>(
            <div key={i} className="border rounded p-3 flex items-center gap-2">
              <input className="border rounded px-2 py-1 flex-1" value={m.label} onChange={(e)=> {
                const arr = [...header.menuItems]; arr[i] = { ...m, label: e.target.value }; updateHeader({ menuItems: arr });
              }}/>
              <input className="border rounded px-2 py-1 flex-1" value={m.href} onChange={(e)=> {
                const arr = [...header.menuItems]; arr[i] = { ...m, href: e.target.value }; updateHeader({ menuItems: arr });
              }}/>
              <button className="px-2 py-1 text-red-700 bg-red-100 rounded" onClick={()=> {
                const arr = header.menuItems.filter((_,x)=>x!==i); updateHeader({ menuItems: arr });
              }}>حذف</button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input className="border rounded px-2 py-1 flex-1" placeholder="الاسم" value={newMenu.label} onChange={(e)=>setNewMenu(s=>({...s, label:e.target.value}))}/>
          <input className="border rounded px-2 py-1 flex-1" placeholder="/path" value={newMenu.href} onChange={(e)=>setNewMenu(s=>({...s, href:e.target.value}))}/>
          <button className="px-3 py-2 bg-teal-600 text-white rounded" onClick={()=>{
            if(!newMenu.label || !newMenu.href) return;
            updateHeader({ menuItems: [...header.menuItems, newMenu]});
            setNewMenu({ label:"", href:"" });
          }}>إضافة</button>
        </div>
      </section>

      {/* أقسام الفوتر + الدفع/الشركاء */}
      <section className="border rounded-lg p-4 mt-6">
        <h2 className="font-semibold mb-3">أقسام الفوتر</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {footer.sections.map((s, i)=>(
            <div key={i} className="border rounded p-3 space-y-2">
              <input className="border rounded px-2 py-1 w-full" value={s.title} onChange={(e)=> {
                const arr=[...footer.sections]; arr[i]={...s, title:e.target.value}; updateFooter({ sections: arr });
              }}/>
              {s.links.map((l, j)=>(
                <div key={j} className="flex gap-2">
                  <input className="border rounded px-2 py-1 flex-1" value={l.label} onChange={(e)=> {
                    const arr=[...footer.sections]; const links=[...arr[i].links]; links[j]={...l, label:e.target.value}; arr[i]={...arr[i], links}; updateFooter({ sections: arr });
                  }}/>
                  <input className="border rounded px-2 py-1 flex-1" value={l.href} onChange={(e)=> {
                    const arr=[...footer.sections]; const links=[...arr[i].links]; links[j]={...l, href:e.target.value}; arr[i]={...arr[i], links}; updateFooter({ sections: arr });
                  }}/>
                </div>
              ))}
              <div className="flex gap-2">
                <button className="px-2 py-1 bg-slate-100 rounded" onClick={()=> {
                  const arr=[...footer.sections]; arr[i]={...s, links:[...s.links, {label:"رابط", href:"#"}]}; updateFooter({ sections: arr });
                }}>+ رابط</button>
                <button className="px-2 py-1 bg-red-100 text-red-700 rounded" onClick={()=> {
                  updateFooter({ sections: footer.sections.filter((_,x)=>x!==i) });
                }}>حذف القسم</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-2 border rounded p-3">
          <input className="border rounded px-2 py-1 w-full" placeholder="عنوان القسم" value={newSection.title} onChange={(e)=>setNewSection(s=>({...s, title:e.target.value}))}/>
          <div className="flex gap-2">
            <input className="border rounded px-2 py-1 flex-1" placeholder="عنوان الرابط" value={newSection.links[0].label} onChange={(e)=>setNewSection(s=>({ ...s, links: [{...s.links[0], label:e.target.value}] }))}/>
            <input className="border rounded px-2 py-1 flex-1" placeholder="/path" value={newSection.links[0].href} onChange={(e)=>setNewSection(s=>({ ...s, links: [{...s.links[0], href:e.target.value}] }))}/>
          </div>
          <button className="px-3 py-2 bg-teal-600 text-white rounded" onClick={()=>{
            if(!newSection.title) return;
            updateFooter({ sections: [...footer.sections, newSection]});
            setNewSection({ title:"", links:[{label:"", href:""}] });
          }}>+ قسم</button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">الشركاء</h3>
            {footer.partners.map((p,i)=>(
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="flex-1">{p.name}</span>
                <button className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm" onClick={()=> {
                  const arr=[...footer.partners]; arr.splice(i,1); updateFooter({ partners: arr });
                }}>حذف</button>
              </div>
            ))}
            <div className="space-y-2">
              <input className="border rounded px-2 py-1 w-full" placeholder="اسم الشريك" value={newPartner.name} onChange={(e)=>setNewPartner(s=>({...s, name:e.target.value}))}/>
              <input className="border rounded px-2 py-1 w-full" placeholder="رابط الشعار (اختياري)" value={newPartner.logo} onChange={(e)=>setNewPartner(s=>({...s, logo:e.target.value}))}/>
              <input className="border rounded px-2 py-1 w-full" placeholder="رابط الشريك" value={newPartner.url} onChange={(e)=>setNewPartner(s=>({...s, url:e.target.value}))}/>
              <button className="px-3 py-2 bg-teal-600 text-white rounded" onClick={()=>{
                if(!newPartner.name) return;
                updateFooter({ partners: [...footer.partners, newPartner]});
                setNewPartner({ name:"", logo:"", url:"" });
              }}>+ شريك</button>
            </div>
          </div>

          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">طرق الدفع</h3>
            {footer.paymentMethods.map((p,i)=>(
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="flex-1">{p.name}</span>
                <button className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm" onClick={()=> {
                  const arr=[...footer.paymentMethods]; arr.splice(i,1); updateFooter({ paymentMethods: arr });
                }}>حذف</button>
              </div>
            ))}
            <div className="space-y-2">
              <input className="border rounded px-2 py-1 w-full" placeholder="اسم الطريقة" value={newPay.name} onChange={(e)=>setNewPay(s=>({...s, name:e.target.value}))}/>
              <input className="border rounded px-2 py-1 w-full" placeholder="أيقونة (اختياري)" value={newPay.icon} onChange={(e)=>setNewPay(s=>({...s, icon:e.target.value}))}/>
              <button className="px-3 py-2 bg-teal-600 text-white rounded" onClick={()=>{
                if(!newPay.name) return;
                updateFooter({ paymentMethods: [...footer.paymentMethods, newPay]});
                setNewPay({ name:"", icon:"" });
              }}>+ طريقة دفع</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
