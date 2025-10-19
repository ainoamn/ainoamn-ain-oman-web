/**
 * TaskFiltersBar — فلاتر متقدّمة + حفظ آخر اختيار في localStorage
 * الاستخدام:
 * <TaskFiltersBar initial={saved} onChange={(filters)=>loadTasks(filters)} />
 */
import { useEffect, useMemo, useState } from "react";

export type TaskFilters = {
  q?: string;
  status?: string[];       // ["open","in_progress","done"]
  priorities?: string[];   // ["low","medium","high","urgent"]
  assignees?: string[];    // user ids/emails
  categories?: string[];   // names/ids
  labels?: string[];       // tags
};

const LS_KEY = "ao_task_filters_v1";
const BTN = "rounded-lg px-2 py-1 text-xs ring-1 ring-gray-200 hover:bg-gray-50";

export default function TaskFiltersBar({
  initial,
  onChange,
  options,
}: {
  initial?: TaskFilters;
  onChange: (f: TaskFilters) => void;
  options?: {
    assignees?: { id: string; name: string }[];
    categories?: string[];
    labels?: string[];
  };
}) {
  const [f, setF] = useState<TaskFilters>(initial || { status: ["open","in_progress"], priorities: [] });
  useEffect(()=>{ // تحميل آخر اختيار إن لم تُمرره من الخارج
    if (initial) return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setF(JSON.parse(raw));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(()=>{
    onChange(f);
    try { localStorage.setItem(LS_KEY, JSON.stringify(f)); } catch {}
  }, [f, onChange]);

  const toggle = (key: keyof TaskFilters, value: string) => {
    setF((prev: TaskFilters) => {
      const arr = new Set([...(prev[key] as string[] || [])]);
      arr.has(value) ? arr.delete(value) : arr.add(value);
      return { ...prev, [key]: Array.from(arr) };
    });
  };

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-200 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          className="rounded-lg border border-gray-300 p-2"
          placeholder="بحث..."
          value={f.q || ""}
          onChange={(e)=>setF({ ...f, q: e.target.value })}
        />

        {/* الحالة */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">الحالة:</span>
          {["open","in_progress","done"].map(s => (
            <button key={s} className={`${BTN} ${f.status?.includes(s) ? "bg-gray-50" : ""}`} onClick={()=>toggle("status", s)}>
              {s==="open"?"مفتوحة":s==="in_progress"?"قيد العمل":"منجزة"}
            </button>
          ))}
        </div>

        {/* الأولوية */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">الأولوية:</span>
          {[
            ["low","منخفضة"],["medium","متوسطة"],["high","مرتفعة"],["urgent","عاجلة"],
          ].map(([v,l])=>(
            <button key={v} className={`${BTN} ${f.priorities?.includes(v) ? "bg-gray-50" : ""}`} onClick={()=>toggle("priorities", v)}>
              {l}
            </button>
          ))}
        </div>

        {/* المكلّفون */}
        <div className="md:col-span-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">المكلّفون:</span>
          {(options?.assignees || []).map(u => (
            <button key={u.id} className={`${BTN} ${f.assignees?.includes(u.id) ? "bg-gray-50" : ""}`} onClick={()=>toggle("assignees", u.id)}>
              {u.name}
            </button>
          ))}
        </div>

        {/* الفئات */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">الفئات:</span>
          {(options?.categories || []).map(c => (
            <button key={c} className={`${BTN} ${f.categories?.includes(c) ? "bg-gray-50" : ""}`} onClick={()=>toggle("categories", c)}>
              {c}
            </button>
          ))}
        </div>

        {/* التسميات */}
        <div className="md:col-span-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">التسميات:</span>
          {(options?.labels || []).map(t => (
            <button key={t} className={`${BTN} ${f.labels?.includes(t) ? "bg-gray-50" : ""}`} onClick={()=>toggle("labels", t)}>
              #{t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button className={BTN} onClick={()=>setF({})}>مسح</button>
        <button className={BTN} onClick={()=>onChange(f)}>تطبيق</button>
      </div>
    </div>
  );
}
