// src/pages/api/properties/featured.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getFeaturedProperties } from '@/lib/api/propertiesCrud';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const featuredProperties = await getFeaturedProperties();
    res.status(200).json(featuredProperties);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}