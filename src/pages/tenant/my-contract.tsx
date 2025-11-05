// src/pages/tenant/my-contract.tsx - صفحة عرض عقد الإيجار للمستأجر
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  FaFileContract, FaHome, FaCalendar, FaMoneyBillWave,
  FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaDownload, FaPrint, FaCheckCircle, FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';
import Layout from '@/components/layout/Layout';

interface Contract {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  unitNo?: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: string;
  ownerName: string;
  ownerPhone: string;
}

export default function TenantContractPage() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenantContract();
  }, []);

  const fetchTenantContract = async () => {
    try {
      setLoading(true);
      
      // الحصول على المستأجر الحالي (من localStorage أو session)
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const currentUser = JSON.parse(userStr);
        setTenant(currentUser);
        
        // جلب عقد الإيجار الخاص بالمستأجر
        const response = await fetch(`/api/rentals?tenantId=${currentUser.id}`);
        if (response.ok) {
          const data = await response.json();
          const contracts = Array.isArray(data.items) ? data.items : [];
          if (contracts.length > 0) {
            setContract(contracts[0]); // أول عقد
          }
        }
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <FaSpinner className="w-12 h-12 text-purple-600 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!tenant) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">يجب تسجيل الدخول أولاً</h2>
          </div>
        </div>
      </Layout>
    );
  }

  if (!contract) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="text-center">
            <FaFileContract className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">لا يوجد عقد إيجار حالياً</h2>
            <p className="text-gray-600">ستظهر تفاصيل عقدك هنا بعد اعتماده</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>عقد الإيجار - {tenant.name}</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Hero */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <FaFileContract className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-2">عقد الإيجار الخاص بك</h1>
              <p className="text-xl opacity-90">مرحباً {tenant.name}</p>
            </motion.div>
          </div>
        </div>

        {/* Contract Details */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* بطاقة العقد */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">عقد الإيجار رقم: {contract.id}</h2>
                  <p className="text-sm opacity-90 mt-1">تاريخ البداية: {new Date(contract.startDate).toLocaleDateString('ar', { timeZone: 'UTC' })}</p>
                </div>
                <div className="text-right">
                  <span className="bg-white bg-opacity-30 px-4 py-2 rounded-full text-sm font-medium">
                    {contract.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* معلومات العقار */}
                <div className="bg-blue-50 rounded-xl p-5">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <FaHome className="w-5 h-5" />
                    معلومات العقار
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">العنوان:</span>
                      <p className="text-gray-900 mt-1">{contract.propertyTitle}</p>
                      <p className="text-gray-600">{contract.propertyAddress}</p>
                    </div>
                    {contract.unitNo && (
                      <div>
                        <span className="text-blue-600 font-medium">رقم الوحدة:</span>
                        <p className="text-gray-900 mt-1">{contract.unitNo}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* معلومات المالك */}
                <div className="bg-green-50 rounded-xl p-5">
                  <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                    <FaUser className="w-5 h-5" />
                    معلومات المالك
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FaUser className="w-4 h-4 text-green-600" />
                      <span>{contract.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone className="w-4 h-4 text-green-600" />
                      <span>{contract.ownerPhone}</span>
                    </div>
                  </div>
                </div>

                {/* التواريخ */}
                <div className="bg-purple-50 rounded-xl p-5">
                  <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <FaCalendar className="w-5 h-5" />
                    فترة العقد
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-purple-600 font-medium">تاريخ البداية:</span>
                      <p className="text-gray-900 mt-1">{new Date(contract.startDate).toLocaleDateString('ar', { timeZone: 'UTC' })}</p>
                    </div>
                    <div>
                      <span className="text-purple-600 font-medium">تاريخ الانتهاء:</span>
                      <p className="text-gray-900 mt-1">{new Date(contract.endDate).toLocaleDateString('ar', { timeZone: 'UTC' })}</p>
                    </div>
                  </div>
                </div>

                {/* المبالغ المالية */}
                <div className="bg-orange-50 rounded-xl p-5">
                  <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                    <FaMoneyBillWave className="w-5 h-5" />
                    المبالغ المالية
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-orange-600 font-medium">الإيجار الشهري:</span>
                      <p className="text-gray-900 mt-1 text-lg font-bold">{contract.monthlyRent} ريال</p>
                    </div>
                    <div>
                      <span className="text-orange-600 font-medium">التأمين:</span>
                      <p className="text-gray-900 mt-1">{contract.deposit} ريال</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <FaDownload className="w-4 h-4" />
                  تحميل العقد (PDF)
                </button>
                
                <button 
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <FaPrint className="w-4 h-4" />
                  طباعة العقد
                </button>
                
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  <FaCheckCircle className="w-4 h-4" />
                  تأكيد الاستلام
                </button>
              </div>
            </div>
          </motion.div>

          {/* معلوماتي */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">معلوماتي الشخصية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <FaUser className="w-5 h-5 text-purple-600" />
                <div>
                  <span className="text-sm text-gray-600">الاسم:</span>
                  <p className="font-semibold">{tenant.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="w-5 h-5 text-purple-600" />
                <div>
                  <span className="text-sm text-gray-600">البريد:</span>
                  <p className="font-semibold">{tenant.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="w-5 h-5 text-purple-600" />
                <div>
                  <span className="text-sm text-gray-600">الهاتف:</span>
                  <p className="font-semibold">{tenant.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="w-5 h-5 text-purple-600" />
                <div>
                  <span className="text-sm text-gray-600">رقم التعريف:</span>
                  <p className="font-semibold">{tenant.id}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

