// src/services/dashboardStats.ts
// خدمة موحدة لجلب الإحصائيات الحقيقية من APIs
export interface DashboardStats {
  properties?: {
    total: number;
    active: number;
    pending: number;
    growth?: number;
  };
  rentals?: {
    total: number;
    active: number;
    expiringSoon: number;
    daysUntilExpiry?: number;
    growth?: number;
  };
  bookings?: {
    total: number;
    today: number;
    pending: number;
    growth?: number;
  };
  revenue?: {
    total: number;
    monthly: number;
    pending: number;
    growth?: number;
  };
  users?: {
    total: number;
    active: number;
    new: number;
    growth?: number;
  };
  tasks?: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  subscriptions?: {
    total: number;
    active: number;
    expiring: number;
    revenue: number;
  };
}

class DashboardStatsService {
  /**
   * جلب إحصائيات لوحة تحكم المالك
   */
  async getOwnerStats(userId?: string): Promise<DashboardStats> {
    try {
      const [propertiesRes, rentalsRes, bookingsRes] = await Promise.allSettled([
        fetch(userId ? `/api/properties?mine=true&userId=${encodeURIComponent(userId)}` : '/api/properties?mine=true'),
        fetch(userId ? `/api/rentals?mine=true&userId=${encodeURIComponent(userId)}` : '/api/rentals?mine=true'),
        fetch('/api/bookings?mine=true')
      ]);

      const properties = propertiesRes.status === 'fulfilled' && propertiesRes.value.ok
        ? await propertiesRes.value.json()
        : { items: [] };
      
      const rentals = rentalsRes.status === 'fulfilled' && rentalsRes.value.ok
        ? await rentalsRes.value.json()
        : { items: [] };
      
      const bookings = bookingsRes.status === 'fulfilled' && bookingsRes.value.ok
        ? await bookingsRes.value.json()
        : { items: [] };

      const propertiesArray = Array.isArray(properties.items) ? properties.items : [];
      const rentalsArray = Array.isArray(rentals.items) ? rentals.items : [];
      const bookingsArray = Array.isArray(bookings.items) ? bookings.items : [];

      // حساب العقود القريبة من الانتهاء
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const expiringRentals = rentalsArray.filter((r: any) => {
        const endDate = r.endDate ? new Date(r.endDate) : null;
        return endDate && endDate <= thirtyDaysFromNow && endDate > now;
      });

      // حساب الإيرادات
      const totalRevenue = bookingsArray.reduce((sum: number, b: any) => 
        sum + (parseFloat(b.totalAmount) || 0), 0
      );
      const monthlyRevenue = bookingsArray
        .filter((b: any) => {
          const bookingDate = b.createdAt ? new Date(b.createdAt) : null;
          if (!bookingDate) return false;
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return bookingDate >= monthAgo;
        })
        .reduce((sum: number, b: any) => sum + (parseFloat(b.totalAmount) || 0), 0);

      return {
        properties: {
          total: propertiesArray.length,
          active: propertiesArray.filter((p: any) => p.status === 'active' || !p.status).length,
          pending: propertiesArray.filter((p: any) => p.status === 'pending').length
        },
        rentals: {
          total: rentalsArray.length,
          active: rentalsArray.filter((r: any) => {
            const state = r.signatureWorkflow || r.state;
            return state === 'active';
          }).length,
          expiringSoon: expiringRentals.length,
          daysUntilExpiry: expiringRentals.length > 0 
            ? Math.ceil((new Date(expiringRentals[0].endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : undefined
        },
        bookings: {
          total: bookingsArray.length,
          today: bookingsArray.filter((b: any) => {
            const today = now.toISOString().split('T')[0];
            return b.checkIn?.startsWith(today);
          }).length,
          pending: bookingsArray.filter((b: any) => b.status === 'pending').length
        },
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue,
          pending: bookingsArray
            .filter((b: any) => b.status === 'pending')
            .reduce((sum: number, b: any) => sum + (parseFloat(b.totalAmount) || 0), 0)
        }
      };
    } catch (error) {
      console.error('Error fetching owner stats:', error);
      return {};
    }
  }

  /**
   * جلب إحصائيات لوحة تحكم المستأجر
   */
  async getTenantStats(userId?: string): Promise<DashboardStats> {
    try {
      const rentalsRes = await fetch(
        userId 
          ? `/api/rentals?mine=true&userId=${encodeURIComponent(userId)}`
          : '/api/rentals?mine=true'
      );

      const rentals = rentalsRes.ok ? await rentalsRes.json() : { items: [] };
      const rentalsArray = Array.isArray(rentals.items) 
        ? rentals.items.filter((r: any) => !userId || r.tenantId === userId)
        : [];

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const expiringRentals = rentalsArray.filter((r: any) => {
        const endDate = r.endDate ? new Date(r.endDate) : null;
        return endDate && endDate <= thirtyDaysFromNow && endDate > now;
      });

      return {
        rentals: {
          total: rentalsArray.length,
          active: rentalsArray.filter((r: any) => {
            const state = r.signatureWorkflow || r.state;
            return state === 'active';
          }).length,
          expiringSoon: expiringRentals.length,
          daysUntilExpiry: expiringRentals.length > 0 
            ? Math.ceil((new Date(expiringRentals[0].endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : undefined
        }
      };
    } catch (error) {
      console.error('Error fetching tenant stats:', error);
      return {};
    }
  }

  /**
   * جلب إحصائيات لوحة تحكم الإدارة
   */
  async getAdminStats(): Promise<DashboardStats> {
    try {
      const [bookingsRes, propertiesRes, tasksRes, usersRes] = await Promise.allSettled([
        fetch('/api/bookings'),
        fetch('/api/properties'),
        fetch('/api/tasks/simple'),
        fetch('/api/users')
      ]);

      const bookings = bookingsRes.status === 'fulfilled' && bookingsRes.value.ok
        ? await bookingsRes.value.json()
        : { items: [] };
      
      const properties = propertiesRes.status === 'fulfilled' && propertiesRes.value.ok
        ? await propertiesRes.value.json()
        : { items: [] };
      
      const tasks = tasksRes.status === 'fulfilled' && tasksRes.value.ok
        ? await tasksRes.value.json()
        : { items: [] };
      
      const users = usersRes.status === 'fulfilled' && usersRes.value.ok
        ? await usersRes.value.json()
        : { items: [] };

      const bookingsArray = Array.isArray(bookings.items) ? bookings.items : [];
      const propertiesArray = Array.isArray(properties.items) ? properties.items : [];
      const tasksArray = Array.isArray(tasks.items) ? tasks.items : [];
      const usersArray = Array.isArray(users.items) ? users.items : [];

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const totalRevenue = bookingsArray.reduce((sum: number, b: any) => 
        sum + (parseFloat(b.totalAmount) || 0), 0
      );
      const monthlyRevenue = bookingsArray
        .filter((b: any) => {
          const bookingDate = b.createdAt ? new Date(b.createdAt) : null;
          return bookingDate && bookingDate >= monthAgo;
        })
        .reduce((sum: number, b: any) => sum + (parseFloat(b.totalAmount) || 0), 0);

      const newUsersThisMonth = usersArray.filter((u: any) => {
        const userDate = u.createdAt ? new Date(u.createdAt) : null;
        return userDate && userDate >= monthAgo;
      }).length;

      return {
        users: {
          total: usersArray.length,
          active: usersArray.filter((u: any) => u.status === 'active' || !u.status).length,
          new: newUsersThisMonth,
          growth: usersArray.length > 0 
            ? (newUsersThisMonth / usersArray.length) * 100 
            : 0
        },
        properties: {
          total: propertiesArray.length,
          active: propertiesArray.filter((p: any) => p.status === 'active' || !p.status).length,
          pending: propertiesArray.filter((p: any) => p.status === 'pending').length
        },
        bookings: {
          total: bookingsArray.length,
          today: bookingsArray.filter((b: any) => b.checkIn?.startsWith(today)).length,
          pending: bookingsArray.filter((b: any) => b.status === 'pending').length
        },
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue,
          pending: bookingsArray
            .filter((b: any) => b.status === 'pending')
            .reduce((sum: number, b: any) => sum + (parseFloat(b.totalAmount) || 0), 0)
        },
        tasks: {
          total: tasksArray.length,
          completed: tasksArray.filter((t: any) => t.status === 'completed').length,
          pending: tasksArray.filter((t: any) => t.status === 'pending' || !t.status).length,
          overdue: tasksArray.filter((t: any) => {
            if (!t.dueDate) return false;
            const dueDate = new Date(t.dueDate);
            return dueDate < now && t.status !== 'completed';
          }).length
        }
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {};
    }
  }
}

export const dashboardStatsService = new DashboardStatsService();
