// src/pages/admin/sequencing.tsx
import React, { useState, useEffect } from "react";

import Head from "next/head";

export default function SequencingPage() {
  const [currentNumber, setCurrentNumber] = useState(0);
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCurrentNumber();
  }, []);

  const loadCurrentNumber = async () => {
    try {
      const r = await fetch(`/api/serial/current?key=AO-T`);
      const j = await r.json();
      setCurrentNumber(Number(j?.value ?? 0));
    } catch (error) {

    }
  };

  const handleResetCounter = async () => {
    if (!newValue || isNaN(Number(newValue))) {
      setMessage("يرجى إدخال قيمة رقمية صحيحة");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/serial/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: "AO-T", value: Number(newValue) }),
      });
      if (!r.ok) throw new Error("reset failed");
      setMessage("تم إعادة تعيين العداد بنجاح");
      setNewValue("");
      await loadCurrentNumber();
    } catch (error) {

      setMessage("فشل في إعادة تعيين العداد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>إدارة الترقيم المتسلسل | Ain Oman</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">إدارة الترقيم المتسلسل للمهام</h1>

        <div className="bg-white rounded-2xl shadow-sm p-6 max-w-md">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">الرقم الحالي</h2>
            <p className="text-2xl font-mono text-blue-600">
              AO-T-{currentNumber.toString().padStart(6, "0")}
            </p>
            <p className="text-sm text-slate-500 mt-1">الرقم التالي الذي سيتم تعيينه للمهمة الجديدة</p>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">إعادة تعيين العداد</h2>
            <div className="flex gap-2">
              <input
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="أدخل الرقم الجديد"
                className="flex-1 border border-slate-300 rounded-xl px-3 py-2"
              />
              <button
                onClick={handleResetCounter}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "جاري..." : "إعادة تعيين"}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              تحذير: إعادة تعيين العداد قد يتسبب في تكرار الأرقام إذا لم يتم بشكل صحيح
            </p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl ${
                message.includes("نجاح") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <h3 className="font-semibold mb-2">نظام الترقيم</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• البادئة: AO-T (عين عمان - مهمة)</li>
              <li>• التنسيق: AO-T-000001</li>
              <li>• الأرقام تزداد تلقائياً مع كل مهمة جديدة</li>
              <li>• يمكن إعادة التعيين للصفر أو أي قيمة أخرى عند الحاجة</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
