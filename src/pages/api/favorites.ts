// @ts-nocheck
// src/pages/api/favorites.ts - API المفضلة
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

// كتابة المفضلة
const writeFavorites = (favorites: Favorite[]): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favorites, null, 2));
  } catch (error) {
    console.error('Error writing favorites:', error);
    throw error;
  }
};

// إنشاء مفضلة جديدة
const createFavorite = (favoriteData: Partial<Favorite>): Favorite => {
  const now = new Date().toISOString();
  const id = `FAV-${Date.now()}`;
  
  return {
    id,
    userId: favoriteData.userId || '',
    type: favoriteData.type || 'property',
    itemId: favoriteData.itemId || '',
    itemName: favoriteData.itemName || '',
    itemDescription: favoriteData.itemDescription || '',
    itemImage: favoriteData.itemImage,
    itemPrice: favoriteData.itemPrice,
    itemLocation: favoriteData.itemLocation,
    itemStatus: favoriteData.itemStatus,
    itemType: favoriteData.itemType,
    addedAt: favoriteData.addedAt || now,
    notes: favoriteData.notes,
    tags: favoriteData.tags || []
  };
};

// إنشاء بيانات تجريبية للمفضلة
const createSampleFavorites = (): Favorite[] => {
  const now = new Date();
  const sampleFavorites: Favorite[] = [
    {
      id: 'FAV-001',
      userId: 'USER-001',
      type: 'property',
      itemId: 'P-20250911120430',
      itemName: 'شقة فاخرة في مسقط',
      itemDescription: 'شقة حديثة بمساحة 120 متر مربع في موقع مميز',
      itemImage: '/images/property-1.jpg',
      itemPrice: 450,
      itemLocation: 'مسقط، سلطنة عُمان',
      itemStatus: 'available',
      itemType: 'apartment',
      addedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'شقة مناسبة للعائلات',
      tags: ['فاخرة', 'حديثة', 'عائلية']
    },
    {
      id: 'FAV-002',
      userId: 'USER-001',
      type: 'auction',
      itemId: 'AUCTION-001',
      itemName: 'مزاد فيلا فاخرة في صلالة',
      itemDescription: 'فيلا فاخرة بمساحة 500 متر مربع مع حديقة خاصة وحمام سباحة',
      itemImage: '/images/villa-1.jpg',
      itemPrice: 175000,
      itemLocation: 'صلالة، محافظة ظفار',
      itemStatus: 'live',
      itemType: 'villa',
      addedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'مزاد علني - التسجيل مطلوب مسبقاً',
      tags: ['فاخرة', 'حديقة', 'حمام سباحة']
    },
    {
      id: 'FAV-003',
      userId: 'USER-001',
      type: 'customer',
      itemId: 'CUST-001',
      itemName: 'أحمد محمد العبري',
      itemDescription: 'عميل مميز، دفع منتظم',
      itemImage: '/avatars/ahmed.jpg',
      itemLocation: 'مسقط، سلطنة عُمان',
      itemStatus: 'active',
      itemType: 'individual',
      addedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'عميل موثوق',
      tags: ['مميز', 'منتظم', 'موثوق']
    },
    {
      id: 'FAV-004',
      userId: 'USER-001',
      type: 'property',
      itemId: 'P-20250930145909',
      itemName: 'فيلا في صلالة',
      itemDescription: 'فيلا فاخرة بمساحة 300 متر مربع مع حديقة واسعة',
      itemImage: '/images/villa-2.jpg',
      itemPrice: 800,
      itemLocation: 'صلالة، محافظة ظفار',
      itemStatus: 'rented',
      itemType: 'villa',
      addedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'فيلا مناسبة للعائلات الكبيرة',
      tags: ['فاخرة', 'حديقة', 'عائلية']
    },
    {
      id: 'FAV-005',
      userId: 'USER-001',
      type: 'auction',
      itemId: 'AUCTION-002',
      itemName: 'مزاد شقة في مسقط',
      itemDescription: 'شقة حديثة بمساحة 120 متر مربع في موقع مميز',
      itemImage: '/images/apartment-1.jpg',
      itemPrice: 80000,
      itemLocation: 'مسقط، محافظة مسقط',
      itemStatus: 'upcoming',
      itemType: 'apartment',
      addedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'مزاد علني - التسجيل مطلوب مسبقاً',
      tags: ['حديثة', 'مميز', 'شقة']
    },
    {
      id: 'FAV-006',
      userId: 'USER-001',
      type: 'customer',
      itemId: 'CUST-002',
      itemName: 'فاطمة علي الشنفري',
      itemDescription: 'عميلة جديدة، تحتاج متابعة',
      itemImage: '/avatars/fatima.jpg',
      itemLocation: 'مسقط، سلطنة عُمان',
      itemStatus: 'active',
      itemType: 'individual',
      addedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'عميلة جديدة',
      tags: ['جديدة', 'متابعة', 'نشطة']
    },
    {
      id: 'FAV-007',
      userId: 'USER-001',
      type: 'property',
      itemId: 'P-20250930145910',
      itemName: 'مكتب تجاري في نزوى',
      itemDescription: 'مكتب تجاري بمساحة 200 متر مربع في قلب المدينة',
      itemImage: '/images/office-1.jpg',
      itemPrice: 650,
      itemLocation: 'نزوى، محافظة الداخلية',
      itemStatus: 'available',
      itemType: 'office',
      addedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'مكتب مناسب للشركات',
      tags: ['تجاري', 'مكتب', 'شركات']
    },
    {
      id: 'FAV-008',
      userId: 'USER-001',
      type: 'auction',
      itemId: 'AUCTION-003',
      itemName: 'مزاد محل تجاري في صحار',
      itemDescription: 'محل تجاري بمساحة 80 متر مربع في شارع رئيسي',
      itemImage: '/images/shop-1.jpg',
      itemPrice: 60000,
      itemLocation: 'صحار، محافظة شمال الباطنة',
      itemStatus: 'upcoming',
      itemType: 'shop',
      addedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'محل مناسب للتجارة',
      tags: ['تجاري', 'محل', 'شارع رئيسي']
    }
  ];

  return sampleFavorites;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // قراءة المفضلة
        let favorites = readFavorites();
        
        // إنشاء بيانات تجريبية إذا لم تكن موجودة
        if (favorites.length === 0) {
          favorites = createSampleFavorites();
          writeFavorites(favorites);
        }

        const { 
          userId = 'USER-001', 
          type, 
          sortBy = 'addedAt', 
          sortOrder = 'desc' 
        } = req.query;

        // تطبيق الفلاتر
        let filteredFavorites = [...favorites];

        if (userId) {
          filteredFavorites = filteredFavorites.filter(f => f.userId === userId);
        }

        if (type && type !== 'all') {
          filteredFavorites = filteredFavorites.filter(f => f.type === type);
        }

        // ترتيب النتائج
        filteredFavorites.sort((a, b) => {
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

        res.status(200).json({
          favorites: filteredFavorites,
          total: filteredFavorites.length,
          filters: {
            userId,
            type,
            sortBy,
            sortOrder
          }
        });
        break;

      case 'POST':
        // إنشاء مفضلة جديدة
        const { 
          userId, 
          type, 
          itemId, 
          itemName, 
          itemDescription, 
          itemImage, 
          itemPrice, 
          itemLocation, 
          itemStatus, 
          itemType, 
          notes, 
          tags
        } = req.body;

        if (!userId || !type || !itemId || !itemName) {
          return res.status(400).json({
            error: 'Missing required fields: userId, type, itemId, itemName'
          });
        }

        // التحقق من عدم تكرار المفضلة
        const existingFavorites = readFavorites();
        const existingFavorite = existingFavorites.find(f => 
          f.userId === userId && f.type === type && f.itemId === itemId
        );

        if (existingFavorite) {
          return res.status(400).json({
            error: 'Item already in favorites'
          });
        }

        const newFavorite = createFavorite({
          userId,
          type,
          itemId,
          itemName,
          itemDescription,
          itemImage,
          itemPrice: itemPrice ? Number(itemPrice) : undefined,
          itemLocation,
          itemStatus,
          itemType,
          notes,
          tags
        });

        const updatedFavorites = [...existingFavorites, newFavorite];
        writeFavorites(updatedFavorites);

        res.status(201).json({
          message: 'Favorite added successfully',
          favorite: newFavorite
        });
        break;

      case 'PUT':
        // تحديث مفضلة
        const { id, ...updateData } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Favorite ID is required' });
        }

        const allFavorites = readFavorites();
        const favoriteIndex = allFavorites.findIndex(f => f.id === id);

        if (favoriteIndex === -1) {
          return res.status(404).json({ error: 'Favorite not found' });
        }

        const updatedFavorite = {
          ...allFavorites[favoriteIndex],
          ...updateData,
          addedAt: allFavorites[favoriteIndex].addedAt // الحفاظ على تاريخ الإضافة الأصلي
        };

        allFavorites[favoriteIndex] = updatedFavorite;
        writeFavorites(allFavorites);

        res.status(200).json({
          message: 'Favorite updated successfully',
          favorite: updatedFavorite
        });
        break;

      case 'DELETE':
        // حذف مفضلة
        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({ error: 'Favorite ID is required' });
        }

        const favoritesToDelete = readFavorites();
        const deleteIndex = favoritesToDelete.findIndex(f => f.id === deleteId);

        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Favorite not found' });
        }

        favoritesToDelete.splice(deleteIndex, 1);
        writeFavorites(favoritesToDelete);

        res.status(200).json({
          message: 'Favorite removed successfully'
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error in favorites API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
