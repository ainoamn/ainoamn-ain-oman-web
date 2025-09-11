// src/pages/contact.tsx
import Head from "next/head";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

type Form = { name: string; email: string; message: string };

export default function ContactPage() {
  const { t, dir } = useI18n();
  const [v, setV] = useState<Form>({ name: "", email: "", message: "" });
  const [sent, setSent] = useState<null | "ok" | "err">(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: any) {
    e.preventDefault();
    setLoading(true);
    setSent(null);
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      setSent(r.ok ? "ok" : "err");
      if (r.ok) setV({ name: "", email: "", message: "" });
    } catch {
      setSent("err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir={dir} className="min-h-screen bg-slate-50">
      <Head>
        <title>{t("contact.title", "تواصل معنا")} | Ain Oman</title>
      </Head>

      <section className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">{t("contact.title", "تواصل معنا")}</h1>
        <p className="mb-6 text-slate-600">
          {t("contact.subtitle", "نستقبل استفساراتك واقتراحاتك على مدار الساعة.")}
        </p>

        <form onSubmit={submit} className="grid gap-4 rounded-2xl border bg-white p-6">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">{t("contact.name", "الاسم")}</span>
            <input
              required
              value={v.name}
              onChange={(e) => setV({ ...v, name: e.target.value })}
              className="rounded-xl border p-2"
              placeholder={t("contact.name.ph", "اكتب اسمك")}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">{t("contact.email", "البريد الإلكتروني")}</span>
            <input
              required
              type="email"
              value={v.email}
              onChange={(e) => setV({ ...v, email: e.target.value })}
              className="rounded-xl border p-2"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">{t("contact.message", "الرسالة")}</span>
            <textarea
              required
              rows={6}
              value={v.message}
              onChange={(e) => setV({ ...v, message: e.target.value })}
              className="rounded-xl border p-2"
              placeholder={t("contact.message.ph", "اكتب رسالتك هنا")}
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              disabled={loading}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              {loading ? t("common.loading", "جاري التحميل…") : t("contact.send", "إرسال")}
            </button>
            {sent === "ok" && (
              <span className="text-sm text-emerald-700">{t("contact.sent", "تم إرسال رسالتك بنجاح")}</span>
            )}
            {sent === "err" && (
              <span className="text-sm text-red-700">{t("contact.error", "تعذّر الإرسال. حاول لاحقًا.")}</span>
            )}
          </div>
        </form>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">{t("contact.info.address", "العنوان")}</div>
            <div className="text-sm text-slate-600">{t("contact.info.address.val", "مسقط، عُمان")}</div>
          </div>
          <div className="rounded-2xl border bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">{t("contact.info.phone", "الهاتف")}</div>
            <div className="text-sm text-slate-600">{t("contact.info.phone.val", "+968 0000 0000")}</div>
          </div>
          <div className="rounded-2xl border bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">{t("contact.info.email", "البريد")}</div>
            <div className="text-sm text-slate-600">support@ainoman.com</div>
          </div>
        </div>
      </section>
    </main>
  );
}
