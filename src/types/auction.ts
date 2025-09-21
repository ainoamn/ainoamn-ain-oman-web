import { AIAnalysis } from '@/types/auction';
export interface AIAnalysis {
  fairValue: number;
  risk: string;
  marketTrend: string;
  predictedFinalPrice: number;
  // أضف أي خصائص أخرى تجدها مستخدمة في المكون
  recommendation?: string;
  confidence?: number;
  pricePrediction?: number;
  estimatedValue?: number;
}