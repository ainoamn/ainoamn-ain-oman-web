// src/pages/api/bookings/index.ts
import { NextApiRequest, NextApiResponse } from 'next';

// تخزين البيانات في متغير (مؤقت للاختبار، في الإنتاج يجب استخدام قاعدة بيانات)
let bookings: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // جلب جميع الحجوزات
    res.status(200).json({ bookings });
  } else if (req.method === 'POST') {
    try {
      const newBooking = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString(),
      };
      
      bookings.push(newBooking);
      res.status(201).json({ booking: newBooking });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create booking' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}