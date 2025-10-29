import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import InstantLink from "@/components/InstantLink";

const TEMPLATES: Record<string, { name: string; description: string; sections: string[] }> = {
  "std-rental": {
    name: "نموذج عقد إيجار قياسي",
    description: "قالب عام يحتوي على البنود الأساسية لعقد الإيجار السكني.",
    sections: [
      "بيانات الأطراف",
      "بيانات الوحدة المؤجرة",
      "مدة العقد وقيمته",
      "التأمين والالتزامات",
      "الصيانة والمرافق",
      "فسخ العقد",
      "التوقيعات"
    ]
  },
  "commercial": {
    name: "عقد إيجار تجاري",
    description: "قالب مخصص للمحلات والمكاتب مع بنود النشاط التجاري.",
    sections: [
      "بيانات الأطراف",
      "وصف المحل/المكتب",
      "الترخيص والنشاط",
      "الإيجار والرسوم",
      "التأمين والالتزامات",
      "الإعلانات والتجهيزات",
      "التوقيعات"
    ]
  },
  "residential": {
    name: "عقد إيجار سكني",
    description: "قالب مناسب للشقق والفلل السكنية.",
    sections: [
      "بيانات الأطراف",
      "بيانات العقار",
      "المدة والقيمة",
      "سياسة الزيارات والسكن",
      "المرافق والصيانة",
      "إنهاء العقد",
      "التوقيعات"
    ]
  }
};

const TemplatePreviewPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const tpl = id ? TEMPLATES[id] : undefined;

  if (!tpl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">القالب غير موجود</h1>
          <p className="text-gray-600 mb-4">تأكد من رابط القالب أو عد لقائمة القوالب.</p>
          <InstantLink href="/contracts/templates" className="px-4 py-2 bg-blue-600 text-white rounded-md">العودة للقوالب</InstantLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>معاينة القالب | {tpl.name}</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tpl.name}</h1>
              <p className="text-gray-600">{tpl.description}</p>
            </div>
            <InstantLink
              href={`/rentals/new?template=${encodeURIComponent(id || "")}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              استخدام هذا القالب
            </InstantLink>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">فهرس بنود القالب</h2>
            <ol className="list-decimal pr-6 space-y-2 text-gray-800">
              {tpl.sections.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ol>

            <div className="mt-8 border-t pt-6">
              <p className="text-sm text-gray-600">هذه معاينة بنيوية. سيتم ملء البنود تلقائياً في نموذج إنشاء العقد وفق القالب المختار.</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default TemplatePreviewPage;


