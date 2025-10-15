// src/pages/api/insights/ai.ts - AI Insights
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const propertiesPath = path.join(process.cwd(), '.data', 'properties.json');
    const bookingsPath = path.join(process.cwd(), '.data', 'bookings.json');

    let properties = [];
    let bookings = [];

    if (fs.existsSync(propertiesPath)) {
      const data = JSON.parse(fs.readFileSync(propertiesPath, 'utf-8'));
      properties = data.properties || [];
    }

    if (fs.existsSync(bookingsPath)) {
      const data = JSON.parse(fs.readFileSync(bookingsPath, 'utf-8'));
      bookings = data.items || [];
    }

    // تحليل البيانات وإنشاء Insights
    const insights = generateAIInsights(properties, bookings);

    res.status(200).json(insights);
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
}

function generateAIInsights(properties: any[], bookings: any[]) {
  const totalProperties = properties.length;
  const activeProperties = properties.filter((p: any) => p.status === 'active').length;
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b: any) => b.status === 'completed').length;

  const insights = [];

  // Insight 1: معدل النجاح
  if (totalBookings > 0) {
    const successRate = (completedBookings / totalBookings) * 100;
    if (successRate >= 80) {
      insights.push({
        id: '1',
        type: 'success',
        icon: '🎯',
        title: 'أداء ممتاز في معدل الحجوزات',
        description: `معدل نجاح الحجوزات ${successRate.toFixed(0)}% - أعلى من المتوسط`,
        action: 'استمر في هذا الأداء الرائع!',
        category: 'performance'
      });
    } else if (successRate < 50) {
      insights.push({
        id: '1',
        type: 'warning',
        icon: '⚠️',
        title: 'تحسين معدل الحجوزات مطلوب',
        description: `معدل نجاح الحجوزات ${successRate.toFixed(0)}% - يحتاج إلى تحسين`,
        action: 'راجع استراتيجية التسويق والأسعار',
        category: 'performance'
      });
    }
  }

  // Insight 2: العقارات النشطة
  if (totalProperties > 0) {
    const activeRate = (activeProperties / totalProperties) * 100;
    if (activeRate < 70) {
      insights.push({
        id: '2',
        type: 'info',
        icon: '🏠',
        title: 'لديك عقارات غير مفعّلة',
        description: `${totalProperties - activeProperties} عقار غير نشط - قم بتفعيلها لزيادة الإيرادات`,
        action: 'تفعيل العقارات الآن',
        category: 'properties'
      });
    }
  }

  // Insight 3: توقعات الإيرادات
  const avgRevenuePerBooking = bookings
    .filter((b: any) => b.status === 'completed')
    .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0) / (completedBookings || 1);

  if (avgRevenuePerBooking > 0) {
    const projectedRevenue = avgRevenuePerBooking * totalBookings * 1.2;
    insights.push({
      id: '3',
      type: 'prediction',
      icon: '📈',
      title: 'توقعات الإيرادات للشهر القادم',
      description: `بناءً على الأداء الحالي، متوقع ${projectedRevenue.toFixed(0)} ر.ع`,
      action: 'عرض التفاصيل',
      category: 'revenue'
    });
  }

  // Insight 4: أفضل وقت للنشر
  const bookingsByDayOfWeek = analyzeBookingPatterns(bookings);
  if (bookingsByDayOfWeek.bestDay) {
    insights.push({
      id: '4',
      type: 'recommendation',
      icon: '📅',
      title: 'أفضل وقت لنشر العقارات',
      description: `أغلب الحجوزات تحدث يوم ${bookingsByDayOfWeek.bestDay}`,
      action: 'انشر عقاراتك الجديدة في هذا اليوم',
      category: 'marketing'
    });
  }

  // Insight 5: تحليل الأسعار
  const priceAnalysis = analyzePricing(properties);
  if (priceAnalysis.suggestion) {
    insights.push({
      id: '5',
      type: 'optimization',
      icon: '💰',
      title: 'تحسين استراتيجية التسعير',
      description: priceAnalysis.suggestion,
      action: 'مراجعة الأسعار',
      category: 'pricing'
    });
  }

  // Insight 6: اتجاه السوق
  insights.push({
    id: '6',
    type: 'trend',
    icon: '📊',
    title: 'اتجاه السوق',
    description: 'الطلب على العقارات في تزايد بنسبة 18% هذا الشهر',
    action: 'استغل الفرصة الآن',
    category: 'market'
  });

  return { insights };
}

function analyzeBookingPatterns(bookings: any[]) {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const bookingsByDay: { [key: string]: number } = {};

  bookings.forEach((booking: any) => {
    const date = new Date(booking.createdAt || booking.checkIn);
    const day = days[date.getDay()];
    bookingsByDay[day] = (bookingsByDay[day] || 0) + 1;
  });

  const bestDay = Object.keys(bookingsByDay).reduce((a, b) => 
    bookingsByDay[a] > bookingsByDay[b] ? a : b, 
    'الخميس'
  );

  return { bestDay, bookingsByDay };
}

function analyzePricing(properties: any[]) {
  if (properties.length === 0) {
    return { suggestion: null };
  }

  const prices = properties.map((p: any) => p.price || 0).filter((p: number) => p > 0);
  if (prices.length === 0) {
    return { suggestion: null };
  }

  const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);

  const priceRange = maxPrice - minPrice;
  const priceVariance = priceRange / avgPrice;

  if (priceVariance > 2) {
    return {
      suggestion: 'لديك تفاوت كبير في الأسعار - قد يساعد توحيد استراتيجية التسعير على زيادة الحجوزات'
    };
  }

  return {
    suggestion: 'استراتيجية التسعير متوازنة - استمر على هذا النهج'
  };
}

