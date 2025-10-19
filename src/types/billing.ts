// Lightweight billing types surface for client imports
export type Reservation = {
  id: string | number;
  propertyId?: string;
  userId?: string;
  date?: string;
  status?: string;
  [key: string]: any;
};

// Re-use financial types where available
export type { Invoice, Payment, PaymentMethod } from './financial';

export default Reservation;
export type Currency = "OMR" | "AED" | "SAR" | "USD";
