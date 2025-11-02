import { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import InstantLink from "@/components/InstantLink";
import ContractDisplay from "@/components/contracts/ContractDisplay";
import { FaArrowLeft, FaFileContract, FaPrint, FaDownload, FaSave } from "react-icons/fa";

interface Template {
  id: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  category: string;
  type: string;
  usageTypes: string[];
}

interface Property {
  id: string;
  address?: string;
  buildingNumber?: string;
  [key: string]: any;
}

interface Unit {
  id: string;
  unitNumber?: string;
  [key: string]: any;
}

interface Tenant {
  id: string;
  name?: string;
  email?: string;
  [key: string]: any;
}

const CreateContractPage: NextPage = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [contractData, setContractData] = useState<Record<string, any>>({});
  const [generatedContract, setGeneratedContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Template, 2: Fill Data, 3: Review

  useEffect(() => {
    loadTemplates();
    loadProperties();
    loadTenants();
  }, []);

  // قراءة القالب من URL - منفصل عن useEffect الرئيسي
  useEffect(() => {
    if (router.isReady && router.query.template) {
      const templateId = String(router.query.template);
      setSelectedTemplate(templateId);
      setStep(2);
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (selectedProperty) {
      loadUnits(selectedProperty);
    }
  }, [selectedProperty]);

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/contract-templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadProperties = async () => {
    try {
      const res = await fetch('/api/properties?mine=true');
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || data || []);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const loadUnits = async (propertyId: string) => {
    try {
      const res = await fetch(`/api/properties/${propertyId}`);
      if (res.ok) {
        const data = await res.json();
        const property = data.property || data;
        if (property.units && Array.isArray(property.units)) {
          setUnits(property.units);
        } else {
          setUnits([]);
        }
      }
    } catch (error) {
      console.error('Error loading units:', error);
      setUnits([]);
    }
  };

  const loadTenants = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        const users = data.users || data || [];
        // تصفية المستأجرين فقط
        const tenantUsers = users.filter((u: any) => 
          u.role === 'tenant' || u.role === 'مستأجر'
        );
        setTenants(tenantUsers);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      alert('يرجى اختيار قالب');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contracts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate,
          propertyId: selectedProperty || undefined,
          unitId: selectedUnit || undefined,
          tenantId: selectedTenant || undefined,
          contractData: contractData
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedContract(data.contract);
        setStep(3);
      } else {
        const error = await res.json();
        alert(`خطأ: ${error.message || 'فشل توليد العقد'}`);
      }
    } catch (error) {
      console.error('Error generating contract:', error);
      alert('حدث خطأ أثناء توليد العقد');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!generatedContract) return;
    
    const content = JSON.stringify(generatedContract, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-${generatedContract.contractData?.contractNumber || Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Head>
        <title>إنشاء عقد من قالب | Ain Oman</title>
        <link rel="stylesheet" href="/styles/contracts.css" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">إنشاء عقد من قالب</h1>
                <p className="text-gray-600">اختر قالباً واملأ البيانات لتوليد العقد</p>
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
          {step === 1 && (
            <div className="bg-white shadow sm:rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">الخطوة 1: اختيار القالب</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setStep(2);
                    }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FaFileContract className="text-blue-600" />
                      <h3 className="font-medium text-gray-900">{template.name.ar}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{template.name.en}</p>
                    <p className="text-xs text-gray-400 mt-1">{template.description.ar}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-white shadow sm:rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">الخطوة 2: ملء البيانات</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* اختيار العقار */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العقار</label>
                    <select
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      className="w-full border-gray-300 rounded-md"
                    >
                      <option value="">اختر العقار</option>
                      {properties.map(prop => (
                        <option key={prop.id} value={prop.id}>
                          {prop.buildingNumber || prop.address || prop.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* اختيار الوحدة */}
                  {selectedProperty && units.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الوحدة</label>
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="w-full border-gray-300 rounded-md"
                      >
                        <option value="">اختر الوحدة</option>
                        {units.map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.unitNumber || unit.serialNumber || unit.id}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* اختيار المستأجر */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المستأجر</label>
                    <select
                      value={selectedTenant}
                      onChange={(e) => setSelectedTenant(e.target.value)}
                      className="w-full border-gray-300 rounded-md"
                    >
                      <option value="">اختر المستأجر</option>
                      {tenants.map(tenant => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name || tenant.email || tenant.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* بيانات العقد */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم العقد</label>
                    <input
                      type="text"
                      value={contractData.contractNumber || ''}
                      onChange={(e) => setContractData({ ...contractData, contractNumber: e.target.value })}
                      className="w-full border-gray-300 rounded-md"
                      placeholder="سيتم توليده تلقائياً"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء</label>
                    <input
                      type="date"
                      value={contractData.startDate || ''}
                      onChange={(e) => setContractData({ ...contractData, startDate: e.target.value })}
                      className="w-full border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
                    <input
                      type="date"
                      value={contractData.endDate || ''}
                      onChange={(e) => setContractData({ ...contractData, endDate: e.target.value })}
                      className="w-full border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الإيجار الشهري (ريال عماني)</label>
                    <input
                      type="number"
                      value={contractData.monthlyRent || ''}
                      onChange={(e) => setContractData({ ...contractData, monthlyRent: e.target.value })}
                      className="w-full border-gray-300 rounded-md"
                      placeholder="0.000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ التأمين (ريال عماني)</label>
                    <input
                      type="number"
                      value={contractData.securityDeposit || ''}
                      onChange={(e) => setContractData({ ...contractData, securityDeposit: e.target.value })}
                      className="w-full border-gray-300 rounded-md"
                      placeholder="0.000"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    رجوع
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'جاري التوليد...' : 'توليد العقد'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && generatedContract && (
            <div className="space-y-6">
              <div className="bg-white shadow sm:rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">العقد المُولد</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                    >
                      <FaPrint className="ml-2" />
                      طباعة
                    </button>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                    >
                      <FaDownload className="ml-2" />
                      تحميل
                    </button>
                  </div>
                </div>

                {/* عرض العقد */}
                <div className="print-area">
                  <ContractDisplay 
                    contract={generatedContract} 
                    showCompanyHeader={true}
                    className="bilingual-contract"
                  />
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    رجوع
                  </button>
                  <button
                    onClick={() => {
                      // TODO: حفظ العقد في قاعدة البيانات
                      alert('تم حفظ العقد بنجاح');
                    }}
                    className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <FaSave className="ml-2" />
                    حفظ العقد
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

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
      </div>
    </>
  );
};

export default CreateContractPage;

