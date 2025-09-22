// src/components/ratings/ReviewItem.tsx
import RatingStars from "./RatingStars";
function ReviewItem({ review }: { review: any }) {
  return (
    <div className="border rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <RatingStars value={review?.rating ?? 0} />
        <span className="text-xs text-slate-500">{review?.createdAt ?? ""}</span>
      </div>
      <p className="mt-2 text-sm">{review?.comment ?? ""}</p>
    </div>
  );
}