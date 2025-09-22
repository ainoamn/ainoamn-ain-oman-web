export type TaskStatus = "open" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Task = {
  id: string;                // e.g., AO-T-000123
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  assignees?: string[];      // user ids/emails
  labels?: string[];         // tags
  createdAt: string;         // ISO
  updatedAt: string;         // ISO
  // بيانات اختيارية للطباعة
  thread?: { id: string; author: string; ts: string; text: string }[];
  attachments?: { id: string; name: string; url: string }[];
};
