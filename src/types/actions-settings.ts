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
  id: string;
  labelAr: string;
  labelEn: string;
  icon?: string;
  kind: CustomActionKind;
  url?: string; // for link
  modalId?: string; // for modal
  enabled: boolean;
  order: number;
  [key: string]: any;
}

export interface ActionsSettings {
  builtin: BuiltinActionSetting[];
  custom: CustomAction[];
  showAnnualPrice?: boolean;
  iconSize?: number;
}

export default ActionsSettings;
