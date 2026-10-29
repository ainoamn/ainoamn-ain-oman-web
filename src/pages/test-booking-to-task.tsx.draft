// src/pages/test-booking-to-task.tsx - صفحة اختبار إحالة الحجز إلى مهمة
import React, { useState } from "react";
import Head from "next/head";

export default function TestBookingToTaskPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCreateTask = async () => {
    setLoading(true);
    setResult(null);

    try {
      const testTask = {
        title: "مهمة اختبار من حجز",
        status: "open",
        type: "booking_followup",
        propertyId: "P-20250911120430",
        bookingId: "TEST-BOOKING-123",
        assignee: "admin",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: "مهمة اختبار تم إنشاؤها من حجز تجريبي",
        priority: "medium"
      };

      console.log("Creating test task:", testTask);

      const response = await fetch("/api/tasks/simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(testTask),
      });

      if (response.ok) {
        const data = await response.json();
        setResult({ success: true, data });
        console.log("Test task created successfully:", data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setResult({ success: false, error: errorData.error || "فشل في إنشاء المهمة" });
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message });
      console.error("Test error:", error);
    } finally {
      setLoading(false);
    }
  };

  const testGetTasks = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/tasks/simple?propertyId=P-20250911120430", {
        cache: "no-store",
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setResult({ success: true, data });
        console.log("Tasks retrieved successfully:", data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setResult({ success: false, error: errorData.error || "فشل في جلب المهام" });
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message });
      console.error("Test error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Head>
        <title>اختبار إحالة الحجز إلى مهمة | Ain Oman</title>
      </Head>

      <div className="mx-auto max-w-4xl p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              اختبار إحالة الحجز إلى مهمة
            </h1>
            <p className="text-slate-600">
              اختبار النظام الموحد لإنشاء المهام من الحجوزات
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 justify-center">
              <button
                onClick={testCreateTask}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors"
              >
                {loading ? "جاري الاختبار..." : "إنشاء مهمة اختبار"}
              </button>

              <button
                onClick={testGetTasks}
                disabled={loading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-xl transition-colors"
              >
                {loading ? "جاري الاختبار..." : "جلب المهام"}
              </button>
            </div>

            {result && (
              <div className={`rounded-xl p-4 ${
                result.success 
                  ? "bg-green-50 border border-green-200" 
                  : "bg-red-50 border border-red-200"
              }`}>
                <div className="flex items-center mb-2">
                  {result.success ? (
                    <svg className="w-5 h-5 text-green-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className={`font-medium ${
                    result.success ? "text-green-800" : "text-red-800"
                  }`}>
                    {result.success ? "نجح الاختبار" : "فشل الاختبار"}
                  </span>
                </div>
                
                {result.success ? (
                  <div className="text-green-700">
                    <p className="mb-2">النتيجة:</p>
                    <pre className="bg-green-100 p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-red-700">
                    <p>الخطأ: {result.error}</p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">معلومات الاختبار</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• هذا الاختبار ينشئ مهمة تجريبية مرتبطة بحجز</li>
                <li>• المهمة تُحفظ في النظام الأساسي والمتقدم</li>
                <li>• يمكنك رؤية النتيجة في صفحات المهام المختلفة</li>
                <li>• المهمة مرتبطة بالعقار P-20250911120430</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
