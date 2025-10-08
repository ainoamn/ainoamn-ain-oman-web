import React, { useState, useEffect } from 'react';
import {
  FaCalendarAlt, FaPlus, FaSearch, FaFilter, FaCalendar,
  FaUser, FaDollarSign, FaCheckCircle, FaExclamationTriangle,
  FaClock, FaEdit, FaEye, FaTrash, FaDownload, FaPrint,
  FaArrowUp, FaArrowDown, FaSort, FaRefresh, FaHandshake,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaBed, FaBath
} from 'react-icons/fa';

interface Reservation {
  id: string;
  reservationNumber: string;
  propertyId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  guests: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  propertyDetails?: {
    title: string;
    address: string;
    beds: number;
    baths: number;
  };
}

interface ReservationsTabProps {
  propertyId: string;
}

export default function ReservationsTab({ propertyId }: ReservationsTabProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('checkInDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, [propertyId]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reservations?propertyId=${propertyId}`);
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'مؤكد';
      case 'pending': return 'معلق';
      case 'cancelled': return 'ملغي';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.reservationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const checkInDate = new Date(reservation.checkInDate);
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      
      switch (dateFilter) {
        case 'upcoming':
          matchesDate = checkInDate >= now && checkInDate <= thirtyDaysFromNow;
          break;
        case 'next90days':
          matchesDate = checkInDate >= now && checkInDate <= ninetyDaysFromNow;
          break;
        case 'past':
          matchesDate = checkInDate < now;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const sortedReservations = [...filteredReservations].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'checkInDate':
        aValue = new Date(a.checkInDate).getTime();
        bValue = new Date(b.checkInDate).getTime();
        break;
      case 'checkOutDate':
        aValue = new Date(a.checkOutDate).getTime();
        bValue = new Date(b.checkOutDate).getTime();
        break;
      case 'totalAmount':
        aValue = a.totalAmount;
        bValue = b.totalAmount;
        break;
      case 'customerName':
        aValue = a.customerName;
        bValue = b.customerName;
        break;
      default:
        aValue = a.reservationNumber;
        bValue = b.reservationNumber;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const reservationStats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    pending: reservations.filter(r => r.status === 'pending').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    totalRevenue: reservations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum, r) => sum + r.totalAmount, 0)
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

  const getDaysUntilCheckIn = (checkInDate: string) => {
    const now = new Date();
    const checkIn = new Date(checkInDate);
    const diffTime = checkIn.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-3 text-gray-600">جارٍ تحميل الحجوزات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <FaCalendarAlt className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">الحجوزات</h2>
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
            حجز جديد
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الحجوزات</p>
              <p className="text-2xl font-bold text-gray-900">{reservationStats.total}</p>
            </div>
            <FaCalendarAlt className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">مؤكدة</p>
              <p className="text-2xl font-bold text-green-600">{reservationStats.confirmed}</p>
            </div>
            <FaCheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">معلقة</p>
              <p className="text-2xl font-bold text-yellow-600">{reservationStats.pending}</p>
            </div>
            <FaClock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(reservationStats.totalRevenue)}
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
                placeholder="البحث في الحجوزات..."
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
            <option value="confirmed">مؤكد</option>
            <option value="pending">معلق</option>
            <option value="cancelled">ملغي</option>
            <option value="completed">مكتمل</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع التواريخ</option>
            <option value="upcoming">القادمة (30 يوم)</option>
            <option value="next90days">الـ 90 يوم القادمة</option>
            <option value="past">السابقة</option>
          </select>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="checkInDate">تاريخ الوصول</option>
              <option value="checkOutDate">تاريخ المغادرة</option>
              <option value="totalAmount">المبلغ الإجمالي</option>
              <option value="customerName">اسم العميل</option>
              <option value="reservationNumber">رقم الحجز</option>
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

      {/* Reservations List */}
      <div className="bg-white rounded-lg border">
        {sortedReservations.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حجوزات</h3>
            <p className="text-gray-500 mb-4">لم يتم العثور على حجوزات تطابق المعايير المحددة</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="h-4 w-4 ml-2" />
              إنشاء حجز جديد
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الحجز
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الوصول
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ المغادرة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المبلغ
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
                {sortedReservations.map((reservation) => {
                  const daysUntilCheckIn = getDaysUntilCheckIn(reservation.checkInDate);
                  
                  return (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reservation.reservationNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{reservation.customerName}</div>
                          <div className="text-sm text-gray-500">{reservation.customerEmail}</div>
                          <div className="text-sm text-gray-500">{reservation.guests} ضيف</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{formatDate(reservation.checkInDate)}</div>
                          {reservation.status === 'confirmed' && daysUntilCheckIn > 0 && daysUntilCheckIn <= 7 && (
                            <div className="text-xs text-orange-600">
                              خلال {daysUntilCheckIn} يوم
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(reservation.checkOutDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(reservation.totalAmount, reservation.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {getStatusText(reservation.status)}
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
