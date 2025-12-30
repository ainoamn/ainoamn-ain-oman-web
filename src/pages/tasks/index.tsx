import Head from "next/head";
// Header and Footer are now handled by MainLayout in _app.tsx
import React from "react";

// ---- i18n fallback ----
let useI18n: any;
try { 
  // محاولة استخدام النظام المحسّن أولاً
  const modEnhanced = require("@/lib/i18n-enhanced");
  if (modEnhanced.useI18n) {
    useI18n = modEnhanced.useI18n;
  } else {
    useI18n = require("@/lib/i18n").useI18n;
  }
} catch {
  // Fallback للنظام القديم
  try {
    useI18n = require("@/lib/i18n").useI18n;
  } catch {
    useI18n = () => ({
      t: (k: string) => k,
      lang: "ar",
      dir: "rtl",
      setLang: () => {},
      supported: ["ar", "en"]
    });
  }
}

// Safe wrapper لـ useI18n
function safeUseI18n() {
  try {
    return useI18n();
  } catch (error) {
    // إذا كان useI18n يحتاج I18nProvider ولم يكن موجوداً
    return {
      t: (k: string) => k,
      lang: "ar",
      dir: "rtl" as const,
      setLang: () => {},
      supported: ["ar", "en"]
    };
  }
}
import { useMemo, useState, useEffect } from "react";
import PropertyBadge from "@/components/tasks/PropertyBadge";
import TaskStatusPill from "@/components/tasks/TaskStatusPill";
import InstantLink from "@/components/InstantLink";

type Task = { 
  id: string; 
  title: string; 
  status: "open" | "in_progress" | "done" | "cancelled" | "archived"; 
  assignee?: string; 
  due?: string; 
  dueDate?: string;
  propertyId?: string;
  priority?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function Content() {
  const [filter, setFilter] = useState("all");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // قائمة العقود
  const [contracts, setContracts] = useState<any[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching tasks from unified API...");
      
      // استخدام API المبسط
      const response = await fetch("/api/tasks/simple", {
        cache: "no-store",
        credentials: "include"
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Received tasks:", data.tasks?.length || 0);
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
      } else {
        console.error("Failed to fetch tasks:", response.status);
        setError("فشل في جلب البيانات");
      }
    } catch (e) {
      console.error("Error fetching tasks:", e);
      setError("خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const fetchContracts = async () => {
    setContractsLoading(true);
    try {
      const response = await fetch('/api/rentals');
      if (response.ok) {
        const data = await response.json();
        const allContracts = data.items || [];
        // فلترة العقود التي تحتاج للتوقيع (غير مفعّلة)
        const pendingContracts = allContracts.filter((c: any) => 
          c.signatureWorkflow && c.signatureWorkflow !== 'active'
        );
        setContracts(pendingContracts);
        console.log(`📝 ${pendingContracts.length} عقد يحتاج للتوقيع`);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setContractsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchContracts();

    // الاستماع لتحديثات المهام
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("ao_tasks");
      bc.onmessage = (ev) => {
        if (ev?.data?.type === "updated") {
          console.log("Received task update broadcast:", ev.data);
          // إعادة تحميل البيانات مع تأخير صغير
          setTimeout(() => {
            console.log("Reloading tasks after broadcast");
            fetchTasks();
          }, 100);
        }
      };
    } catch (error) {
      console.error("BroadcastChannel error:", error);
    }

    function onStorage(ev: StorageEvent) {
      if (ev.key === "ao_tasks_bump") {
        console.log("Storage event triggered reload");
        fetchTasks();
      }
    }
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      try { bc?.close(); } catch {}
    };
  }, []);

  const list = useMemo(()=>tasks.filter(t=> filter==="all"?true:t.status===filter),[filter, tasks]);
  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* قسم العقود التي تحتاج للتوقيع */}
        {!contractsLoading && contracts.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📝</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">عقود تحتاج للتوقيع</h2>
                  <p className="text-sm text-gray-600">
                    {contracts.length} {contracts.length === 1 ? 'عقد' : 'عقود'} في انتظار التوقيع
                  </p>
                </div>
              </div>
              <InstantLink
                href="/contracts/sign"
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                عرض الكل
              </InstantLink>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {contracts.slice(0, 3).map((contract) => {
                const signatures = contract.signatures || [];
                const hasTenantSign = signatures.some((s: any) => s.type === 'tenant');
                const hasOwnerSign = signatures.some((s: any) => s.type === 'owner');
                const hasAdminSign = signatures.some((s: any) => s.type === 'admin');
                
                return (
                  <InstantLink
                    key={contract.id}
                    href={`/contracts/sign?contractId=${contract.id}`}
                    className="block bg-white border border-yellow-200 hover:border-yellow-400 rounded-xl p-4 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm mb-1">
                          العقد #{contract.id.slice(-8)}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {contract.tenantName || 'مستأجر غير محدد'}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {contract.monthlyRent || 0} {contract.currency || 'OMR'}
                      </span>
                    </div>
                    
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center ${hasTenantSign ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {hasTenantSign ? '✓' : '○'}
                        </span>
                        <span className={hasTenantSign ? 'text-green-700 font-medium' : 'text-gray-500'}>
                          المستأجر
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center ${hasOwnerSign ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {hasOwnerSign ? '✓' : '○'}
                        </span>
                        <span className={hasOwnerSign ? 'text-green-700 font-medium' : 'text-gray-500'}>
                          المالك
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center ${hasAdminSign ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {hasAdminSign ? '✓' : '○'}
                        </span>
                        <span className={hasAdminSign ? 'text-green-700 font-medium' : 'text-gray-500'}>
                          الإدارة
                        </span>
                      </div>
                    </div>
                  </InstantLink>
                );
              })}
            </div>
            {contracts.length > 3 && (
              <div className="mt-3 text-center">
                <InstantLink
                  href="/contracts/sign"
                  className="text-sm text-yellow-700 hover:text-yellow-800 font-medium"
                >
                  + {contracts.length - 3} عقود أخرى
                </InstantLink>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">المهام</h1>
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
            <option value="all">الكل</option><option value="open">مفتوحة</option><option value="in_progress">قيد التنفيذ</option><option value="done">منجزة</option>
          </select>
        </div>
        {loading ? (
          <div className="text-center py-8">جارٍ التحميل...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : (
          <div className="grid gap-4">
            {list.map(t=> (
              <div key={t.id} className="rounded-2xl border bg-white p-4 hover:shadow-sm transition">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">{t.title}</h3>
                  <TaskStatusPill status={t.status} priority={t.priority || "medium"} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    المسؤول: {t.assignee||"غير محدد"} — الاستحقاق: {t.dueDate || t.due || "—"}
                  </p>
                  <PropertyBadge propertyId={t.propertyId} taskId={t.id} />
                </div>
              </div>
            ))}
            {list.length === 0 && (
              <div className="text-center py-8 text-slate-500">لا توجد مهام</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

    export default function Page() {
      const { dir } = safeUseI18n();
      return (
        <main dir={dir} className="min-h-screen bg-slate-50 flex flex-col">
          <Head><title>المهام | Ain Oman</title></Head>
          <div className="flex-1">
            <Content />
          </div>
        </main>
      );
    }
