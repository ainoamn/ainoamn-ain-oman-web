// src/components/dashboard/ContractManagement.tsx
import React, { useState } from "react";
import { createContract, type CreateContractInput } from "@/lib/contracts";

export default function ContractManagement() {
  const [form, setForm] = useState<CreateContractInput>({
    propertyId: "",
    buyerName: "",
    sellerName: "",
    amount: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await createContract(form);
      setResult(r.id);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create contract");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">إدارة العقود</h2>

      <form onSubmit={onSubmit} className="grid gap-4 max-w-lg">
        <input
          className="border rounded px-3 py-2"
          placeholder="رقم العقار"
          value={form.propertyId}
          onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="اسم المشتري"
          value={form.buyerName ?? ""}
          onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="اسم البائع"
          value={form.sellerName ?? ""}
          onChange={(e) => setForm({ ...form, sellerName: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2"
          type="number"
          step="0.01"
          placeholder="المبلغ"
          value={form.amount ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              amount: e.target.value === "" ? undefined : Number(e.target.value),
            })
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-sky-600 text-white px-4 py-2 disabled:opacity-60"
        >
          {loading ? "جارٍ الحفظ..." : "إنشاء عقد"}
        </button>
      </form>

      {result && <div className="text-green-700">تم إنشاء العقد برقم: {result}</div>}
      {error && <div className="text-red-700">خطأ: {error}</div>}
    </div>
  );
}
