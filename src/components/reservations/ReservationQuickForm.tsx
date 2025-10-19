// @ts-nocheck
/**
 * Reservation quick form (drop-in for property page)
 * Location: src/components/reservations/ReservationQuickForm.tsx
 */
import { useState } from "react";
import { createReservation } from "@/lib/billingClient";
import type { Currency } from "@/types/billing";

interface ReservationQuickFormProps {
  propertyId: string;
  defaultAmount?: number;
  defaultCurrency?: Currency;
}

export default function ReservationQuickForm({ propertyId, defaultAmount = 60, defaultCurrency = "OMR" as Currency }: ReservationQuickFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    try {
      setBusy(true); setMsg(null);
      const r = await createReservation({ propertyId, customerName, phone, email, amount, currency, notes });
      setMsg(`تم إنشاء الحجز: ${r.id}`);
      setCustomerName(""); setPhone(""); setEmail(""); setNotes("");
    } catch (e: any) {
      setMsg(e?.message || "فشل إنشاء الحجز");
    } finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
      <div className="text-lg font-semibold">طلب حجز سريع</div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input className="rounded-lg border border-gray-300 p-2" placeholder="اسم العميل" value={customerName} onChange={(e)=>setCustomerName(e.target.value)} />
        <input className="rounded-lg border border-gray-300 p-2" placeholder="الهاتف (+968...)" value={phone} onChange={(e)=>setPhone(e.target.value)} />
        <input className="rounded-lg border border-gray-300 p-2" placeholder="البريد (اختياري)" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <div className="flex items-center gap-2">
          <input type="number" className="w-32 rounded-lg border border-gray-300 p-2 text-end" value={amount} onChange={(e)=>setAmount(Number(e.target.value||0))} />
          <select className="rounded-lg border border-gray-300 p-2" value={currency} onChange={(e)=>setCurrency(e.target.value as Currency)}>
            <option value="OMR">OMR</option>
            <option value="AED">AED</option>
            <option value="SAR">SAR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <textarea className="md:col-span-2 rounded-lg border border-gray-300 p-2" rows={3} placeholder="ملاحظات" value={notes} onChange={(e)=>setNotes(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <button onClick={submit} disabled={busy || !customerName || !amount}
          className="rounded-xl px-4 py-2 font-semibold ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-60">
          {busy ? "يرجى الانتظار..." : "إرسال الطلب"}
        </button>
        {msg && <div className="text-xs text-gray-600">{msg}</div>}
      </div>
    </div>
  );
}
