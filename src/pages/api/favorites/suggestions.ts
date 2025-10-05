// src/pages/api/favorites/suggestions.ts - الاقتراحات الذكية للمفضلة
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

interface Property {
  id: string;
  title: string;
  description?: string;
  priceMonthly?: number;
  location?: string;
  type?: string;
  status?: string;
  images?: string[];
  amenities?: string[];
  [key: string]: any;
}

interface Auction {
  id: string;
  title: string;
  description?: string;
  startingPrice?: number;
  currentBid?: number;
  location?: string;
  type?: string;
  status?: string;
  images?: string[];
  [key: string]: any;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const FAVORITES_FILE = path.join(DATA_DIR, 'favorites.json');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const AUCTIONS_FILE = path.join(DATA_DIR, 'auctions.json');

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

// قراءة العقارات
const readProperties = (): Property[] => {
  try {
    if (fs.existsSync(PROPERTIES_FILE)) {
      const data = fs.readFileSync(PROPERTIES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading properties:', error);
  }
  return [];
};

// قراءة المزادات
const readAuctions = (): Auction[] => {
  try {
    if (fs.existsSync(AUCTIONS_FILE)) {
      const data = fs.readFileSync(AUCTIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading auctions:', error);
  }
  return [];
};

// تحليل تفضيلات المستخدم
const analyzeUserPreferences = (userId: string): {
  preferredTypes: string[];
  preferredLocations: string[];
  preferredPriceRange: { min: number; max: number };
  preferredTags: string[];
  preferredStatuses: string[];
} => {
  const favorites = readFavorites();
  const userFavorites = favorites.filter(f => f.userId === userId);

  if (userFavorites.length === 0) {
    return {
      preferredTypes: [],
      preferredLocations: [],
      preferredPriceRange: { min: 0, max: 0 },
      preferredTags: [],
      preferredStatuses: []
    };
  }

  // تحليل الأنواع المفضلة
  const typeCounts = userFavorites.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const preferredTypes = Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type);

  // تحليل المواقع المفضلة
  const locationCounts = userFavorites.reduce((acc, f) => {
    if (f.itemLocation) {
      acc[f.itemLocation] = (acc[f.itemLocation] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const preferredLocations = Object.entries(locationCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([location]) => location);

  // تحليل نطاق الأسعار المفضل
  const prices = userFavorites
    .map(f => f.itemPrice)
    .filter(price => price !== undefined && price !== null) as number[];

  const preferredPriceRange = prices.length > 0 ? {
    min: Math.min(...prices),
    max: Math.max(...prices)
  } : { min: 0, max: 0 };

  // تحليل الشارات المفضلة
  const allTags = userFavorites.flatMap(f => f.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const preferredTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  // تحليل الحالات المفضلة
  const statusCounts = userFavorites.reduce((acc, f) => {
    if (f.itemStatus) {
      acc[f.itemStatus] = (acc[f.itemStatus] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const preferredStatuses = Object.entries(statusCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([status]) => status);

  return {
    preferredTypes,
    preferredLocations,
    preferredPriceRange,
    preferredTags,
    preferredStatuses
  };
};

// اقتراح عقارات جديدة
const suggestProperties = (userId: string, limit: number = 5): Property[] => {
  const preferences = analyzeUserPreferences(userId);
  const properties = readProperties();
  const favorites = readFavorites();
  const userFavoriteIds = favorites
    .filter(f => f.userId === userId && f.type === 'property')
    .map(f => f.itemId);

  // تصفية العقارات غير المفضلة
  const availableProperties = properties.filter(p => !userFavoriteIds.includes(p.id));

  // حساب نقاط التطابق
  const scoredProperties = availableProperties.map(property => {
    let score = 0;

    // تطابق النوع
    if (preferences.preferredTypes.includes('property')) {
      score += 10;
    }

    // تطابق الموقع
    if (property.location && preferences.preferredLocations.some(loc => 
      property.location!.toLowerCase().includes(loc.toLowerCase())
    )) {
      score += 15;
    }

    // تطابق نطاق السعر
    if (property.priceMonthly && preferences.preferredPriceRange.min > 0) {
      const price = property.priceMonthly;
      if (price >= preferences.preferredPriceRange.min && 
          price <= preferences.preferredPriceRange.max) {
        score += 20;
      } else if (price >= preferences.preferredPriceRange.min * 0.8 && 
                 price <= preferences.preferredPriceRange.max * 1.2) {
        score += 10;
      }
    }

    // تطابق الحالة
    if (property.status && preferences.preferredStatuses.includes(property.status)) {
      score += 10;
    }

    // تطابق المرافق
    if (property.amenities && preferences.preferredTags.length > 0) {
      const matchingAmenities = property.amenities.filter(amenity =>
        preferences.preferredTags.some(tag => 
          amenity.toLowerCase().includes(tag.toLowerCase())
        )
      );
      score += matchingAmenities.length * 5;
    }

    // عقارات جديدة
    const propertyDate = new Date(property.createdAt || property.updatedAt || '');
    const daysSinceCreation = (Date.now() - propertyDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 7) {
      score += 5;
    }

    return { ...property, score };
  });

  // ترتيب حسب النقاط
  return scoredProperties
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score, ...property }) => property);
};

// اقتراح مزادات جديدة
const suggestAuctions = (userId: string, limit: number = 5): Auction[] => {
  const preferences = analyzeUserPreferences(userId);
  const auctions = readAuctions();
  const favorites = readFavorites();
  const userFavoriteIds = favorites
    .filter(f => f.userId === userId && f.type === 'auction')
    .map(f => f.itemId);

  // تصفية المزادات غير المفضلة
  const availableAuctions = auctions.filter(a => !userFavoriteIds.includes(a.id));

  // حساب نقاط التطابق
  const scoredAuctions = availableAuctions.map(auction => {
    let score = 0;

    // تطابق النوع
    if (preferences.preferredTypes.includes('auction')) {
      score += 10;
    }

    // تطابق الموقع
    if (auction.location && preferences.preferredLocations.some(loc => 
      auction.location!.toLowerCase().includes(loc.toLowerCase())
    )) {
      score += 15;
    }

    // تطابق نطاق السعر
    if (auction.startingPrice && preferences.preferredPriceRange.min > 0) {
      const price = auction.startingPrice;
      if (price >= preferences.preferredPriceRange.min && 
          price <= preferences.preferredPriceRange.max) {
        score += 20;
      } else if (price >= preferences.preferredPriceRange.min * 0.8 && 
                 price <= preferences.preferredPriceRange.max * 1.2) {
        score += 10;
      }
    }

    // تطابق الحالة
    if (auction.status && preferences.preferredStatuses.includes(auction.status)) {
      score += 10;
    }

    // مزادات قادمة أو نشطة
    if (auction.status === 'upcoming' || auction.status === 'live') {
      score += 15;
    }

    return { ...auction, score };
  });

  // ترتيب حسب النقاط
  return scoredAuctions
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score, ...auction }) => auction);
};

// اقتراحات ذكية عامة
const generateSmartSuggestions = (userId: string): {
  properties: Property[];
  auctions: Auction[];
  recommendations: string[];
  insights: string[];
} => {
  const preferences = analyzeUserPreferences(userId);
  const properties = suggestProperties(userId, 3);
  const auctions = suggestAuctions(userId, 3);
  
  const recommendations: string[] = [];
  const insights: string[] = [];

  // توصيات بناءً على التفضيلات
  if (preferences.preferredTypes.includes('property')) {
    recommendations.push('نوصي بمراجعة العقارات الجديدة في المناطق المفضلة لديك');
  }

  if (preferences.preferredTypes.includes('auction')) {
    recommendations.push('توجد مزادات جديدة قد تهمك في نطاق السعر المفضل');
  }

  if (preferences.preferredLocations.length > 0) {
    recommendations.push(`ركز على المناطق المفضلة: ${preferences.preferredLocations.join(', ')}`);
  }

  // رؤى ذكية
  if (preferences.preferredPriceRange.min > 0) {
    insights.push(`نطاق السعر المفضل: ${preferences.preferredPriceRange.min} - ${preferences.preferredPriceRange.max} ريال عماني`);
  }

  if (preferences.preferredTags.length > 0) {
    insights.push(`الخصائص المفضلة: ${preferences.preferredTags.join(', ')}`);
  }

  if (preferences.preferredTypes.length > 0) {
    insights.push(`أنواع العقارات المفضلة: ${preferences.preferredTypes.join(', ')}`);
  }

  return {
    properties,
    auctions,
    recommendations,
    insights
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} not allowed` });
  }

  try {
    const { userId, type, limit = '5' } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const limitNum = Number(limit);

    if (type === 'properties') {
      const suggestions = suggestProperties(userId as string, limitNum);
      res.status(200).json({
        suggestions,
        type: 'properties',
        total: suggestions.length
      });
    } else if (type === 'auctions') {
      const suggestions = suggestAuctions(userId as string, limitNum);
      res.status(200).json({
        suggestions,
        type: 'auctions',
        total: suggestions.length
      });
    } else {
      const smartSuggestions = generateSmartSuggestions(userId as string);
      res.status(200).json({
        ...smartSuggestions,
        type: 'all',
        generatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error in favorites suggestions API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
