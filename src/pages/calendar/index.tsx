// صفحة التقويم المتكاملة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { subscriptionManager } from '@/lib/subscriptionSystem';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: 'booking' | 'maintenance' | 'inspection' | 'meeting' | 'other';
  propertyId?: string;
  propertyTitle?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  color: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const userId = 'user_123'; // محاكاة معرف المستخدم

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/calendar/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const canCreateEvent = () => {
    return subscriptionManager.hasPermission(userId, 'calendar_write');
  };

  const canEditEvent = () => {
    return subscriptionManager.hasPermission(userId, 'calendar_write');
  };

  const canDeleteEvent = () => {
    return subscriptionManager.hasPermission(userId, 'calendar_admin');
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📅';
      case 'maintenance': return '🔧';
      case 'inspection': return '🔍';
      case 'meeting': return '👥';
      default: return '📝';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'booking': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inspection': return 'bg-green-100 text-green-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (canCreateEvent()) {
      setSelectedEvent(null);
      setShowEventModal(true);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthDays = getMonthDays();
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <>
      <Head>
        <title>التقويم - عين عُمان</title>
        <meta name="description" content="إدارة الأحداث والمواعيد" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">التقويم</h1>
                <p className="text-gray-600 mt-1">إدارة الأحداث والمواعيد</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setView('month')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      view === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    شهر
                  </button>
                  <button
                    onClick={() => setView('week')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      view === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    أسبوع
                  </button>
                  <button
                    onClick={() => setView('day')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      view === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    يوم
                  </button>
                </div>
                {canCreateEvent() && (
                  <button
                    onClick={() => {
                      setSelectedEvent(null);
                      setShowEventModal(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    إضافة حدث
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm">
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePreviousMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span className="text-gray-600">←</span>
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      اليوم
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span className="text-gray-600">→</span>
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-6">
                  {/* Days of Week */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {monthDays.map((day, index) => {
                      if (!day) {
                        return <div key={index} className="h-24"></div>;
                      }

                      const dayEvents = getEventsForDate(day);
                      const isToday = day.toDateString() === new Date().toDateString();
                      const isSelected = day.toDateString() === selectedDate.toDateString();

                      return (
                        <div
                          key={day.toISOString()}
                          onClick={() => handleDateClick(day)}
                          className={`h-24 p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                            isToday ? 'bg-blue-50 border-blue-200' : ''
                          } ${isSelected ? 'bg-blue-100 border-blue-300' : ''}`}
                        >
                          <div className={`text-sm font-medium mb-1 ${
                            isToday ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventClick(event);
                                }}
                                className={`text-xs px-2 py-1 rounded truncate cursor-pointer ${getEventTypeColor(event.type)}`}
                              >
                                {getEventTypeIcon(event.type)} {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{dayEvents.length - 2} أكثر
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Selected Date Events */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  أحداث {formatDate(selectedDate)}
                </h3>
                <div className="space-y-3">
                  {selectedDateEvents.length > 0 ? (
                    selectedDateEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center mb-2">
                          <span className="text-lg mr-2">{getEventTypeIcon(event.type)}</span>
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(event.startDate).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {event.propertyTitle && (
                          <p className="text-xs text-gray-500 mt-1">
                            العقار: {event.propertyTitle}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">لا توجد أحداث في هذا اليوم</p>
                  )}
                </div>
              </div>

              {/* Event Types Legend */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">أنواع الأحداث</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">📅</span>
                    <span className="text-sm text-gray-600">حجوزات</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg mr-2">🔧</span>
                    <span className="text-sm text-gray-600">صيانة</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg mr-2">🔍</span>
                    <span className="text-sm text-gray-600">فحص</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg mr-2">👥</span>
                    <span className="text-sm text-gray-600">اجتماعات</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {selectedEvent ? 'تفاصيل الحدث' : 'إضافة حدث جديد'}
              </h3>
              
              {selectedEvent ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                    <p className="text-gray-900">{selectedEvent.title}</p>
                  </div>
                  {selectedEvent.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                      <p className="text-gray-900">{selectedEvent.description}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ والوقت</label>
                    <p className="text-gray-900">
                      {new Date(selectedEvent.startDate).toLocaleDateString('ar-SA')} - {' '}
                      {new Date(selectedEvent.startDate).toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {selectedEvent.propertyTitle && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">العقار</label>
                      <p className="text-gray-900">{selectedEvent.propertyTitle}</p>
                    </div>
                  )}
                  <div className="flex space-x-3">
                    {canEditEvent() && (
                      <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium">
                        تعديل
                      </button>
                    )}
                    {canDeleteEvent() && (
                      <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium">
                        حذف
                      </button>
                    )}
                    <button 
                      onClick={() => setShowEventModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الحدث</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل عنوان الحدث"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع الحدث</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="booking">حجز</option>
                      <option value="maintenance">صيانة</option>
                      <option value="inspection">فحص</option>
                      <option value="meeting">اجتماع</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ والوقت</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium">
                      حفظ
                    </button>
                    <button 
                      onClick={() => setShowEventModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
