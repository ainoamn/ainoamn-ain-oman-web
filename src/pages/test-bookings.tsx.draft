// src/pages/test-bookings.tsx - صفحة اختبار الحجوزات
import React, { useState } from "react";
import Head from "next/head";

export default function TestBookingsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const createTestBooking = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/bookings/test-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setResult({ success: true, data });
        console.log("Test booking created successfully:", data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setResult({ success: false, error: errorData.error || "فشل في إنشاء الحجز التجريبي" });
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message });
      console.error("Test error:", error);
    } finally {
      setLoading(false);
    }
  };

  const testGetBookings = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/bookings", {
        cache: "no-store",
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setResult({ success: true, data });
        console.log("Bookings retrieved successfully:", data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setResult({ success: false, error: errorData.error || "فشل في جلب الحجوزات" });
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message });
      console.error("Test error:", error);
    } finally {
      setLoading(false);
    }
  };

  const testGetBookingDetail = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/bookings/B-20250922200226", {
        cache: "no-store",
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setResult({ success: true, data });
        console.log("Booking detail retrieved successfully:", data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setResult({ success: false, error: errorData.error || "فشل في جلب تفاصيل الحجز" });
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
        <title>اختبار الحجوزات | Ain Oman</title>
      </Head>

      <div className="mx-auto max-w-4xl p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              اختبار نظام الحجوزات
            </h1>
            <p className="text-slate-600">
              اختبار APIs الحجوزات وإصلاح مشكلة عدم جلب البيانات
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={createTestBooking}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors"
              >
                {loading ? "جاري الاختبار..." : "إنشاء حجز تجريبي"}
              </button>

              <button
                onClick={testGetBookings}
                disabled={loading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-xl transition-colors"
              >
                {loading ? "جاري الاختبار..." : "جلب الحجوزات"}
              </button>

              <button
                onClick={testGetBookingDetail}
                disabled={loading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-xl transition-colors"
              >
                {loading ? "جاري الاختبار..." : "جلب تفاصيل الحجز"}
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
                    <pre className="bg-green-100 p-3 rounded text-sm overflow-auto max-h-96">
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
                <li>• هذا الاختبار ينشئ حجز تجريبي مع بيانات كاملة</li>
                <li>• يختبر جلب قائمة الحجوزات</li>
                <li>• يختبر جلب تفاصيل حجز معين</li>
                <li>• يمكنك رؤية النتيجة في صفحة إدارة الحجوزات</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">روابط مفيدة</h3>
              <div className="text-yellow-800 text-sm space-y-1">
                <p>• <a href="/admin/bookings" className="underline">صفحة إدارة الحجوزات</a></p>
                <p>• <a href="/admin/bookings/B-20250922200226" className="underline">تفاصيل الحجز المحدد (محاسبي)</a></p>
                <p>• <a href="/admin/bookings/B-20250922184327" className="underline">تفاصيل الحجز الآخر</a></p>
                <p>• <a href="/admin/bookings/TEST-BOOKING-001" className="underline">تفاصيل الحجز التجريبي</a></p>
                <p>• <a href="/bookings" className="underline">صفحة الحجوزات العامة</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
