// src/pages/api/reviews/[id].ts - إدارة تقييم محدد
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const reviewsPath = path.join(process.cwd(), '.data', 'reviews.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!fs.existsSync(reviewsPath)) {
    return res.status(404).json({ error: 'Reviews not found' });
  }

  const data = JSON.parse(fs.readFileSync(reviewsPath, 'utf-8'));
  let reviews = data.reviews || [];

  if (req.method === 'GET') {
    const review = reviews.find((r: any) => r.id === id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.status(200).json({ review });
  } else if (req.method === 'PATCH') {
    const reviewIndex = reviews.findIndex((r: any) => r.id === id);
    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const updates = req.body;
    reviews[reviewIndex] = {
      ...reviews[reviewIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(reviewsPath, JSON.stringify({ reviews }, null, 2));
    res.status(200).json({ review: reviews[reviewIndex] });
  } else if (req.method === 'DELETE') {
    reviews = reviews.filter((r: any) => r.id !== id);
    fs.writeFileSync(reviewsPath, JSON.stringify({ reviews }, null, 2));
    res.status(200).json({ message: 'Review deleted' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

