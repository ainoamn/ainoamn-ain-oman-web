// src/pages/owners/management.tsx - صفحة إدارة الملاك
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  FaUser, FaUsers, FaEnvelope, FaPhone, FaIdCard,
  FaEdit, FaTrash, FaKey, FaPlus, FaSpinner,
  FaCheckCircle, FaBuilding, FaEye
} from 'react-icons/fa';
import Layout from '@/components/layout/Layout';
import AddOwnerModal from '@/components/owners/AddOwnerModal';
import InstantLink from '@/components/InstantLink';

interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  username?: string;
  role: string;
  status: string;
  ownerDetails?: {
    nationalId?: string;
    nationalIdExpiry?: string;
  };
  credentials?: {
    username?: string;
  };
  stats?: {
    properties?: number;
    units?: number;
  };
}

export default function OwnersManagement() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        const allUsers = Array.isArray(data.users) ? data.users : [];
        const ownersOnly = allUsers.filter(u => u.role === 'owner');
        setOwners(ownersOnly);
        console.log('✅ Fetched owners:', ownersOnly.length);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNewOwner = async (ownerData: any) => {
    try {
      setAddLoading(true);
      setError(null);
      
      const response = await fetch('/api/users/add-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ownerData)
      });
      
      if (response.ok) {
        const createdOwner = await response.json();
        await fetchOwners();
        setShowAddModal(false);
        alert(`✅ تم إضافة المالك بنجاح!\n\nاسم المستخدم: ${createdOwner.username}\nالرقم السري: ${createdOwner.password}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'فشل في إضافة المالك');
      }
    } catch (error) {
      console.error('Error adding owner:', error);
      setError('حدث خطأ أثناء إضافة المالك');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>إدارة الملاك - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 py-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <FaUsers className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2">إدارة الملاك</h1>
              <p className="text-sm opacity-90 mb-4">
                إدارة شاملة لجميع ملاك العقارات
              </p>
              
              {/* إحصائيات */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold">{owners.length}</div>
                  <div className="text-xs opacity-90">إجمالي الملاك</div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold">{owners.filter(o => o.status === 'active').length}</div>
                  <div className="text-xs opacity-90">نشط</div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold">
                    {owners.reduce((sum, o) => sum + (o.stats?.properties || 0), 0)}
                  </div>
                  <div className="text-xs opacity-90">عقارات</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              عرض {owners.length} مالك
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
            >
              <FaPlus className="w-4 h-4" />
              إضافة مالك جديد
            </button>
          </div>

          {/* قائمة الملاك */}
          {loading ? (
            <div className="text-center py-12">
              <FaSpinner className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">جاري التحميل...</p>
            </div>
          ) : owners.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <FaUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">لا يوجد ملاك</h3>
              <p className="text-gray-600 mb-6">ابدأ بإضافة مالك جديد</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FaPlus className="w-4 h-4" />
                إضافة مالك جديد
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {owners.map((owner) => (
                <motion.div
                  key={owner.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="w-16 h-16 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                        <FaUser className="w-8 h-8" />
                      </div>
                      <div className="w-full">
                        <h3 className="font-bold text-base truncate">{owner.name}</h3>
                        <p className="text-xs opacity-90">{owner.id}</p>
                        <div className="mt-2">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {owner.status === 'active' ? 'نشط' : 'غير نشط'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-3">
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-700">
                        <FaUser className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <span className="font-medium text-blue-600 truncate">
                          {owner.credentials?.username || owner.username || 'لم يُنشأ'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <FaEnvelope className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <span className="truncate flex-1">{owner.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <FaPhone className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <span className="flex-1">{owner.phone}</span>
                      </div>
                      {owner.ownerDetails?.nationalId && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaIdCard className="w-3 h-3 text-blue-500 flex-shrink-0" />
                          <span className="flex-1">{owner.ownerDetails.nationalId}</span>
                        </div>
                      )}
                      {(owner.stats?.properties || 0) > 0 && (
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <FaBuilding className="w-3 h-3 text-green-600" />
                            <span className="font-medium text-green-700">
                              {owner.stats?.properties || 0} عقار
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-200">
                      <button
                        className="flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="عرض التفاصيل"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      <button
                        className="flex items-center justify-center w-10 h-10 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        title="تعديل"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        className="flex items-center justify-center w-10 h-10 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                        title="كلمة المرور"
                      >
                        <FaKey className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal إضافة مالك */}
      <AddOwnerModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setError(null);
        }}
        onSubmit={addNewOwner}
        loading={addLoading}
        error={error}
      />
    </Layout>
  );
}

