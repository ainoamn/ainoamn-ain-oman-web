import React from "react";

export function RatingStars({ value = 0, size = 16 }: { value?: number; size?: number }) {
  const rounded = Math.round(value * 2) / 2;
  const stars = [1, 2, 3, 4, 5].map((i) => {
    const full = i <= Math.floor(rounded);
    const half = !full && i - rounded === 0.5;
    return { i, full, half };
  });

  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${value}`}>
      {stars.map(({ i, full }) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
          width={size} height={size}
          className={full ? "fill-yellow-400" : "fill-gray-300"} aria-hidden="true">
          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.401 8.164L12 18.896l-7.335 3.864 1.401-8.164L.132 9.21l8.2-1.192L12 .587z" />
        </svg>
      ))}
      <span className="text-xs text-slate-500 ms-1">{value.toFixed(1)}</span>
    </div>
  );
}