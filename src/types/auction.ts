export interface AIAnalysis {
  fairValue: number;
  risk: string;
  marketTrend: string;
  recommendation?: string;
  confidence?: number;
  pricePrediction?: number;
  estimatedValue?: number;
  // أضف أي خصائص أخرى قد تكون مستخدمة في المكون
}