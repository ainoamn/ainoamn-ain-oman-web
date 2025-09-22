import type { AppUser } from "@/lib/auth";

export type Feature = "hoa" | "invest";

const PLAN_FEATURES: Record<NonNullable<AppUser["plan"]>, Feature[]> = {
  free: [],
  pro: ["hoa", "invest"],
  enterprise: ["hoa", "invest"],
};

export function hasFeature(user: AppUser | null, feature: Feature): boolean {
  if (!user) return true; // permissive for dev; tighten later
  const plan = user.plan || "free";
  return PLAN_FEATURES[plan]?.includes(feature) ?? false;
}
