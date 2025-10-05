// src/components/badges/BadgeList.tsx
import Badge from "./Badge";

export default function BadgeList({ items=[] }: { items:{name:string; icon?:string}[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((b,i)=>(<Badge key={i} name={b.name} icon={b.icon}/>))}
    </div>
  );
}