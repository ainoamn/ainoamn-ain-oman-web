// src/server/ratings/store.ts - مخزن التقييمات
import { Rating, RatingResponse, RatingStats, RatingFilters } from '@/types/ratings';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), '.data');
const RATINGS_FILE = join(DATA_DIR, 'ratings.json');
const RESPONSES_FILE = join(DATA_DIR, 'rating-responses.json');

// تهيئة الملفات
async function ensureFiles() {
  try {
    await readFile(RATINGS_FILE);
  } catch {
    await writeFile(RATINGS_FILE, JSON.stringify([], null, 2));
  }
  try {
    await readFile(RESPONSES_FILE);
  } catch {
    await writeFile(RESPONSES_FILE, JSON.stringify([], null, 2));
  }
}

// قراءة التقييمات
export async function getRatings(filters?: RatingFilters): Promise<Rating[]> {
  await ensureFiles();
  const data = await readFile(RATINGS_FILE, 'utf-8');
  let ratings: Rating[] = JSON.parse(data || '[]');

  // تطبيق الفلاتر
  if (filters) {
    if (filters.minRating) {
      ratings = ratings.filter(r => r.overallRating >= filters.minRating!);
    }
    if (filters.maxRating) {
      ratings = ratings.filter(r => r.overallRating <= filters.maxRating!);
    }
    if (filters.verifiedOnly) {
      ratings = ratings.filter(r => r.verified);
    }
    if (filters.hasResponse !== undefined) {
      ratings = ratings.filter(r => (filters.hasResponse ? !!r.responseId : !r.responseId));
    }
    if (filters.reviewType) {
      ratings = ratings.filter(r => r.reviewType === filters.reviewType);
    }
    if (filters.dimension) {
      ratings = ratings.filter(r => 
        r.dimensions.some(d => d.dimension === filters.dimension)
      );
    }
    if (filters.dateFrom) {
      ratings = ratings.filter(r => r.createdAt >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      ratings = ratings.filter(r => r.createdAt <= filters.dateTo!);
    }
  }

  return ratings;
}

// حفظ تقييم جديد
export async function createRating(rating: Omit<Rating, 'id' | 'createdAt' | 'updatedAt'>): Promise<Rating> {
  await ensureFiles();
  const ratings = await getRatings();
  
  const newRating: Rating = {
    ...rating,
    id: `rating-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  ratings.push(newRating);
  await writeFile(RATINGS_FILE, JSON.stringify(ratings, null, 2));
  
  return newRating;
}

// تحديث تقييم
export async function updateRating(id: string, updates: Partial<Rating>): Promise<Rating | null> {
  await ensureFiles();
  const ratings = await getRatings();
  const index = ratings.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  ratings[index] = {
    ...ratings[index],
    ...updates,
    updatedAt: Date.now(),
  };
  
  await writeFile(RATINGS_FILE, JSON.stringify(ratings, null, 2));
  return ratings[index];
}

// حذف تقييم
export async function deleteRating(id: string): Promise<boolean> {
  await ensureFiles();
  const ratings = await getRatings();
  const filtered = ratings.filter(r => r.id !== id);
  
  if (filtered.length === ratings.length) return false;
  
  await writeFile(RATINGS_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

// جلب تقييم محدد
export async function getRatingById(id: string): Promise<Rating | null> {
  const ratings = await getRatings();
  return ratings.find(r => r.id === id) || null;
}

// جلب التقييمات حسب المستخدم
export async function getRatingsByUser(userId: string, type: 'reviewer' | 'reviewee'): Promise<Rating[]> {
  const ratings = await getRatings();
  return ratings.filter(r => 
    type === 'reviewer' ? r.reviewerId === userId : r.revieweeId === userId
  );
}

// جلب التقييمات حسب العقار
export async function getRatingsByProperty(propertyId: string): Promise<Rating[]> {
  const ratings = await getRatings();
  return ratings.filter(r => r.propertyId === propertyId);
}

// حساب الإحصائيات
export async function getRatingStats(userId?: string, propertyId?: string): Promise<RatingStats> {
  let ratings = await getRatings();
  
  if (userId) {
    ratings = ratings.filter(r => r.revieweeId === userId);
  }
  if (propertyId) {
    ratings = ratings.filter(r => r.propertyId === propertyId);
  }

  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0
    ? ratings.reduce((sum, r) => sum + r.overallRating, 0) / totalRatings
    : 0;

  const ratingDistribution = {
    1: ratings.filter(r => r.overallRating === 1).length,
    2: ratings.filter(r => r.overallRating === 2).length,
    3: ratings.filter(r => r.overallRating === 3).length,
    4: ratings.filter(r => r.overallRating === 4).length,
    5: ratings.filter(r => r.overallRating === 5).length,
  };

  // حساب متوسطات الأبعاد
  const dimensionAverages: Record<string, number> = {};
  const dimensionCounts: Record<string, number> = {};
  
  ratings.forEach(rating => {
    rating.dimensions.forEach(dim => {
      if (!dimensionAverages[dim.dimension]) {
        dimensionAverages[dim.dimension] = 0;
        dimensionCounts[dim.dimension] = 0;
      }
      dimensionAverages[dim.dimension] += dim.score;
      dimensionCounts[dim.dimension] += 1;
    });
  });

  Object.keys(dimensionAverages).forEach(dim => {
    if (dimensionCounts[dim] > 0) {
      dimensionAverages[dim] = dimensionAverages[dim] / dimensionCounts[dim];
    }
  });

  const verifiedCount = ratings.filter(r => r.verified).length;
  const responseRate = totalRatings > 0
    ? ratings.filter(r => r.responseId).length / totalRatings
    : 0;
  const helpfulCount = ratings.reduce((sum, r) => sum + (r.helpful || 0), 0);

  return {
    totalRatings,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution,
    dimensionAverages: dimensionAverages as any,
    verifiedCount,
    responseRate: Math.round(responseRate * 100) / 100,
    helpfulCount,
  };
}

// إدارة الردود
export async function getResponses(): Promise<RatingResponse[]> {
  await ensureFiles();
  const data = await readFile(RESPONSES_FILE, 'utf-8');
  return JSON.parse(data || '[]');
}

export async function createResponse(response: Omit<RatingResponse, 'id' | 'createdAt' | 'updatedAt'>): Promise<RatingResponse> {
  await ensureFiles();
  const responses = await getResponses();
  
  const newResponse: RatingResponse = {
    ...response,
    id: `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  responses.push(newResponse);
  await writeFile(RESPONSES_FILE, JSON.stringify(responses, null, 2));
  
  // تحديث التقييم برابط الرد
  await updateRating(response.ratingId, { responseId: newResponse.id });
  
  return newResponse;
}






