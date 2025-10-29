import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import InstantLink from "@/components/InstantLink";
import { FaLink } from "react-icons/fa";

const TemplatePreviewPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    try {
      const res = await fetch(`/api/contract-templates/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTemplate(data.template);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!template) {
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

  const getUsageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'residential': 'سكني',
      'commercial': 'تجاري',
      'industrial': 'صناعي'
    };
    return labels[type] || type;
  };

  return (
    <>
      <Head>
        <title>معاينة القالب | {template.name}</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
              <p className="text-gray-600">{template.description}</p>
            </div>
            <div className="flex gap-2">
              <InstantLink
                href={`/rentals/new?template=${encodeURIComponent(id || "")}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                استخدام هذا القالب
              </InstantLink>
              <InstantLink
                href={`/contracts/templates/${id}/link`}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                <FaLink className="inline ml-1" />
                ربط
              </InstantLink>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow-sm rounded-lg p-6">
            {/* معلومات القالب */}
            <div className="mb-6 pb-6 border-b">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">الفئة:</span>
                  <span className="mr-2 font-medium">{template.category === 'contracts' ? 'عقود' : template.category === 'requests' ? 'طلبات' : 'رسائل'}</span>
                </div>
                <div>
                  <span className="text-gray-500">النوع:</span>
                  <span className="mr-2 font-medium">{template.type}</span>
                </div>
                {template.usageTypes && template.usageTypes.length > 0 && (
                  <div>
                    <span className="text-gray-500">أنواع الاستخدام:</span>
                    <span className="mr-2 font-medium">
                      {template.usageTypes.map((t: string) => getUsageTypeLabel(t)).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* البنود */}
            <h2 className="text-lg font-semibold text-gray-900 mb-4">بنود القالب</h2>
            {template.content?.sections ? (
              <div className="space-y-6">
                {template.content.sections.map((section: any, sectionIndex: number) => (
                  <div key={sectionIndex} className="border-r-4 border-blue-500 pr-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">{section.title}</h3>
                    <ol className="list-decimal pr-6 space-y-2 text-gray-800">
                      {section.clauses.map((clause: string, clauseIndex: number) => (
                        <li key={clauseIndex} className="text-base leading-relaxed">
                          {clause}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">لا توجد بنود محددة</p>
            )}

            <div className="mt-8 border-t pt-6">
              <p className="text-sm text-gray-600">
                هذه معاينة بنيوية. سيتم ملء البنود تلقائياً في نموذج إنشاء العقد وفق القالب المختار.
                المتغيرات بين [الأقواس] سيتم استبدالها بالبيانات الفعلية عند إنشاء العقد.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default TemplatePreviewPage;
