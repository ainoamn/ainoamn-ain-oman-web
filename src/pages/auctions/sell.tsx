// src/pages/auctions/sell.tsx
import Head from "next/head";
import withSubscription from "@/components/auth/withSubscription";
import { useI18n } from "@/lib/i18n";

function SellAuctionPage() {
  const { t, dir } = useI18n();
  return (
    <main dir={dir} className="min-h-screen bg-slate-50">
      <Head><title>إنشاء مزاد | Ain Oman</title></Head>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">إنشاء مزاد جديد</h1>
        <p className="text-slate-600 mb-8">هذه صفحة نموذج مبدئي — عند الربط مع لوحة التحكم سيتم نقل الإدارة بالكامل إلى الـ Dashboard.</p>

        <form className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">عنوان العقار</label>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">الوصف</label>
            <textarea rows={5} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">السعر الابتدائي (ر.ع)</label>
              <input type="number" className="w-full rounded-xl border border-slate-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">تاريخ/وقت الانتهاء</label>
              <input type="datetime-local" className="w-full rounded-xl border border-slate-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">الموقع</label>
              <input className="w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="مسقط، ..." />
            </div>
          </div>
          <div className="pt-4">
            <button className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 font-semibold">حفظ وإرسال للمراجعة</button>
          </div>
        </form>

        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">ملاحظة</h2>
          <p className="text-sm text-slate-600">
            ستظهر هذه الطلبات في لوحة تحكم الإدارة للمراجعة والاعتماد قبل النشر.
          </p>
        </div>
      </div>
    </main>
  );
}

export default withSubscription(SellAuctionPage, ["CREATE_AUCTION"]);
