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
