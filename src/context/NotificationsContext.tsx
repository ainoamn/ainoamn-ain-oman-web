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
  const [refreshing, setRefreshing] = useState(false);

  const fetchWithTimeout = async (input: RequestInfo | URL, init?: RequestInit & { timeoutMs?: number }) => {
    const { timeoutMs = 8000, ...rest } = init || {};
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(input, { ...rest, signal: controller.signal, headers: { 'cache-control': 'no-cache', ...(rest.headers || {}) } });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // جلب الإشعارات
  const refreshNotifications = async () => {
    try {
      if (refreshing) return; // avoid overlapping
      setRefreshing(true);
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

      // retry up to 2 times on network errors
      let response: Response | null = null;
      let lastErr: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          response = await fetchWithTimeout(`/api/notifications?userId=${encodeURIComponent(userId)}`, { timeoutMs: 8000 });
          break;
        } catch (e) {
          // تجاهل AbortError - يحدث عند timeout أو unmount
          if (e instanceof Error && e.name === 'AbortError') {
            console.log('📢 Notifications: Request aborted (timeout or unmount)');
            setNotifications([]);
            setUnreadCount(0);
            return;
          }
          lastErr = e;
          await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
        }
      }
      if (!response) throw lastErr || new Error('Failed to fetch notifications');
      
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('Failed to fetch notifications', response.status, text);
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const data = await response.json();

      console.log('📢 Notifications: Received', data.count, 'notifications');
      console.log('📢 Notifications: Unread', data.unreadCount);

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);

    } catch (err) {
      // تجاهل AbortError - ليس خطأ حقيقي
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('📢 Notifications: Request aborted');
        return;
      }
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // keep old notifications; do not clear on transient failure
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    let mounted = true;

    const fetchIfMounted = async () => {
      if (mounted) {
        await refreshNotifications();
      }
    };

    fetchIfMounted();

    // تحديث كل 30 ثانية
    const interval = setInterval(fetchIfMounted, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
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
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      markAsRead: async () => {},
      markAllAsRead: async () => {},
      deleteNotification: async () => {},
      addNotification: async () => {},
      refresh: async () => {},
    } as any;
  }
  return context;
};

