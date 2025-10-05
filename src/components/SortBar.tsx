// src/components/SortBar.tsx
export type SortValue = "newest" | "priceAsc" | "priceDesc" | "rating" | "views" | "";

export default function SortBar({ value, onChange }: { value: SortValue; onChange: (v: SortValue) => void }) {
  return (
    <div className="sticky top-16 z-20 bg-[#FAF9F6] py-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">الفرز:</span>
        <select className="border rounded p-2" value={value} onChange={e => onChange(e.target.value as SortValue)}>
          <option value="">—</option>
          <option value="newest">الأحدث</option>
          <option value="priceAsc">السعر ↑</option>
          <option value="priceDesc">السعر ↓</option>
          <option value="rating">التقييم</option>
          <option value="views">المشاهدة</option>
        </select>
      </div>
    </div>
  );
}
