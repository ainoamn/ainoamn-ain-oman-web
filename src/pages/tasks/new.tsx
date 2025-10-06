// src/pages/tasks/new.tsx
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";

export default function NewTaskPage() {
  const router = useRouter();
  const { propertyId } = router.query;

  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const [title, setTitle] = useState("مهمة متابعة");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("open");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    setReady(true);
  }, [router.isReady]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      // جلب بيانات المستخدم لإسناد منشئ المهمة
      let createdById: string | undefined = undefined;
      let createdByName: string | undefined = undefined;
      try {
        const me = await fetch("/api/auth/me", { cache: "no-store" });
        if (me.ok) {
          const j = await me.json();
          createdById = j?.user?.id || j?.id;
          createdByName = j?.user?.name || j?.name || j?.email;
        }
      } catch {}

      const body = {
        title: title || "مهمة جديدة",
        description: description || undefined,
        status,
        priority,
        assignee: assignee || undefined,
        dueDate: dueDate || undefined,
        type: "followup",
        propertyId: typeof propertyId === "string" ? propertyId : undefined,
        link: propertyId ? { type: "property", id: propertyId } : undefined,
        createdById,
        createdByName,
      };

      const res = await fetch("/api/tasks/simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();

      // نجاح: توجيه المستخدم
      const pid = typeof propertyId === "string" ? propertyId : "";
      const adminUrl = pid ? `/admin/tasks?propertyId=${encodeURIComponent(pid)}` : "/admin/tasks";
      router.replace(adminUrl);
    } catch (e: any) {
      setError(e?.message || "فشل في إنشاء المهمة");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <Head>
        <title>مهمة جديدة | Ain Oman</title>
      </Head>
      <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">إنشاء مهمة جديدة</h1>
          <p className="text-slate-600 mb-6">هذه المهمة ستكون مرتبطة {propertyId ? `بالعقار ${propertyId}` : "بدون عقار محدد"}.</p>

          {error && <div className="mb-4 text-sm text-red-600">خطأ: {error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-700 mb-1">عنوان المهمة</label>
              <input className="w-full border rounded-xl px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1">وصف</label>
              <textarea className="w-full border rounded-xl px-3 py-2 min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-1">الحالة</label>
                <select className="w-full border rounded-xl px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="open">مفتوحة</option>
                  <option value="in_progress">قيد التنفيذ</option>
                  <option value="done">منجزة</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">الأولوية</label>
                <select className="w-full border rounded-xl px-3 py-2" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">مرتفعة</option>
                  <option value="urgent">عاجلة</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">تاريخ الاستحقاق</label>
                <input type="date" className="w-full border rounded-xl px-3 py-2" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 mb-1">المحال إليه</label>
                <input className="w-full border rounded-xl px-3 py-2" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="البريد أو معرف المستخدم" />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">رقم العقار (اختياري)</label>
                <input className="w-full border rounded-xl px-3 py-2 bg-gray-50" value={typeof propertyId === "string" ? propertyId : ""} readOnly />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60">
                {saving ? "جارٍ الحفظ…" : "حفظ وإنشاء"}
              </button>
              <button type="button" onClick={() => router.back()} className="px-5 py-2 rounded-xl border">رجوع</button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}


