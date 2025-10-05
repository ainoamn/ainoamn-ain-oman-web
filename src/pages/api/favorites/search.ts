// src/pages/api/favorites/search.ts - البحث في المفضلة
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

// البحث في المفضلة
const searchFavorites = (
  favorites: Favorite[], 
  query: string, 
  filters: {
    userId?: string;
    type?: string;
    status?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
  }
): Favorite[] => {
  let results = [...favorites];

  // تطبيق الفلاتر
  if (filters.userId) {
    results = results.filter(f => f.userId === filters.userId);
  }

  if (filters.type && filters.type !== 'all') {
    results = results.filter(f => f.type === filters.type);
  }

  if (filters.status) {
    results = results.filter(f => f.itemStatus === filters.status);
  }

  if (filters.location) {
    results = results.filter(f => 
      f.itemLocation?.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }

  if (filters.minPrice !== undefined) {
    results = results.filter(f => (f.itemPrice || 0) >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    results = results.filter(f => (f.itemPrice || 0) <= filters.maxPrice!);
  }

  if (filters.tags && filters.tags.length > 0) {
    results = results.filter(f => 
      filters.tags!.some(tag => f.tags?.includes(tag))
    );
  }

  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    results = results.filter(f => new Date(f.addedAt) >= fromDate);
  }

  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    results = results.filter(f => new Date(f.addedAt) <= toDate);
  }

  // البحث النصي
  if (query && query.trim()) {
    const searchTerm = query.toLowerCase().trim();
    results = results.filter(f => 
      f.itemName.toLowerCase().includes(searchTerm) ||
      f.itemDescription.toLowerCase().includes(searchTerm) ||
      f.itemLocation?.toLowerCase().includes(searchTerm) ||
      f.notes?.toLowerCase().includes(searchTerm) ||
      f.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      f.itemId.toLowerCase().includes(searchTerm)
    );
  }

  return results;
};

// ترتيب النتائج
const sortFavorites = (
  favorites: Favorite[], 
  sortBy: string, 
  sortOrder: 'asc' | 'desc'
): Favorite[] => {
  return [...favorites].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'addedAt':
        aValue = new Date(a.addedAt);
        bValue = new Date(b.addedAt);
        break;
      case 'itemName':
        aValue = a.itemName;
        bValue = b.itemName;
        break;
      case 'itemPrice':
        aValue = a.itemPrice || 0;
        bValue = b.itemPrice || 0;
        break;
      case 'itemLocation':
        aValue = a.itemLocation || '';
        bValue = b.itemLocation || '';
        break;
      case 'itemStatus':
        aValue = a.itemStatus || '';
        bValue = b.itemStatus || '';
        break;
      default:
        aValue = new Date(a.addedAt);
        bValue = new Date(b.addedAt);
    }

    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
    } else {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }
  });
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} not allowed` });
  }

  try {
    const { 
      q: query = '', 
      userId, 
      type, 
      status, 
      location, 
      minPrice, 
      maxPrice, 
      tags, 
      dateFrom, 
      dateTo, 
      sortBy = 'addedAt', 
      sortOrder = 'desc',
      page = '1',
      limit = '20'
    } = req.query;

    const favorites = readFavorites();

    // تطبيق الفلاتر
    const filters = {
      userId: userId as string,
      type: type as string,
      status: status as string,
      location: location as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      tags: tags ? (tags as string).split(',') : undefined,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    // البحث
    let results = searchFavorites(favorites, query as string, filters);

    // ترتيب النتائج
    results = sortFavorites(results, sortBy as string, sortOrder as 'asc' | 'desc');

    // تطبيق الصفحات
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedResults = results.slice(startIndex, endIndex);

    // إحصائيات البحث
    const searchStats = {
      totalResults: results.length,
      currentPage: pageNum,
      totalPages: Math.ceil(results.length / limitNum),
      hasNextPage: endIndex < results.length,
      hasPrevPage: pageNum > 1,
      resultsPerPage: limitNum
    };

    res.status(200).json({
      results: paginatedResults,
      searchStats,
      query: query as string,
      filters,
      sortBy,
      sortOrder
    });
  } catch (error) {
    console.error('Error in favorites search API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
