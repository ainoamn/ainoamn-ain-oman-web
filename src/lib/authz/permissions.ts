// src/lib/authz/permissions.ts
// RBAC مبسّط
export type Role =
  | "owner" | "admin" | "manager" | "finance" | "marketing"
  | "support" | "staff" | "seller" | "guest";

export type Permission =
  | "task:create" | "task:update" | "task:view"
  | "reservation:create" | "reservation:view"
  | "notification:create" | "notification:manage"
  | "account:manage" | "account:view"
  | "hoa:manage" | "hoa:view"
  | "property:create" | "property:update" | "property:view"
  | "auction:create" | "auction:approve" | "auction:view"
  | "partner:manage" | "review:moderate"
  | "billing:manage" | "invoice:manage" | "subscription:manage"
  | "ads:manage" | "coupon:manage"
  | "ai:use" | "valuation:use"
  | "i18n:manage" | "feature:manage"
  | "project:manage" | "impersonate:use";

export const RolePermissions: Record<Role, Permission[]> = {
  owner: [
    "task:create","task:update","task:view",
    "reservation:create","reservation:view",
    "notification:create","notification:manage",
    "account:manage","account:view",
    "hoa:manage","hoa:view",
    "property:create","property:update","property:view",
    "auction:create","auction:approve","auction:view",
    "partner:manage","review:moderate",
    "billing:manage","invoice:manage","subscription:manage",
    "ads:manage","coupon:manage",
    "ai:use","valuation:use",
    "i18n:manage","feature:manage",
    "project:manage","impersonate:use"
  ],
  admin: [
    "task:create","task:update","task:view",
    "reservation:create","reservation:view",
    "notification:create","notification:manage",
    "account:manage","account:view",
    "hoa:manage","hoa:view",
    "property:create","property:update","property:view",
    "auction:create","auction:approve","auction:view",
    "partner:manage","review:moderate",
    "billing:manage","invoice:manage","subscription:manage",
    "ads:manage","coupon:manage",
    "ai:use","valuation:use",
    "i18n:manage","feature:manage",
    "project:manage","impersonate:use"
  ],
  manager: [
    "task:create","task:update","task:view",
    "reservation:create","reservation:view",
    "notification:create",
    "account:view","hoa:view",
    "property:create","property:update","property:view",
    "auction:create","auction:view",
    "partner:manage","review:moderate",
    "billing:manage","invoice:manage","subscription:manage",
    "ads:manage","coupon:manage",
    "ai:use","valuation:use"
  ],
  finance: ["billing:manage","invoice:manage","subscription:manage","account:view","task:view"],
  marketing: ["ads:manage","coupon:manage","task:view"],
  support: ["notification:create","task:update","task:view","reservation:view"],
  staff: ["task:create","task:view","property:create","property:view","auction:create","auction:view"],
  seller: ["property:create","property:view","auction:create","auction:view"],
  guest: []
};

export function can(perms: Permission[], need: Permission | Permission[]) {
  const needs = Array.isArray(need) ? need : [need];
  return needs.every((p) => perms.includes(p));
}
