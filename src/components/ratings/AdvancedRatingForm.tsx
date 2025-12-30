// src/components/ratings/AdvancedRatingForm.tsx - نموذج التقييم المتقدم
import React, { useState } from 'react';
import { RatingDimension, ReviewType } from '@/types/ratings';
import { FaStar, FaSpinner } from 'react-icons/fa';
import FeatureGate from '@/components/common/FeatureGate';

interface AdvancedRatingFormProps {
  reviewerId: string;
  revieweeId: string;
  reviewType: ReviewType;
  propertyId?: string;
  onSubmit: (rating: any) => Promise<void>;
  onCancel?: () => void;
}

const DIMENSION_LABELS: Record<RatingDimension, { ar: string; en: string }> = {
  punctuality: { ar: 'الالتزام بالمواعيد', en: 'Punctuality' },
  communication: { ar: 'التواصل', en: 'Communication' },
  cleanliness: { ar: 'النظافة', en: 'Cleanliness' },
  maintenance: { ar: 'الصيانة', en: 'Maintenance' },
  contractCompliance: { ar: 'الالتزام بالعقد', en: 'Contract Compliance' },
  responsiveness: { ar: 'سرعة الاستجابة', en: 'Responsiveness' },
  professionalism: { ar: 'الاحترافية', en: 'Professionalism' },
  value: { ar: 'القيمة مقابل المال', en: 'Value for Money' },
  location: { ar: 'الموقع', en: 'Location' },
  amenities: { ar: 'المرافق', en: 'Amenities' },
};

// الأبعاد حسب نوع التقييم
const DIMENSIONS_BY_TYPE: Record<ReviewType, RatingDimension[]> = {
  tenant: ['punctuality', 'communication', 'cleanliness', 'contractCompliance'],
  owner: ['responsiveness', 'communication', 'maintenance', 'professionalism', 'value'],
  property: ['location', 'cleanliness', 'amenities', 'value', 'maintenance'],
  company: ['professionalism', 'responsiveness', 'communication', 'value'],
};

export default function AdvancedRatingForm({
  reviewerId,
  revieweeId,
  reviewType,
  propertyId,
  onSubmit,
  onCancel,
}: AdvancedRatingFormProps) {
  const [dimensions, setDimensions] = useState<Record<RatingDimension, number>>({} as any);
  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableDimensions = DIMENSIONS_BY_TYPE[reviewType];

  const handleDimensionChange = (dimension: RatingDimension, score: number) => {
    const newDimensions = { ...dimensions, [dimension]: score };
    setDimensions(newDimensions);
    
    // حساب التقييم الإجمالي
    const scores = availableDimensions
      .map(dim => newDimensions[dim])
      .filter(score => score > 0);
    
    if (scores.length > 0) {
      const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      setOverallRating(Math.round(average * 10) / 10);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (overallRating === 0) {
      alert('يرجى إعطاء تقييم على الأقل في بُعد واحد');
      return;
    }

    setSubmitting(true);
    try {
      const ratingData = {
        reviewerId,
        revieweeId,
        reviewType,
        propertyId,
        dimensions: availableDimensions
          .filter(dim => dimensions[dim] > 0)
          .map(dim => ({
            dimension: dim,
            score: dimensions[dim],
            weight: 1,
          })),
        overallRating,
        comment,
        verified: false,
      };

      await onSubmit(ratingData);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('حدث خطأ أثناء إرسال التقييم');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">تقييم متقدم</h3>

      {/* الأبعاد */}
      <div className="space-y-4">
        {availableDimensions.map((dimension) => (
          <div key={dimension} className="border-b pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {DIMENSION_LABELS[dimension].ar}
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => handleDimensionChange(dimension, score)}
                  className={`p-2 rounded transition-all ${
                    dimensions[dimension] >= score
                      ? 'text-yellow-500 scale-110'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <FaStar className="text-2xl" />
                </button>
              ))}
              {dimensions[dimension] > 0 && (
                <span className="text-sm text-gray-600 mr-2">
                  {dimensions[dimension]} / 5
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* التقييم الإجمالي */}
      {overallRating > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            التقييم الإجمالي
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <FaStar
                key={score}
                className={`text-3xl ${
                  overallRating >= score
                    ? 'text-yellow-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-lg font-bold text-gray-800 mr-2">
              {overallRating.toFixed(1)} / 5.0
            </span>
          </div>
        </div>
      )}

      {/* التعليق */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          تعليقك (اختياري)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="شاركنا تجربتك..."
        />
      </div>

      {/* الأزرار */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={submitting || overallRating === 0}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <FaSpinner className="animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            'إرسال التقييم'
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
}

