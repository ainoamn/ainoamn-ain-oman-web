// src/pages/api/stats/profile.ts - إحصائيات البروفايل
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // قراءة البيانات من الملفات
    const propertiesPath = path.join(process.cwd(), '.data', 'properties.json');
    const bookingsPath = path.join(process.cwd(), '.data', 'bookings.json');
    const notificationsPath = path.join(process.cwd(), '.data', 'notifications.json');
    const tasksPath = path.join(process.cwd(), '.data', 'tasks.json');

    let properties = [];
    let bookings = [];
    let notifications = [];
    let tasks = [];

    // قراءة العقارات
    if (fs.existsSync(propertiesPath)) {
      const data = JSON.parse(fs.readFileSync(propertiesPath, 'utf-8'));
      properties = data.properties || [];
    }

    // قراءة الحجوزات
    if (fs.existsSync(bookingsPath)) {
      const data = JSON.parse(fs.readFileSync(bookingsPath, 'utf-8'));
      bookings = data.items || [];
    }

    // قراءة الإشعارات
    if (fs.existsSync(notificationsPath)) {
      const data = JSON.parse(fs.readFileSync(notificationsPath, 'utf-8'));
      notifications = data.notifications || [];
    }

    // قراءة المهام
    if (fs.existsSync(tasksPath)) {
      const data = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
      tasks = data.tasks || [];
    }

    // حساب الإحصائيات
    const stats = {
      properties: {
        total: properties.length,
        active: properties.filter((p: any) => p.status === 'active').length,
        rented: properties.filter((p: any) => p.status === 'rented').length,
        draft: properties.filter((p: any) => p.status === 'draft').length,
      },
      bookings: {
        total: bookings.length,
        pending: bookings.filter((b: any) => b.status === 'pending').length,
        confirmed: bookings.filter((b: any) => b.status === 'confirmed').length,
        completed: bookings.filter((b: any) => b.status === 'completed').length,
      },
      notifications: {
        total: notifications.length,
        unread: notifications.filter((n: any) => !n.read).length,
      },
      tasks: {
        total: tasks.length,
        pending: tasks.filter((t: any) => t.status === 'pending').length,
        in_progress: tasks.filter((t: any) => t.status === 'in_progress').length,
        completed: tasks.filter((t: any) => t.status === 'completed').length,
      },
      revenue: {
        total: calculateTotalRevenue(properties, bookings),
        thisMonth: calculateMonthlyRevenue(properties, bookings),
        growth: calculateGrowth(properties, bookings),
      },
      chartData: {
        performance: generatePerformanceData(properties, bookings),
        revenue: generateRevenueData(properties, bookings),
      }
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error loading stats:', error);
    res.status(500).json({ error: 'Failed to load stats' });
  }
}

function calculateTotalRevenue(properties: any[], bookings: any[]): number {
  // حساب إجمالي الإيرادات من الحجوزات والعقارات
  const bookingRevenue = bookings
    .filter((b: any) => b.status === 'completed')
    .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
  
  const propertyRevenue = properties
    .filter((p: any) => p.status === 'rented')
    .reduce((sum: number, p: any) => sum + (p.price || 0), 0);

  return bookingRevenue + propertyRevenue;
}

function calculateMonthlyRevenue(properties: any[], bookings: any[]): number {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const monthlyBookings = bookings.filter((b: any) => {
    const bookingDate = new Date(b.createdAt || b.checkIn);
    return bookingDate.getMonth() === thisMonth && 
           bookingDate.getFullYear() === thisYear &&
           b.status === 'completed';
  });

  return monthlyBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
}

function calculateGrowth(properties: any[], bookings: any[]): number {
  // حساب معدل النمو مقارنة بالشهر الماضي
  const now = new Date();
  const thisMonth = calculateMonthlyRevenue(properties, bookings);
  
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthRevenue = bookings
    .filter((b: any) => {
      const bookingDate = new Date(b.createdAt || b.checkIn);
      return bookingDate.getMonth() === lastMonth.getMonth() && 
             bookingDate.getFullYear() === lastMonth.getFullYear() &&
             b.status === 'completed';
    })
    .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

  if (lastMonthRevenue === 0) return 0;
  return ((thisMonth - lastMonthRevenue) / lastMonthRevenue) * 100;
}

function generatePerformanceData(properties: any[], bookings: any[]) {
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
  const now = new Date();
  
  return months.map((month, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const monthBookings = bookings.filter((b: any) => {
      const date = new Date(b.createdAt || b.checkIn);
      return date.getMonth() === monthDate.getMonth() && 
             date.getFullYear() === monthDate.getFullYear();
    });

    return {
      month,
      views: Math.floor(Math.random() * 300) + 100, // يمكن استبداله بقراءة حقيقية من Analytics
      bookings: monthBookings.length,
    };
  });
}

function generateRevenueData(properties: any[], bookings: any[]) {
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
  const now = new Date();
  
  return months.map((month, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const monthBookings = bookings.filter((b: any) => {
      const date = new Date(b.createdAt || b.checkIn);
      return date.getMonth() === monthDate.getMonth() && 
             date.getFullYear() === monthDate.getFullYear() &&
             b.status === 'completed';
    });

    const revenue = monthBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
    const expenses = revenue * 0.6; // افتراض أن المصروفات 60% من الإيرادات

    return {
      month,
      revenue,
      expenses,
    };
  });
}

