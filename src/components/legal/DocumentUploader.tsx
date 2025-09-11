import React from "react";

export default function DocumentUploader({ onSelect }: { onSelect: (file: File) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-2">
      <input ref={inputRef} type="file" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) onSelect(f); e.currentTarget.value=""; }} />
      <button className="px-4 py-2 rounded border" onClick={()=>inputRef.current?.click()}>إرفاق مستند</button>
    </div>
  );
}
