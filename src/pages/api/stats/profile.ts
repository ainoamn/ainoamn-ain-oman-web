// src/pages/api/stats/profile.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const dataDir = path.join(process.cwd(), '.data');

    // قراءة الملفات
    const propertiesFile = path.join(dataDir, 'properties.json');
    const bookingsFile = path.join(dataDir, 'bookings.json');
    const tasksFile = path.join(dataDir, 'tasks.json');
    const notificationsFile = path.join(dataDir, 'notifications.json');
    const invoicesFile = path.join(dataDir, 'invoices.json');
    const paymentsFile = path.join(dataDir, 'payments.json');

    // تحميل البيانات
    const properties = fs.existsSync(propertiesFile) 
      ? JSON.parse(fs.readFileSync(propertiesFile, 'utf-8')) 
      : { properties: [] };
    
    const bookings = fs.existsSync(bookingsFile)
      ? JSON.parse(fs.readFileSync(bookingsFile, 'utf-8'))
      : { bookings: [] };
    
    const tasks = fs.existsSync(tasksFile)
      ? JSON.parse(fs.readFileSync(tasksFile, 'utf-8'))
      : { tasks: [] };
    
    const notifications = fs.existsSync(notificationsFile)
      ? JSON.parse(fs.readFileSync(notificationsFile, 'utf-8'))
      : { notifications: [] };

    const invoices = fs.existsSync(invoicesFile)
      ? JSON.parse(fs.readFileSync(invoicesFile, 'utf-8'))
      : { invoices: [] };

    const payments = fs.existsSync(paymentsFile)
      ? JSON.parse(fs.readFileSync(paymentsFile, 'utf-8'))
      : { payments: [] };

    // حساب الإحصائيات
    const stats = {
      properties: {
        total: properties.properties?.length || 0,
        active: properties.properties?.filter((p: any) => p.status === 'active').length || 0,
        rented: properties.properties?.filter((p: any) => p.status === 'rented').length || 0,
      },
      bookings: {
        total: bookings.bookings?.length || 0,
        pending: bookings.bookings?.filter((b: any) => b.status === 'pending').length || 0,
        confirmed: bookings.bookings?.filter((b: any) => b.status === 'confirmed').length || 0,
      },
      tasks: {
        total: tasks.tasks?.length || 0,
        pending: tasks.tasks?.filter((t: any) => t.status === 'pending').length || 0,
        completed: tasks.tasks?.filter((t: any) => t.status === 'completed').length || 0,
      },
      notifications: {
        total: notifications.notifications?.length || 0,
        unread: notifications.notifications?.filter((n: any) => !n.read).length || 0,
      },
    };

    // بيانات الرسوم البيانية (آخر 6 أشهر)
    const chartData = {
      performance: generatePerformanceData(bookings.bookings || []),
      revenue: generateRevenueData(invoices.invoices || [], payments.payments || []),
    };

    return res.status(200).json({
      stats,
      chartData,
    });

  } catch (error) {
    console.error('Error loading profile stats:', error);
    return res.status(500).json({ 
      error: 'Failed to load stats',
      stats: {
        properties: { total: 0, active: 0, rented: 0 },
        bookings: { total: 0, pending: 0, confirmed: 0 },
        tasks: { total: 0, pending: 0, completed: 0 },
        notifications: { total: 0, unread: 0 },
      },
      chartData: {
        performance: [],
        revenue: [],
      }
    });
  }
}

// دالة لتوليد بيانات الأداء
function generatePerformanceData(bookings: any[]) {
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
  const now = new Date();
  const data = [];

  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = months[monthDate.getMonth()];
    
    // حساب عدد الحجوزات في هذا الشهر
    const monthBookings = bookings.filter((b: any) => {
      const bookingDate = new Date(b.createdAt || b.checkIn);
      return bookingDate.getMonth() === monthDate.getMonth() && 
             bookingDate.getFullYear() === monthDate.getFullYear();
    });

    data.push({
      month: monthName,
      views: Math.floor(monthBookings.length * 8.5), // تقدير المشاهدات
      bookings: monthBookings.length,
    });
  }

  return data;
}

// دالة لتوليد بيانات الإيرادات
function generateRevenueData(invoices: any[], payments: any[]) {
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
  const now = new Date();
  const data = [];

  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = months[monthDate.getMonth()];
    
    // حساب الإيرادات في هذا الشهر
    const monthInvoices = invoices.filter((inv: any) => {
      const invDate = new Date(inv.date || inv.createdAt);
      return invDate.getMonth() === monthDate.getMonth() && 
             invDate.getFullYear() === monthDate.getFullYear();
    });

    const monthPayments = payments.filter((pay: any) => {
      const payDate = new Date(pay.date || pay.createdAt);
      return payDate.getMonth() === monthDate.getMonth() && 
             payDate.getFullYear() === monthDate.getFullYear();
    });

    const revenue = monthInvoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
    const expenses = monthPayments.reduce((sum: number, pay: any) => sum + (pay.amount || 0), 0);

    data.push({
      month: monthName,
      revenue: Math.round(revenue),
      expenses: Math.round(expenses),
    });
  }

  return data;
}
