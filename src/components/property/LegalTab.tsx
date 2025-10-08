import React, { useState, useEffect } from 'react';
import {
  FaGavel, FaPlus, FaSearch, FaFilter, FaCalendar,
  FaUser, FaDollarSign, FaCheckCircle, FaExclamationTriangle,
  FaClock, FaEdit, FaEye, FaTrash, FaDownload, FaPrint,
  FaArrowUp, FaArrowDown, FaSort, FaRefresh, FaFileAlt,
  FaScale, FaBalanceScale, FaHandshake, FaExclamationCircle
} from 'react-icons/fa';

interface LegalCase {
  id: string;
  caseNumber: string;
  propertyId: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'contract_dispute' | 'payment_issue' | 'property_damage' | 'tenant_issue' | 'other';
  assignedLawyer?: string;
  estimatedCost?: number;
  actualCost?: number;
  currency: string;
  startDate: string;
  expectedResolutionDate?: string;
  actualResolutionDate?: string;
  documents?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
  }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface LegalTabProps {
  propertyId: string;
}

export default function LegalTab({ propertyId }: LegalTabProps) {
  const [legalCases, setLegalCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchLegalCases();
  }, [propertyId]);

  const fetchLegalCases = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/legal?propertyId=${propertyId}`);
      const data = await response.json();
      setLegalCases(data);
    } catch (error) {
      console.error('Error fetching legal cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'resolved': return 'محلولة';
      case 'in_progress': return 'قيد المتابعة';
      case 'open': return 'مفتوحة';
      case 'closed': return 'مغلقة';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'عاجل';
      case 'high': return 'عالي';
      case 'medium': return 'متوسط';
      case 'low': return 'منخفض';
      default: return priority;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'contract_dispute': return 'نزاع عقدي';
      case 'payment_issue': return 'مشكلة دفع';
      case 'property_damage': return 'تلف في العقار';
      case 'tenant_issue': return 'مشكلة مستأجر';
      case 'other': return 'أخرى';
      default: return category;
    }
  };

  const filteredLegalCases = legalCases.filter(legalCase => {
    const matchesSearch = legalCase.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         legalCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         legalCase.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || legalCase.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || legalCase.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || legalCase.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const sortedLegalCases = [...filteredLegalCases].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'startDate':
        aValue = new Date(a.startDate).getTime();
        bValue = new Date(b.startDate).getTime();
        break;
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        break;
      case 'estimatedCost':
        aValue = a.estimatedCost || 0;
        bValue = b.estimatedCost || 0;
        break;
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      default:
        aValue = a.caseNumber;
        bValue = b.caseNumber;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const legalStats = {
    total: legalCases.length,
    open: legalCases.filter(c => c.status === 'open').length,
    inProgress: legalCases.filter(c => c.status === 'in_progress').length,
    resolved: legalCases.filter(c => c.status === 'resolved').length,
    totalCost: legalCases.reduce((sum, c) => sum + (c.actualCost || 0), 0),
    estimatedCost: legalCases.reduce((sum, c) => sum + (c.estimatedCost || 0), 0)
  };

  const formatCurrency = (amount: number, currency: string = 'OMR') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn' });
  };

  const getDaysUntilResolution = (expectedDate: string) => {
    const now = new Date();
    const expected = new Date(expectedDate);
    const diffTime = expected.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-3 text-gray-600">جارٍ تحميل القضايا القانونية...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <FaGavel className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">القضايا القانونية</h2>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <FaDownload className="h-4 w-4 ml-2" />
            تصدير
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <FaPrint className="h-4 w-4 ml-2" />
            طباعة
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="h-4 w-4 ml-2" />
            قضية جديدة
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي القضايا</p>
              <p className="text-2xl font-bold text-gray-900">{legalStats.total}</p>
            </div>
            <FaGavel className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">مفتوحة</p>
              <p className="text-2xl font-bold text-yellow-600">{legalStats.open}</p>
            </div>
            <FaExclamationCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">قيد المتابعة</p>
              <p className="text-2xl font-bold text-blue-600">{legalStats.inProgress}</p>
            </div>
            <FaClock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي التكاليف</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(legalStats.totalCost)}
              </p>
            </div>
            <FaDollarSign className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="البحث في القضايا القانونية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الحالات</option>
            <option value="open">مفتوحة</option>
            <option value="in_progress">قيد المتابعة</option>
            <option value="resolved">محلولة</option>
            <option value="closed">مغلقة</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الأولويات</option>
            <option value="urgent">عاجل</option>
            <option value="high">عالي</option>
            <option value="medium">متوسط</option>
            <option value="low">منخفض</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الفئات</option>
            <option value="contract_dispute">نزاع عقدي</option>
            <option value="payment_issue">مشكلة دفع</option>
            <option value="property_damage">تلف في العقار</option>
            <option value="tenant_issue">مشكلة مستأجر</option>
            <option value="other">أخرى</option>
          </select>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="startDate">تاريخ البداية</option>
              <option value="priority">الأولوية</option>
              <option value="estimatedCost">التكلفة المقدرة</option>
              <option value="title">العنوان</option>
              <option value="caseNumber">رقم القضية</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? <FaArrowUp className="h-4 w-4" /> : <FaArrowDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Legal Cases List */}
      <div className="bg-white rounded-lg border">
        {sortedLegalCases.length === 0 ? (
          <div className="text-center py-12">
            <FaGavel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد قضايا قانونية</h3>
            <p className="text-gray-500 mb-4">لم يتم العثور على قضايا تطابق المعايير المحددة</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="h-4 w-4 ml-2" />
              إنشاء قضية جديدة
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم القضية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العنوان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الفئة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الأولوية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التكلفة
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
                {sortedLegalCases.map((legalCase) => (
                  <tr key={legalCase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {legalCase.caseNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{legalCase.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {legalCase.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCategoryText(legalCase.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(legalCase.priority)}`}>
                        {getPriorityText(legalCase.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {legalCase.estimatedCost ? formatCurrency(legalCase.estimatedCost, legalCase.currency) : 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(legalCase.status)}`}>
                        {getStatusText(legalCase.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button className="text-blue-600 hover:text-blue-900">
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <FaDownload className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
