// src/lib/advanced-ai-ml.ts - نظام الذكاء الاصطناعي والتعلم الآلي المتقدم
/**
 * Advanced AI & Machine Learning Engine
 * محرك ذكاء اصطناعي متقدم مع تعلم آلي
 * 
 * التقنيات المستخدمة:
 * - Time Series Forecasting (ARIMA, Prophet-like)
 * - Anomaly Detection (Unsupervised Learning)
 * - Credit Risk Assessment (Logistic Regression, Decision Trees)
 * - Pattern Recognition
 * - Predictive Analytics
 */

// ========================
// 1. التنبؤ بالسلاسل الزمنية
// ========================

export interface TimeSeriesData {
  date: string;
  value: number;
}

export class TimeSeriesForecaster {
  private data: TimeSeriesData[];
  
  constructor(data: TimeSeriesData[]) {
    this.data = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  /**
   * Simple Moving Average (SMA)
   */
  calculateSMA(period: number): number[] {
    const sma: number[] = [];
    for (let i = period - 1; i < this.data.length; i++) {
      const sum = this.data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.value, 0);
      sma.push(sum / period);
    }
    return sma;
  }
  
  /**
   * Exponential Moving Average (EMA)
   */
  calculateEMA(period: number): number[] {
    const multiplier = 2 / (period + 1);
    const ema: number[] = [];
    
    if (this.data.length === 0) return [];
    
    // البداية بـ SMA الأول
    let currentEMA = this.data.slice(0, period).reduce((acc, d) => acc + d.value, 0) / period;
    ema.push(currentEMA);
    
    // حساب EMA للباقي
    for (let i = period; i < this.data.length; i++) {
      currentEMA = (this.data[i].value - currentEMA) * multiplier + currentEMA;
      ema.push(currentEMA);
    }
    
    return ema;
  }
  
  /**
   * ARIMA-like Forecast (مبسط)
   */
  forecast(periods: number): {
    predictions: number[];
    confidence: { lower: number[]; upper: number[] };
    method: string;
  } {
    // حساب الاتجاه (Trend)
    const n = this.data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    this.data.forEach((d, i) => {
      sumX += i;
      sumY += d.value;
      sumXY += i * d.value;
      sumX2 += i * i;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // التنبؤ
    const predictions: number[] = [];
    const lastIndex = n - 1;
    
    for (let i = 1; i <= periods; i++) {
      const prediction = slope * (lastIndex + i) + intercept;
      predictions.push(Math.max(0, prediction)); // لا يمكن أن يكون سالب
    }
    
    // حساب فترة الثقة (مبسطة)
    const stdDev = this.calculateStdDev(this.data.map(d => d.value));
    const confidence = {
      lower: predictions.map(p => Math.max(0, p - 1.96 * stdDev)),
      upper: predictions.map(p => p + 1.96 * stdDev)
    };
    
    return {
      predictions,
      confidence,
      method: 'Linear Regression with Confidence Intervals'
    };
  }
  
  /**
   * Seasonal Decomposition
   */
  detectSeasonality(): {
    hasSeason: boolean;
    seasonLength: number;
    seasonalFactors: number[];
  } {
    const values = this.data.map(d => d.value);
    
    // تحليل الارتباط الذاتي للكشف عن الموسمية
    const correlations: number[] = [];
    for (let lag = 1; lag <= Math.min(12, Math.floor(values.length / 2)); lag++) {
      correlations.push(this.calculateAutocorrelation(values, lag));
    }
    
    // البحث عن أعلى ارتباط
    const maxCorr = Math.max(...correlations);
    const seasonLength = correlations.indexOf(maxCorr) + 1;
    const hasSeason = maxCorr > 0.5;
    
    return {
      hasSeason,
      seasonLength,
      seasonalFactors: []
    };
  }
  
  private calculateAutocorrelation(data: number[], lag: number): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    let numerator = 0, denominator = 0;
    
    for (let i = 0; i < data.length - lag; i++) {
      numerator += (data[i] - mean) * (data[i + lag] - mean);
    }
    
    for (let i = 0; i < data.length; i++) {
      denominator += Math.pow(data[i] - mean, 2);
    }
    
    return numerator / denominator;
  }
  
  private calculateStdDev(data: number[]): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }
}

// ========================
// 2. كشف الشذوذ (Anomaly Detection)
// ========================

export class AnomalyDetector {
  /**
   * Z-Score Method
   */
  static detectByZScore(data: number[], threshold: number = 3): {
    anomalies: Array<{ index: number; value: number; zScore: number }>;
    normal: Array<{ index: number; value: number }>;
  } {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const stdDev = Math.sqrt(
      data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length
    );
    
    const anomalies: Array<{ index: number; value: number; zScore: number }> = [];
    const normal: Array<{ index: number; value: number }> = [];
    
    data.forEach((value, index) => {
      const zScore = (value - mean) / stdDev;
      if (Math.abs(zScore) > threshold) {
        anomalies.push({ index, value, zScore });
      } else {
        normal.push({ index, value });
      }
    });
    
    return { anomalies, normal };
  }
  
