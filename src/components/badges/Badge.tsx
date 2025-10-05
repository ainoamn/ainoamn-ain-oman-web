// src/components/badges/Badge.tsx
export default function Badge({ name, icon }: { name:string; icon?:string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border bg-white">
      {icon ? <img src={icon} alt="" className="w-4 h-4" /> : null}
      <span>{name}</span>
    </span>
  );
}