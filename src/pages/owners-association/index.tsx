import Head from "next/head";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { useI18n } from "@/lib/i18n";

type HOAListItem = {
  id: string;
  name: string;
  propertyName?: string;
  status: "active" | "inactive";
};

const MOCK: HOAListItem[] = [
  { id: "hoa_001", name: "مجمع الندى", propertyName: "Al Nada Tower", status: "active" },
  { id: "hoa_002", name: "Villa Park", propertyName: "Qurum Villas", status: "inactive" },
];

export default function OwnersAssociationIndex() {
  const { t, dir } = useI18n();
  return (
    <Layout>
      <Head>
        <title>{t("owners.title", "جمعية الملاك")} | Ain Oman</title>
      </Head>
      <main dir={dir} className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{t("owners.title", "جمعية الملاك")}</h1>
            <Link href="/owners-association/create" className="rounded-xl bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">
              {t("owners.create", "إنشاء جمعية")}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK.map((hoa) => (
              <Link key={hoa.id} href={`/owners-association/${hoa.id}`} className="block rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">{hoa.name}</div>
                    <div className="text-sm text-slate-600">{hoa.propertyName}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${hoa.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}>
                    {hoa.status === "active" ? t("owners.active", "نشطة") : t("owners.inactive", "غير نشطة")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
