// src/pages/properties/[id]/messages.tsx
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
// Header and Footer are now handled by MainLayout in _app.tsx
import { useI18n } from "@/lib/i18n";

export default function PropertyMessagesPage() {
  const { query } = useRouter();
  const id = (query.id as string) || "";
  const { t, dir } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" dir={dir}>
      <Head>
        <title>{t("property.messages.title", "مراسلات العقار")} | Ain Oman</title>
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
            <span className="text-slate-700">{t("property.messages", "المراسلات")}</span>
          </nav>

          <h1 className="text-2xl font-semibold mb-6">
            {t("property.messages.heading", "المحادثات")} #{id}
          </h1>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
              <div className="space-y-4 max-h-[60vh] overflow-auto">
                <div className="flex gap-3">
                  <div className="rounded-2xl bg-slate-100 px-4 py-2 max-w-[75%]">
                    مرحبا، هل العقار متاح؟
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="rounded-2xl bg-slate-900 text-white px-4 py-2 max-w-[75%]">
                    نعم متاح.
                  </div>
                </div>
              </div>

              <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  className="flex-1 border rounded-xl px-3 py-2"
                  placeholder={t("messages.typeHere", "اكتب رسالتك هنا") as string}
                />
                <button className="px-4 py-2 rounded-xl bg-slate-900 text-white">
                  {t("actions.send", "إرسال")}
                </button>
              </form>
            </section>

            <aside className="bg-white rounded-2xl shadow p-6 h-fit">
              <h3 className="text-base font-medium mb-3">
                {t("messages.parties", "الأطراف")}
              </h3>
              <ul className="text-sm space-y-2">
                <li>مالك العقار</li>
                <li>عميل مهتم</li>
              </ul>
            </aside>
          </div>
        </div>
      </main>

    </div>
  );
}
