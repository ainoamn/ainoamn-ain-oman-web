import { NextPage } from "next";
import Head from "next/head";
import InstantLink from "@/components/InstantLink";
import { useState, useEffect } from "react";
import { FaFileContract, FaFileAlt, FaEnvelope, FaLink, FaUnlink } from "react-icons/fa";

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'contracts' | 'requests' | 'letters';
  type: string;
  usageTypes: string[];
  linkedProperties?: string[];
  linkedUnits?: string[];
  linkedUsageTypes?: string[];
}

const ContractTemplatesPage: NextPage = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/contract-templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
        if (data.templates?.length > 0) {
          setSelectedTemplate(data.templates[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'جميع القوالب', icon: FaFileContract },
    { id: 'contracts', name: 'العقود', icon: FaFileContract },
    { id: 'requests', name: 'الطلبات', icon: FaFileAlt },
    { id: 'letters', name: 'الرسائل', icon: FaEnvelope }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || FaFileContract;
  };

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
        <title>قوالب العقود والطلبات | Ain Oman</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">قوالب العقود والطلبات</h1>
                <p className="text-gray-600">اختر قالباً لبدء إنشاء عقد أو طلب جديد</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="border border-gray-300 rounded-md text-sm px-2 py-2 bg-white"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <InstantLink
                  href={`/rentals/new?template=${encodeURIComponent(selectedTemplate)}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  ابدأ الآن
                </InstantLink>
                <InstantLink
                  href="/contracts/templates/new"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  إنشاء قالب جديد
                </InstantLink>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* التصنيفات */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon />
                  {cat.name}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري تحميل القوالب...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600">لا توجد قوالب في هذا التصنيف</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => {
                const CategoryIcon = getCategoryIcon(template.category);
                return (
                  <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="text-blue-600" />
                        <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                      </div>
                      <InstantLink
                        href={`/contracts/templates/${template.id}`}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        معاينة
                      </InstantLink>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                    {/* أنواع الاستخدام */}
                    {template.usageTypes && template.usageTypes.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {template.usageTypes.map(type => (
                            <span key={type} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                              {getUsageTypeLabel(type)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* روابط العقارات/الوحدات */}
                    {(template.linkedProperties?.length || template.linkedUnits?.length) ? (
                      <div className="mb-4 text-xs text-gray-500">
                        <FaLink className="inline ml-1" />
                        مرتبط بـ {template.linkedProperties?.length || 0} عقار
                        {template.linkedUnits?.length ? ` و ${template.linkedUnits.length} وحدة` : ''}
                      </div>
                    ) : null}

                    <div className="flex gap-2">
                      <InstantLink
                        href={`/rentals/new?template=${template.id}`}
                        className="flex-1 text-center px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                      >
                        استخدام القالب
                      </InstantLink>
                      <InstantLink
                        href={`/contracts/templates/${template.id}/link`}
                        className="px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
                        title="ربط القالب بعقار أو وحدة"
                      >
                        <FaLink />
                      </InstantLink>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default ContractTemplatesPage;
