// src/lib/om-locations.ts //
export type Village = string;
export type State = { name: string; villages: Village[] };
export type Province = { name: string; states: State[] };

export const OMAN_PROVINCES: Province[] = [
  {
    name: "مسقط",
    states: [
      { name: "السيب", villages: ["المعبيلة", "الخوض", "بركاء الجديدة"] },
      { name: "بوشر", villages: ["القرم", "الخوير", "الغبرة"] },
      { name: "مطرح", villages: ["مطرح الكبرى", "روضات", "وادي الكبير"] },
      { name: "قريات", villages: ["ضباب", "فنس", "دغمر"] },
      { name: "العامرات", villages: ["سيح الظبي", "المعيذر"] }
    ]
  },
  {
    name: "شمال الباطنة",
    states: [
      { name: "صحار", villages: ["الهمبار", "الحجرة", "ليوا"] },
      { name: "شناص", villages: ["عقر بني عرابة", "حفيت"] },
      { name: "لوى", villages: ["النفس", "غضفان"] }
    ]
  },
  {
    name: "ظفار",
    states: [
      { name: "صلالة", villages: ["صلالة الوسطى", "الحافة", "عوقد"] },
      { name: "مرباط", villages: ["سدح", "حصون"] }
    ]
  },
  {
    name: "الداخلية",
    states: [
      { name: "نزوى", villages: ["فرق", "العلاية", "العقر"] },
      { name: "بهلاء", villages: ["بسيا", "جانحة"] }
    ]
  },
  {
    name: "شمال الشرقية",
    states: [
      { name: "إبراء", villages: ["القادسية", "اليحمدي"] },
      { name: "بدية", villages: ["المنترب", "الهجرة"] }
    ]
  }
];

// أدوات مساعدة
export function getStates(province?: string): string[] {
  const p = OMAN_PROVINCES.find(x => x.name === province);
  return p ? p.states.map(s => s.name) : [];
}
export function getVillages(province?: string, state?: string): string[] {
  const p = OMAN_PROVINCES.find(x => x.name === province);
  const s = p?.states.find(ss => ss.name === state);
  return s ? s.villages : [];
}
