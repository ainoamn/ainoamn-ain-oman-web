import React from "react";
export default function PrintExport({ caseId }: { caseId: string }) {
  const hdrs = { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" };
  const [busy, setBusy] = React.useState(false);

  const buildAndOpen = async () => {
    setBusy(true);
    try {
      const [casesRes, docsRes, procRes, msgsRes, expRes] = await Promise.all([
        fetch("/api/legal/cases", { headers: hdrs }),
        fetch(`/api/legal/documents?caseId=${caseId}`, { headers: hdrs }),
        fetch(`/api/legal/proceedings?caseId=${caseId}`, { headers: hdrs }),
        fetch(`/api/legal/messages?caseId=${caseId}`, { headers: hdrs }),
        fetch(`/api/legal/expenses?caseId=${caseId}`, { headers: hdrs }),
      ]);
      const cases = await casesRes.json();
      const theCase = (cases||[]).find((c:any)=>c.id===caseId) || {};
      const docs = await docsRes.json();
      const stages = (await procRes.json()).stages||[];
      const messages = await msgsRes.json();
      const expenses = await expRes.json();

      const head = `<style>body{font-family:Arial,sans-serif;direction:rtl}h1,h2{margin:0 0 8px}.sec{margin:12px 0; padding:8px; border:1px solid #ddd}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #eee;padding:6px;text-align:right}.muted{color:#777;font-size:12px}</style>`;
      let html = `<html><head>${head}</head><body>`;
      html += `<div style="display:flex;justify-content:space-between;align-items:center"><h1>${theCase.title||"قضية"}</h1><div class="muted">طُبع بواسطة نظام المحاماة</div></div>`;
      html += `<div class="sec"><h2>تفاصيل الواقعة</h2><div>${(theCase.summary||"—").replace(/\n/g,"<br/>")}</div></div>`;
      html += `<div class="sec"><h2>الجدول الزمني</h2><table><thead><tr><th>التاريخ</th><th>من→إلى</th><th>ملاحظة</th></tr></thead><tbody>`;
      for (const s of stages) if (!s.voided) html += `<tr><td>${new Date(s.at).toLocaleString()}</td><td>${s.from||"—"} → ${s.to}</td><td>${s.note||""}</td></tr>`;
      html += `</tbody></table></div>`;
      html += `<div class="sec"><h2>المحادثة</h2><table><thead><tr><th>الوقت</th><th>النص</th></tr></thead><tbody>`;
      for (const m of messages||[]) if (!m.voided) html += `<tr><td>${new Date(m.at).toLocaleString()}</td><td>${(m.text||"").replace(/\n/g,"<br/>")}</td></tr>`;
      html += `</tbody></table></div>`;
      html += `<div class="sec"><h2>المصاريف</h2><table><thead><tr><th>الوقت</th><th>الوصف</th><th>المبلغ</th></tr></thead><tbody>`;
      for (const e of expenses||[]) if (!e.voided) html += `<tr><td>${new Date(e.at).toLocaleString()}</td><td>${e.label}</td><td>${Number(e.amount).toFixed(2)}</td></tr>`;
      html += `</tbody></table></div>`;
      html += `<div class="sec"><h2>المرفقات</h2>`;
      for (const d of docs||[]) {
        if (d.voided) continue;
        html += `<div class="muted">${d.name}</div>`;
        if (d.dataUrl?.startsWith("data:image")) html += `<img src="${d.dataUrl}" style="max-width:100%; margin:6px 0"/>`;
        if (d.dataUrl?.startsWith("data:application/pdf")) html += `<div class="muted">[PDF]</div>`;
      }
      html += `</div></body></html>`;

      const w = window.open("", "_blank"); if (!w) { alert("اسمح بالنوافذ المنبثقة"); return; }
      w.document.open(); w.document.write(html); w.document.close(); w.focus(); w.print();
    } finally { setBusy(false); }
  };

  const exportDoc = async () => {
    const blob = new Blob([`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><p>استخدم الطباعة للحصول على PDF شامل.</p></body></html>`], { type: "application/msword" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `case-${caseId}.doc`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <button className="px-3 py-2 rounded border" disabled={busy} onClick={buildAndOpen}>طباعة / حفظ PDF</button>
      <button className="px-3 py-2 rounded border" onClick={exportDoc}>تصدير Word</button>
    </div>
  );
}
