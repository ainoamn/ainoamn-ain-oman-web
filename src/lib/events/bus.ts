// src/lib/events/bus.ts
export type DomainEventType =
  | "BUILDING_PUBLISHED"
  | "BUILDING_ARCHIVED"
  | "UNIT_PUBLISHED"
  | "UNIT_STATUS_CHANGED"
  | "TENANT_PAYMENT_DUE"
  | "TENANT_PAYMENT_LATE"
  | "CONTRACT_EXPIRING"
  | "PROPERTY_VIEWED"
  | "PROPERTY_LIKED"
  | "AI_RECOMMENDATION_READY";

export type DomainEvent<T = any> = {
  id: string;
  type: DomainEventType;
  timestamp: number;
  actor?: { id: string; role: "admin" | "owner" | "agent" | "tenant" | "system" };
  payload: T;
};

type Handler = (e: DomainEvent) => Promise<void> | void;

const handlers: Record<DomainEventType, Handler[]> = {
  BUILDING_PUBLISHED: [],
  BUILDING_ARCHIVED: [],
  UNIT_PUBLISHED: [],
  UNIT_STATUS_CHANGED: [],
  TENANT_PAYMENT_DUE: [],
  TENANT_PAYMENT_LATE: [],
  CONTRACT_EXPIRING: [],
  PROPERTY_VIEWED: [],
  PROPERTY_LIKED: [],
  AI_RECOMMENDATION_READY: [],
};

export function on(type: DomainEventType, handler: Handler) {
  handlers[type].push(handler);
}

export async function emit<T = any>(event: DomainEvent<T>) {
  const list = handlers[event.type] || [];
  for (const h of list) {
    try { await h(event); } catch (err) { console.error("event handler error:", event.type, err); }
  }
}

export function makeEvent<T>(type: DomainEventType, payload: T, actor?: DomainEvent["actor"]): DomainEvent<T> {
  return { id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1e4)}`, type, timestamp: Date.now(), actor, payload };
}
