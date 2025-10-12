// src/pages/api/financial/next-invoice-number.ts - API للحصول على رقم الفاتورة التالي
import type { NextApiRequest, NextApiResponse } from 'next';
import { getNextInvoiceNumber } from '@/server/serialNumbers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const nextNumber = await getNextInvoiceNumber();
    return res.status(200).json({ invoiceNumber: nextNumber });
  } catch (error) {
    console.error('Error getting next invoice number:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

