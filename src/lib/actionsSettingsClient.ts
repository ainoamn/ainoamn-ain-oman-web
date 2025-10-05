/**
 * Client helper to load & save ActionsSettings from the API
 * Location: src/lib/actionsSettingsClient.ts
 */
import { ActionsSettings } from "@/types/actions-settings";

const BASE =
  typeof window === "undefined" ? process.env.NEXT_PUBLIC_BASE_URL || "" : "";

export async function fetchActionsSettings(): Promise<ActionsSettings> {
  const res = await fetch(`${BASE}/api/admin/settings/actions`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}

export async function saveActionsSettings(settings: ActionsSettings): Promise<void> {
  const res = await fetch(`/api/admin/settings/actions`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error("Failed to save settings");
}
