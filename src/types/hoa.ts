// src/types/hoa.ts - Homeowners Association Types
export interface HOA {
  id: string;
  name: string;
  buildingCount?: number;
  unitCount?: number;
  createdAt?: string;
}

export interface Building {
  id: string;
  name: string;
  hoaId?: string;
  unitCount?: number;
}

export interface Unit {
  id: string;
  buildingId?: string;
  number?: string;
  owner?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  createdAt?: string;
}

export interface Investor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Alert {
  id: string;
  title: string;
  message?: string;
  type?: string;
  createdAt?: string;
}

export interface Doc {
  id: string;
  name: string;
  url?: string;
  type?: string;
  createdAt?: string;
}


