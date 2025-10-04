// src/pages/admin/maintenance/index.tsx - إدارة الصيانة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
// Icons replaced with emoji characters to avoid import issues
import Layout from '@/components/layout/Layout';

interface MaintenanceRequest {
  id: string;
  requestNumber: string;
  type: 'plumbing' | 'electrical' | 'hvac' | 'cleaning' | 'security' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  tenantId: string;
  tenantName: string;
  unitId: string;
  unitNumber: string;
  buildingId: string;
  buildingName: string;
  title: string;
  description: string;
  reportedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedCost: number;
  actualCost?: number;
  assignedTo?: string;
  assignedToName?: string;
  images: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceStats {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  totalCost: number;
  thisMonthRequests: number;
  thisMonthCost: number;
  averageCompletionTime: number;
}

export default function MaintenanceManagementPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [stats, setStats] = useState<MaintenanceStats>({
    totalRequests: 0,
    pendingRequests: 0,
    inProgressRequests: 0,
    completedRequests: 0,
    totalCost: 0,
    thisMonthRequests: 0,
    thisMonthCost: 0,
    averageCompletionTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadRequests();
    loadStats();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/admin/maintenance');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error loading maintenance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/maintenance/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || request.status === selectedStatus;
    const matchesType = !selectedType || request.type === selectedType;
    const matchesPriority = !selectedPriority || request.priority === selectedPriority;
    
    const matchesDateFrom = !dateFrom || new Date(request.reportedDate) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(request.reportedDate) <= new Date(dateTo);

    return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesDateFrom && matchesDateTo;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'plumbing': return 'سباكة';
      case 'electrical': return 'كهرباء';
      case 'hvac': return 'تكييف';
      case 'cleaning': return 'تنظيف';
      case 'security': return 'أمن';
      case 'other': return 'أخرى';
      default: return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'منخفض';
      case 'medium': return 'متوسط';
      case 'high': return 'عالي';
      case 'urgent': return 'عاجل';
      default: return priority;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR',
      maximumFractionDigits: 3
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-OM');
  };

  const getDaysSinceReported = (reportedDate: string) => {
    const days = Math.floor((new Date().getTime() - new Date(reportedDate).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>إدارة الصيانة - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">إدارة الصيانة</h1>
                <p className="mt-1 text-sm text-gray-500">
                  إدارة شاملة لطلبات الصيانة والإصلاحات
                </p>
              </div>
              <div className="flex space-x-3 rtl:space-x-reverse">
                <Link
                  href="/admin/maintenance/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span className="w-4 h-4 ml-2">➕</span>
                  إضافة طلب صيانة
                </Link>
                <button className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  <span className="w-4 h-4 ml-2">📥</span>
                  تصدير البيانات
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="w-6 h-6 text-blue-600">🔧</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="w-6 h-6 text-yellow-600">⏰</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">في الانتظار</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="w-6 h-6 text-blue-600">🔨</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">قيد التنفيذ</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgressRequests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="w-6 h-6 text-green-600">💰</span>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي التكلفة</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCost)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* فلاتر البحث */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4">🔍</span>
                  <input
                    type="text"
                    placeholder="رقم الطلب، المستأجر، العنوان..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">جميع الحالات</option>
                  <option value="pending">في الانتظار</option>
                  <option value="in_progress">قيد التنفيذ</option>
                  <option value="completed">مكتمل</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">النوع</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">جميع الأنواع</option>
                  <option value="plumbing">سباكة</option>
                  <option value="electrical">كهرباء</option>
                  <option value="hvac">تكييف</option>
                  <option value="cleaning">تنظيف</option>
                  <option value="security">أمن</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الأولوية</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">جميع الأولويات</option>
                  <option value="low">منخفض</option>
                  <option value="medium">متوسط</option>
                  <option value="high">عالي</option>
                  <option value="urgent">عاجل</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* جدول طلبات الصيانة */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                طلبات الصيانة ({filteredRequests.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم الطلب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العنوان
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المستأجر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      النوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الأولوية
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التكلفة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ التقرير
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.requestNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getDaysSinceReported(request.reportedDate)} يوم
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{request.title}</div>
                        <div className="text-sm text-gray-500">
                          {request.unitNumber} - {request.buildingName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.tenantName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getTypeText(request.type)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {getPriorityText(request.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(request.estimatedCost)}
                        </div>
                        {request.actualCost && (
                          <div className="text-sm text-gray-500">
                            فعلي: {formatCurrency(request.actualCost)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(request.reportedDate)}
                        </div>
                        {request.scheduledDate && (
                          <div className="text-sm text-gray-500">
                            مجدول: {formatDate(request.scheduledDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Link
                            href={`/admin/maintenance/${request.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="عرض التفاصيل"
                          >
                            <span className="w-4 h-4">👁️</span>
                          </Link>
                          <Link
                            href={`/admin/maintenance/${request.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="تعديل"
                          >
                            <span className="w-4 h-4">✏️</span>
                          </Link>
                          {request.status === 'pending' && (
                            <button
                              className="text-green-600 hover:text-green-900 p-1"
                              title="بدء العمل"
                            >
                              <span className="w-4 h-4">✅</span>
                            </button>
                          )}
                          <button
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="طباعة"
                          >
                            <span className="w-4 h-4">🖨️</span>
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1"
                            title="حذف"
                          >
                            <span className="w-4 h-4">🗑️</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <span className="mx-auto h-12 w-12 text-gray-400">🔧</span>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد طلبات صيانة</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    ابدأ بإضافة طلب صيانة جديد.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/admin/maintenance/new"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <span className="w-4 h-4 ml-2">➕</span>
                      إضافة طلب صيانة
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
