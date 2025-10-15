import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  color: string;
  link: string;
  read: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  readAt?: string;
  updatedAt?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Partial<Notification>) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب الإشعارات
  const refreshNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // الحصول على userId من localStorage
      const authData = localStorage.getItem('ain_auth');
      const user = authData ? JSON.parse(authData) : null;
      const userId = user?.email;

      if (!userId) {
        console.log('📢 Notifications: No user logged in');
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      console.log('📢 Notifications: Fetching for user:', userId);

      const response = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
      
      if (!response.ok) {
        console.error('Failed to fetch notifications');
        setNotifications([]);
        return;
      }

      const data = await response.json();

      console.log('📢 Notifications: Received', data.count, 'notifications');
      console.log('📢 Notifications: Unread', data.unreadCount);

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);

    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // تحديد إشعار كمقروء
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      console.log('✅ Notifications: Marked as read:', id);

      // تحديث محلياً
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // تحديد جميع الإشعارات كمقروءة
  const markAllAsRead = async () => {
    try {
      const authData = localStorage.getItem('ain_auth');
      const user = authData ? JSON.parse(authData) : null;
      const userId = user?.email;

      if (!userId) return;

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      console.log('✅ Notifications: Marked all as read');

      // تحديث محلياً
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);

    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // حذف إشعار
  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      console.log('🗑️ Notifications: Deleted:', id);

      // تحديث محلياً
      const deletedNotif = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // إضافة إشعار جديد
  const addNotification = async (notification: Partial<Notification>) => {
    try {
      const authData = localStorage.getItem('ain_auth');
      const user = authData ? JSON.parse(authData) : null;
      const userId = user?.email;

      if (!userId) return;

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...notification, userId })
      });

      if (!response.ok) {
        throw new Error('Failed to add notification');
      }

      const data = await response.json();
      console.log('➕ Notifications: Added new notification');

      // تحديث محلياً
      setNotifications(prev => [data.notification, ...prev]);
      setUnreadCount(prev => prev + 1);

    } catch (err) {
      console.error('Error adding notification:', err);
    }
  };

  // جلب الإشعارات عند التحميل
  useEffect(() => {
    refreshNotifications();

    // تحديث كل 30 ثانية
    const interval = setInterval(refreshNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // الاستماع للتزامن عبر BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel('notifications_sync');

    channel.onmessage = (event) => {
      if (event.data.type === 'NOTIFICATION_ADDED' || event.data.type === 'NOTIFICATION_UPDATED') {
        console.log('📡 Notifications: Sync event received');
        refreshNotifications();
      }
    };

    return () => channel.close();
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};

