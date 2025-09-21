export interface AIAnalysis {
  fairValue: number;
  risk: string; // أو يمكن أن يكون نوعاً محدداً مثل 'low' | 'medium' | 'high'
  // أضف أي خصائص أخرى مستخدمة في المكون
  recommendation?: string;
  confidence?: number;
  // ... أي خصائص أخرى يتم استخدامها
}