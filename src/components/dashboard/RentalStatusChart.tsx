// root: src/components/dashboard/RentalStatusChart.tsx
import React, { useMemo } from "react";

type Rental = {
  state?: string;
  status?: string;
};

type Props = { rentals: Rental[] };

const COLORS: Record<string, string> = {
  reserved: "bg-blue-500",
  paid: "bg-indigo-500",
  docs_submitted: "bg-amber-500",
  docs_verified: "bg-emerald-500",
  leased: "bg-green-600",
  handover_completed: "bg-teal-600",
  canceled: "bg-red-500",
  rejected: "bg-rose-500",
  pending: "bg-yellow-500",
};

const LABELS_AR: Record<string, string> = {
  reserved: "محجوز",
  paid: "مدفوع",
  docs_submitted: "مستندات مرفوعة",
  docs_verified: "مستندات معتمدة",
  leased: "مؤجّر",
  handover_completed: "تسليم منجز",
  canceled: "ملغي",
  rejected: "مرفوض",
  pending: "قيد المراجعة",
};
function RentalStatusChart({ rentals }: Props) {
  const buckets = useMemo(() => {
    const acc: Record<string, number> = {};
    const norm = (v?: string) => String(v || "").toLowerCase().trim();

    for (const r of rentals || []) {
      const k = norm(r.state) || norm(r.status) || "pending";
      acc[k] = (acc[k] || 0) + 1;
    }
    return acc;
  }, [rentals]);

  const total = Object.values(buckets).reduce((s, n) => s + n, 0) || 0;
  const entries = Object.entries(buckets).sort((a, b) => (b[1] - a[1]));

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">حالة الطلبات</h3>
        <span className="text-sm text-gray-500">الإجمالي: {total}</span>
      </div>

      {total === 0 ? (
        <div className="text-center text-gray-500 py-8">لا توجد بيانات بعد</div>
      ) : (
        <>
          {/* شريط تراكمي */}
          <div className="w-full h-3 rounded-full overflow-hidden bg-gray-100 mb-4">
            <div className="flex h-full">
              {entries.map(([k, v]) => (
                <div
                  key={k}
                  className={COLORS[k] || "bg-gray-400"}
                  style={{ width: `${(v / total) * 100}%` }}
                  title={`${LABELS_AR[k] || k}: ${v}`}
                />
              ))}
            </div>
          </div>

          {/* وسيلة إيضاح + أرقام */}
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {entries.map(([k, v]) => (
              <li key={k} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-sm mr-2 ${COLORS[k] || "bg-gray-400"}`} />
                  <span className="text-sm text-gray-700">{LABELS_AR[k] || k}</span>
                </div>
                <span className="text-sm font-semibold">{v}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
