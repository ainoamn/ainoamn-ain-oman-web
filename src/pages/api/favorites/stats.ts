// src/pages/api/favorites/stats.ts - إحصائيات المفضلة
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Favorite {
  id: string;
  userId: string;
  type: 'property' | 'auction' | 'customer' | 'report';
  itemId: string;
  itemName: string;
  itemDescription: string;
  itemImage?: string;
  itemPrice?: number;
  itemLocation?: string;
  itemStatus?: string;
  itemType?: string;
  addedAt: string;
  notes?: string;
  tags?: string[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const FAVORITES_FILE = path.join(DATA_DIR, 'favorites.json');

// قراءة المفضلة
const readFavorites = (): Favorite[] => {
  try {
    if (fs.existsSync(FAVORITES_FILE)) {
      const data = fs.readFileSync(FAVORITES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading favorites:', error);
  }
  return [];
};

// حساب الإحصائيات
const calculateStats = (favorites: Favorite[], userId?: string) => {
  let filteredFavorites = favorites;
  
  if (userId) {
    filteredFavorites = favorites.filter(f => f.userId === userId);
  }

  const total = filteredFavorites.length;
  
  // إحصائيات حسب النوع
  const byType = filteredFavorites.reduce((acc, favorite) => {
    acc[favorite.type] = (acc[favorite.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // إحصائيات حسب الحالة
  const byStatus = filteredFavorites.reduce((acc, favorite) => {
    if (favorite.itemStatus) {
      acc[favorite.itemStatus] = (acc[favorite.itemStatus] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // إحصائيات حسب الموقع
  const byLocation = filteredFavorites.reduce((acc, favorite) => {
    if (favorite.itemLocation) {
      acc[favorite.itemLocation] = (acc[favorite.itemLocation] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // إحصائيات حسب السعر
  const withPrice = filteredFavorites.filter(f => f.itemPrice);
  const totalValue = withPrice.reduce((sum, f) => sum + (f.itemPrice || 0), 0);
  const averagePrice = withPrice.length > 0 ? totalValue / withPrice.length : 0;
  const minPrice = withPrice.length > 0 ? Math.min(...withPrice.map(f => f.itemPrice || 0)) : 0;
  const maxPrice = withPrice.length > 0 ? Math.max(...withPrice.map(f => f.itemPrice || 0)) : 0;

  // إحصائيات حسب التاريخ
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const addedLastWeek = filteredFavorites.filter(f => 
    new Date(f.addedAt) >= lastWeek
  ).length;
  
  const addedLastMonth = filteredFavorites.filter(f => 
    new Date(f.addedAt) >= lastMonth
  ).length;

  // إحصائيات حسب الشارات
  const allTags = filteredFavorites.flatMap(f => f.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  // إحصائيات حسب المستخدمين
  const byUser = favorites.reduce((acc, favorite) => {
    acc[favorite.userId] = (acc[favorite.userId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topUsers = Object.entries(byUser)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([userId, count]) => ({ userId, count }));

  return {
    total,
    byType,
    byStatus,
    byLocation,
    priceStats: {
      totalValue,
      averagePrice,
      minPrice,
      maxPrice,
      withPrice: withPrice.length
    },
    timeStats: {
      addedLastWeek,
      addedLastMonth,
      addedToday: filteredFavorites.filter(f => {
        const addedDate = new Date(f.addedAt);
        return addedDate.toDateString() === now.toDateString();
      }).length
    },
    topTags,
    topUsers,
    recentFavorites: filteredFavorites
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, 5)
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} not allowed` });
  }

  try {
    const { userId } = req.query;
    const favorites = readFavorites();
    const stats = calculateStats(favorites, userId as string);

    res.status(200).json({
      stats,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in favorites stats API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
