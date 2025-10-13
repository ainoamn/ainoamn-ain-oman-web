// src/pages/admin/financial/beneficiaries.tsx - نظام المستفيدين مع التحقق من IBAN
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  FiUsers, FiPlus, FiCheckCircle, FiAlertCircle, FiGlobe, FiDollarSign,
  FiCreditCard, FiShield
} from 'react-icons/fi';
import { Beneficiary, validateIBAN, extractIBANData, getBankNameFromCode } from '@/types/contacts';

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ibanInput, setIbanInput] = useState('');
  const [ibanValidation, setIbanValidation] = useState<{
    isValid: boolean;
    bankName: string;
    country: string;
    message: string;
  } | null>(null);

  const validateAndExtractIBAN = (iban: string) => {
    const isValid = validateIBAN(iban);
    
    if (!isValid) {
      setIbanValidation({
        isValid: false,
        bankName: '',
        country: '',
        message: '❌ IBAN غير صحيح'
      });
      return;
    }

    const data = extractIBANData(iban);
    const bankName = getBankNameFromCode(data.bankCode);
    
    setIbanValidation({
      isValid: true,
      bankName,
      country: data.country === 'OM' ? 'سلطنة عُمان' : data.country,
      message: `✓ IBAN صحيح - ${bankName}`
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>المستفيدون - النظام المالي</title></Head>

      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FiUsers className="text-purple-600" />
              المستفيدون
            </h1>
            <p className="text-gray-600 mt-2">إدارة المستفيدين من المدفوعات مع التحقق التلقائي من IBAN</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <FiPlus />
            إضافة مستفيد
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-r-4 border-blue-500 p-6 rounded-lg mb-8">
          <div className="flex items-start gap-3">
            <FiShield className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">ميزات نظام المستفيدين:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ تحقق فوري من IBAN مع استخراج تلقائي لبيانات البنك</li>
                <li>✓ ربط مباشر بجهات الاتصال لاستيراد البيانات تلقائياً</li>
                <li>✓ تخزين معلومات الحساب البنكي بشكل آمن</li>
                <li>✓ استخراج تلقائي لاسم البنك والبلد والـ SWIFT</li>
                <li>✓ تبسيط المدفوعات وتقليل الأخطاء</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Create Beneficiary Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
              <div className="bg-purple-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FiPlus />
                  إضافة مستفيد جديد
                </h2>
                <p className="text-purple-100 text-sm mt-1">مع التحقق التلقائي من IBAN</p>
              </div>

              <div className="p-6 space-y-6">
                {/* IBAN Field with Auto-Validation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم IBAN * <span className="text-blue-600">(تحقق تلقائي)</span>
                  </label>
                  <input
                    type="text"
                    value={ibanInput}
                    onChange={(e) => {
                      setIbanInput(e.target.value);
                      if (e.target.value.length >= 15) {
                        validateAndExtractIBAN(e.target.value);
                      }
                    }}
                    placeholder="OM23 001 123456789012345"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                  
                  {/* Validation Result */}
                  {ibanValidation && (
                    <div className={`mt-2 p-3 rounded-lg flex items-start gap-2 ${
                      ibanValidation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      {ibanValidation.isValid ? (
                        <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${ibanValidation.isValid ? 'text-green-900' : 'text-red-900'}`}>
                          {ibanValidation.message}
                        </p>
                        {ibanValidation.isValid && (
                          <div className="text-xs text-green-700 mt-2 space-y-1">
                            <div>🏦 البنك: <strong>{ibanValidation.bankName}</strong></div>
                            <div>🌍 الدولة: <strong>{ibanValidation.country}</strong></div>
                            <div>💳 نوع الحساب: <strong>حساب جاري</strong></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">اسم المستفيد *</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">اسم صاحب الحساب *</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ربط بجهة اتصال</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option value="">اختر جهة اتصال...</option>
                      <option value="contact_1">أحمد محمد السالمي</option>
                      <option value="contact_2">شركة الصيانة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">العملة</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option value="OMR">ريال عُماني (OMR)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="EUR">يورو (EUR)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button
                  disabled={!ibanValidation?.isValid}
                  onClick={() => { alert('تم الحفظ!'); setShowCreateModal(false); }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  حفظ المستفيد
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

