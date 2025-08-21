// src/types/task.ts
export type Priority = "low" | "medium" | "high" | "urgent";
export type Status = "open" | "in_progress" | "blocked" | "done";
export type ThreadItem = { id: string; author: string; text: string; at: string };
export type LinkedEntity = { type: string; id: string };

export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  assignees?: string[];
  thread: ThreadItem[];
  calendarEvent?: { id: string; title: string; start?: string; end?: string; createdAt: string };
  link?: LinkedEntity;
};
