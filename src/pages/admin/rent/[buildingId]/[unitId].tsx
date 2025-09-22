// src/pages/admin/rent/[buildingId]/[unitId].tsx
// نسخة كاملة مع تشديد التحقق: صورة عداد الكهرباء إلزامية دائمًا.
// صورة عداد الماء إلزامية فقط إذا كانت الوحدة لديها عداد ماء.
import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type TenantKind = "omani" | "expat" | "company";
type Cheque = {
  chequeNo: string;
  chequeDate: string;
  amount: number | string;
  status: "paid" | "pending" | "returned" | "refunded";
  image?: string;
};
type ExtraTax = { name: string; rate: number; mode: "total" | "monthly" };
type ModalState = { open: boolean; anchorIndex: number };

export default function RentUnitPage() {
  const { query } = useRouter();
  const buildingId = String(query.buildingId || "");
  const unitId = String(query.unitId || "");

  const [monthlyRent, setMonthlyRent] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("OMR");
  const [unitHasWaterMeter, setUnitHasWaterMeter] = useState<boolean>(false);

  useEffect(() => {
    if (!buildingId) return;
    (async () => {
      const r = await fetch(`/api/buildings/${encodeURIComponent(buildingId)}`);
      const d = r.ok ? await r.json() : null;
      const u = d?.item?.units?.find((x: any) => x.id === unitId);
      if (u) {
        setMonthlyRent(Number(u.rentAmount || 0));
        setCurrency(u.currency || "OMR");
        setUnitHasWaterMeter(!!u.waterMeter);
      }
    })();
  }, [buildingId, unitId]);

  // المستأجر
  const [kind, setKind] = useState<TenantKind>("omani");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("+968");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  function validEmail(s: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  }
  function validPhone(code: string, num: string) {
    const n = num.replace(/\D+/g, "");
    return code === "+968" ? /^9\d{7}$/.test(n) : n.length >= 6 && n.length <= 15;
  }

  // فترة العقد
  const [startDate, setStartDate] = useState<string>("");
  const [durationKind, setDurationKind] = useState<"months" | "days">("months");
  const [durationValue, setDurationValue] = useState<number>(12);
  const endDate = useMemo(
    () => computeEnd(startDate, durationKind, durationValue),
    [startDate, durationKind, durationValue]
  );
  const durationMonths = useMemo(
    () => diffMonths(startDate, endDate),
    [startDate, endDate]
  );

  // إجمالي الإيجار
  const [totalRent, setTotalRent] = useState<number>(0);
  useEffect(() => {
    if (durationMonths > 0 && monthlyRent > 0) {
      setTotalRent(Math.round(monthlyRent * durationMonths * 1000) / 1000);
    }
  }, [durationMonths, monthlyRent]);

  // رسوم/ضرائب إضافية
  const [extras, setExtras] = useState<ExtraTax[]>([]);
  function addTax() {
    setExtras((x) => [...x, { name: "رسوم إضافية", rate: 0, mode: "total" }]);
  }
  function setTax(i: number, patch: Partial<ExtraTax>) {
    setExtras((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function removeTax(i: number) {
    setExtras((prev) => prev.filter((_, idx) => idx !== i));
  }

  const fee3 = useMemo(() => round2(totalRent * 0.03), [totalRent]);
  const monthBreakdown = useMemo(() => {
    const months = Math.max(1, durationMonths || 1);
    const rows: { month: number; base: number; extra: number; total: number }[] = [];
    const monthlyRateSum = extras
      .filter((x) => x.mode === "monthly")
      .reduce((s, x) => s + x.rate, 0);
    for (let i = 1; i <= months; i++) {
      const base = monthlyRent;
      const add = base * (monthlyRateSum / 100);
      rows.push({ month: i, base: round2(base), extra: round2(add), total: round2(base + add) });
    }
    return rows;
  }, [durationMonths, monthlyRent, extras]);

  // العدادات + المرفقات
  const [powerReading, setPowerReading] = useState<number | "">("");
  const [waterReading, setWaterReading] = useState<number | "">("");
  const [powerImage, setPowerImage] = useState("");
  const [waterImage, setWaterImage] = useState("");

  // الضمان + المرفقات
  const [deposit, setDeposit] = useState<number>(0);
  const [depositPaid, setDepositPaid] = useState<boolean>(false);
  const [depositPaymentMethod, setDepositPaymentMethod] =
    useState<"cash" | "transfer" | "cheque">("cash");
  const [depositReceiptNo, setDepositReceiptNo] = useState("");
  const [depositFiles, setDepositFiles] = useState<string[]>([]);
  function onDepositFiles(fl: FileList | null) {
    if (!fl) return;
    setDepositFiles(Array.from(fl).map((f) => f.name));
  }

  // طريقة الدفع
  const [method, setMethod] = useState<"cash" | "transfer" | "cheque">("cash");
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [modal, setModal] = useState<ModalState>({ open: false, anchorIndex: -1 });
  const [askedOnce, setAskedOnce] = useState(false);

  useEffect(() => {
    if (method !== "cheque") return;
    const n = Math.max(1, Math.ceil(durationMonths || 1));
    setCheques((prev) => {
      const arr = [...prev];
      while (arr.length < n)
        arr.push({ chequeNo: "", chequeDate: "", amount: monthlyRent || 0, status: "pending" });
      if (arr.length > n) arr.length = n;
      return arr;
    });
  }, [method, durationMonths, monthlyRent]);

  function setCheque(i: number, patch: Partial<Cheque>) {
    setCheques((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }
  function onFocusCheque(i: number) {
    if (i === 1 && !askedOnce && cheques[0]?.chequeNo && cheques[0]?.chequeDate) {
      setModal({ open: true, anchorIndex: 1 });
    }
  }
  function unifyDatesAndSequence() {
    const base = cheques[0];
    if (!base) return setModal({ open: false, anchorIndex: -1 });
    const date = new Date(base.chequeDate);
    const baseNo = base.chequeNo;
    setCheques((prev) => {
      const out = [...prev];
      for (let i = 1; i < out.length; i++) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + i);
        out[i] = {
          ...out[i],
          chequeDate: d.toISOString().slice(0, 10),
          chequeNo: sequenceNumber(baseNo, i),
        };
      }
      return out;
    });
    setAskedOnce(true);
    setModal({ open: false, anchorIndex: -1 });
  }
  function sequenceNumber(no: string, i: number) {
    const m = no.match(/(\d+)(?!.*\d)/);
    if (!m) return `${no}-${i + 1}`;
    const num = m[1];
    const start = parseInt(num, 10);
    const next = (start + i).toString().padStart(num.length, "0");
    return no.replace(/\d+(?!.*\d)/, next);
  }

  async function submit() {
    if (!buildingId || !unitId) return alert("رابط غير صحيح");
    if (!name) return alert("أدخل الاسم");
    if (!validPhone(country, phone)) return alert("رقم الهاتف غير صحيح");
    if (email && !validEmail(email)) return alert("صيغة البريد غير صحيحة");
    if (!startDate) return alert("أدخل تاريخ البداية");
    if (durationMonths <= 0) return alert("المدة غير صحيحة");

    // إلزام صور العدادات
    if (!powerImage) return alert("صورة عداد الكهرباء إلزامية");
    if (unitHasWaterMeter && !waterImage) return alert("صورة عداد الماء إلزامية لهذه الوحدة");

    if (method === "cheque") {
      if (!cheques.length || cheques.some((c) => !c.chequeNo || !c.amount || !c.chequeDate))
        return alert("أدخل كل تواريخ وأرقام ومبالغ الشيكات");
    }

    const totalWithExtras = computeTotalWithExtras(
      totalRent,
      extras,
      Math.max(1, durationMonths),
      monthlyRent
    );

    const body = {
      buildingId,
      unitId,
      startDate,
      durationMonths,
      totalRent: totalWithExtras,
      deposit,
      depositPaid,
      depositReceiptNo,
      depositPaymentMethod,
      depositFiles,
      paymentMethod: method,
      cheques:
        method === "cheque"
          ? cheques.map((c) => ({ ...c, amount: Number(c.amount || 0) }))
          : [],
      guaranteeCheques: [],
      meters: {
        powerReading: powerReading === "" ? undefined : Number(powerReading),
        powerImage: powerImage || undefined,
        waterReading: waterReading === "" ? undefined : Number(waterReading),
        waterImage: unitHasWaterMeter ? waterImage || undefined : undefined,
      },
      tenant: {
        id: "",
        kind,
        name,
        phone: `${country}${phone.replace(/\D+/g, "")}`,
        email: email || undefined,
      },
    };

    const r = await fetch("/api/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (r.ok && d?.item?.id) {
      window.location.href = `/contracts/sign/${encodeURIComponent(d.item.id)}`;
    } else {
      alert(d?.error || "فشل إنشاء الحجز/العقد");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>إدارة تأجير وحدة</title>
      </Head>
      <Header />
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">تأجير الوحدة</h1>
          <Link href="/admin/properties" className="btn">
            رجوع
          </Link>
        </div>

        {/* المستأجر */}
        <section className="border rounded-2xl p-3 space-y-3">
          <div className="font-semibold">المستأجر</div>
          <div className="grid sm:grid-cols-6 gap-2">
            <select className="form-input" value={kind} onChange={(e) => setKind(e.target.value as any)}>
              <option value="omani">شخص عماني</option>
              <option value="expat">وافد</option>
              <option value="company">شركة</option>
            </select>
            <input
              className="form-input"
              placeholder="الاسم"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <select className="form-input" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="+968">عُمان (+968)</option>
              <option value="+971">الإمارات (+971)</option>
              <option value="+966">السعودية (+966)</option>
              <option value="+974">قطر (+974)</option>
              <option value="+973">البحرين (+973)</option>
              <option value="+965">الكويت (+965)</option>
            </select>
            <input
              className="form-input"
              placeholder="رقم الهاتف"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="form-input sm:col-span-2"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </section>

        {/* فترة العقد والمبالغ */}
        <section className="border rounded-2xl p-3 space-y-3">
          <div className="font-semibold">فترة العقد والمبالغ</div>
          <div className="grid sm:grid-cols-5 gap-2">
            <input className="form-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <select className="form-input" value={durationKind} onChange={(e) => setDurationKind(e.target.value as any)}>
              <option value="months">بالأشهر</option>
              <option value="days">بالأيام</option>
            </select>
            <input
              className="form-input"
              type="number"
              min={1}
              value={durationValue}
              onChange={(e) => setDurationValue(Math.max(1, Number(e.target.value || 1)))}
            />
            <input className="form-input" value={`الإيجار الشهري: ${monthlyRent} ${currency}`} readOnly />
            <input
              className="form-input"
              value={`ينتهي: ${endDate ? new Date(endDate).toLocaleDateString("ar-OM") : "—"}`}
              readOnly
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-2">
            <input className="form-input" value={`القيمة الإجمالية (قبل الضرائب): ${totalRent}`} readOnly />
            <input className="form-input" value={`رسوم البلدية 3% = ${fee3}`} readOnly />
            <button className="btn btn-outline" onClick={addTax}>
              + إضافة ضريبة/رسوم أخرى
            </button>
          </div>

          {extras.map((t, idx) => (
            <div key={idx} className="grid sm:grid-cols-5 gap-2">
              <input
                className="form-input"
                placeholder="اسم الرسوم"
                value={t.name}
                onChange={(e) => setTax(idx, { name: e.target.value })}
              />
              <input
                className="form-input"
                type="number"
                placeholder="النسبة %"
                value={t.rate}
                onChange={(e) => setTax(idx, { rate: Number(e.target.value || 0) })}
              />
              <select className="form-input" value={t.mode} onChange={(e) => setTax(idx, { mode: e.target.value as any })}>
                <option value="total">على الإجمالي</option>
                <option value="monthly">شهريًا</option>
              </select>
              <div className="form-input bg-gray-50">
                {t.mode === "total" ? round2(totalRent * (t.rate / 100)) : `${round2(monthlyRent * (t.rate / 100))}/شهر`}
              </div>
              <button className="btn btn-outline" onClick={() => removeTax(idx)}>
                حذف
              </button>
            </div>
          ))}

          {extras.some((x) => x.mode === "monthly") && (
            <div className="overflow-auto">
              <table className="w-full text-sm border mt-2">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-2">الشهر</th>
                    <th className="p-2">إيجار</th>
                    <th className="p-2">ضرائب شهرية</th>
                    <th className="p-2">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {monthBreakdown.map((r) => (
                    <tr key={r.month} className="border-b">
                      <td className="p-2">{r.month}</td>
                      <td className="p-2">{r.base}</td>
                      <td className="p-2">{r.extra}</td>
                      <td className="p-2">{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* العدادات */}
        <section className="border rounded-2xl p-3 space-y-3">
          <div className="font-semibold">قراءات العدادات</div>
          <div className="grid sm:grid-cols-4 gap-2">
            <input
              className="form-input"
              type="number"
              placeholder="قراءة الكهرباء"
              value={powerReading}
              onChange={(e) => setPowerReading(e.target.value ? Number(e.target.value) : "")}
            />
            <input
              className="form-input"
              type="file"
              accept="image/*"
              onChange={(e) => setPowerImage(e.target.files?.[0]?.name || "")}
            />
            <input
              className="form-input"
              type="number"
              placeholder="قراءة الماء"
              value={waterReading}
              onChange={(e) => setWaterReading(e.target.value ? Number(e.target.value) : "")}
            />
            <input
              className="form-input"
              type="file"
              accept="image/*"
              onChange={(e) => setWaterImage(e.target.files?.[0]?.name || "")}
            />
          </div>
          <div className="text-xs text-gray-600">
            صورة الكهرباء إلزامية. صورة الماء إلزامية فقط إذا كانت هذه الوحدة تحتوي عداد ماء.
          </div>
        </section>

        {/* الضمان */}
        <section className="border rounded-2xl p-3 space-y-3">
          <div className="font-semibold">مبلغ الضمان</div>
          <div className="grid sm:grid-cols-4 gap-2">
            <input
              className="form-input"
              type="number"
              placeholder="مبلغ الضمان"
              value={deposit}
              onChange={(e) => setDeposit(Number(e.target.value || 0))}
            />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={depositPaid} onChange={(e) => setDepositPaid(e.target.checked)} />
              تم دفع الضمان
            </label>
            <select
              className="form-input"
              value={depositPaymentMethod}
              onChange={(e) => setDepositPaymentMethod(e.target.value as any)}
            >
              <option value="cash">كاش</option>
              <option value="transfer">تحويل</option>
              <option value="cheque">شيك</option>
            </select>
            <input
              className="form-input"
              placeholder="رقم الإيصال"
              value={depositReceiptNo}
              onChange={(e) => setDepositReceiptNo(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">مرفقات إيصالات الضمان</label>
            <input className="form-input" type="file" multiple accept="image/*,.pdf" onChange={(e) => onDepositFiles(e.target.files)} />
          </div>
        </section>

        {/* طريقة الدفع */}
        <section className="border rounded-2xl p-3 space-y-3">
          <div className="font-semibold">طريقة دفع الإيجار</div>
          <div className="grid sm:grid-cols-4 gap-2">
            <select className="form-input" value={method} onChange={(e) => setMethod(e.target.value as any)}>
              <option value="cash">نقدًا</option>
              <option value="transfer">تحويل</option>
              <option value="cheque">شيك</option>
            </select>
          </div>

          {method === "cheque" && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">عدد الشيكات = مدة العقد بالأشهر.</div>
              {cheques.map((c, idx) => (
                <div key={idx} className="grid sm:grid-cols-6 gap-2 items-center">
                  <input
                    className="form-input"
                    placeholder={`رقم الشيك #${idx + 1}`}
                    value={c.chequeNo}
                    onChange={(e) => setCheque(idx, { chequeNo: e.target.value })}
                    onFocus={() => onFocusCheque(idx)}
                  />
                  <input
                    className="form-input"
                    type="date"
                    value={c.chequeDate}
                    onChange={(e) => setCheque(idx, { chequeDate: e.target.value })}
                    onFocus={() => onFocusCheque(idx)}
                  />
                  <input
                    className="form-input"
                    type="number"
                    placeholder="المبلغ"
                    value={c.amount}
                    onChange={(e) => setCheque(idx, { amount: Number(e.target.value || 0) })}
                  />
                  <select className="form-input" value={c.status} onChange={(e) => setCheque(idx, { status: e.target.value as any })}>
                    <option value="pending">لم يحن</option>
                    <option value="paid">مدفوع</option>
                    <option value="returned">مرتجع</option>
                    <option value="refunded">مسترد</option>
                  </select>
                  <input className="form-input" type="file" accept="image/*" onChange={(e) => setCheque(idx, { image: e.target.files?.[0]?.name })} />
                  <div className="text-xs text-gray-500">حالة الشيك</div>
                </div>
              ))}

              {modal.open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-4 w-full max-w-md space-y-3">
                    <div className="text-lg font-semibold">توحيد تواريخ الشيكات وترقيمها؟</div>
                    <div className="text-sm text-gray-600">
                      سنستخدم تاريخ الشيك الأول كأساس ونزيده شهرًا لكل شيك مع ترقيم متسلسل.
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="btn"
                        onClick={() => {
                          setAskedOnce(true);
                          setModal({ open: false, anchorIndex: -1 });
                        }}
                      >
                        لا
                      </button>
                      <button className="btn btn-primary" onClick={unifyDatesAndSequence}>
                        نعم
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <button className="btn btn-primary" onClick={submit}>
          إنشاء الحجز وجلب العقد للتوقيع
        </button>
      </main>
      <Footer />
    </div>
  );
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function computeEnd(start?: string, kind?: "months" | "days", value?: number) {
  if (!start || !value) return "";
  const d = new Date(start);
  if (kind === "days") d.setDate(d.getDate() + value);
  else d.setMonth(d.getMonth() + value);
  return d.toISOString();
}
function diffMonths(a?: string, b?: string) {
  if (!a || !b) return 0;
  const d1 = new Date(a);
  const d2 = new Date(b);
  const days = (d2.getTime() - d1.getTime()) / 86400000;
  if (!Number.isFinite(days) || days <= 0) return 0;
  return Math.max(1, Math.round(days / 30));
}
function computeTotalWithExtras(base: number, extras: ExtraTax[], months: number, monthlyRent: number) {
  const addTotal = base * (extras.filter((x) => x.mode === "total").reduce((s, x) => s + x.rate, 0) / 100);
  const addMonthly =
    monthlyRent * (extras.filter((x) => x.mode === "monthly").reduce((s, x) => s + x.rate, 0) / 100) * Math.max(1, months || 1);
  return round2(base + addTotal + addMonthly);
}
