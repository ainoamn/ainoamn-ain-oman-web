import React, { useState } from "react";
import { useRouter } from "next/router";

export default function TasksIndexPage() {
  const r = useRouter();
  const [tid, setTid] = useState("");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">لوحة المهام</h1>
      <p className="text-gray-600 mb-6">افتح مهمة موجودة أو ابدأ مهمة جديدة عبر إدخال المعرّف.</p>

      <div className="flex gap-2 flex-wrap mb-6">
        <input
          className="border rounded-lg px-3 py-2 min-w-[260px]"
          placeholder="مثال: AO-T-000002"
          value={tid}
          onChange={(e)=>setTid(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 disabled:opacity-50"
          disabled={!tid.trim()}
          onClick={()=>r.push(`/admin/tasks/${encodeURIComponent(tid.trim())}`)}
        >
          فتح المهمة
        </button>
      </div>

      <div className="text-sm text-gray-500">
        تلميح: افتح <code className="bg-gray-100 px-1 rounded">/admin/tasks/AO-T-000002</code> مباشرةً للتجربة.
      </div>
    </div>
  );
}
الآن لن يظهر إلا هيدر/فوتر الموقع القادمان من _app.tsx.

2) معالجة “تعذّر الحفظ” + توسيع الحقول القابلة للتحرير
حسّنت نداء الحفظ ليعرض سبب الخطأ الحقيقي القادم من الـAPI بدل رسالة عامة.

أضفت حقولًا إضافية قابلة للتحرير: المُكلّفون (assignees) كسلسلة CSV، وربط المهمة بكيان (type/id).

أعدت ترتيب الأزرار: حفظ بجانب معاينة وطباعة وICS وإرفاق مستند.

استبدل الملف كاملًا: