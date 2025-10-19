// src/lib/ai/index.ts
export type UnitSignal = {
  type: string;
  area: number;
  locationScore: number; // 0..1 based on geo desirability
  amenitiesScore: number; // 0..1 features normalized
  marketTrend: number; // -1..+1 quarter-over-quarter price movement
  historicalRent?: number; // previous rent for same/similar units
  demandIndex?: number; // computed from views/likes/leads
};

export type RentPrediction = {
  predictedRent: number;
  confidence: number; // 0..1
  factors: Record<string, number>;
};

export type DemandScore = {
  score: number; // 0..100
  segments: Record<string, number>; // e.g., "family", "student", "expat"
};

export type AnomalyFlag = {
  risk: "low" | "medium" | "high";
  reasons: string[];
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

// Baseline rent prediction using weighted linear model
export function predictRent(signal: UnitSignal): RentPrediction {
  const base = (signal.historicalRent ?? 250) * 0.6 + (signal.area * 0.5);
  const locAdj = 200 * clamp(signal.locationScore, 0, 1);
  const amenAdj = 150 * clamp(signal.amenitiesScore, 0, 1);
  const trendAdj = (signal.marketTrend ?? 0) * 120;

  const predicted = clamp(base + locAdj + amenAdj + trendAdj, 75, 999999);
  const confidence = clamp(0.6 + 0.2 * (signal.locationScore + signal.amenitiesScore) / 2, 0.2, 0.95);

  return {
    predictedRent: Math.round(predicted),
    confidence,
    factors: { base, locAdj, amenAdj, trendAdj },
  };
}

// Demand scoring blending engagement and unit attractiveness
export function scoreDemand(input: { views: number; likes: number; inquiries: number; locationScore: number; amenitiesScore: number }): DemandScore {
  const engagement = clamp((input.views * 0.2 + input.likes * 0.5 + input.inquiries * 1.2) / 10, 0, 10);
  const charm = clamp(input.locationScore * 0.6 + input.amenitiesScore * 0.4, 0, 1);
  const score = clamp(engagement * 8 + charm * 30, 0, 100);

  const segments = {
    family: clamp(score * 0.7, 0, 100),
    student: clamp(score * 0.4, 0, 100),
    expat: clamp(score * 0.6, 0, 100),
  };

  return { score: Math.round(score), segments };
}

// Anomaly detection for payment behavior (baseline heuristics)
export function detectPaymentAnomaly(history: { onTime: number; late: number; daysLateAvg: number }): AnomalyFlag {
  const lateRatio = history.late / Math.max(1, (history.late + history.onTime));
  const severity = lateRatio * 0.6 + clamp(history.daysLateAvg / 30, 0, 1) * 0.4;

  if (severity > 0.7) return { risk: "high", reasons: ["frequent delays", "excessive average lateness"] };
  if (severity > 0.4) return { risk: "medium", reasons: ["occasional delays", "moderate lateness"] };
  return { risk: "low", reasons: ["mostly on-time"] };
}
