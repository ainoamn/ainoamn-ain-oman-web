// src/components/partners/PartnerCard.tsx
import RatingStars from "../ratings/RatingStars";

export default function PartnerCard({ partner }: { partner:any }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="flex items-center gap-3">
        {partner?.logo ? <img src={partner.logo} className="w-12 h-12 rounded-full" alt="" /> : <div className="w-12 h-12 rounded-full bg-slate-200" />}
        <div>
          <div className="font-semibold">{partner?.name ?? "Partner"}</div>
          <RatingStars value={partner?.rating ?? 0} />
        </div>
      </div>
    </div>
  );
}