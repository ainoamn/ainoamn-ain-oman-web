// src/pages/admin/seq-test.tsx
import { useState } from "react";
import Head from "next/head";
import { issueSerial, type EntityKey } from "@/lib/seqClient";

const ENTITIES: EntityKey[] = [
  "PROPERTY",
  "AUCTION",
  "CONTRACT",
  "INVOICE",
  "PAYMENT",
  "TASK",
  "TICKET",
];

export default function SeqTestPage() {
  const [entity, setEntity] = useState<EntityKey>("PROPERTY");
  const [year, setYear] = useState<number | "">("");
  const [width, setWidth] = useState<number>(6);
  const [prefix, setPrefix] = useState<string>("");
  const [resetPolicy, setResetPolicy] = useState<"yearly" | "never">("yearly");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    serial?: string;
    year?: number;
    counter?: number;
    error?: string;
  } | null>(null);

  const handleIssue = async () => {
    setLoading(true);
    setResult(null);
    const res = await issueSerial(entity, {
      year: year === "" ? undefined : Number(year),
      width,
      prefixOverride: prefix || undefined,
      resetPolicy,
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>اختبار الأرقام المتسلسلة</title>
      </Head>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">🔢 اختبار الأرقام المتسلسلة</h1>
          <p className="text-sm text-gray-600 mb-6">
            هذه صفحة تجريبية لتوليد رقم متسلسل لأي معاملة. لاحقًا سنربطها بنموذج إضافة العقار/المزاد.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow">
            <div>
              <label className="block text-sm font-medium mb-1">نوع المعاملة</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={entity}
                onChange={(e) => setEntity(e.target.value as EntityKey)}
              >
                {ENTITIES.map((en) => (
                  <option key={en} value={en}>
                    {en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">السنة (اختياري)</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                type="number"
                placeholder="مثال 2025"
                value={year}
                onChange={(e) =>
                  setYear(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                اتركه فارغًا لاستخدام السنة الحالية. إن اخترت سياسة عدم إعادة التعيين
                (never) سيتم تجاهل السنة.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">عدد الخانات</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                type="number"
                min={1}
                max={12}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value || 6))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">تجاوز البادئة (اختياري)</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                type="text"
                placeholder="مثال OM-AUC"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                يدوّس على البادئة الافتراضية (PR/AU/CN/...).
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">سياسة إعادة التعيين</label>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="resetPolicy"
                    value="yearly"
                    checked={resetPolicy === "yearly"}
                    onChange={() => setResetPolicy("yearly")}
                  />
                  <span>سنويًا (افتراضي)</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="resetPolicy"
                    value="never"
                    checked={resetPolicy === "never"}
                    onChange={() => setResetPolicy("never")}
                  />
                  <span>عدم إعادة التعيين (عداد واحد دائم)</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleIssue}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg"
              >
                {loading ? "جارٍ التوليد..." : "توليد رقم متسلسل"}
              </button>
            </div>
          </div>

          {result && (
            <div className="mt-6 bg-white p-4 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-2">النتيجة</h2>
              {result.ok ? (
                <div className="space-y-1">
                  <div>
                    <span className="font-medium">Serial:</span>{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">{result.serial}</code>
                  </div>
                  <div>
                    <span className="font-medium">Year:</span> {result.year}
                  </div>
                  <div>
                    <span className="font-medium">Counter:</span> {result.counter}
                  </div>
                </div>
              ) : (
                <div className="text-red-600">
                  فشل التوليد: {result.error ?? "خطأ غير معروف"}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-xs text-gray-500">
            <p>
              ملاحظة أمنية: هذه الصفحة تجريبية. عند الإنتاج، يجب تقييد الوصول إليها
              للمشرفين فقط عبر الحماية والصلاحيات.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
