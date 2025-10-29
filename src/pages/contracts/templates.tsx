import { NextPage } from "next";
import Head from "next/head";
import InstantLink from "@/components/InstantLink";

const ContractTemplatesPage: NextPage = () => {
  const templates = [
    { id: "std-rental", name: "نموذج عقد إيجار قياسي", description: "قابل للتعديل، يحتوي على البنود الأساسية." },
    { id: "commercial", name: "عقد إيجار تجاري", description: "بنود مخصصة للمحلات والمكاتب." },
    { id: "residential", name: "عقد إيجار سكني", description: "مناسب للشقق والفلل." }
  ];

  return (
    <>
      <Head>
        <title>قوالب العقود | Ain Oman</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">قوالب العقود</h1>
                <p className="text-gray-600">اختر قالباً لبدء إنشاء عقد جديد</p>
              </div>
              <InstantLink
                href="/rentals/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                إنشاء عقد من قالب
              </InstantLink>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(t => (
              <div key={t.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">{t.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{t.description}</p>
                <div className="mt-4 flex gap-2">
                  <InstantLink
                    href={`/rentals/new?template=${t.id}`}
                    className="flex-1 text-center px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                  >
                    استخدام القالب
                  </InstantLink>
                  <InstantLink
                    href={`/contracts/templates/${t.id}`}
                    className="flex-1 text-center px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    معاينة
                  </InstantLink>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default ContractTemplatesPage;


