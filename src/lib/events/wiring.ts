// src/lib/events/wiring.ts
import { on, makeEvent, emit } from "./bus";
import { predictRent, scoreDemand } from "@/lib/ai";
import { enqueue } from "@/lib/notify";

// When a unit is published → compute recommended rent and notify owner/agent
on("UNIT_PUBLISHED", async (e) => {
  const u = e.payload?.unit;
  const ctx = e.payload?.context;

  const prediction = predictRent({
    type: u.type,
    area: u.area ?? 0,
    locationScore: ctx.locationScore ?? 0.5,
    amenitiesScore: (u.features?.length ?? 0) > 0 ? 0.7 : 0.3,
    marketTrend: ctx.marketTrend ?? 0,
    historicalRent: u.rentAmount ?? undefined,
  });

  enqueue({
    channel: "inapp",
    priority: "normal",
    title: "توصية إيجار ذكية",
    body: `القيمة المقترحة: ${prediction.predictedRent} (${Math.round(prediction.confidence * 100)}% ثقة)`,
    to: { userId: ctx.ownerId },
    dedupeKey: `rent-suggest-${u.id}`,
  });

  await emit(makeEvent("AI_RECOMMENDATION_READY", { unitId: u.id, prediction }));
});

// Engagement signals (views/likes) → demand scoring → notify marketing
on("PROPERTY_VIEWED", (e) => {
  const { propertyId, views, likes, inquiries, locationScore, amenitiesScore } = e.payload;
  const demand = scoreDemand({ views, likes, inquiries, locationScore, amenitiesScore });

  if (demand.score > 70) {
    enqueue({
      channel: "email",
      priority: "low",
      title: "طلب تسويق: عقار ساخن",
      body: `العقار ${propertyId} يحقق طلبًا عاليًا (Score=${demand.score}).`,
      to: { email: "marketing@example.com" },
      dedupeKey: `hot-${propertyId}`,
    });
  }
});