import { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";

const ElectronicSignPage: NextPage = () => {
  const [contractId, setContractId] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSendForSign = async (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: ربط خدمة التوقيع الإلكتروني لاحقاً
    setStatus("تم إرسال العقد للتوقيع الإلكتروني بنجاح (تجريبي)");
  };

  return (
    <>
      <Head>
        <title>التوقيع الإلكتروني | Ain Oman</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">التوقيع الإلكتروني</h1>
            <p className="text-gray-600">أرسل العقد للتوقيع من المالك والمستأجر</p>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSendForSign} className="bg-white shadow sm:rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم العقد</label>
              <input value={contractId} onChange={e => setContractId(e.target.value)} className="w-full border-gray-300 rounded-md" placeholder="مثال: CNT-2025-001" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المالك</label>
                <input value={ownerName} onChange={e => setOwnerName(e.target.value)} className="w-full border-gray-300 rounded-md" placeholder="اسم المالك" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستأجر</label>
                <input value={tenantName} onChange={e => setTenantName(e.target.value)} className="w-full border-gray-300 rounded-md" placeholder="اسم المستأجر" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ملف العقد (PDF)</label>
              <input type="file" accept="application/pdf" className="w-full" />
              <p className="text-xs text-gray-500 mt-1">سيتم ربط خدمة التوقيع الإلكتروني لاحقاً (DocuSign/Adobe Sign).</p>
            </div>
            <div className="pt-2">
              <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                إرسال للتوقيع
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

export default ElectronicSignPage;


