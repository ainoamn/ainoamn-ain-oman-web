// src/components/ratings/RatingDisplay.tsx - عرض التقييم
import React from 'react';
import { Rating, RatingResponse } from '@/types/ratings';
import { FaStar, FaStarHalfAlt, FaRegStar, FaCheckCircle, FaReply } from 'react-icons/fa';
import InstantLink from '@/components/InstantLink';

interface RatingDisplayProps {
  rating: Rating;
  response?: RatingResponse | null;
  showResponse?: boolean;
  onRespond?: () => void;
  currentUserId?: string;
}

const DIMENSION_LABELS: Record<string, { ar: string }> = {
  punctuality: { ar: 'الالتزام بالمواعيد' },
  communication: { ar: 'التواصل' },
  cleanliness: { ar: 'النظافة' },
  maintenance: { ar: 'الصيانة' },
  contractCompliance: { ar: 'الالتزام بالعقد' },
  responsiveness: { ar: 'سرعة الاستجابة' },
  professionalism: { ar: 'الاحترافية' },
  value: { ar: 'القيمة مقابل المال' },
  location: { ar: 'الموقع' },
  amenities: { ar: 'المرافق' },
};

export default function RatingDisplay({
  rating,
  response,
  showResponse = true,
  onRespond,
  currentUserId,
}: RatingDisplayProps) {
  const renderStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-500" />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-500" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<FaRegStar key={i} className="text-gray-300" />);
    }

    return stars;
  };

  const canRespond = showResponse && 
    !response && 
    currentUserId === rating.revieweeId;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* رأس التقييم */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {renderStars(rating.overallRating)}
            </div>
            <span className="text-lg font-bold text-gray-800">
              {rating.overallRating.toFixed(1)}
            </span>
            {rating.verified && (
              <FaCheckCircle className="text-green-500" title="تقييم موثق" />
            )}
          </div>
          <p className="text-sm text-gray-500">
            {new Date(rating.createdAt).toLocaleDateString('ar-SA')}
          </p>
        </div>
      </div>

      {/* الأبعاد */}
      {rating.dimensions && rating.dimensions.length > 0 && (
        <div className="mb-4 space-y-2">
          {rating.dimensions.map((dim, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {DIMENSION_LABELS[dim.dimension]?.ar || dim.dimension}
              </span>
              <div className="flex items-center gap-1">
                {renderStars(dim.score)}
                <span className="text-gray-700 font-medium mr-1">
                  {dim.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* التعليق */}
      {rating.comment && (
        <p className="text-gray-700 mb-4 leading-relaxed">{rating.comment}</p>
      )}

      {/* الرد */}
      {response && (
        <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaReply className="text-blue-500" />
            <span className="font-semibold text-gray-800">رد من المالك</span>
          </div>
          <p className="text-gray-700">{response.responseText}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(response.createdAt).toLocaleDateString('ar-SA')}
          </p>
        </div>
      )}

      {/* زر الرد */}
      {canRespond && (
        <button
          onClick={onRespond}
          className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
        >
          <FaReply />
          الرد على التقييم
        </button>
      )}
    </div>
  );
}






