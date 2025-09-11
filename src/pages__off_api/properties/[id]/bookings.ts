// src/pages/api/properties/[id]/bookings.ts
import { NextApiRequest, NextApiResponse } from 'next';

// نحتاج للوصول إلى بيانات الحجوزات المخزنة
let bookings: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // تصفية الحجوزات الخاصة بالعقار المحدد
      const propertyBookings = bookings.filter(booking => booking.propertyId === id);
      
      res.status(200).json({
        bookings: propertyBookings,
        total: propertyBookings.length
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch property bookings' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}