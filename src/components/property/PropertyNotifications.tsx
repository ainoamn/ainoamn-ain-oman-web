// src/components/property/PropertyNotifications.tsx - مكون تنبيهات العقارات
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InstantLink from '@/components/InstantLink';

interface Notification {
  id: string;
  propertyId: string;
  unitId?: string | null;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'dismissed';
  type: string;
  relatedId: string;
  relatedType: string;
  dueDate?: string;
  overdueDays?: number;
  daysUntilExpiry?: number;
  amount?: number;
  currency?: string;
  createdAt: string;
}

interface PropertyNotificationsProps {
  propertyId?: string;
  ownerId?: string;
  tenantId?: string;
  showAll?: boolean;
  limit?: number;
}

export default function PropertyNotifications({ 
  propertyId, 
  ownerId, 
  tenantId, 
  showAll = false, 
  limit = 10 
}: PropertyNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDismissed, setShowDismissed] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [propertyId, ownerId, tenantId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (propertyId) params.append('propertyId', propertyId);
      if (ownerId) params.append('ownerId', ownerId);
      if (tenantId) params.append('tenantId', tenantId);
      if (!showAll) params.append('unread', 'true');
      
      const response = await fetch(`/api/property-notifications?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/property-notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: [notificationId],
          status: 'read'
        }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, status: 'read' as const }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      const response = await fetch('/api/property-notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: [notificationId],
          status: 'dismissed'
        }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notif => notif.id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📢';
      case 'low': return 'ℹ️';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-200 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-200 text-blue-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service_overdue': return '⚡';
      case 'document_expiring': return '📄';
      case 'expense_reimbursement': return '💰';
      case 'maintenance_due': return '🔧';
      case 'contract_expiring': return '📝';
      default: return '📢';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', { 
      calendar: 'gregory', 
      numberingSystem: 'latn' 
    });
  };

  const formatCurrency = (amount: number, currency: string = 'OMR') => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const filteredNotifications = showDismissed 
    ? notifications 
    : notifications.filter(notif => notif.status !== 'dismissed');

  const displayedNotifications = limit 
    ? filteredNotifications.slice(0, limit)
    : filteredNotifications;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="text-4xl mb-4 block">✅</span>
        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تنبيهات</h3>
        <p className="text-gray-500">جميع الأمور تحت السيطرة!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showAll && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">التنبيهات</h3>
          <button
            onClick={() => setShowDismissed(!showDismissed)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showDismissed ? 'إخفاء المرفوضة' : 'عرض المرفوضة'}
          </button>
        </div>
      )}

      <AnimatePresence>
        {displayedNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`border rounded-lg p-4 transition-all ${
              notification.status === 'unread' 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-2xl">{getTypeIcon(notification.type)}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className={`text-sm font-medium ${
                      notification.status === 'unread' ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                      {getPriorityIcon(notification.priority)}
                      <span className="mr-1">{notification.priority}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {notification.status === 'unread' && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        تمييز كمقروء
                      </button>
                    )}
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      رفض
                    </button>
                  </div>
                </div>
                
                <p className={`text-sm ${
                  notification.status === 'unread' ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {notification.message}
                </p>
                
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <span>{formatDate(notification.createdAt)}</span>
                  {notification.dueDate && (
                    <span>الاستحقاق: {formatDate(notification.dueDate)}</span>
                  )}
                  {notification.overdueDays && notification.overdueDays > 0 && (
                    <span className="text-red-600">
                      متأخر {notification.overdueDays} يوم
                    </span>
                  )}
                  {notification.daysUntilExpiry && (
                    <span className="text-orange-600">
                      ينتهي خلال {notification.daysUntilExpiry} يوم
                    </span>
                  )}
                  {notification.amount && (
                    <span className="font-medium">
                      {formatCurrency(notification.amount, notification.currency)}
                    </span>
                  )}
                </div>
                
                <div className="mt-3 flex space-x-2">
                  <InstantLink
                    href={`/property-management/${notification.propertyId}?tab=${notification.relatedType}s`}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    عرض التفاصيل
                  </InstantLink>
                  {notification.unitId && (
                    <InstantLink
                      href={`/properties/${notification.unitId}`}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      عرض الوحدة
                    </InstantLink>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {limit && filteredNotifications.length > limit && (
        <div className="text-center">
          <InstantLink
            href="/property-management/overdue"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            عرض جميع التنبيهات ({filteredNotifications.length})
          </InstantLink>
        </div>
      )}
    </div>
  );
}
