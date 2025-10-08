// src/components/admin/AdvancedDataTable.tsx - جدول بيانات متطور مع تأثيرات بصرية
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  MoreHorizontal,
  Calendar,
  Building,
  User,
  DollarSign,
  Tag,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface Booking {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyTitle?: string;
  propertyReference?: string;
  startDate: string;
  duration: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  contractSigned?: boolean;
  customerInfo: { name: string; phone: string; email?: string };
  ownerDecision?: { approved?: boolean; reason?: string; decidedAt?: string } | null;
}

interface AdvancedDataTableProps {
  data: Booking[];
  loading?: boolean;
}

type SortField = 'createdAt' | 'totalAmount' | 'status' | 'bookingNumber' | 'customerInfo.name';
type SortDirection = 'asc' | 'desc';

export default function AdvancedDataTable({ data, loading = false }: AdvancedDataTableProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // ترتيب البيانات
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'totalAmount':
          aValue = a.totalAmount || 0;
          bValue = b.totalAmount || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'bookingNumber':
          aValue = a.bookingNumber;
          bValue = b.bookingNumber;
          break;
        case 'customerInfo.name':
          aValue = a.customerInfo?.name || '';
          bValue = b.customerInfo?.name || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        label: 'قيد المراجعة', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⏳'
      },
      reserved: { 
        label: 'محجوز', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '📋'
      },
      leased: { 
        label: 'مؤجّر', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '✅'
      },
      cancelled: { 
        label: 'ملغى', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '❌'
      },
      accounting: { 
        label: 'محاسبي', 
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '📊'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-OM", {
      style: "currency",
      currency: "OMR",
      maximumFractionDigits: 3
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn', 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4 rtl:space-x-reverse">
                <div className="rounded-full bg-gray-200 h-4 w-4"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">قائمة الحجوزات</h3>
          <div className="text-sm text-gray-600">
            عرض {sortedData.length} من {data.length} حجز
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                #
              </th>
              <th 
                className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('bookingNumber')}
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span>رقم الحجز</span>
                  {getSortIcon('bookingNumber')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Calendar className="w-4 h-4" />
                  <span>تاريخ الحجز</span>
                  {getSortIcon('createdAt')}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Building className="w-4 h-4" />
                  <span>العقار</span>
                </div>
              </th>
              <th 
                className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('customerInfo.name')}
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <User className="w-4 h-4" />
                  <span>العميل</span>
                  {getSortIcon('customerInfo.name')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('totalAmount')}
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <DollarSign className="w-4 h-4" />
                  <span>القيمة</span>
                  {getSortIcon('totalAmount')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Tag className="w-4 h-4" />
                  <span>الحالة</span>
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedData.map((booking, index) => {
              const statusConfig = getStatusConfig(booking.status);
              const isHovered = hoveredRow === booking.id;
              
              return (
                <tr 
                  key={booking.id}
                  className={`transition-all duration-200 ${
                    isHovered 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm' 
                      : 'hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setHoveredRow(booking.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono font-medium text-gray-900">
                      {booking.bookingNumber}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.createdAt)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <Link 
                      href={`/properties/${encodeURIComponent(booking.propertyId || '')}`}
                      className="group block"
                    >
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {booking.propertyTitle || "غير محدد"}
                      </div>
                      <div className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors">
                        {booking.propertyReference || "غير محدد"}
                      </div>
                    </Link>
                  </td>
                  
                  <td className="px-6 py-4">
                    <Link 
                      href={`/admin/customers/${encodeURIComponent(booking.customerInfo?.name || '')}`}
                      className="group block"
                    >
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {booking.customerInfo?.name || "-"}
                      </div>
                      <div className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors">
                        {booking.customerInfo?.phone || "-"}
                      </div>
                    </Link>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(booking.totalAmount || 0)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      <span className="ml-1">{statusConfig.icon}</span>
                      {statusConfig.label}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Link 
                        href={`/admin/bookings/${encodeURIComponent(booking.id)}`}
                        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <Eye className="w-3 h-3 ml-1" />
                        عرض
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حجوزات</h3>
          <p className="text-gray-500">لم يتم العثور على حجوزات تطابق معايير البحث.</p>
        </div>
      )}
    </div>
  );
}





