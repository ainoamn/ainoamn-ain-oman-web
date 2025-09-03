export type HOA = {
  id: string;
  name: string;
  status: "active" | "inactive";
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  unitsCount?: number;
  createdAt: string;
  updatedAt?: string;
};

export type Building = {
  id: string;
  hoaId: string;
  name: string;
  address?: string;
  unitsCount: number;
  forRent?: boolean;
  delegation?: {
    enabled: boolean;
    delegateName: string;
    startDate: string;
    endDate: string;
  };
  docs?: Doc[];
  createdAt: string;
  updatedAt?: string;
};

export type Unit = {
  id: string;
  buildingId: string;
  hoaId?: string;
  name: string;
  number: string;
  owner: string;
  ownerEmail?: string;
  ownerPhone?: string;
  area?: number;
  balance: number;
  forRent?: boolean;
  docs?: Doc[];
  createdAt: string;
  updatedAt?: string;
};

export type Doc = {
  id: string;
  title: string;
  type: string;
  expiry?: string;
  url?: string;
  uploadedBy: string;
  uploadedAt: string;
  relatedTo?: string; // unitId or buildingId
};

export type Ticket = {
  id: string;
  by: string; // unitId or userId
  byName: string;
  type: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  description?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
};

export type Alert = {
  id: string;
  level: "info" | "warning" | "critical";
  msg: string;
  link?: string;
  relatedTo?: string; // unitId, buildingId, or docId
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
};

export type Investor = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  share: number;
  units?: string[]; // unitIds
  joinedAt: string;
};

export type Payment = {
  id: string;
  unitId: string;
  amount: number;
  type: "service" | "rent" | "fine" | "other";
  status: "pending" | "paid" | "overdue" | "cancelled";
  dueDate: string;
  paidAt?: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "alert" | "payment" | "maintenance";
  read: boolean;
  link?: string;
  createdAt: string;
};

// أنواع للردود من API
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = ApiResponse<T> & {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};