import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
    try {
      // جلب البيانات من localStorage
      const properties = JSON.parse(localStorage.getItem('properties') || '[]');
      const property = properties.find((p: any) => p.id === id);
      
      if (!property) {
        return res.status(404).json({ error: 'العقار غير موجود' });
      }
      
      res.status(200).json({ item: property });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch property' });
    }
  } else if (req.method === 'PUT') {
    try {
      const properties = JSON.parse(localStorage.getItem('properties') || '[]');
      const propertyIndex = properties.findIndex((p: any) => p.id === id);
      
      if (propertyIndex === -1) {
        return res.status(404).json({ error: 'العقار غير موجود' });
      }
      
      // تحديث العقار
      properties[propertyIndex] = { ...properties[propertyIndex], ...req.body };
      localStorage.setItem('properties', JSON.stringify(properties));
      
      res.status(200).json({ property: properties[propertyIndex] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update property' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}