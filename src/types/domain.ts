// src/types/domain.ts
export type ID = string;


export type PropertyStatus = "draft" | "vacant" | "reserved" | "leased" | "hidden";


export interface Property {
id: ID; // AO-P-######
title: string;
description?: string;
price: number; // الايجار الشهري أو السعر
status: PropertyStatus;
ownerId: ID; // معرّف المالك
servicesNo?: string; // رقم الخدمات
images: string[];
createdAt: number;
updatedAt: number;
}


export type BookingStatus = "pending_payment" | "paid" | "cancelled" | "expired";


export interface Booking {
id: ID; // AO-B-######
propertyId: ID;
tenantId: ID; // معرّف المستأجر
amount: number; // مبلغ الحجز/الدفع الأولي
status: BookingStatus;
createdAt: number;
updatedAt: number;
}


export type PaymentStatus = "success" | "failed" | "refunded";


export interface Payment {
id: ID; // AO-R-###### إيصال
bookingId: ID;
amount: number;
method: "card" | "bank" | "cash";
status: PaymentStatus;
paidAt: number;
}


export type ContractStatus =
| "drafting"
| "awaiting_tenant_sign"
| "awaiting_landlord_approve"
| "active"
| "terminated"
| "expired"
| "rejected";


export interface Contract {
id: ID; // AO-C-######
bookingId: ID;
propertyId: ID;
landlordId: ID;
tenantId: ID;
status: ContractStatus;
termsHtml: string; // نص البنود HTML بسيط
tenantAcceptedAt?: number;
landlordApprovedAt?: number;
rejectionReason?: string;
totals: {
total: number;
paid: number;
due: number;
};
createdAt: number;
updatedAt: number;
}


export interface TenantDoc {
}