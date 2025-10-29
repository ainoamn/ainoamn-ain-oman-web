import { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";

const NewTemplatePage: NextPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sectionsText, setSectionsText] = useState("بيانات الأطراف\nبيانات الوحدة\nالمدة والقيمة\nالالتزامات\nالتوقيعات");
  const [status, setStatus] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: يمكن ربط API لحفظ القوالب لاحقاً
    setStatus("تم حفظ القالب تجريبياً (سيتم ربط التخزين لاحقاً)");
  };

  return (
    <>
      <Head>
        <title>إنشاء قالب عقد | Ain Oman</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">إنشاء قالب عقد جديد</h1>
            <p className="text-gray-600">عرّف بنية القالب والبنود الأساسية.</p>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSave} className="bg-white shadow sm:rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم القالب</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full border-gray-300 rounded-md" placeholder="مثال: عقد إيجار سكني" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وصف مختصر</label>
              <input value={description} onChange={e => setDescription(e.target.value)} className="w-full border-gray-300 rounded-md" placeholder="وصف القالب" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">بنود القالب (سطر لكل بند)</label>
              <textarea value={sectionsText} onChange={e => setSectionsText(e.target.value)} rows={8} className="w-full border-gray-300 rounded-md" />
            </div>
            <div className="pt-2">
              <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                حفظ القالب
              </button>
            </div>
            {status && (
              <div className="text-green-700 bg-green-50 border border-green-200 rounded-md p-3 text-sm">{status}</div>
            )}
          </form>
        </main>
      </div>
    </>
  );
};

export default NewTemplatePage;


