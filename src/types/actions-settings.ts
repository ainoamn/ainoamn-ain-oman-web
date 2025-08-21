/**
 * Types for Actions Settings (Property actions visibility & custom actions)
 * Location: src/types/actions-settings.ts
 */

export type BuiltinActionKey =
  | "chatOwner"
  | "contactAdmin"
  | "requestViewing"
  | "negotiatePrice"
  | "reserveProperty";

export interface BuiltinActionSetting {
  key: BuiltinActionKey;
  enabled: boolean;
}

export type CustomActionKind = "link" | "modal";

export interface CustomAction {
  id: string;             // uuid-like string
  labelAr: string;
  labelEn: string;
  icon?: string;          // lucide-react icon name or custom
  kind: CustomActionKind; // link | modal
  url?: string;           // required when kind === "link"
  modalId?: string;       // required when kind === "modal"
  enabled: boolean;
  order: number;          // render order among custom actions
}

export interface ActionsSettings {
  /**
   * Toggle the visibility of built-in buttons on /property/[id].tsx
   */
  builtin: BuiltinActionSetting[];

  /**
   * Custom actions the admin can add
   */
  custom: CustomAction[];

  /**
   * Display yearly price near monthly/daily price (e.g., 60 OMR monthly → 720 OMR yearly)
   */
  showAnnualPrice: boolean;

  /**
   * Optional: default icon size for action buttons
   */
  iconSize?: number;
}
