// src/components/badges/Badge.tsx
import InstantImage from '@/components/InstantImage';

export default function Badge({ name, icon }: { name:string; icon?:string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border bg-white">
      {icon ? <InstantImage src={icon} alt="" className="w-4 h-4"  loading="lazy" width={400} height={300}/> : null}
      <span>{name}</span>
    </span>
  );
}

