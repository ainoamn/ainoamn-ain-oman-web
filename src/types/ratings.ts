// src/types/ratings.ts - أنواع التقييمات المتقدمة

export type ReviewType = 'tenant' | 'owner' | 'property' | 'company';

export type RatingDimension = 
  | 'punctuality'      // الالتزام بالمواعيد
  | 'communication'   // التواصل
  | 'cleanliness'      // النظافة
  | 'maintenance'      // الصيانة
  | 'contractCompliance' // الالتزام بالعقد
  | 'responsiveness'   // سرعة الاستجابة
  | 'professionalism'  // الاحترافية
  | 'value'            // القيمة مقابل المال
  | 'location'         // الموقع
  | 'amenities';       // المرافق

export interface RatingDimensionScore {
  dimension: RatingDimension;
  score: number; // 1-5
  weight?: number; // أهمية البعد (0-1)
}

export interface Rating {
  id: string;
  propertyId?: string;
  reviewerId: string;
  revieweeId: string;
  reviewType: ReviewType;
  dimensions: RatingDimensionScore[];
  overallRating: number; // 1-5
  comment: string;
  verified: boolean;
  responseId?: string;
  createdAt: number;
  updatedAt: number;
  helpful?: number;
  reported?: boolean;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    source?: string; // 'web', 'mobile', 'api'
  };
}

export interface RatingResponse {
  id: string;
  ratingId: string;
  responderId: string;
  responseText: string;
  createdAt: number;
  updatedAt: number;
}

export interface RatingStats {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  dimensionAverages: Record<RatingDimension, number>;
  verifiedCount: number;
  responseRate: number;
  helpfulCount: number;
}

export interface RatingFilters {
  minRating?: number;
  maxRating?: number;
  verifiedOnly?: boolean;
  hasResponse?: boolean;
  reviewType?: ReviewType;
  dimension?: RatingDimension;
  dateFrom?: number;
  dateTo?: number;
}






