// src/pages/api/generate-booking-number.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { generateSerialNumber } from '@/server/serialNumbers';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const bookingNumber = generateSerialNumber('booking');
      res.status(200).json({ bookingNumber });
    } catch (error) {
      console.error('Error generating booking number:', error);
      res.status(500).json({ error: 'Failed to generate booking number' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}