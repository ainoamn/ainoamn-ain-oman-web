// src/pages/api/rentals/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { repo } from "@/server/rentals/workflow";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  
  if (!id) {
    return res.status(400).json({ error: 'Missing rental ID' });
  }

  if (req.method === "GET") {
    try {
      const rental = await repo.load(id);
      
      if (!rental) {
        return res.status(404).json({ error: 'Rental not found' });
      }
      
      return res.status(200).json({ rental });
    } catch (error) {
      console.error('Error fetching rental:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === "PATCH") {
    try {
      const updates = req.body;
      const rental = await repo.load(id);
      
      if (!rental) {
        return res.status(404).json({ error: 'Rental not found' });
      }
      
      const updatedRental = {
        ...rental,
        ...updates,
        updatedAt: Date.now()
      };
      
      await repo.save(updatedRental);
      
      return res.status(200).json({ rental: updatedRental });
    } catch (error) {
      console.error('Error updating rental:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === "DELETE") {
    try {
      // حذف العقد (إذا كان النظام يدعم ذلك)
      // يمكن إضافة منطق الحذف هنا
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting rental:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

