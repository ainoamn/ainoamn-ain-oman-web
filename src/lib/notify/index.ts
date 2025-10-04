// src/lib/notify/index.ts
export type Channel = "inapp" | "email" | "sms" | "push";
export type Notification = {
  id: string;
  to: { userId?: string; email?: string; phone?: string; deviceToken?: string };
  title: string;
  body: string;
  channel: Channel;
  priority?: "low" | "normal" | "high";
  dedupeKey?: string;
  createdAt: number;
};

const queue: Notification[] = [];
const dedupe = new Set<string>();

export function enqueue(n: Omit<Notification, "id" | "createdAt">) {
  const id = `NTF-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
  const item: Notification = { ...n, id, createdAt: Date.now() };

  if (item.dedupeKey && dedupe.has(item.dedupeKey)) return; // drop duplicate
  if (item.dedupeKey) dedupe.add(item.dedupeKey);

  queue.push(item);
  // Dispatch asynchronously
  setTimeout(() => dispatch(item).catch(console.error), 0);
}

async function dispatch(n: Notification) {
  switch (n.channel) {
    case "inapp":
      // Persist to db or memory for UI consumption
      console.log("[INAPP]", n.title, n.body);
      break;
    case "email":
      // Integrate with provider (e.g., SendGrid)
      console.log("[EMAIL]", n.to.email, n.title);
      break;
    case "sms":
      // Integrate with provider (e.g., Twilio)
      console.log("[SMS]", n.to.phone, n.body);
      break;
    case "push":
      // Integrate with FCM/APNs
      console.log("[PUSH]", n.to.deviceToken, n.title);
      break;
  }
}

export function getQueue() {
  return queue.slice().reverse();
}