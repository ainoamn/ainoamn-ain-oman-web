// src/pages/properties/[id]/finance.tsx
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
// Header and Footer are now handled by MainLayout in _app.tsx
import { useI18n } from "@/lib/i18n";

export default function PropertyFinancePage() {
  const { query } = useRouter();
  const id = (query.id as string) || "";
  const { t, dir } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" dir={dir}>
      <Head>
        <title>{t("property.finance.title", "حسابات العقار")} | Ain Oman</title>
      </Head>


      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <nav className="text-sm text-slate-500 mb-6">
            <Link className="hover:underline" href="/properties">
              {t("nav.properties", "العقارات")}
            </Link>
            <span className="mx-2">/</span>
            <Link className="hover:underline" href={`/properties/${id}`}>
              {t("nav.property", "العقار")}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700">
              {t("property.finance", "الحسابات")}
            </span>
          </nav>

          <h1 className="text-2xl font-semibold mb-6">
            {t("property.finance.heading", "تقارير وحركات مالية")} #{id}
          </h1>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border p-4">
                  <div className="text-sm text-slate-500">
                    {t("finance.totalIncome", "إجمالي الدخل")}
                  </div>
                  <div className="text-2xl font-semibold">0</div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="text-sm text-slate-500">
                    {t("finance.totalExpense", "إجمالي المصروف")}
                  </div>
                  <div className="text-2xl font-semibold">0</div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="text-sm text-slate-500">
                    {t("finance.balance", "الرصيد")}
                  </div>
                  <div className="text-2xl font-semibold">0</div>
                </div>
              </div>

              <h2 className="mt-6 mb-3 font-medium">
                {t("finance.ledger", "سجل القيود")}
              </h2>
              <div className="overflow-auto border rounded-xl">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-3 py-2 text-start">#</th>
                      <th className="px-3 py-2 text-start">
                        {t("finance.date", "التاريخ")}
                      </th>
                      <th className="px-3 py-2 text-start">
                        {t("finance.desc", "الوصف")}
                      </th>
                      <th className="px-3 py-2 text-start">
                        {t("finance.type", "النوع")}
                      </th>
                      <th className="px-3 py-2 text-start">
                        {t("finance.amount", "المبلغ")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2">1</td>
                      <td className="px-3 py-2">—</td>
                      <td className="px-3 py-2">—</td>
                      <td className="px-3 py-2">—</td>
                      <td className="px-3 py-2">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="bg-white rounded-2xl shadow p-6 h-fit">
              <h3 className="text-base font-medium mb-3">
                {t("finance.actions", "إجراءات")}
              </h3>
              <div className="space-y-2 text-sm">
                <Link
                  href={`/properties/${id}/bookings`}
                  className="block underline"
                >
                  {t("property.bookings", "الحجوزات")}
                </Link>
                <Link
                  href={`/properties/${id}/requests`}
                  className="block underline"
                >
                  {t("property.requests", "الطلبات")}
                </Link>
                <Link
                  href={`/properties/${id}/messages`}
                  className="block underline"
                >
                  {t("property.messages", "المراسلات")}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>

    </div>
  );
}
