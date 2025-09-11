// src/pages/api/bookings/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';

// نحتاج للوصول إلى بيانات الحجوزات المخزنة
let bookings: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (req.method === 'PUT') {
    try {
      const bookingIndex = bookings.findIndex(b => b.id === id);
      
      if (bookingIndex === -1) {
        return res.status(404).json({ error: 'الحجز غير موجود' });
      }
      
      // تحديث الحجز
      bookings[bookingIndex] = { ...bookings[bookingIndex], ...req.body };
      
      res.status(200).json({ booking: bookings[bookingIndex] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update booking' });
    }
  } else if (req.method === 'GET') {
    try {
      const booking = bookings.find(b => b.id === id);
      
      if (!booking) {
        return res.status(404).json({ error: 'الحجز غير موجود' });
      }
      
      res.status(200).json({ booking });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch booking' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}