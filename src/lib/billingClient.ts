/**
 * Minimal client for reservations/invoices
 * Location: src/lib/billingClient.ts
 */
import type { Reservation, Invoice, Payment, PaymentMethod } from "@/types/billing";

export async function createReservation(payload: Partial<Reservation>): Promise<Reservation> {
  const r = await fetch("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error((await r.json().catch(()=>({})))?.error || "Failed to create reservation");
  return r.json();
}

export async function listReservations(): Promise<Reservation[]> {
  const r = await fetch("/api/reservations", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load reservations");
  return r.json();
}

export async function approveReservation(id: string): Promise<{ ok: true; invoice: Invoice }> {
  const r = await fetch(`/api/reservations/${encodeURIComponent(id)}/approve`, { method: "POST" });
  if (!r.ok) throw new Error((await r.json().catch(()=>({})))?.error || "Approve failed");
  return r.json();
}

export async function rejectReservation(id: string): Promise<{ ok: true }> {
  const r = await fetch(`/api/reservations/${encodeURIComponent(id)}/reject`, { method: "POST" });
  if (!r.ok) throw new Error((await r.json().catch(()=>({})))?.error || "Reject failed");
  return r.json();
}

export async function listInvoices(): Promise<Invoice[]> {
  const r = await fetch("/api/invoices", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load invoices");
  return r.json();
}

export async function payInvoice(id: string, amount: number, method: PaymentMethod, note?: string): Promise<{ ok: true; payment: Payment }> {
  const r = await fetch(`/api/invoices/${encodeURIComponent(id)}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, method, note }),
  });
  if (!r.ok) throw new Error((await r.json().catch(()=>({})))?.error || "Pay failed");
  return r.json();
}
