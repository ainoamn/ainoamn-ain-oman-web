// src/lib/ai.ts
// Placeholder AI services (to be replaced with real models/integrations)
export type RecommendationInput = {
  userId?: string;
  context?: "browse" | "property" | "auction" | "invest";
  propertyId?: string;
  limit?: number;
};

export function getRecommendations(input: RecommendationInput) {
  // TODO: Replace with real model inference
  return [
    { type: "property", id: "PRP-00000001", reason: "Similar to your recent views" },
    { type: "auction", id: "AUC-00000003", reason: "Ending soon" }
  ].slice(0, input.limit ?? 5);
}

export function estimateValuation(property: { area:number; location:string; rooms:number; year?:number }) {
  // TODO: Replace with a proper hedonic model / ML
  const base = 300 * property.area;
  const locFactor = property.location?.toLowerCase().includes("muscat") ? 1.2 : 1.0;
  const roomFactor = 1 + (property.rooms * 0.03);
  return Math.round(base * locFactor * roomFactor);
}

// Backwards-compatible helper used by event wiring
export function predictRent(opts: { area?: number; location?: string; rooms?: number; type?: string; locationScore?: number; amenitiesScore?: number; marketTrend?: number; historicalRent?: number }) {
  const area = opts.area ?? 0;
  const val = estimateValuation({ area, location: opts.location || '', rooms: opts.rooms || 1 });
  // base monthly rent estimate
  let predictedRent = Math.round(val * 0.004);
  // tweak by locationScore/amenities/marketTrend
  if (typeof opts.locationScore === 'number') predictedRent = Math.round(predictedRent * (0.9 + opts.locationScore));
  if (typeof opts.amenitiesScore === 'number') predictedRent = Math.round(predictedRent * (0.9 + opts.amenitiesScore * 0.2));
  if (typeof opts.marketTrend === 'number') predictedRent = Math.round(predictedRent * (1 + opts.marketTrend * 0.1));
  // blend with historicalRent if provided
  if (typeof opts.historicalRent === 'number') {
    predictedRent = Math.round((predictedRent * 0.6) + (opts.historicalRent * 0.4));
  }

  const confidence = Math.min(0.99, 0.4 + Math.min(0.5, (opts.locationScore ?? 0.5) * 0.5 + (opts.amenitiesScore ?? 0.3) * 0.3));
  return { predictedRent, confidence };
}

export function scoreDemand(opts: { views?: number; likes?: number; inquiries?: number; locationScore?: number; amenitiesScore?: number }) {
  const views = opts.views ?? 0;
  const likes = opts.likes ?? 0;
  const inquiries = opts.inquiries ?? 0;
  const base = Math.min(100, Math.floor((views * 0.1) + (likes * 1.5) + (inquiries * 5)));
  const loc = (opts.locationScore ?? 0.5) * 20;
  const amenities = (opts.amenitiesScore ?? 0.3) * 10;
  const score = Math.min(100, Math.round(base + loc + amenities));
  return { score };
}
