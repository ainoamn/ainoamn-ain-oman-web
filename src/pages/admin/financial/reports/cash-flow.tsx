// Cash Flow - التدفقات النقدية
import React from 'react';
import Head from 'next/head';
import { FiActivity } from 'react-icons/fi';

export default function CashFlowPage() {
  const data = {
    operating: 48250, investing: -15000, financing: -8500,
    beginning: 35000, ending: 59750
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>قائمة التدفقات النقدية</title></Head>
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <FiActivity className="text-purple-600" />
        قائمة التدفقات النقدية
      </h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        <div>
          <h3 className="font-bold mb-2">التدفقات التشغيلية</h3>
          <div className="flex justify-between p-3 bg-green-50"><span>صافي التدفق</span><span className="font-bold text-green-600">{data.operating.toLocaleString()} ر.ع</span></div>
        </div>

        <div>
          <h3 className="font-bold mb-2">التدفقات الاستثمارية</h3>
          <div className="flex justify-between p-3 bg-red-50"><span>صافي التدفق</span><span className="font-bold text-red-600">({Math.abs(data.investing).toLocaleString()}) ر.ع</span></div>
        </div>

        <div>
          <h3 className="font-bold mb-2">التدفقات التمويلية</h3>
          <div className="flex justify-between p-3 bg-blue-50"><span>صافي التدفق</span><span className="font-bold text-blue-600">({Math.abs(data.financing).toLocaleString()}) ر.ع</span></div>
        </div>

        <div className="pt-4 border-t-2">
          <div className="flex justify-between p-2"><span>رصيد أول المدة</span><span>{data.beginning.toLocaleString()} ر.ع</span></div>
          <div className="flex justify-between p-2"><span>صافي التدفق</span><span>{(data.operating + data.investing + data.financing).toLocaleString()} ر.ع</span></div>
          <div className="flex justify-between p-3 bg-purple-100 font-bold text-lg"><span>رصيد آخر المدة</span><span>{data.ending.toLocaleString()} ر.ع</span></div>
        </div>
      </div>
    </div>
  );
}

