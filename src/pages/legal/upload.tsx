// src/pages/legal/upload.tsx
import React from "react";
import DocumentUploader from "@/components/legal/DocumentUploader";

export default function UploadDocPage() {
  const [caseId, setCaseId] = React.useState("");
  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append("caseId", caseId);
    fd.append("file", file);
    fd.append("confidentiality", "INTERNAL");
    const r = await fetch("/api/legal/documents", {
      method: "POST",
      headers: { "x-tenant-id": "TENANT-1", "x-user-id": "U1", "x-roles": "LAWYER" },
      body: fd,
    });
    const j = await r.json();
    alert(r.ok ? `تم الرفع v${j.version}` : `خطأ: ${j.error}`);
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">رفع مستند</h1>
      <input className="w-full border p-2 rounded" placeholder="caseId" value={caseId} onChange={e=>setCaseId(e.target.value)} />
      <DocumentUploader onUpload={upload} />
    </main>
  );
}
