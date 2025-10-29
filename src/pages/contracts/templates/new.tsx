import { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import InstantLink from "@/components/InstantLink";
import { FaMagic, FaLanguage, FaSpellCheck, FaSave, FaArrowLeft } from "react-icons/fa";

interface Section {
  title: { ar: string; en: string };
  clauses: Array<{ ar: string; en: string }>;
}

const NewTemplatePage: NextPage = () => {
  const [name, setName] = useState({ ar: "", en: "" });
  const [description, setDescription] = useState({ ar: "", en: "" });
  const [category, setCategory] = useState<'contracts' | 'requests' | 'letters'>('contracts');
  const [type, setType] = useState("");
  const [usageTypes, setUsageTypes] = useState<string[]>([]);
  const [sections, setSections] = useState<Section[]>([
    { title: { ar: "", en: "" }, clauses: [{ ar: "", en: "" }] }
  ]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleAI = async (action: 'translate' | 'improve' | 'correct', text: string, lang: 'ar' | 'en', targetLang?: 'ar' | 'en', sectionIndex?: number, clauseIndex?: number, field?: 'title' | 'clause' | 'name' | 'description') => {
    if (!text || !text.trim()) {
      setStatus('الرجاء إدخال نص أولاً');
      return;
    }

    try {
      setLoading(`${action}-${sectionIndex}-${clauseIndex}-${field}`);
      setStatus(null);
      
      const res = await fetch('/api/ai/template-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          text: text.trim(),
          sourceLang: lang,
          targetLang: targetLang || (lang === 'ar' ? 'en' : 'ar')
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'فشل في معالجة الطلب');
      }

      if (action === 'translate') {
        const finalTargetLang = targetLang || (lang === 'ar' ? 'en' : 'ar');
        
        if (field === 'name') {
          setName({ ...name, [finalTargetLang]: data.text });
        } else if (field === 'description') {
          setDescription({ ...description, [finalTargetLang]: data.text });
        } else if (field === 'title' && sectionIndex !== undefined) {
          const newSections = [...sections];
          newSections[sectionIndex].title[finalTargetLang] = data.text;
          setSections(newSections);
        } else if (field === 'clause' && sectionIndex !== undefined && clauseIndex !== undefined) {
          const newSections = [...sections];
          newSections[sectionIndex].clauses[clauseIndex][finalTargetLang] = data.text;
          setSections(newSections);
        }
      } else {
        // للتحسين والتصحيح، تحديث النص مباشرة
        if (field === 'name') {
          setName({ ...name, [lang]: data.text });
        } else if (field === 'description') {
          setDescription({ ...description, [lang]: data.text });
        } else if (field === 'title' && sectionIndex !== undefined) {
          const newSections = [...sections];
          newSections[sectionIndex].title[lang] = data.text;
          setSections(newSections);
        } else if (field === 'clause' && sectionIndex !== undefined && clauseIndex !== undefined) {
          const newSections = [...sections];
          newSections[sectionIndex].clauses[clauseIndex][lang] = data.text;
          setSections(newSections);
        }
      }
      
      setStatus(null); // Clear any previous errors
    } catch (error: any) {
      console.error('AI error:', error);
      setStatus(`حدث خطأ: ${error.message || 'فشل في استخدام الذكاء الاصطناعي'}`);
    } finally {
      setLoading(null);
    }
  };

  const addSection = () => {
    setSections([...sections, { title: { ar: "", en: "" }, clauses: [{ ar: "", en: "" }] }]);
  };

  const addClause = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].clauses.push({ ar: "", en: "" });
    setSections(newSections);
  };

  const removeClause = (sectionIndex: number, clauseIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].clauses = newSections[sectionIndex].clauses.filter((_, i) => i !== clauseIndex);
    setSections(newSections);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStatus(null);
      const template = {
        name,
        description,
        category,
        type: type || 'custom',
        usageTypes,
        content: {
          sections: sections.filter(s => s.title.ar || s.title.en)
        }
      };

      const res = await fetch('/api/contract-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });

      if (res.ok) {
        setStatus('تم حفظ القالب بنجاح!');
        setTimeout(() => {
          window.location.href = '/contracts/templates';
        }, 1500);
      } else {
        setStatus('فشل حفظ القالب');
      }
    } catch (error) {
      setStatus('حدث خطأ أثناء الحفظ');
    }
  };

  return (
    <>
      <Head>
        <title>إنشاء قالب عقد جديد | Ain Oman</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">إنشاء قالب عقد جديد</h1>
                <p className="text-gray-600">صمم قالباً مخصصاً باللغتين العربية والإنجليزية</p>
              </div>
              <InstantLink
                href="/contracts/templates"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm"
              >
                <FaArrowLeft className="ml-2" />
                العودة
              </InstantLink>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* معلومات أساسية */}
            <div className="bg-white shadow sm:rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">معلومات القالب</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* اسم القالب */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم القالب (عربي)</label>
                  <input
                    value={name.ar}
                    onChange={e => setName({ ...name, ar: e.target.value })}
                    className="w-full border-gray-300 rounded-md"
                    placeholder="مثال: عقد إيجار سكني"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name (English)</label>
                  <div className="flex gap-2">
                    <input
                      value={name.en}
                      onChange={e => setName({ ...name, en: e.target.value })}
                      className="flex-1 border-gray-300 rounded-md"
                      placeholder="e.g., Residential Rental Agreement"
                    />
                    {name.ar && (
                      <button
                        type="button"
                        onClick={() => handleAI('translate', name.ar, 'ar', 'en', undefined, undefined, 'name')}
                        disabled={loading !== null}
                        className="px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-50 relative"
                        title="ترجمة تلقائية"
                      >
                        {loading?.includes('translate') && loading?.includes('name') ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <FaLanguage />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* وصف القالب */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف (عربي)</label>
                  <textarea
                    value={description.ar}
                    onChange={e => setDescription({ ...description, ar: e.target.value })}
                    rows={2}
                    className="w-full border-gray-300 rounded-md"
                    placeholder="وصف مختصر للقالب"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                  <div className="flex gap-2">
                    <textarea
                      value={description.en}
                      onChange={e => setDescription({ ...description, en: e.target.value })}
                      rows={2}
                      className="flex-1 border-gray-300 rounded-md"
                      placeholder="Brief template description"
                    />
                    {description.ar && (
                      <button
                        type="button"
                        onClick={() => handleAI('translate', description.ar, 'ar', 'en', undefined, undefined, 'description')}
                        disabled={loading !== null}
                        className="px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-50"
                        title="ترجمة تلقائية"
                      >
                        <FaLanguage />
                      </button>
                    )}
                  </div>
                </div>

                {/* الفئة والنوع */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full border-gray-300 rounded-md"
                  >
                    <option value="contracts">عقود</option>
                    <option value="requests">طلبات</option>
                    <option value="letters">رسائل</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                  <input
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full border-gray-300 rounded-md"
                    placeholder="مثال: rental, renewal"
                  />
                </div>
              </div>
            </div>

            {/* الأقسام */}
            <div className="bg-white shadow sm:rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">أقسام القالب</h2>
                <button
                  type="button"
                  onClick={addSection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  إضافة قسم
                </button>
              </div>

              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-6 p-4 border border-gray-200 rounded-lg">
                  {/* عنوان القسم */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">عنوان القسم (عربي)</label>
                      <div className="flex gap-2">
                        <input
                          value={section.title.ar}
                          onChange={e => {
                            const newSections = [...sections];
                            newSections[sectionIndex].title.ar = e.target.value;
                            setSections(newSections);
                          }}
                          className="flex-1 border-gray-300 rounded-md"
                          placeholder="مثال: بيانات الأطراف"
                        />
                        <button
                          type="button"
                          onClick={() => handleAI('improve', section.title.ar, 'ar', undefined, sectionIndex, undefined, 'title')}
                          disabled={loading !== null || !section.title.ar}
                          className="px-3 py-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 disabled:opacity-50"
                          title="تحسين النص"
                        >
                          <FaMagic />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAI('translate', section.title.ar, 'ar', 'en', sectionIndex, undefined, 'title')}
                          disabled={loading !== null || !section.title.ar}
                          className="px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-50"
                          title="ترجمة تلقائية"
                        >
                          <FaLanguage />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section Title (English)</label>
                      <div className="flex gap-2">
                        <input
                          value={section.title.en}
                          onChange={e => {
                            const newSections = [...sections];
                            newSections[sectionIndex].title.en = e.target.value;
                            setSections(newSections);
                          }}
                          className="flex-1 border-gray-300 rounded-md"
                          placeholder="e.g., Party Information"
                        />
                        <button
                          type="button"
                          onClick={() => handleAI('improve', section.title.en, 'en', undefined, sectionIndex, undefined, 'title')}
                          disabled={loading !== null || !section.title.en}
                          className="px-3 py-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 disabled:opacity-50"
                          title="Improve text"
                        >
                          <FaMagic />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* البنود */}
                  <div className="space-y-3">
                    {section.clauses.map((clause, clauseIndex) => (
                      <div key={clauseIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex gap-2 mb-1">
                            <label className="block text-sm font-medium text-gray-700 flex-1">البند {clauseIndex + 1} (عربي)</label>
                            {section.clauses.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeClause(sectionIndex, clauseIndex)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                حذف
                              </button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <textarea
                              value={clause.ar}
                              onChange={e => {
                                const newSections = [...sections];
                                newSections[sectionIndex].clauses[clauseIndex].ar = e.target.value;
                                setSections(newSections);
                              }}
                              rows={2}
                              className="flex-1 border-gray-300 rounded-md"
                              placeholder="اكتب البند بالعربية..."
                            />
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => handleAI('correct', clause.ar, 'ar', undefined, sectionIndex, clauseIndex, 'clause')}
                                disabled={loading !== null || !clause.ar}
                                className="px-2 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 disabled:opacity-50 text-xs relative"
                                title="تصحيح تلقائي"
                              >
                                {loading === `correct-${sectionIndex}-${clauseIndex}-clause` ? (
                                  <span className="animate-spin">⏳</span>
                                ) : (
                                  <FaSpellCheck />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAI('improve', clause.ar, 'ar', undefined, sectionIndex, clauseIndex, 'clause')}
                                disabled={loading !== null || !clause.ar}
                                className="px-2 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 disabled:opacity-50 text-xs relative"
                                title="تحسين النص"
                              >
                                {loading === `improve-${sectionIndex}-${clauseIndex}-clause` ? (
                                  <span className="animate-spin">⏳</span>
                                ) : (
                                  <FaMagic />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAI('translate', clause.ar, 'ar', 'en', sectionIndex, clauseIndex, 'clause')}
                                disabled={loading !== null || !clause.ar}
                                className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-50 text-xs relative"
                                title="ترجمة تلقائية"
                              >
                                {loading === `translate-${sectionIndex}-${clauseIndex}-clause` ? (
                                  <span className="animate-spin">⏳</span>
                                ) : (
                                  <FaLanguage />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Clause {clauseIndex + 1} (English)</label>
                          <div className="flex gap-2">
                            <textarea
                              value={clause.en}
                              onChange={e => {
                                const newSections = [...sections];
                                newSections[sectionIndex].clauses[clauseIndex].en = e.target.value;
                                setSections(newSections);
                              }}
                              rows={2}
                              className="flex-1 border-gray-300 rounded-md"
                              placeholder="Write the clause in English..."
                            />
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => handleAI('correct', clause.en, 'en', undefined, sectionIndex, clauseIndex, 'clause')}
                                disabled={loading !== null || !clause.en}
                                className="px-2 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 disabled:opacity-50 text-xs"
                                title="Auto correct"
                              >
                                <FaSpellCheck />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAI('improve', clause.en, 'en', undefined, sectionIndex, clauseIndex, 'clause')}
                                disabled={loading !== null || !clause.en}
                                className="px-2 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 disabled:opacity-50 text-xs"
                                title="Improve text"
                              >
                                <FaMagic />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addClause(sectionIndex)}
                      className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                    >
                      + إضافة بند جديد
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* زر الحفظ */}
            <div className="flex justify-end gap-4">
              <InstantLink
                href="/contracts/templates"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                إلغاء
              </InstantLink>
              <button
                type="submit"
                disabled={loading !== null}
                className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <FaSave className="ml-2" />
                حفظ القالب
              </button>
            </div>

            {status && (
              <div className={`p-3 rounded-md text-sm ${
                status.includes('نجاح') 
                  ? 'bg-green-50 text-green-700' 
                  : status.includes('خطأ') || status.includes('configure')
                  ? 'bg-red-50 text-red-700'
                  : 'bg-yellow-50 text-yellow-700'
              }`}>
                {status}
                {status.includes('configure') && (
                  <div className="mt-2 text-xs">
                    <p>يرجى إضافة GEMINI_API_KEY في ملف .env.local:</p>
                    <code className="block mt-1 p-2 bg-gray-100 rounded">GEMINI_API_KEY=your_api_key_here</code>
                  </div>
                )}
              </div>
            )}
          </form>
        </main>
      </div>
    </>
  );
};

export default NewTemplatePage;
