// src/lib/rating.ts - نظام التقييم والشارات الذكي
export interface Rating {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetType: 'property' | 'tenant' | 'landlord' | 'service';
  targetId: string;
  rating: number; // 1-5
  review?: string;
  categories: {
    cleanliness?: number;
    communication?: number;
    maintenance?: number;
    value?: number;
    location?: number;
  };
  images?: string[];
  verified: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'achievement' | 'status' | 'special' | 'level';
  requirements: {
    type: 'rating' | 'count' | 'duration' | 'custom';
    value: number;
    condition?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

export interface UserProfile {
  userId: string;
  overallRating: number;
  totalRatings: number;
  badges: string[];
  level: number;
  points: number;
  achievements: string[];
  stats: {
    propertiesRated: number;
    reviewsWritten: number;
    helpfulVotes: number;
    verifiedReviews: number;
  };
}

export class RatingSystem {
  private badges: Badge[] = [
    // شارات الإنجاز
    {
      id: 'first_review',
      name: 'مراجع جديد',
      description: 'أول تقييم لك',
      icon: '⭐',
      color: '#FFD700',
      category: 'achievement',
      requirements: { type: 'count', value: 1 },
      rarity: 'common',
      points: 10
    },
    {
      id: 'reviewer_10',
      name: 'مراجع نشط',
      description: '10 تقييمات',
      icon: '🏆',
      color: '#C0C0C0',
      category: 'achievement',
      requirements: { type: 'count', value: 10 },
      rarity: 'rare',
      points: 50
    },
    {
      id: 'reviewer_50',
      name: 'خبير التقييم',
      description: '50 تقييم',
      icon: '👑',
      color: '#FFD700',
      category: 'achievement',
      requirements: { type: 'count', value: 50 },
      rarity: 'epic',
      points: 200
    },
    {
      id: 'helpful_reviewer',
      name: 'مراجع مفيد',
      description: '100 تصويت مفيد',
      icon: '👍',
      color: '#4CAF50',
      category: 'achievement',
      requirements: { type: 'count', value: 100, condition: 'helpful' },
      rarity: 'rare',
      points: 100
    },
    // شارات الحالة
    {
      id: 'verified_user',
      name: 'مستخدم موثق',
      description: 'حساب موثق',
      icon: '✅',
      color: '#2196F3',
      category: 'status',
      requirements: { type: 'custom', value: 1, condition: 'verified' },
      rarity: 'common',
      points: 25
    },
    {
      id: 'premium_member',
      name: 'عضو مميز',
      description: 'عضو في الخطة المميزة',
      icon: '💎',
      color: '#9C27B0',
      category: 'status',
      requirements: { type: 'custom', value: 1, condition: 'premium' },
      rarity: 'epic',
      points: 150
    },
    // شارات خاصة
    {
      id: 'early_adopter',
      name: 'مبكر في التبني',
      description: 'من أوائل المستخدمين',
      icon: '🚀',
      color: '#FF5722',
      category: 'special',
      requirements: { type: 'custom', value: 1, condition: 'early_user' },
      rarity: 'legendary',
      points: 500
    }
  ];

  // إضافة تقييم جديد
  async addRating(rating: Omit<Rating, 'id' | 'createdAt' | 'updatedAt'>): Promise<Rating> {
    const newRating: Rating = {
      ...rating,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // حفظ التقييم (هنا يمكن إضافة API call)
    await this.saveRating(newRating);

    // تحديث ملف المستخدم
    await this.updateUserProfile(rating.userId);

    // فحص الشارات الجديدة
    await this.checkNewBadges(rating.userId);

    return newRating;
  }

  // حساب التقييم الإجمالي
  calculateOverallRating(ratings: Rating[]): number {
    if (ratings.length === 0) return 0;
    
    const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return Math.round((total / ratings.length) * 10) / 10;
  }

  // حساب التقييم حسب الفئات
  calculateCategoryRatings(ratings: Rating[]): Record<string, number> {
    const categories = ['cleanliness', 'communication', 'maintenance', 'value', 'location'];
    const result: Record<string, number> = {};

    categories.forEach(category => {
      const categoryRatings = ratings
        .map(rating => rating.categories[category as keyof typeof rating.categories])
        .filter(rating => rating !== undefined) as number[];

      if (categoryRatings.length > 0) {
        const total = categoryRatings.reduce((sum, rating) => sum + rating, 0);
        result[category] = Math.round((total / categoryRatings.length) * 10) / 10;
      }
    });

    return result;
  }

  // فحص الشارات الجديدة
  async checkNewBadges(userId: string): Promise<Badge[]> {
    const userProfile = await this.getUserProfile(userId);
    const userRatings = await this.getUserRatings(userId);
    const newBadges: Badge[] = [];

    for (const badge of this.badges) {
      if (userProfile.badges.includes(badge.id)) continue;

      let earned = false;

      switch (badge.requirements.type) {
        case 'count':
          if (badge.requirements.condition === 'helpful') {
            earned = userProfile.stats.helpfulVotes >= badge.requirements.value;
          } else {
            earned = userRatings.length >= badge.requirements.value;
          }
          break;
        case 'rating':
          earned = userProfile.overallRating >= badge.requirements.value;
          break;
        case 'custom':
          earned = await this.checkCustomRequirement(badge.requirements.condition!, userId);
          break;
      }

      if (earned) {
        newBadges.push(badge);
        userProfile.badges.push(badge.id);
        userProfile.points += badge.points;
      }
    }

    if (newBadges.length > 0) {
      await this.updateUserProfile(userId);
      await this.notifyNewBadges(userId, newBadges);
    }

    return newBadges;
  }

  // حساب مستوى المستخدم
  calculateUserLevel(points: number): number {
    return Math.floor(points / 100) + 1;
  }

  // الحصول على شارات المستخدم
  getUserBadges(userId: string): Badge[] {
    // هذا سيتم استبداله بـ API call
    return [];
  }

  // إضافة تصويت مفيد
  async addHelpfulVote(ratingId: string, userId: string): Promise<void> {
    // تحديث التقييم
    const rating = await this.getRating(ratingId);
    if (rating) {
      rating.helpful += 1;
      await this.updateRating(rating);
    }

    // تحديث ملف المستخدم
    await this.updateUserProfile(userId);
  }

  // الحصول على تقييمات العقار
  async getPropertyRatings(propertyId: string): Promise<Rating[]> {
    // هذا سيتم استبداله بـ API call
    return [];
  }

  // الحصول على ملف المستخدم
  async getUserProfile(userId: string): Promise<UserProfile> {
    // هذا سيتم استبداله بـ API call
    return {
      userId,
      overallRating: 0,
      totalRatings: 0,
      badges: [],
      level: 1,
      points: 0,
      achievements: [],
      stats: {
        propertiesRated: 0,
        reviewsWritten: 0,
        helpfulVotes: 0,
        verifiedReviews: 0
      }
    };
  }

  // الحصول على تقييمات المستخدم
  async getUserRatings(userId: string): Promise<Rating[]> {
    // هذا سيتم استبداله بـ API call
    return [];
  }

  // الحصول على تقييم محدد
  async getRating(ratingId: string): Promise<Rating | null> {
    // هذا سيتم استبداله بـ API call
    return null;
  }

  // حفظ التقييم
  private async saveRating(rating: Rating): Promise<void> {
    // هذا سيتم استبداله بـ API call
    console.log('Saving rating:', rating);
  }

  // تحديث التقييم
  private async updateRating(rating: Rating): Promise<void> {
    // هذا سيتم استبداله بـ API call
    console.log('Updating rating:', rating);
  }

  // تحديث ملف المستخدم
  private async updateUserProfile(userId: string): Promise<void> {
    // هذا سيتم استبداله بـ API call
    console.log('Updating user profile:', userId);
  }

  // فحص متطلبات مخصصة
  private async checkCustomRequirement(condition: string, userId: string): Promise<boolean> {
    switch (condition) {
      case 'verified':
        // فحص إذا كان المستخدم موثق
        return true; // محاكاة
      case 'premium':
        // فحص إذا كان المستخدم في الخطة المميزة
        return false; // محاكاة
      case 'early_user':
        // فحص إذا كان المستخدم من أوائل المستخدمين
        return false; // محاكاة
      default:
        return false;
    }
  }

  // إشعار الشارات الجديدة
  private async notifyNewBadges(userId: string, badges: Badge[]): Promise<void> {
    // هذا سيتم استبداله بـ API call للإشعارات
    console.log('New badges earned:', badges);
  }

  // إنشاء معرف فريد
  private generateId(): string {
    return `RATING-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // الحصول على جميع الشارات
  getAllBadges(): Badge[] {
    return this.badges;
  }

  // الحصول على شارات حسب الفئة
  getBadgesByCategory(category: string): Badge[] {
    return this.badges.filter(badge => badge.category === category);
  }

  // الحصول على شارات حسب الندرة
  getBadgesByRarity(rarity: string): Badge[] {
    return this.badges.filter(badge => badge.rarity === rarity);
  }
}

// دوال مساعدة
export const ratingSystem = new RatingSystem();

export async function addRating(rating: Omit<Rating, 'id' | 'createdAt' | 'updatedAt'>): Promise<Rating> {
  return await ratingSystem.addRating(rating);
}

export function calculateOverallRating(ratings: Rating[]): number {
  return ratingSystem.calculateOverallRating(ratings);
}

export function calculateCategoryRatings(ratings: Rating[]): Record<string, number> {
  return ratingSystem.calculateCategoryRatings(ratings);
}

export function calculateUserLevel(points: number): number {
  return ratingSystem.calculateUserLevel(points);
}

export function getAllBadges(): Badge[] {
  return ratingSystem.getAllBadges();
}