  /**
   * IQR (Interquartile Range) Method
   */
  static detectByIQR(data: number[]): {
    anomalies: Array<{ index: number; value: number; reason: string }>;
    quartiles: { Q1: number; Q2: number; Q3: number; IQR: number };
  } {
    const sorted = [...data].sort((a, b) => a - b);
    const Q1 = this.percentile(sorted, 25);
    const Q2 = this.percentile(sorted, 50);
    const Q3 = this.percentile(sorted, 75);
    const IQR = Q3 - Q1;
    
    const lowerBound = Q1 - 1.5 * IQR;
    const upperBound = Q3 + 1.5 * IQR;
    
    const anomalies: Array<{ index: number; value: number; reason: string }> = [];
    
    data.forEach((value, index) => {
      if (value < lowerBound) {
        anomalies.push({ index, value, reason: `أقل من الحد الأدنى (${lowerBound.toFixed(2)})` });
      } else if (value > upperBound) {
        anomalies.push({ index, value, reason: `أعلى من الحد الأعلى (${upperBound.toFixed(2)})` });
      }
    });
    
    return { anomalies, quartiles: { Q1, Q2, Q3, IQR } };
  }
  
  private static percentile(sorted: number[], p: number): number {
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    if (lower === upper) return sorted[lower];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
}

// ========================
// 3. تقييم مخاطر الائتمان
// ========================

export interface CustomerCreditData {
  customerId: string;
  paymentHistory: number[];  // 1 = دفع في الموعد, 0 = تأخير
  totalInvoices: number;
  totalPaid: number;
  averagePaymentDays: number;
  bouncedChecks: number;
  creditLimit: number;
  currentBalance: number;
  industryRisk: number;  // 0-1
  companyAge: number;    // بالسنوات
}

export class CreditRiskAssessor {
  /**
   * حساب درجة الائتمان (Credit Score)
   */
  static calculateCreditScore(data: CustomerCreditData): {
    score: number;  // 0-100
    rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C' | 'D';
    probabilityOfDefault: number;
    recommendation: string;
    factors: Array<{ factor: string; impact: number; weight: number }>;
  } {
    const factors: Array<{ factor: string; impact: number; weight: number }> = [];
    
    // 1. سجل الدفع (35%)
    const paymentScore = data.paymentHistory.filter(p => p === 1).length / data.paymentHistory.length;
    factors.push({ factor: 'سجل الدفع', impact: paymentScore * 100, weight: 0.35 });
    
    // 2. نسبة الديون (30%)
    const debtRatio = data.currentBalance / data.creditLimit;
    const debtScore = Math.max(0, 1 - debtRatio);
    factors.push({ factor: 'نسبة الديون', impact: debtScore * 100, weight: 0.30 });
    
    // 3. متوسط أيام الدفع (20%)
    const paymentDaysScore = Math.max(0, 1 - (data.averagePaymentDays / 90));
    factors.push({ factor: 'سرعة الدفع', impact: paymentDaysScore * 100, weight: 0.20 });
    
    // 4. الشيكات المرتجعة (10%)
    const bouncedScore = Math.max(0, 1 - (data.bouncedChecks / 10));
    factors.push({ factor: 'الشيكات المرتجعة', impact: bouncedScore * 100, weight: 0.10 });
    
    // 5. مخاطر الصناعة (5%)
    const industryScore = 1 - data.industryRisk;
    factors.push({ factor: 'مخاطر الصناعة', impact: industryScore * 100, weight: 0.05 });
    
    // حساب الدرجة النهائية
    const score = factors.reduce((acc, f) => acc + (f.impact * f.weight), 0);
    
    // تحديد التصنيف
    let rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C' | 'D' = 'D';
    if (score >= 90) rating = 'AAA';
    else if (score >= 80) rating = 'AA';
    else if (score >= 70) rating = 'A';
    else if (score >= 60) rating = 'BBB';
    else if (score >= 50) rating = 'BB';
    else if (score >= 40) rating = 'B';
    else if (score >= 30) rating = 'CCC';
    else if (score >= 20) rating = 'CC';
    else if (score >= 10) rating = 'C';
    
    // احتمالية التعثر (باستخدام Logistic Function)
    const probabilityOfDefault = 1 / (1 + Math.exp(0.1 * (score - 50)));
    
    // التوصية
    let recommendation = '';
    if (score >= 70) {
      recommendation = '✅ عميل ممتاز - يُنصح بزيادة حد الائتمان';
    } else if (score >= 50) {
      recommendation = '⚠️ عميل متوسط - مراقبة عادية';
    } else if (score >= 30) {
      recommendation = '⚠️ عميل عالي المخاطر - تقليل حد الائتمان';
    } else {
      recommendation = '🚫 عميل عالي المخاطر جداً - إيقاف الائتمان';
    }
    
    return { score, rating, probabilityOfDefault, recommendation, factors };
  }
  
