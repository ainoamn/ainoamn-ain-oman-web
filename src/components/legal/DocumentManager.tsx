import React from "react";
import DocumentUploader from "./DocumentUploader";

type Doc = { id: string; name: string; mime: string; size: number; url?: string; dataUrl?: string; version: number; createdAt: string; uploadedBy: string; voided?: boolean; voidReason?: string; };
function DocumentManager({ caseId, category }: { caseId: string; category?: string }) {
  const [docs, setDocs] = React.useState<Doc[]>([]);
  const [busy, setBusy] = React.useState(false);
  const hdrs = { "x-tenant-id": "TENANT-1", "x-user-id": "U1", "x-roles": "LAWYER" };

  const load = async () => {
    const r = await fetch(`/api/legal/documents?caseId=${encodeURIComponent(caseId)}`, { headers: hdrs });
    const j = await r.json(); if (r.ok) setDocs(j);
  };
  React.useEffect(() => { if (caseId) load(); }, [caseId]);

  const toBase64 = (file: File) => new Promise<string>((resolve,reject)=>{ const fr = new FileReader(); fr.onload = ()=> resolve(String(fr.result)); fr.onerror = reject; fr.readAsDataURL(file); });

  const onUpload = async (file: File) => {
    setBusy(true);
    try {
      const dataUrl = await toBase64(file);
      const r = await fetch("/api/legal/documents", { method: "POST", headers: { "Content-Type": "application/json", ...hdrs }, body: JSON.stringify({ action: "createBase64", caseId, name: file.name, mime: file.type, size: file.size, dataUrl, confidentiality: "INTERNAL", category: category || "default" }) });
      if (!r.ok) { const e = await r.json().catch(() => ({})); alert(`فشل الرفع: ${e.error || r.status}`); } else { await load(); }
    } finally { setBusy(false); }
  };

  const onVoid = async (id: string) => {
    const reason = prompt("سبب الشطب (إجباري):")?.trim();
    if (!reason) return;
    const r = await fetch("/api/legal/documents", { method: "POST", headers: { "Content-Type": "application/json", ...hdrs }, body: JSON.stringify({ action: "void", id, reason }) });
    if (!r.ok) alert("تعذر الشطب"); else load();
  };

  return (
    <section className="p-4 border rounded">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">إدارة المستندات</h2>
        <span className="text-sm opacity-70">{docs.length} ملف</span>
      </div>
      <div className="mb-4 flex items-center gap-3">
        <DocumentUploader onSelect={onUpload} />
        {busy && <div className="text-sm">يرفع الملف…</div>}
        <div className="text-xs opacity-70">لا حذف. مسموح الشطب مع سبب.</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th className="py-2">الاسم</th><th>الإصدار</th><th>الحجم</th><th>نوع</th><th>تاريخ</th><th>الحالة</th><th></th></tr></thead>
          <tbody>
            {docs.sort((a,b)=> b.version-a.version).map(d => (
              <tr key={d.id} className={`border-b last:border-b-0 ${d.voided?"opacity-60":""}`}>
                <td className="py-2">{d.name}</td>
                <td>v{d.version}</td>
                <td>{(d.size/1024).toFixed(1)} KB</td>
                <td>{d.mime}</td>
                <td>{new Date(d.createdAt).toLocaleString()}</td>
                <td>{d.voided ? `مشطوب: ${d.voidReason||""}` : "فعال"}</td>
                <td>{!d.voided && <button className="px-3 py-1 rounded border" onClick={()=>onVoid(d.id)}>شطب</button>}</td>
              </tr>
            ))}
            {docs.length === 0 && (<tr><td className="py-3 text-center opacity-70" colSpan={7}>لا توجد مستندات.</td></tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
