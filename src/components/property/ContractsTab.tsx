import React, { useState, useEffect } from 'react';
import {
  FaFileContract, FaPlus, FaSearch, FaFilter, FaCalendar,
  FaUser, FaDollarSign, FaCheckCircle, FaExclamationTriangle,
  FaClock, FaEdit, FaEye, FaTrash, FaDownload, FaPrint,
  FaArrowUp, FaArrowDown, FaSort, FaRefresh, FaHandshake
} from 'react-icons/fa';

interface Contract {
  id: string;
  contractNumber: string;
  propertyId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  currency: string;
  status: 'active' | 'expired' | 'terminated' | 'pending';
  deposit: number;
  terms: string;
  createdAt: string;
  updatedAt: string;
  documents?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

interface ContractsTabProps {
  propertyId: string;
}

export default function ContractsTab({ propertyId }: ContractsTabProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('endDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, [propertyId]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/contracts?propertyId=${propertyId}`);
      const data = await response.json();
      setContracts(data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'terminated': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'expired': return 'منتهي';
      case 'terminated': return 'منهي';
      case 'pending': return 'معلق';
      default: return status;
    }
  };

  const getContractStatus = (contract: Contract) => {
    const now = new Date();
    const endDate = new Date(contract.endDate);
    const startDate = new Date(contract.startDate);
    
    if (contract.status === 'terminated') return 'terminated';
    if (contract.status === 'pending') return 'pending';
    if (endDate < now) return 'expired';
    if (startDate > now) return 'pending';
    return 'active';
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.tenantEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || getContractStatus(contract) === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'endDate':
        aValue = new Date(a.endDate).getTime();
        bValue = new Date(b.endDate).getTime();
        break;
      case 'startDate':
        aValue = new Date(a.startDate).getTime();
        bValue = new Date(b.startDate).getTime();
        break;
      case 'monthlyRent':
        aValue = a.monthlyRent;
        bValue = b.monthlyRent;
        break;
      case 'tenantName':
        aValue = a.tenantName;
        bValue = b.tenantName;
        break;
      default:
        aValue = a.contractNumber;
        bValue = b.contractNumber;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const contractStats = {
    total: contracts.length,
    active: contracts.filter(c => getContractStatus(c) === 'active').length,
    expired: contracts.filter(c => getContractStatus(c) === 'expired').length,
    pending: contracts.filter(c => getContractStatus(c) === 'pending').length,
    totalRevenue: contracts
      .filter(c => getContractStatus(c) === 'active')
      .reduce((sum, c) => sum + c.monthlyRent, 0)
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

  const getDaysUntilExpiry = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-3 text-gray-600">جارٍ تحميل العقود...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <FaFileContract className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">العقود</h2>
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
            عقد جديد
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي العقود</p>
              <p className="text-2xl font-bold text-gray-900">{contractStats.total}</p>
            </div>
            <FaFileContract className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">عقود نشطة</p>
              <p className="text-2xl font-bold text-green-600">{contractStats.active}</p>
            </div>
            <FaCheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">منتهية</p>
              <p className="text-2xl font-bold text-red-600">{contractStats.expired}</p>
            </div>
            <FaExclamationTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(contractStats.totalRevenue)}
              </p>
            </div>
            <FaDollarSign className="h-8 w-8 text-green-600" />
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
                placeholder="البحث في العقود..."
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
            <option value="active">نشط</option>
            <option value="expired">منتهي</option>
            <option value="terminated">منهي</option>
            <option value="pending">معلق</option>
          </select>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="endDate">تاريخ الانتهاء</option>
              <option value="startDate">تاريخ البداية</option>
              <option value="monthlyRent">الإيجار الشهري</option>
              <option value="tenantName">اسم المستأجر</option>
              <option value="contractNumber">رقم العقد</option>
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

      {/* Contracts List */}
      <div className="bg-white rounded-lg border">
        {sortedContracts.length === 0 ? (
          <div className="text-center py-12">
            <FaFileContract className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عقود</h3>
            <p className="text-gray-500 mb-4">لم يتم العثور على عقود تطابق المعايير المحددة</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="h-4 w-4 ml-2" />
              إنشاء عقد جديد
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم العقد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المستأجر
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإيجار الشهري
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ البداية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الانتهاء
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
                {sortedContracts.map((contract) => {
                  const status = getContractStatus(contract);
                  const daysUntilExpiry = getDaysUntilExpiry(contract.endDate);
                  
                  return (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {contract.contractNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{contract.tenantName}</div>
                          <div className="text-sm text-gray-500">{contract.tenantEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(contract.monthlyRent, contract.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(contract.startDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{formatDate(contract.endDate)}</div>
                          {status === 'active' && daysUntilExpiry <= 30 && (
                            <div className="text-xs text-orange-600">
                              ينتهي خلال {daysUntilExpiry} يوم
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusText(status)}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
