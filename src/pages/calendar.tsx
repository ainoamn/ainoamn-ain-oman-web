// src/pages/calendar.tsx - التقويم العقاري
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FiCalendar, FiClock, FiMapPin, FiUser, FiEye, FiEdit,
  FiPlus, FiFilter, FiSearch, FiChevronLeft, FiChevronRight,
  FiHome, FiGavel, FiFileText, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import Layout from '@/components/layout/Layout';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: 'appointment' | 'auction' | 'maintenance' | 'inspection' | 'meeting' | 'payment';
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  attendees?: string[];
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  propertyId?: string;
  propertyName?: string;
  customerId?: string;
  customerName?: string;
  notes?: string;
  reminder?: number; // minutes before
  createdAt: string;
  updatedAt: string;
}

interface Property {
  id: string;
  title: string;
  location?: string;
  type?: string;
  status?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // تحميل الأحداث
      const eventsResponse = await fetch('/api/calendar/events');
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.events || []);
      }

      // تحميل العقارات
      const propertiesResponse = await fetch('/api/properties');
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json();
        setProperties(propertiesData.properties || []);
      }

      // تحميل العملاء
      const customersResponse = await fetch('/api/customers');
      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        setCustomers(customersData.customers || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-OM', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ar-OM', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'auction': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'inspection': return 'bg-green-100 text-green-800 border-green-200';
      case 'meeting': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'payment': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <FiUser className="w-4 h-4" />;
      case 'auction': return <FiGavel className="w-4 h-4" />;
      case 'maintenance': return <FiHome className="w-4 h-4" />;
      case 'inspection': return <FiEye className="w-4 h-4" />;
      case 'meeting': return <FiUser className="w-4 h-4" />;
      case 'payment': return <FiFileText className="w-4 h-4" />;
      default: return <FiCalendar className="w-4 h-4" />;
    }
  };

  const getEventTypeText = (type: string) => {
    switch (type) {
      case 'appointment': return 'موعد';
      case 'auction': return 'مزاد';
      case 'maintenance': return 'صيانة';
      case 'inspection': return 'فحص';
      case 'meeting': return 'اجتماع';
      case 'payment': return 'دفع';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-gray-100 text-gray-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'مجدول';
      case 'confirmed': return 'مؤكد';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <FiClock className="w-4 h-4" />;
      case 'confirmed': return <FiCheckCircle className="w-4 h-4" />;
      case 'completed': return <FiCheckCircle className="w-4 h-4" />;
      case 'cancelled': return <FiAlertCircle className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-green-500';
      default: return 'border-l-4 border-gray-300';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // إضافة الأيام الفارغة في بداية الشهر
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // إضافة أيام الشهر
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventStartDate = new Date(event.startDate).toISOString().split('T')[0];
      const eventEndDate = new Date(event.endDate).toISOString().split('T')[0];
      
      return dateString >= eventStartDate && dateString <= eventEndDate;
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('ar-OM', { month: 'long', year: 'numeric' });
  };

  const getWeekDays = () => {
    return ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
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
        <title>التقويم العقاري - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">التقويم العقاري</h1>
                <p className="mt-1 text-sm text-gray-500">
                  إدارة المواعيد والأحداث العقارية
                </p>
              </div>
              <div className="flex space-x-3 rtl:space-x-reverse">
                <button className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  <FiFilter className="w-4 h-4 ml-2" />
                  فلاتر
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <FiPlus className="w-4 h-4 ml-2" />
                  حدث جديد
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* فلاتر البحث */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع الحدث</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="appointment">موعد</option>
                  <option value="auction">مزاد</option>
                  <option value="maintenance">صيانة</option>
                  <option value="inspection">فحص</option>
                  <option value="meeting">اجتماع</option>
                  <option value="payment">دفع</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="scheduled">مجدول</option>
                  <option value="confirmed">مؤكد</option>
                  <option value="completed">مكتمل</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عرض التقويم</label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'month' | 'week' | 'day')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="month">شهري</option>
                  <option value="week">أسبوعي</option>
                  <option value="day">يومي</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                  <FiSearch className="w-4 h-4 ml-2 inline" />
                  تطبيق الفلاتر
                </button>
              </div>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiCalendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي الأحداث</p>
                  <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">مكتمل</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.filter(e => e.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FiClock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">مجدول</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.filter(e => e.status === 'scheduled').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FiAlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">ملغي</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.filter(e => e.status === 'cancelled').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* التقويم */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* رأس التقويم */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {getMonthName(currentDate)}
                </h2>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    اليوم
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* أيام الأسبوع */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {getWeekDays().map((day) => (
                <div key={day} className="px-4 py-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
                  {day}
                </div>
              ))}
            </div>

            {/* أيام الشهر */}
            <div className="grid grid-cols-7">
              {getDaysInMonth(currentDate).map((day, index) => (
                <div
                  key={index}
                  className="min-h-[120px] border-r border-b border-gray-200 p-2 bg-white hover:bg-gray-50 transition-colors"
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-2">
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {getEventsForDate(day).slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)} ${getPriorityColor(event.priority)} cursor-pointer hover:shadow-sm transition-shadow`}
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowEventModal(true);
                            }}
                          >
                            <div className="flex items-center">
                              {getEventTypeIcon(event.type)}
                              <span className="mr-1 truncate">{event.title}</span>
                            </div>
                            <div className="text-xs opacity-75">
                              {formatTime(event.startDate)}
                            </div>
                          </div>
                        ))}
                        {getEventsForDate(day).length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{getEventsForDate(day).length - 3} أكثر
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* قائمة الأحداث القادمة */}
          <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">الأحداث القادمة</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredEvents
                .filter(event => new Date(event.startDate) >= new Date())
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .slice(0, 10)
                .map((event) => (
                  <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}>
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                          <p className="text-sm text-gray-500">{event.description}</p>
                          <div className="flex items-center space-x-4 rtl:space-x-reverse mt-1">
                            <div className="flex items-center text-xs text-gray-500">
                              <FiClock className="w-3 h-3 ml-1" />
                              {formatDate(event.startDate)}
                            </div>
                            {event.location && (
                              <div className="flex items-center text-xs text-gray-500">
                                <FiMapPin className="w-3 h-3 ml-1" />
                                {event.location}
                              </div>
                            )}
                            {event.propertyName && (
                              <div className="flex items-center text-xs text-gray-500">
                                <FiHome className="w-3 h-3 ml-1" />
                                {event.propertyName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {getStatusIcon(event.status)}
                          <span className="mr-1">{getStatusText(event.status)}</span>
                        </span>
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                          <FiEdit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
