/**
 * Billing/Reservation types
 * Location: src/types/billing.ts
 */

export type Currency = "OMR" | "AED" | "SAR" | "USD";

export type ReservationStatus = "pending" | "approved" | "rejected" | "cancelled";
export type InvoiceStatus = "unpaid" | "paid" | "void";
export type PaymentMethod = "cash" | "card" | "bank" | "wallet";

export interface Reservation {
  id: string;               // reservation number e.g., AO-R-000123
  propertyId: string;
  customerName: string;
  phone?: string;           // E.164 e.g., +9689xxxxxxx
  email?: string;
  startDate?: string;       // ISO (optional)
  days?: number;            // optional
  amount: number;
  currency: Currency;
  notes?: string;
  status: ReservationStatus;
  invoiceId?: string;       // created upon approval
  createdAt: string;        // ISO
  updatedAt: string;        // ISO
}

export interface Invoice {
  id: string;               // invoice number e.g., AO-I-000123
  reservationId: string;
  propertyId: string;
  customerName: string;
  amount: number;
  currency: Currency;
  status: InvoiceStatus;
  dueDate?: string;         // ISO
  createdAt: string;        // ISO
  paidAt?: string;          // ISO
}

export interface Payment {
  id: string;               // payment number e.g., AO-PM-000123
  invoiceId: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  paidAt: string;           // ISO
  receiptNote?: string;
}
