export type BhdAppMode = "identity" | "sso" | "browse";

export type BhdApp = {
  id: string;
  nameAr: string;
  nameEn: string;
  origin: string;
  workspacePath: string;
  startUrl: string | null;
  mode: BhdAppMode;
  enabled: boolean;
  mark: string;
  accent: string;
  logoUrl?: string | null;
  sortOrder?: number;
};

/** Local fallback when live catalog is unreachable. */
export const BHD_APPS_FALLBACK: BhdApp[] = [
  {
    id: "account",
    nameAr: "الحساب",
    nameEn: "Account",
    origin: "https://id.bhd-om.com",
    workspacePath: "/",
    startUrl: null,
    mode: "identity",
    enabled: true,
    mark: "ID",
    accent: "#075c45",
    sortOrder: 0,
  },
  {
    id: "portal",
    nameAr: "بوابة BHD",
    nameEn: "BHD Portal",
    origin: "https://www.bhd-om.com",
    workspacePath: "/",
    startUrl: "https://www.bhd-om.com/api/auth/bhd/start?returnTo=%2F",
    mode: "sso",
    enabled: true,
    mark: "BHD",
    accent: "#0f766e",
    sortOrder: 1,
  },
];
