// src/pages/tenants/management.tsx - صفحة إدارة المستأجرين الشاملة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  FaUser, FaUsers, FaEnvelope, FaPhone, FaIdCard,
  FaEdit, FaTrash, FaKey, FaCalendar, FaBell,
  FaSearch, FaFilter, FaPlus, FaSave, FaSpinner,
  FaExclamationTriangle, FaCheckCircle, FaTimesCircle,
  FaMapMarkerAlt, FaBriefcase, FaPassport, FaBuilding,
  FaGlobe, FaFlag, FaEye, FaEyeSlash
} from 'react-icons/fa';
import InstantLink from '@/components/InstantLink';
import Layout from '@/components/layout/Layout';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  password?: string;
  createdAt: string;
  tenantDetails?: {
    type: 'individual_omani' | 'individual_foreign' | 'company';
    fullName?: string;
    tribe?: string;
    nationalId?: string;
    nationalIdExpiry?: string;
    residenceId?: string;
    residenceIdExpiry?: string;
    passportNumber?: string;
    passportExpiry?: string;
    [key: string]: any;
  };
}

export default function TenantsManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [expiringDocuments, setExpiringDocuments] = useState<any[]>([]);

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    filterTenants();
  }, [tenants, searchQuery, filterStatus]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        const allUsers = Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []);
        const tenantsOnly = allUsers.filter(user => user.role === 'tenant');
        setTenants(tenantsOnly);
        setFilteredTenants(tenantsOnly);
        
        // فحص الوثائق المنتهية
        checkExpiringDocuments(tenantsOnly);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkExpiringDocuments = (tenantsList: Tenant[]) => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiring: any[] = [];

    tenantsList.forEach(tenant => {
      if (tenant.tenantDetails) {
        const details = tenant.tenantDetails;
        
        // فحص البطاقة الشخصية
        if (details.nationalIdExpiry) {
          const expiryDate = new Date(details.nationalIdExpiry);
          if (expiryDate < thirtyDaysFromNow) {
            expiring.push({
              tenantId: tenant.id,
              tenantName: tenant.name,
              documentType: 'البطاقة الشخصية',
              expiryDate: details.nationalIdExpiry,
              daysRemaining: Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
              isExpired: expiryDate < today
            });
          }
        }
        
        // فحص بطاقة الإقامة
        if (details.residenceIdExpiry) {
          const expiryDate = new Date(details.residenceIdExpiry);
          if (expiryDate < thirtyDaysFromNow) {
            expiring.push({
              tenantId: tenant.id,
              tenantName: tenant.name,
              documentType: 'بطاقة الإقامة',
              expiryDate: details.residenceIdExpiry,
              daysRemaining: Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
              isExpired: expiryDate < today
            });
          }
        }
        
        // فحص جواز السفر
        if (details.passportExpiry) {
          const expiryDate = new Date(details.passportExpiry);
          if (expiryDate < thirtyDaysFromNow) {
            expiring.push({
              tenantId: tenant.id,
              tenantName: tenant.name,
              documentType: 'جواز السفر',
              expiryDate: details.passportExpiry,
              daysRemaining: Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
              isExpired: expiryDate < today
            });
          }
        }
      }
    });

    setExpiringDocuments(expiring);
  };

  const filterTenants = () => {
    let filtered = [...tenants];

    // فلترة حسب الحالة
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // فلترة حسب البحث
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.email.toLowerCase().includes(query) ||
        t.phone.includes(query) ||
        t.id.toLowerCase().includes(query)
      );
    }

    setFilteredTenants(filtered);
  };

  const getTenantTypeLabel = (type: string) => {
    switch (type) {
      case 'individual_omani': return '🇴🇲 عماني';
      case 'individual_foreign': return '🌍 وافد';
      case 'company': return '🏢 شركة';
      default: return 'غير محدد';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">نشط</span>;
      case 'inactive':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">غير نشط</span>;
      case 'suspended':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">موقوف</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <Layout>
      <Head>
        <title>إدارة المستأجرين - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <FaUsers className="w-12 h-12" />
              </div>
              <h1 className="text-4xl font-bold mb-4">إدارة المستأجرين</h1>
              <p className="text-xl opacity-90 mb-6">
                إدارة شاملة لجميع المستأجرين والوثائق والتنبيهات
              </p>
              
              {/* إحصائيات سريعة */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold">{tenants.length}</div>
                  <div className="text-sm opacity-90">إجمالي المستأجرين</div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold">{tenants.filter(t => t.status === 'active').length}</div>
                  <div className="text-sm opacity-90">نشط</div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold">{expiringDocuments.filter(d => !d.isExpired).length}</div>
                  <div className="text-sm opacity-90">وثائق قريبة الانتهاء</div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold text-red-200">{expiringDocuments.filter(d => d.isExpired).length}</div>
                  <div className="text-sm opacity-90">وثائق منتهية</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* تنبيهات الوثائق المنتهية */}
          {expiringDocuments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <FaBell className="w-6 h-6" />
                  <h3 className="text-xl font-bold">تنبيهات هامة</h3>
                  <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-sm">
                    {expiringDocuments.length} تنبيه
                  </span>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {expiringDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className={`bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 ${
                        doc.isExpired ? 'border-2 border-red-300' : 'border border-white border-opacity-30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">{doc.tenantName}</div>
                          <div className="text-sm opacity-90">{doc.documentType}</div>
                        </div>
                        <div className="text-left">
                          {doc.isExpired ? (
                            <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold">
                              منتهي ❌
                            </span>
                          ) : (
                            <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                              ينتهي خلال {doc.daysRemaining} يوم
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* البحث والفلترة */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaSearch className="inline ml-2" />
                  بحث عن مستأجر
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="ابحث بالاسم، البريد، الهاتف، أو الرقم..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaFilter className="inline ml-2" />
                  تصفية حسب الحالة
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="suspended">موقوف</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                عرض {filteredTenants.length} من {tenants.length} مستأجر
              </div>
              <InstantLink
                href="/rentals/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
              >
                <FaPlus className="w-4 h-4" />
                إضافة عقد جديد
              </InstantLink>
            </div>
          </div>

          {/* قائمة المستأجرين */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="w-8 h-8 text-purple-600 animate-spin" />
              <span className="mr-3 text-gray-600">جاري التحميل...</span>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FaUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'لا توجد نتائج' : 'لا يوجد مستأجرين'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'ابدأ بإضافة مستأجر جديد عبر صفحة العقود'}
              </p>
              <InstantLink
                href="/rentals/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <FaPlus className="w-4 h-4" />
                إضافة عقد جديد
              </InstantLink>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTenants.map((tenant) => (
                <motion.div
                  key={tenant.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                >
                  {/* Header - Compact */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="w-16 h-16 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                        <FaUser className="w-8 h-8" />
                      </div>
                      <div className="w-full">
                        <h3 className="font-bold text-base truncate">{tenant.name}</h3>
                        <p className="text-xs opacity-90">{tenant.id}</p>
                        <div className="mt-2">
                          {getStatusBadge(tenant.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body - Compact */}
                  <div className="p-3">
                    <div className="space-y-2">
                      {/* البيانات الأساسية */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaEnvelope className="w-3 h-3 text-purple-500 flex-shrink-0" />
                          <span className="truncate flex-1">{tenant.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaPhone className="w-3 h-3 text-purple-500 flex-shrink-0" />
                          <span className="flex-1">{tenant.phone}</span>
                        </div>
                        
                        {/* نوع المستأجر */}
                        {tenant.tenantDetails?.type && (
                          <div className="pt-1">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              tenant.tenantDetails.type === 'individual_omani' ? 'bg-green-100 text-green-800' :
                              tenant.tenantDetails.type === 'individual_foreign' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {getTenantTypeLabel(tenant.tenantDetails.type)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* تنبيهات الوثائق - Compact */}
                      {expiringDocuments.filter(d => d.tenantId === tenant.id).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-center gap-1">
                            <FaExclamationTriangle className="w-3 h-3 text-orange-500" />
                            <span className="text-xs font-medium text-orange-600">
                              {expiringDocuments.filter(d => d.tenantId === tenant.id).length} تنبيه
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* حالة الاعتماد - Compact */}
                    {tenant.status === 'pending_approval' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-yellow-800">
                            <FaExclamationTriangle className="w-4 h-4" />
                            بانتظار الاعتماد
                          </div>
                          <div className="mt-2 space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              {tenant.credentials?.ownerApproved ? (
                                <FaCheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <FaTimesCircle className="w-4 h-4 text-gray-400" />
                              )}
                              <span>اعتماد المالك</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {tenant.credentials?.tenantApproved ? (
                                <FaCheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <FaTimesCircle className="w-4 h-4 text-gray-400" />
                              )}
                              <span>توقيع المستأجر</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {tenant.credentials?.adminApproved ? (
                                <FaCheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <FaTimesCircle className="w-4 h-4 text-gray-400" />
                              )}
                              <span>موافقة الإدارة</span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={async () => {
                            if (confirm('هل تريد اعتماد هذا المستأجر كمسؤول؟')) {
                              const response = await fetch('/api/tenants/approve', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  tenantId: tenant.id,
                                  approvalType: 'admin',
                                  approvedBy: 'ADMIN'
                                })
                              });
                              if (response.ok) {
                                alert('تم الاعتماد بنجاح!');
                                window.location.reload();
                              }
                            }
                          }}
                          className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium"
                        >
                          <FaCheckCircle className="w-3 h-3" />
                          اعتماد
                        </button>
                      </div>
                    )}
                    
                    {/* زر إرسال بيانات الدخول - Compact */}
                    {tenant.status === 'active' && !tenant.credentials?.sentViaWhatsApp && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={async () => {
                              if (confirm(`إرسال بيانات الدخول إلى ${tenant.name} عبر الواتساب والبريد؟`)) {
                                const response = await fetch('/api/tenants/send-credentials', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    tenantId: tenant.id,
                                    method: 'both' // whatsapp + email
                                  })
                                });
                                if (response.ok) {
                                  const data = await response.json();
                                  
                                  // فتح الواتساب مباشرة
                                  if (data.whatsappUrl) {
                                    window.open(data.whatsappUrl, '_blank');
                                  }
                                  
                                  alert(`✅ تم التحضير!\n\nاسم المستخدم: ${data.credentials.username}\n\nتم فتح الواتساب - أرسل الرسالة الآن!`);
                                  window.location.reload();
                                }
                              }
                            }}
                            className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all text-xs font-medium"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            إرسال للواتساب
                          </button>
                      </div>
                    )}
                    
                    {/* بعد الإرسال - Compact */}
                    {tenant.credentials?.sentViaWhatsApp && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-xs font-medium text-green-800">
                            <FaCheckCircle className="w-3 h-3" />
                            تم الإرسال ✓
                          </div>
                        </div>
                      </div>
                    )}

                    {/* أزرار الإجراءات - Compact Icons */}
                    <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setShowEditModal(true);
                        }}
                        className="flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="تعديل"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setShowPasswordModal(true);
                        }}
                        className="flex items-center justify-center w-10 h-10 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                        title="كلمة المرور"
                      >
                        <FaKey className="w-4 h-4" />
                      </button>
                      
                      <button
                        className="flex items-center justify-center w-10 h-10 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="حذف"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEditModal && selectedTenant && (
        <EditTenantModal
          tenant={selectedTenant}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTenant(null);
          }}
          onSave={() => {
            fetchTenants();
            setShowEditModal(false);
            setSelectedTenant(null);
          }}
        />
      )}

      {showPasswordModal && selectedTenant && (
        <PasswordModal
          tenant={selectedTenant}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedTenant(null);
          }}
        />
      )}
    </Layout>
  );
}

// Component لتعديل بيانات المستأجر
function EditTenantModal({ tenant, onClose, onSave }: any) {
  const [formData, setFormData] = useState(tenant);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users?id=${tenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        onSave();
      }
    } catch (error) {
      console.error('Error updating tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">تعديل بيانات المستأجر</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="suspended">موقوف</option>
            </select>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            حفظ التعديلات
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Component لتغيير كلمة المرور
function PasswordModal({ tenant, onClose }: any) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/users?id=${tenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      
      if (response.ok) {
        alert('تم تغيير كلمة المرور بنجاح');
        onClose();
      }
    } catch (error) {
      setError('حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="p-6 border-b border-gray-200 bg-purple-50">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaKey className="text-purple-600" />
            تغيير كلمة المرور
          </h3>
          <p className="text-sm text-gray-600 mt-1">لـ: {tenant.name}</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="أدخل كلمة المرور الجديدة"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="أعد إدخال كلمة المرور"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <FaBell className="inline ml-2" />
            سيتم إرسال كلمة المرور الجديدة إلى البريد الإلكتروني: {tenant.email}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            إلغاء
          </button>
          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaKey />}
            تغيير كلمة المرور
          </button>
        </div>
      </motion.div>
    </div>
  );
}

