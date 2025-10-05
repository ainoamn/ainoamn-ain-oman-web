/**
 * Notifications client helpers
 * Location: src/lib/notificationsClient.ts
 */
import type {
  NotificationTemplate,
  SendRequest,
  PaginatedLogs,
} from "@/types/notifications";

const base =
  typeof window === "undefined" ? process.env.NEXT_PUBLIC_BASE_URL || "" : "";

export async function getTemplates(): Promise<NotificationTemplate[]> {
  const r = await fetch(`${base}/api/admin/notifications/templates`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load templates");
  return r.json();
}

export async function saveTemplates(tpls: NotificationTemplate[]): Promise<void> {
  const r = await fetch(`/api/admin/notifications/templates`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tpls),
  });
  if (!r.ok) throw new Error("Failed to save templates");
}

export async function sendTest(payload: SendRequest): Promise<{ ok: true }> {
  const r = await fetch(`/api/admin/notifications/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to send");
  }
  return r.json();
}

export async function getLog(page = 1, pageSize = 50): Promise<PaginatedLogs> {
  const r = await fetch(`/api/admin/notifications/log?page=${page}&pageSize=${pageSize}`, {
    cache: "no-store",
  });
  if (!r.ok) throw new Error("Failed to load log");
  return r.json();
}

export async function clearLog(): Promise<void> {
  const r = await fetch(`/api/admin/notifications/log`, { method: "DELETE" });
  if (!r.ok) throw new Error("Failed to clear log");
}
