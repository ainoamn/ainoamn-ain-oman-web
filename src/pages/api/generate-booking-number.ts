import { NextApiRequest, NextApiResponse } from 'next';
import { getNextSerialNumber } from '@/server/serialNumbers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const bookingNumber = await getNextSerialNumber('booking');
    res.status(200).json({ bookingNumber });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate booking number' });
  }
}