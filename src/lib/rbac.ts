export type Role =
  | "guest"
  | "individual_tenant"
  | "corporate_tenant"
  | "basic_individual_landlord"
  | "property_owner_individual_landlord"
  | "corporate_landlord"
  | "individual_property_manager"
  | "service_provider"
  | "admin_staff"
  | "broker"
  | "investor"
  | "sub_user"
  | "super_admin";

export type Permission =
  | "contracts.view"
  | "contracts.manage"
  | "invoices.pay"
  | "invoices.manage"
  | "maintenance.create"
  | "maintenance.manage"
  | "notifications.receive"
  | "tenants.add_subusers"
  | "units.manage"
  | "employees.manage"
  | "portfolio.manage"
  | "reports.view"
  | "operations.full"
  | "ads.create"
  | "auctions.create"
  | "finance.view"
  | "finance.manage";

export const PERMISSIONS_BY_ROLE: Record<Role, Permission[]> = {
  guest: [],
  individual_tenant: [
    "contracts.view", "invoices.pay", "maintenance.create", "notifications.receive"
  ],
  corporate_tenant: [
    "contracts.view", "invoices.pay", "maintenance.create", "notifications.receive",
    "tenants.add_subusers", "units.manage"
  ],
  basic_individual_landlord: [
    "contracts.manage", "portfolio.manage", "reports.view"
  ],
  property_owner_individual_landlord: [
    "contracts.manage", "portfolio.manage", "reports.view", "maintenance.manage", "ads.create", "auctions.create"
  ],
  corporate_landlord: [
    "contracts.manage", "portfolio.manage", "employees.manage",
    "reports.view", "maintenance.manage", "operations.full", "finance.view"
  ],
  individual_property_manager: [
    "portfolio.manage", "contracts.manage", "maintenance.manage", "reports.view"
  ],
  service_provider: [
    "maintenance.manage", "reports.view"
  ],
  admin_staff: [
    "operations.full", "reports.view", "finance.view"
  ],
  broker: [
    "ads.create", "auctions.create", "units.manage", "reports.view"
  ],
  investor: [
    "reports.view", "finance.view"
  ],
  sub_user: [], // يضبطها المالك لاحقًا
  super_admin: [
    "operations.full","contracts.manage","invoices.manage","portfolio.manage","employees.manage",
    "reports.view","finance.manage","ads.create","auctions.create","maintenance.manage","units.manage"
  ],
};

export function hasPerm(role: Role, perm: Permission) {
  if (role === "super_admin") return true;
  return (PERMISSIONS_BY_ROLE[role] || []).includes(perm);
}
