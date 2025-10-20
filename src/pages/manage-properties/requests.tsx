// @ts-nocheck
// src/pages/manage-properties/requests.tsx - طلبات إدارة العقارات
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import InstantLink from '@/components/InstantLink';
import { 
  FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiFilter,
  FiUser, FiCalendar, FiDollarSign, FiCheck, FiX,
  FiClock, FiAlertTriangle, FiTrendingUp, FiMapPin
} from 'react-icons/fi';
// Layout handled by _app.tsx

interface PropertyRequest {
  id: string;
  requestNumber: string;
  type: 'listing' | 'management' | 'valuation' | 'maintenance';
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  propertyId?: string;
  propertyTitle?: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  description: string;
  requestedDate: string;
  estimatedValue?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  notes?: string;
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

export default function PropertyRequestsPage() {
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/property-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.propertyTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || request.status === selectedStatus;
    const matchesType = !selectedType || request.type === selectedType;
    const matchesPriority = !selectedPriority || request.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'approved': return 'موافق عليه';
      case 'rejected': return 'مرفوض';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'listing': return 'إدراج للبيع';
      case 'management': return 'إدارة العقار';
      case 'valuation': return 'تقييم العقار';
      case 'maintenance': return 'صيانة';
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
    return new Date(dateString).toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn' });
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/property-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      });
      
      if (response.ok) {
        loadRequests();
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/property-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      });
      
      if (response.ok) {
        loadRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>طلبات إدارة العقارات - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">طلبات إدارة العقارات</h1>
                <p className="mt-1 text-sm text-gray-500">
                  إدارة طلبات الخدمات العقارية
                </p>
              </div>
              <div className="flex space-x-3 rtl:space-x-reverse">
                <InstantLink 
                  href="/manage-properties/requests/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4 ml-2" />
                  طلب جديد
                </InstantLink>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* فلاتر البحث */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                <div className="relative">
                  <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="رقم الطلب، اسم الطالب..."
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
                  <option value="approved">موافق عليه</option>
                  <option value="rejected">مرفوض</option>
                  <option value="in_progress">قيد التنفيذ</option>
                  <option value="completed">مكتمل</option>
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
                  <option value="listing">إدراج للبيع</option>
                  <option value="management">إدارة العقار</option>
                  <option value="valuation">تقييم العقار</option>
                  <option value="maintenance">صيانة</option>
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

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStatus('');
                    setSelectedType('');
                    setSelectedPriority('');
                  }}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  مسح الفلاتر
                </button>
              </div>
            </div>
          </div>

          {/* جدول الطلبات */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                الطلبات ({filteredRequests.length})
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
                      النوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الطالب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العقار
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الأولوية
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الطلب
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getTypeText(request.type)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.requesterName}</div>
                        <div className="text-sm text-gray-500">{request.requesterEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.propertyTitle || 'غير محدد'}
                        </div>
                        {request.estimatedValue && (
                          <div className="text-sm text-gray-500">
                            {formatCurrency(request.estimatedValue)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {getPriorityText(request.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(request.requestedDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <InstantLink 
                            href={`/manage-properties/requests/${request.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="عرض التفاصيل"
                          >
                            <FiEye className="w-4 h-4" />
                          </InstantLink>
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="موافقة"
                              >
                                <FiCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="رفض"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <InstantLink 
                            href={`/manage-properties/requests/${request.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="تعديل"
                          >
                            <FiEdit className="w-4 h-4" />
                          </InstantLink>
                        </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <FaBuilding className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد طلبات</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    ابدأ بإنشاء طلب جديد لإدارة العقارات.
                  </p>
                  <div className="mt-6">
                    <InstantLink 
                      href="/manage-properties/requests/new"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <FiPlus className="w-4 h-4 ml-2" />
                      طلب جديد
                    </InstantLink>
                  </div>
                </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
