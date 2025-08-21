/**
 * Notifications types
 * Location: src/types/notifications.ts
 */

export type NotificationChannel = "email" | "whatsapp";

export interface TemplateVariable {
  name: string;       // e.g., "customer"
  example?: string;   // e.g., "عبد الحميد"
  required?: boolean; // default false
}

export interface NotificationTemplate {
  id: string;                   // uuid or slug
  channel: NotificationChannel; // email | whatsapp
  name: string;                 // internal name, e.g., "reservation_approved"
  description?: string;
  lang?: string;                // ar | en | ...
  enabled: boolean;
  subject?: string;             // email only
  body: string;                 // text with {{placeholders}}
  variables?: TemplateVariable[];
  updatedAt: string;            // ISO
}

export interface SendRequest {
  channel: NotificationChannel;
  templateId: string;
  to: string;                   // email or phone in E.164
  data?: Record<string, string | number | boolean>;
}

export type SendStatus = "queued" | "sent" | "error";

export interface SendLogItem {
  id: string;
  ts: string;                   // ISO timestamp
  channel: NotificationChannel;
  to: string;
  templateId: string;
  status: SendStatus;
  error?: string;
  previewUrl?: string;          // e.g., "preview://email/..."
  payload?: any;                // snapshot for auditing
}

export interface PaginatedLogs {
  page: number;
  pageSize: number;
  total: number;
  items: SendLogItem[];
}