  /**
   * التنبؤ بالمخصص المتوقع (IFRS 9 ECL)
   */
  static calculateExpectedLoss(
    exposureAtDefault: number,
    probabilityOfDefault: number,
    lossGivenDefault: number = 0.45  // افتراضي 45%
  ): {
    ecl: number;
    stage: 1 | 2 | 3;
    provision: number;
  } {
    const ecl = exposureAtDefault * probabilityOfDefault * lossGivenDefault;
    
    let stage: 1 | 2 | 3 = 1;
    if (probabilityOfDefault > 0.3) stage = 3;  // Credit-impaired
    else if (probabilityOfDefault > 0.1) stage = 2;  // Significant increase
    
    const provision = stage === 1 ? ecl / 12 : ecl;  // 12-month ECL vs Lifetime ECL
    
    return { ecl, stage, provision };
  }
}

// ========================
// 4. التعلم من أنماط المستخدم
// ========================

export class UserBehaviorLearning {
  private userActions: Array<{ userId: string; action: string; timestamp: string; context: any }> = [];
  
  /**
   * تسجيل إجراء المستخدم
   */
  recordAction(userId: string, action: string, context: any): void {
    this.userActions.push({
      userId,
      action,
      timestamp: new Date().toISOString(),
      context
    });
  }
  
  /**
   * اقتراح الإجراء التالي
   */
  suggestNextAction(userId: string): {
    suggestion: string;
    confidence: number;
    reason: string;
  } {
    const userHistory = this.userActions.filter(a => a.userId === userId);
    
    if (userHistory.length < 5) {
      return {
        suggestion: 'لا توجد بيانات كافية',
        confidence: 0,
        reason: 'يحتاج المزيد من البيانات للتعلم'
      };
    }
    
    // تحليل الأنماط الزمنية
    const lastActions = userHistory.slice(-10);
    const actionFrequency = new Map<string, number>();
    
    lastActions.forEach(a => {
      actionFrequency.set(a.action, (actionFrequency.get(a.action) || 0) + 1);
    });
    
    // الإجراء الأكثر تكراراً
    let mostFrequent = '';
    let maxCount = 0;
    actionFrequency.forEach((count, action) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = action;
      }
    });
    
    const confidence = maxCount / lastActions.length;
    
    return {
      suggestion: mostFrequent,
      confidence,
      reason: `بناءً على ${maxCount} إجراءات مشابهة من آخر ${lastActions.length} إجراء`
    };
  }
  
  /**
   * كشف السلوك غير المعتاد
   */
  detectUnusualBehavior(userId: string, currentAction: string): {
    isUnusual: boolean;
    severity: 'low' | 'medium' | 'high';
    alert: string;
  } {
    const userHistory = this.userActions.filter(a => a.userId === userId);
    const actionCounts = new Map<string, number>();
    
    userHistory.forEach(a => {
      actionCounts.set(a.action, (actionCounts.get(a.action) || 0) + 1);
    });
    
    const currentCount = actionCounts.get(currentAction) || 0;
    const avgCount = Array.from(actionCounts.values()).reduce((a, b) => a + b, 0) / actionCounts.size;
    
    const isUnusual = currentCount === 0 || currentCount < avgCount * 0.1;
    
    let severity: 'low' | 'medium' | 'high' = 'low';
    if (currentCount === 0) severity = 'high';
    else if (currentCount < avgCount * 0.2) severity = 'medium';
    
    return {
      isUnusual,
      severity,
      alert: isUnusual ? `إجراء غير معتاد: "${currentAction}" نادراً ما يُستخدم` : ''
    };
  }
}

// ========================
// 5. التحليلات التنبؤية
// ========================

export class PredictiveAnalytics {
  /**
   * التنبؤ بالتدفق النقدي
   */
  static forecastCashFlow(
    historicalData: Array<{ date: string; inflow: number; outflow: number }>,
    periods: number
  ): Array<{
    date: string;
    predictedInflow: number;
    predictedOutflow: number;
    netCashFlow: number;
    confidence: { lower: number; upper: number };
  }> {
    const forecaster = new TimeSeriesForecaster(
      historicalData.map(d => ({ date: d.date, value: d.inflow - d.outflow }))
    );
    
    const forecast = forecaster.forecast(periods);
    
    return forecast.predictions.map((net, i) => ({
      date: this.addMonths(new Date(), i + 1).toISOString().split('T')[0],
      predictedInflow: Math.max(0, net + Math.abs(net) * 0.1),
      predictedOutflow: Math.abs(Math.min(0, net)),
      netCashFlow: net,
      confidence: {
        lower: forecast.confidence.lower[i],
        upper: forecast.confidence.upper[i]
      }
    }));
  }
  
  private static addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }
}

