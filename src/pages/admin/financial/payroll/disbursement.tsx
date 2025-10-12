// src/pages/admin/financial/payroll/disbursement.tsx - صرف الرواتب
import React, { useState } from 'react';
import Head from 'next/head';
import { FiDollarSign, FiPlay, FiCheckCircle } from 'react-icons/fi';

export default function PayrollDisbursementPage() {
  const [processing, setProcessing] = useState(false);

  const handleDisbursement = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      alert('تم صرف رواتب 45 موظف بنجاح!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>صرف الرواتب</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-8">
          <FiDollarSign className="text-green-600" />
          صرف الرواتب
        </h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center py-8">
            <FiDollarSign className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <p className="text-gray-900 font-bold text-xl mb-2">رواتب شهر أكتوبر 2025</p>
            <p className="text-gray-600 mb-2">45 موظف • إجمالي: 62,100 ر.ع</p>
            <p className="text-sm text-gray-500 mb-6">الحالة: جاهزة للصرف</p>
            
            <button
              onClick={handleDisbursement}
              disabled={processing}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  جاري الصرف...
                </>
              ) : (
                <>
                  <FiCheckCircle />
                  صرف الرواتب الآن
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
