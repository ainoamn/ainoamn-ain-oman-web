export interface NotificationTemplate {
  id: string;
  channel: 'email' | 'sms' | 'push' | 'whatsapp' | 'inapp';
  name: string;
  subject?: string;
  body: string;
  variables?: string[];
  enabled?: boolean;
}

export type NotificationChannel = NotificationTemplate['channel'];
export type TemplateVariable = { key: string; description?: string };

export interface SendRequest {
  channel: 'email' | 'sms' | 'push' | 'whatsapp' | 'inapp';
  to: string | { userId?: string; email?: string };
  subject?: string;
  body: string;
  variables?: Record<string, any>;
}

export interface NotificationLogItem {
  id: string;
  at: string;
  channel: string;
  to: string;
  subject?: string;
  body: string;
  status: 'queued' | 'sent' | 'failed';
}

export interface PaginatedLogs {
  items: NotificationLogItem[];
  total: number;
  page: number;
  pageSize: number;
}

export default NotificationTemplate;
