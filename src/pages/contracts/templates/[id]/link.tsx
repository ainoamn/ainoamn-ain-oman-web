import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import InstantLink from "@/components/InstantLink";

const LinkTemplatePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  
  const [template, setTemplate] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedUsageType, setSelectedUsageType] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const getText = (obj: any, lang: 'ar' | 'en' = 'ar'): string => {
    if (typeof obj === 'string') return obj;
    if (obj && typeof obj === 'object') {
      return obj[lang] || obj.ar || obj.en || '';
    }
    return '';
  };

  useEffect(() => {
    if (id) {
      loadTemplate();
      loadProperties();
    }
  }, [id]);

  const loadTemplate = async () => {
    try {
      const res = await fetch(`/api/contract-templates/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTemplate(data.template);
        setSelectedUsageType(data.template?.linkedUsageTypes?.[0] || '');
      }
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const res = await fetch('/api/properties?mine=true');
      if (res.ok) {
        const data = await res.json();
        setProperties(data.items || []);
        
        // Load units from properties
        const allUnits: any[] = [];
        (data.items || []).forEach((prop: any) => {
          if (prop.units && Array.isArray(prop.units)) {
            prop.units.forEach((unit: any) => {
              allUnits.push({ ...unit, propertyId: prop.id, propertyName: prop.titleAr });
            });
          }
        });
        setUnits(allUnits);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const handleLink = async () => {
    try {
      setStatus(null);
      const updates: any = {};

      if (selectedProperty) {
        updates.linkProperty = selectedProperty;
      }
      if (selectedUnit) {
        updates.linkUnit = selectedUnit;
      }
      if (selectedUsageType) {
        updates.linkUsageType = selectedUsageType;
      }

      const res = await fetch(`/api/contract-templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        setStatus('تم ربط القالب بنجاح');
        loadTemplate();
      } else {
        setStatus('فشل ربط القالب');
      }
    } catch (error) {
      setStatus('حدث خطأ أثناء ربط القالب');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">القالب غير موجود</h1>
          <InstantLink href="/contracts/templates" className="px-4 py-2 bg-blue-600 text-white rounded-md">العودة للقوالب</InstantLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>ربط القالب - {template.name} | Ain Oman</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ربط القالب</h1>
                <p className="text-gray-600">{getText(template?.name)}</p>
              </div>
              <InstantLink
                href="/contracts/templates"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm"
              >
                العودة
              </InstantLink>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow sm:rounded-lg p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ربط بعقار محدد
              </label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full border-gray-300 rounded-md"
              >
                <option value="">اختر عقاراً (اختياري)</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.titleAr || p.id}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ربط بوحدة محددة
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full border-gray-300 rounded-md"
              >
                <option value="">اختر وحدة (اختياري)</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.propertyName} - {u.unitNumber || u.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ربط بنوع استخدام
              </label>
              <select
                value={selectedUsageType}
                onChange={(e) => setSelectedUsageType(e.target.value)}
                className="w-full border-gray-300 rounded-md"
              >
                <option value="">اختر نوع الاستخدام (اختياري)</option>
                <option value="residential">سكني</option>
                <option value="commercial">تجاري</option>
                <option value="industrial">صناعي</option>
              </select>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={handleLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                حفظ الربط
              </button>
            </div>

            {status && (
              <div className={`p-3 rounded-md text-sm ${
                status.includes('نجاح') 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {status}
              </div>
            )}

            {/* عرض الروابط الحالية */}
            {(template.linkedProperties?.length || template.linkedUnits?.length || template.linkedUsageTypes?.length) && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-2">الروابط الحالية:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {template.linkedProperties?.map((pId: string) => {
                    const prop = properties.find(p => p.id === pId);
                    return prop ? <li key={pId}>• عقار: {prop.titleAr || pId}</li> : null;
                  })}
                  {template.linkedUnits?.map((uId: string) => {
                    const unit = units.find(u => u.id === uId);
                    return unit ? <li key={uId}>• وحدة: {unit.propertyName} - {unit.unitNumber || uId}</li> : null;
                  })}
                  {template.linkedUsageTypes?.map((type: string) => (
                    <li key={type}>• نوع استخدام: {type === 'residential' ? 'سكني' : type === 'commercial' ? 'تجاري' : 'صناعي'}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default LinkTemplatePage;

