// src/components/ratings/RatingStars.tsx
export default function RatingStars({ value = 0 }: { value?: number }) {
  const rounded = Math.round(value);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden className={i < rounded ? "opacity-100" : "opacity-30"}>★</span>
      ))}
    </div>
  );
}
