import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import InstantLink from "@/components/InstantLink";
import { FaLink, FaPrint, FaFileContract, FaBuilding, FaUser, FaCalendarAlt, FaArrowLeft } from "react-icons/fa";

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

  const handlePrint = () => {
    window.print();
  };

  const getUsageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'residential': 'سكني',
      'commercial': 'تجاري',
      'industrial': 'صناعي'
    };
    return labels[type] || type;
  };

  const getText = (obj: any, lang: 'ar' | 'en' = 'ar') => {
    if (typeof obj === 'string') return obj;
    if (obj && typeof obj === 'object') {
      return obj[lang] || obj.ar || obj.en || '';
    }
    return '';
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

  return (
    <>
      <Head>
        <title>معاينة القالب | {getText(template.name)} | Ain Oman</title>
        <link rel="stylesheet" href="/styles/contracts.css" />
      </Head>
      
      {/* تنسيق الطباعة */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            font-size: 12pt;
            line-height: 1.6;
          }
          .no-print {
            display: none !important;
          }
          .company-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #1f2937;
          }
          .company-name-ar {
            font-size: 18pt;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .company-name-en {
            font-size: 16pt;
            font-weight: bold;
            color: #4b5563;
            margin-bottom: 10px;
          }
          .company-contact {
            font-size: 10pt;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .document-title {
            text-align: center;
            margin: 30px 0;
            padding: 15px;
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
          }
          .document-title-ar {
            font-size: 16pt;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .document-title-en {
            font-size: 14pt;
            font-weight: bold;
            color: #4b5563;
          }
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            padding: 8px 12px;
            background-color: #e5e7eb;
            border-right: 4px solid #3b82f6;
          }
          .clause {
            margin-bottom: 12px;
            padding: 8px 0;
          }
          .clause-ar {
            font-size: 11pt;
            line-height: 1.7;
            margin-bottom: 5px;
            text-align: right;
          }
          .clause-en {
            font-size: 10pt;
            line-height: 1.6;
            color: #4b5563;
            text-align: left;
            font-style: italic;
          }
          .clause-number {
            font-weight: bold;
            color: #1f2937;
          }
          .signature-section {
            margin-top: 40px;
            page-break-inside: avoid;
          }
          .signature-line {
            border-bottom: 1px solid #000;
            width: 200px;
            display: inline-block;
            margin: 0 20px;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        {/* Header - لا يظهر عند الطباعة */}
        <header className="bg-white shadow-sm no-print">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <InstantLink
                  href="/contracts/templates"
                  className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900"
                >
                  <FaArrowLeft className="ml-2" />
                  العودة للقوالب
                </InstantLink>
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{getText(template.name)}</h1>
                  <p className="text-gray-600">{getText(template.description)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <InstantLink
                  href={`/contracts/create?template=${encodeURIComponent(id || "")}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <FaFileContract className="ml-2" />
                  إنشاء عقد
                </InstantLink>
                <InstantLink
                  href={`/contracts/templates/${id}/link`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <FaLink className="ml-2" />
                  ربط
                </InstantLink>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <FaPrint className="ml-2" />
                  طباعة
                </button>
              </div>
            </div>

            {/* معلومات القالب */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <FaFileContract className="text-blue-600" />
                <span className="text-gray-500">الفئة:</span>
                <span className="font-medium">
                  {template.category === 'contracts' ? 'عقود' : template.category === 'requests' ? 'طلبات' : 'رسائل'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaBuilding className="text-green-600" />
                <span className="text-gray-500">النوع:</span>
                <span className="font-medium">{template.type}</span>
              </div>
              {template.usageTypes && template.usageTypes.length > 0 && (
                <div className="flex items-center gap-2">
                  <FaUser className="text-purple-600" />
                  <span className="text-gray-500">الاستخدام:</span>
                  <span className="font-medium">
                    {template.usageTypes.map((t: string) => getUsageTypeLabel(t)).join(', ')}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-orange-600" />
                <span className="text-gray-500">تاريخ الإنشاء:</span>
                <span className="font-medium">
                  {new Date(template.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* المحتوى الرئيسي */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print-area">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {/* رأس الشركة - يظهر كتر هد عند الطباعة */}
            <div className="company-header bg-gradient-to-r from-blue-50 to-indigo-50 p-8 text-center">
              <div className="company-name-ar text-3xl font-bold text-gray-900 mb-2">
                مجموعة سيد فياض العالمية ش م م
              </div>
              <div className="company-name-en text-2xl font-bold text-gray-700 mb-4">
                SYED FAYYAZ GROUP INTERNATIONAL L L C
              </div>
              <div className="company-contact text-sm text-gray-600 space-y-1">
                <div>ص.ب: 154 ، الرمز البريدي : 111 ، سلطنة عمان</div>
                <div>P.O.Box : 154 , P.C : 111 ,Sultanate of Oman</div>
                <div>هاتف : +968 24499481 | فاكس : +968 24497482</div>
                <div>Tel.: +968 24499481 | Fax.: +968 24497482</div>
              </div>
            </div>

            {/* عنوان المستند */}
            <div className="document-title bg-gray-50 p-6 text-center border-b">
              <div className="document-title-ar text-2xl font-bold text-gray-900 mb-2">
                {getText(template.name, 'ar')}
              </div>
              <div className="document-title-en text-xl font-bold text-gray-700">
                {getText(template.name, 'en')}
              </div>
            </div>

            {/* محتوى المستند */}
            <div className="p-8">
              {template.content?.sections ? (
                <div className="space-y-8">
                  {template.content.sections.map((section: any, sectionIndex: number) => (
                    <div key={sectionIndex} className="section">
                      {/* عنوان القسم */}
                      <div className="section-title bg-gray-100 p-4 rounded-r-lg border-r-4 border-blue-500">
                        <div className="text-lg font-bold text-gray-900 mb-1" dir="rtl">
                          {getText(section.title, 'ar')}
                        </div>
                        <div className="text-base font-semibold text-gray-700" dir="ltr">
                          {getText(section.title, 'en')}
                        </div>
                      </div>

                      {/* البنود */}
                      <div className="mt-4 space-y-4">
                        {section.clauses.map((clause: any, clauseIndex: number) => (
                          <div key={clauseIndex} className="clause p-4 bg-white border border-gray-200 rounded-lg">
                            {/* البند بالعربية */}
                            <div className="clause-ar text-base leading-relaxed mb-3" dir="rtl">
                              <span className="clause-number font-bold text-blue-600 mr-2">
                                {clauseIndex + 1}.
                              </span>
                              {getText(clause, 'ar')}
                            </div>
                            {/* البند بالإنجليزية */}
                            <div className="clause-en text-sm leading-relaxed text-gray-600" dir="ltr">
                              <span className="clause-number font-bold text-blue-500 mr-2">
                                {clauseIndex + 1}.
                              </span>
                              {getText(clause, 'en')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">لا توجد بنود محددة في هذا القالب</p>
                </div>
              )}

              {/* قسم التوقيعات */}
              <div className="signature-section mt-12 pt-8 border-t-2 border-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="signature-line"></div>
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-1">توقيع المؤجر</div>
                    <div className="text-xs text-gray-500">Lessor Signature</div>
                    <div className="text-sm text-gray-600 mt-2">التاريخ: _______________</div>
                    <div className="text-xs text-gray-500">Date: _______________</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="signature-line"></div>
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-1">توقيع المستأجر</div>
                    <div className="text-xs text-gray-500">Tenant Signature</div>
                    <div className="text-sm text-gray-600 mt-2">التاريخ: _______________</div>
                    <div className="text-xs text-gray-500">Date: _______________</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ملاحظة في أسفل الصفحة - لا تظهر عند الطباعة */}
            <div className="bg-blue-50 border-t border-blue-200 p-4 no-print">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <FaFileContract className="text-blue-600 mt-1" />
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">ملاحظة:</p>
                  <p>
                    هذه معاينة بنيوية للقالب. سيتم ملء البنود تلقائياً في نموذج إنشاء العقد وفق القالب المختار.
                    المتغيرات بين [الأقواس] سيتم استبدالها بالبيانات الفعلية عند إنشاء العقد.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default TemplatePreviewPage;
