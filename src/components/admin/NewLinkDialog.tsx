// src/components/admin/NewLinkDialog.tsx
// يضيف "المجموعة (اختياري)" كقائمة منسدلة مع إمكانية إنشاء مجموعة جديدة
// ويجعل onCreated اختيارية لمنع الخطأ.
import React, { useEffect, useMemo, useState } from "react";
import { ADMIN_MODULES } from "@/lib/admin/registry";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void; // اختياري الآن
};

export default function NewLinkDialog({ open, onClose, onCreated }: Props) {
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [useCentral, setUseCentral] = useState(true);
  const [href, setHref] = useState("");
  const [groups, setGroups] = useState<string[]>([]);
  const [groupMode, setGroupMode] = useState<"pick" | "new">("pick");
  const [groupPick, setGroupPick] = useState<string>("");
  const [groupNew, setGroupNew] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    // اجلب المجموعات الحالية من السجل + الإضافات اليدوية
    (async () => {
      const builtins = Array.from(new Set(ADMIN_MODULES.map((m: any) => m.group).filter(Boolean)));
      let extras: string[] = [];
      try {
        const r = await fetch("/api/admin/dev/sections");
        const j = await r.json();
        extras = Array.from(new Set((j?.sections || []).map((s: any) => s.group).filter(Boolean)));
      } catch {}
      const all = Array.from(new Set([...builtins, ...extras, "custom"]));
      setGroups(all);
    })();
  }, [open]);

  // المجموعة النهائية المختارة/المضافة
  const group = useMemo(
    () => (groupMode === "new" ? groupNew.trim() : groupPick.trim()) || "",
    [groupMode, groupPick, groupNew]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: any = {
      id: id.trim() || slugify(title),
      title: title.trim(),
      group: group || "custom",
      useCentral,
    };
    if (!useCentral) payload.href = href.trim() || `/admin/${payload.id}`;

    const res = await fetch("/api/admin/dev/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (res && res.ok) {
      // تفريغ الحقول
      setId("");
      setTitle("");
      setUseCentral(true);
      setHref("");
      setGroupMode("pick");
      setGroupPick("");
      setGroupNew("");
      // نادِ فقط إذا مُمرّرة
      onCreated?.();
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30">
      <div className="mx-auto mt-24 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="mb-4 text-base font-semibold text-slate-900">رابط سريع جديد</h3>

        <form onSubmit={submit} className="grid grid-cols-1 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">العنوان</span>
            <input className="rounded-xl border p-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-600">المعرّف (اختياري)</span>
              <input className="rounded-xl border p-2" value={id} onChange={(e) => setId(e.target.value)} placeholder="auto-slug" />
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={useCentral} onChange={(e) => setUseCentral(e.target.checked)} />
              <span className="text-sm text-slate-700">ربط باللوحة المركزية ‎/admin/dashboard?section=id‎</span>
            </label>
          </div>

          {!useCentral && (
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-600">المسار (href)</span>
              <input
                className="rounded-xl border p-2"
                value={href}
                onChange={(e) => setHref(e.target.value)}
                placeholder="/admin/your-page"
              />
            </label>
          )}

          {/* المجموعات */}
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="mb-2 text-sm font-medium text-slate-900">المجموعة (اختياري)</div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="group-mode"
                  checked={groupMode === "pick"}
                  onChange={() => setGroupMode("pick")}
                />
                <span className="text-sm">اختيار من القائمة</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="group-mode"
                  checked={groupMode === "new"}
                  onChange={() => setGroupMode("new")}
                />
                <span className="text-sm">إضافة مجموعة جديدة</span>
              </label>
            </div>

            {groupMode === "pick" ? (
              <select
                className="mt-3 w-full rounded-xl border p-2 text-sm"
                value={groupPick}
                onChange={(e) => setGroupPick(e.target.value)}
              >
                <option value="">— بدون مجموعة —</option>
                {groups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="mt-3 w-full rounded-xl border p-2 text-sm"
                value={groupNew}
                onChange={(e) => setGroupNew(e.target.value)}
                placeholder="اكتب اسم المجموعة الجديدة"
              />
            )}
          </div>

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\- ]+/g, "")
    .replace(/\s+/g, "-");
}
