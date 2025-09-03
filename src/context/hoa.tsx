import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { HOA, Building, Unit, Ticket, Investor, Alert, Doc } from "@/types/hoa";

type Store = {
  hoas: HOA[]; buildings: Building[]; units: Unit[]; tickets: Ticket[];
  investors: Investor[]; alerts: Alert[]; docs: Doc[];
};

type Ctx = Store & {
  addHOA: (p: HOA) => void;
  addBuilding: (b: Building) => void;
  addUnit: (u: Unit) => void;
  addTicket: (t: Ticket) => void;
  addDoc: (d: Doc) => void;
  addInvestor: (i: Investor) => void;
};

export const HoaContext = createContext<Ctx | null>(null);

const KEY = "ain-oman.hoa.store.v1";

const seed: Store = {
  hoas: [{ id: "HOA-001", name: "جمعية الملاك - برج المسرة", status: "active" }],
  buildings: [{ id: "B-001", hoaId: "HOA-001", name: "برج المسرة A", address: "المعبيلة الجنوبية" }],
  units: [
    { id: "U-101", buildingId: "B-001", name: "الدور 1 - شقة 1", owner: "أحمد", area: 120, balance: 0 },
    { id: "U-102", buildingId: "B-001", name: "الدور 1 - شقة 2", owner: "سمية", area: 115, balance: 72.5 },
  ],
  tickets: [{ id: "REQ-1001", by: "U-102", type: "صيانة تسريب", status: "open", createdAt: "2025-08-30" }],
  investors: [{ id: "inv_1", name: "Oman REIT", share: 15 }],
  alerts: [{ id: "A-01", level: "critical", msg: "متأخرات رسوم خدمات لأكثر من 60 يومًا", link: "/owners-association/requests" }],
  docs: [{ id: "DOC-1", title: "عقد صيانة المصاعد", expiry: "2025-09-20" }, { id: "DOC-2", title: "وثيقة التأمين", expiry: "2025-10-10" }],
};

export function HoaProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store>(seed);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setStore(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(store));
    } catch {}
  }, [store]);

  const api: Ctx = useMemo(() => ({
    ...store,
    addHOA: (p) => setStore(s => ({ ...s, hoas: [...s.hoas, p] })),
    addBuilding: (b) => setStore(s => ({ ...s, buildings: [...s.buildings, b] })),
    addUnit: (u) => setStore(s => ({ ...s, units: [...s.units, u] })),
    addTicket: (t) => setStore(s => ({ ...s, tickets: [t, ...s.tickets] })),
    addDoc: (d) => setStore(s => ({ ...s, docs: [d, ...s.docs] })),
    addInvestor: (i) => setStore(s => ({ ...s, investors: [...s.investors, i] })),
  }), [store]);

  return <HoaContext.Provider value={api}>{children}</HoaContext.Provider>;
}

/** آمن: يعيد كائنًا افتراضيًا بدل رمي خطأ إذا لم يوجد Provider */
export function useHoa(): Ctx {
  const ctx = useContext(HoaContext);
  if (ctx) return ctx;
  return {
    ...seed,
    addHOA: () => {},
    addBuilding: () => {},
    addUnit: () => {},
    addTicket: () => {},
    addDoc: () => {},
    addInvestor: () => {},
  };
}
