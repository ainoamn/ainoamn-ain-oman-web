import React from "react";

type Person = { id: string; name: string; subscriptionNo: string };
type AssignmentItem = { toLawyerId: string; role: "RESPONSIBLE" | "SUPERVISOR" | "VIEWER"; subNo?: string };

export default function ActionButtons({ caseId, onChanged }: { caseId: string; onChanged: () => void }) {
  const [toStage, setToStage] = React.useState("HEARING");
  const [lawyers, setLawyers] = React.useState<Person[]>([]);
  const [items, setItems] = React.useState<AssignmentItem[]>([{ toLawyerId: "", role: "RESPONSIBLE" }]);
  const [busy, setBusy] = React.useState(false);

  const hdrs = { "Content-Type": "application/json", "x-tenant-id": "TENANT-1", "x-user-id": "U1", "x-roles": "LAWYER" };

  const loadLawyers = async () => { const r = await fetch("/api/legal/directory?kind=LAWYER", { headers: hdrs }); const j = await r.json(); if (r.ok) setLawyers(j); };
  React.useEffect(()=>{ loadLawyers(); }, []);

  const changeStage = async () => {
    setBusy(true);
    const r = await fetch("/api/legal/proceedings", { method: "POST", headers: hdrs, body: JSON.stringify({ kind: "stage", caseId, to: toStage, note: "manual change" }) });
    setBusy(false);
    if (!r.ok) { const e = await r.json().catch(()=>({})); alert(`فشل تحديث المرحلة: ${e.error||r.status}`); } else onChanged();
  };

  const assignMany = async () => {
    const mapped = items
      .map(it => {
        if (it.toLawyerId) return it;
        if (it.subNo) {
          const p = lawyers.find(l => l.subscriptionNo === it.subNo);
          if (p) return { ...it, toLawyerId: p.id };
        }
        return null;
      })
      .filter(Boolean) as AssignmentItem[];
    if (mapped.length === 0) { alert("اختر أشخاصاً"); return; }
    setBusy(true);
    const r = await fetch("/api/legal/proceedings", { method: "POST", headers: hdrs, body: JSON.stringify({ kind: "assignMany", caseId, items: mapped }) });
    setBusy(false);
    if (!r.ok) alert("تعذر الإحالة"); else onChanged();
  };

  const setItem = (idx:number, patch: Partial<AssignmentItem>) => setItems(v=> v.map((it,i)=> i===idx ? { ...it, ...patch } : it));

  return (
    <section className="p-3 border rounded bg-white">
      <h3 className="font-semibold mb-3">إجراءات سريعة</h3>
      <div className="grid md:grid-cols-3 gap-2">
        <div className="p-2 border rounded">
          <div className="text-sm font-medium mb-1">تغيير المرحلة</div>
          <select className="border rounded p-2 w-full" value={toStage} onChange={e=>setToStage(e.target.value)}>
            <option value="FILING">قيد القيد</option>
            <option value="HEARING">جلسات</option>
            <option value="APPEAL">استئناف</option>
            <option value="JUDGMENT">حكم</option>
            <option value="EXECUTION">تنفيذ</option>
            <option value="ARCHIVED">أرشفة</option>
          </select>
          <button className="px-3 py-2 rounded bg-black text-white mt-2 w-full disabled:opacity-60" disabled={busy} onClick={changeStage}>تنفيذ</button>
        </div>

        <div className="p-2 border rounded md:col-span-2">
          <div className="text-sm font-medium mb-1">إحالة لمتعدّد الأدوار</div>
          <div className="space-y-2">
            {items.map((it,idx)=>(
              <div key={idx} className="grid grid-cols-3 gap-2">
                <select className="border rounded p-2" value={it.toLawyerId} onChange={e=>setItem(idx,{ toLawyerId: e.target.value })}>
                  <option value="">اختر من القائمة</option>
                  {lawyers.map(p=><option key={p.id} value={p.id}>{p.subscriptionNo} — {p.name}</option>)}
                </select>
                <input className="border rounded p-2" placeholder="أو اكتب رقم الاشتراك" value={it.subNo||""} onChange={e=>setItem(idx,{ subNo: e.target.value })} />
                <select className="border rounded p-2" value={it.role} onChange={e=>setItem(idx,{ role: e.target.value as any })}>
                  <option value="RESPONSIBLE">مسؤول</option>
                  <option value="SUPERVISOR">مشرف</option>
                  <option value="VIEWER">مطلع</option>
                </select>
              </div>
            ))}
            <button className="text-sm underline" onClick={()=>setItems(v=>[...v,{ toLawyerId:"", role:"VIEWER" }])}>إضافة شخص</button>
          </div>
          <button className="px-3 py-2 rounded bg-black text-white mt-2 w-full disabled:opacity-60" disabled={busy} onClick={assignMany}>إحالة</button>
        </div>
      </div>
    </section>
  );
}
