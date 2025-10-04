// src/pages/api/favorites/manage.ts - إدارة المفضلة
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

// إضافة مفضلة جديدة
const addFavorite = (favoriteData: Partial<Favorite>): Favorite => {
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

// تحديث مفضلة
const updateFavorite = (id: string, updateData: Partial<Favorite>): Favorite | null => {
  const favorites = readFavorites();
  const index = favorites.findIndex(f => f.id === id);
  
  if (index === -1) {
    return null;
  }

  const updatedFavorite = {
    ...favorites[index],
    ...updateData,
    addedAt: favorites[index].addedAt // الحفاظ على تاريخ الإضافة الأصلي
  };

  favorites[index] = updatedFavorite;
  writeFavorites(favorites);
  
  return updatedFavorite;
};

// حذف مفضلة
const deleteFavorite = (id: string): boolean => {
  const favorites = readFavorites();
  const index = favorites.findIndex(f => f.id === id);
  
  if (index === -1) {
    return false;
  }

  favorites.splice(index, 1);
  writeFavorites(favorites);
  
  return true;
};

// حذف جميع المفضلة للمستخدم
const deleteAllUserFavorites = (userId: string): number => {
  const favorites = readFavorites();
  const initialLength = favorites.length;
  
  const filteredFavorites = favorites.filter(f => f.userId !== userId);
  writeFavorites(filteredFavorites);
  
  return initialLength - filteredFavorites.length;
};

// نسخ المفضلة من مستخدم إلى آخر
const copyFavorites = (fromUserId: string, toUserId: string): number => {
  const favorites = readFavorites();
  const userFavorites = favorites.filter(f => f.userId === fromUserId);
  
  if (userFavorites.length === 0) {
    return 0;
  }

  const copiedFavorites = userFavorites.map(favorite => ({
    ...favorite,
    id: `FAV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: toUserId,
    addedAt: new Date().toISOString()
  }));

  const updatedFavorites = [...favorites, ...copiedFavorites];
  writeFavorites(updatedFavorites);
  
  return copiedFavorites.length;
};

// دمج المفضلة
const mergeFavorites = (userId: string, favoriteIds: string[]): Favorite | null => {
  const favorites = readFavorites();
  const userFavorites = favorites.filter(f => 
    f.userId === userId && favoriteIds.includes(f.id)
  );
  
  if (userFavorites.length < 2) {
    return null;
  }

  // إنشاء مفضلة مدمجة
  const mergedFavorite: Favorite = {
    id: `FAV-${Date.now()}`,
    userId,
    type: userFavorites[0].type,
    itemId: userFavorites[0].itemId,
    itemName: userFavorites.map(f => f.itemName).join(' + '),
    itemDescription: userFavorites.map(f => f.itemDescription).join(' | '),
    itemImage: userFavorites[0].itemImage,
    itemPrice: userFavorites.reduce((sum, f) => sum + (f.itemPrice || 0), 0),
    itemLocation: userFavorites[0].itemLocation,
    itemStatus: userFavorites[0].itemStatus,
    itemType: userFavorites[0].itemType,
    addedAt: new Date().toISOString(),
    notes: `مفضلة مدمجة من ${userFavorites.length} عناصر`,
    tags: [...new Set(userFavorites.flatMap(f => f.tags || []))]
  };

  // حذف المفضلة الأصلية
  const filteredFavorites = favorites.filter(f => !favoriteIds.includes(f.id));
  
  // إضافة المفضلة المدمجة
  const updatedFavorites = [...filteredFavorites, mergedFavorite];
  writeFavorites(updatedFavorites);
  
  return mergedFavorite;
};

// تصدير المفضلة
const exportFavorites = (userId: string, format: 'json' | 'csv' = 'json'): string => {
  const favorites = readFavorites();
  const userFavorites = favorites.filter(f => f.userId === userId);
  
  if (format === 'csv') {
    const headers = [
      'ID', 'Type', 'Item ID', 'Item Name', 'Description', 'Price', 
      'Location', 'Status', 'Type', 'Added At', 'Notes', 'Tags'
    ];
    
    const rows = userFavorites.map(f => [
      f.id,
      f.type,
      f.itemId,
      f.itemName,
      f.itemDescription,
      f.itemPrice || '',
      f.itemLocation || '',
      f.itemStatus || '',
      f.itemType || '',
      f.addedAt,
      f.notes || '',
      (f.tags || []).join(';')
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }
  
  return JSON.stringify(userFavorites, null, 2);
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        // إضافة مفضلة جديدة
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

        const newFavorite = addFavorite({
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

        const updatedFavorite = updateFavorite(id, updateData);

        if (!updatedFavorite) {
          return res.status(404).json({ error: 'Favorite not found' });
        }

        res.status(200).json({
          message: 'Favorite updated successfully',
          favorite: updatedFavorite
        });
        break;

      case 'DELETE':
        // حذف مفضلة
        const { id: deleteId, userId: deleteUserId, action } = req.query;

        if (action === 'deleteAll' && deleteUserId) {
          // حذف جميع المفضلة للمستخدم
          const deletedCount = deleteAllUserFavorites(deleteUserId as string);
          res.status(200).json({
            message: `Deleted ${deletedCount} favorites successfully`
          });
        } else if (action === 'copy' && deleteUserId) {
          // نسخ المفضلة
          const { fromUserId, toUserId } = req.body;
          if (!fromUserId || !toUserId) {
            return res.status(400).json({ error: 'fromUserId and toUserId are required' });
          }
          
          const copiedCount = copyFavorites(fromUserId, toUserId);
          res.status(200).json({
            message: `Copied ${copiedCount} favorites successfully`
          });
        } else if (action === 'merge' && deleteUserId) {
          // دمج المفضلة
          const { favoriteIds } = req.body;
          if (!favoriteIds || !Array.isArray(favoriteIds) || favoriteIds.length < 2) {
            return res.status(400).json({ error: 'At least 2 favorite IDs are required for merging' });
          }
          
          const mergedFavorite = mergeFavorites(deleteUserId as string, favoriteIds);
          if (!mergedFavorite) {
            return res.status(400).json({ error: 'Could not merge favorites' });
          }
          
          res.status(200).json({
            message: 'Favorites merged successfully',
            favorite: mergedFavorite
          });
        } else if (deleteId) {
          // حذف مفضلة واحدة
          const deleted = deleteFavorite(deleteId as string);
          if (!deleted) {
            return res.status(404).json({ error: 'Favorite not found' });
          }
          
          res.status(200).json({
            message: 'Favorite removed successfully'
          });
        } else {
          return res.status(400).json({ error: 'Invalid delete action' });
        }
        break;

      case 'GET':
        // تصدير المفضلة
        const { userId: exportUserId, format = 'json' } = req.query;
        
        if (!exportUserId) {
          return res.status(400).json({ error: 'User ID is required for export' });
        }

        const exportedData = exportFavorites(exportUserId as string, format as 'json' | 'csv');
        
        res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="favorites-${exportUserId}.${format}"`);
        res.status(200).send(exportedData);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Error in favorites manage API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
