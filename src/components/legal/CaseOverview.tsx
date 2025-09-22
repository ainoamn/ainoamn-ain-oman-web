import React from "react";
import DocumentManager from "./DocumentManager";
function CaseOverview({ caseId }: { caseId: string }) {
  const [summary, setSummary] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<string>("");
  const apiHdrs = { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" };

  const ensureCase = async () => {
    const r = await fetch("/api/legal/cases", { headers: apiHdrs });
    const list = await r.json();
    const ex = (Array.isArray(list) ? list : []).find((x:any)=>x.id===caseId);
    if (!ex) {
      await fetch("/api/legal/cases", { method: "POST", headers: { "Content-Type":"application/json", ...apiHdrs }, body: JSON.stringify({ id: caseId, title: `قضية ${caseId.slice(0,6)}` }) });
    } else {
      setSummary(ex.summary || "");
    }
  };
  React.useEffect(()=>{ if (caseId) ensureCase(); }, [caseId]);

  const save = async () => {
    setBusy(true);
    const r = await fetch("/api/legal/cases", { method: "PUT", headers: { "Content-Type": "application/json", ...apiHdrs }, body: JSON.stringify({ id: caseId, summary }) });
    setBusy(false);
    if (!r.ok) { alert("تعذّر الحفظ"); return; }
    setSavedAt(new Date().toLocaleString());
  };

  return (
    <section className="space-y-4">
      <div className="p-4 border rounded bg-white">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">تفاصيل الواقعة</h2>
          {savedAt ? <div className="text-xs opacity-70">آخر حفظ: {savedAt}</div> : null}
        </div>
        <textarea className="w-full min-h-[180px] border rounded p-2 mt-3" value={summary} onChange={e=>setSummary(e.target.value)} placeholder="اكتب تفاصيل الواقعة كاملة..." />
        <div className="text-right mt-2">
          <button onClick={save} disabled={busy} className="px-4 py-2 rounded bg-black text-white disabled:opacity-60">{busy ? "يحفظ..." : "حفظ"}</button>
        </div>
      </div>

      <div className="p-4 border rounded bg-white">
        <h3 className="font-semibold mb-3">مرفقات الواقعة</h3>
        <DocumentManager caseId={caseId} category="overview" />
        <div className="text-xs opacity-70 mt-2">المشطوب لا يظهر في الطباعة.</div>
      </div>
    </section>
  );
}
