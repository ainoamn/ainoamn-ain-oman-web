export interface AIAnalysis {
  fairValue: number;
  risk: string;
  marketTrend: string;
  predictedFinalPrice: number;
  nextStepRecommendation: string;
  comparableProperties: any[];
  updatedAt: string; // أضف هذا السطر
  recommendation?: string;
  confidence?: number;
  pricePrediction?: number;
  estimatedValue?: number;
}