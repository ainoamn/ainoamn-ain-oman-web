// src/pages/admin/tasks/sync.tsx - صفحة مزامنة المهام
import React, { useState } from "react";
import Head from "next/head";
import Layout from "@/components/layout/Layout";

export default function TasksSyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tasks/unified?action=sync", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        console.log("Sync completed:", data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل في المزامنة");
      }
    } catch (err: any) {
      setError(err.message || "خطأ في المزامنة");
      console.error("Sync error:", err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>مزامنة المهام | Ain Oman</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              مزامنة المهام
            </h1>
            <p className="text-slate-600">
              مزامنة المهام بين النظام الأساسي والنظام المتقدم
            </p>
          </div>

          <div className="space-y-6">
            {/* زر المزامنة */}
            <div className="text-center">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors"
              >
                {syncing ? "جاري المزامنة..." : "بدء المزامنة"}
              </button>
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-800 font-medium">خطأ في المزامنة</span>
                </div>
                <p className="text-red-700 mt-2">{error}</p>
              </div>
            )}

            {/* نتيجة المزامنة */}
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-800 font-medium">تمت المزامنة بنجاح</span>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-green-700">
                    <strong>المهام الأساسية:</strong> {result.result?.basicTasks?.length || 0}
                  </p>
                  <p className="text-green-700">
                    <strong>المهام المتقدمة:</strong> {result.result?.advancedTasks?.length || 0}
                  </p>
                  <p className="text-green-700 text-sm">
                    {result.message}
                  </p>
                </div>
              </div>
            )}

            {/* معلومات إضافية */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">معلومات المزامنة</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• المزامنة تجمع المهام من النظام الأساسي والنظام المتقدم</li>
                <li>• يتم إزالة التكرارات بناءً على معرف المهمة</li>
                <li>• المهام المحدثة تحل محل المهام القديمة</li>
                <li>• المزامنة تحدث تلقائياً عند تحديث المهام</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

