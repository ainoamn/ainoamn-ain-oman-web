// src/pages/ratings/index.tsx - صفحة التقييمات الرئيسية
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import InstantLink from '@/components/InstantLink';
import AdvancedRatingForm from '@/components/ratings/AdvancedRatingForm';
import RatingDisplay from '@/components/ratings/RatingDisplay';
import FeatureGate from '@/components/common/FeatureGate';
import { Rating, RatingResponse, ReviewType } from '@/types/ratings';
import { FaStar, FaFilter, FaPlus, FaSpinner, FaSearch, FaLock } from 'react-icons/fa';

export default function RatingsPage() {
  const router = useRouter();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [responses, setResponses] = useState<Record<string, RatingResponse>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    minRating: '',
    maxRating: '',
    verifiedOnly: false,
    reviewType: '' as ReviewType | '',
    search: '',
  });

  useEffect(() => {
    loadRatings();
  }, [filters]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.maxRating) params.append('maxRating', filters.maxRating);
      if (filters.verifiedOnly) params.append('verifiedOnly', 'true');
      if (filters.reviewType) params.append('reviewType', filters.reviewType);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/ratings?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setRatings(data.ratings || []);

        // جلب الردود
        const responsesData: Record<string, RatingResponse> = {};
        for (const rating of data.ratings || []) {
          if (rating.responseId) {
            const resResponse = await fetch(`/api/ratings/responses?ratingId=${rating.id}`);
            if (resResponse.ok) {
              const resData = await resResponse.json();
              if (resData.responses && resData.responses.length > 0) {
                responsesData[rating.id] = resData.responses[0];
              }
            }
          }
        }
        setResponses(responsesData);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (ratingData: any) => {
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData),
      });

      if (response.ok) {
        setShowForm(false);
        loadRatings();
      } else {
        throw new Error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  };

  // الحصول على معرف المستخدم الحالي (من localStorage أو session)
  const getCurrentUserId = (): string => {
    if (typeof window === 'undefined') return '';
    const authData = localStorage.getItem('ain_auth');
    if (authData) {
      try {
        const user = JSON.parse(authData);
        return user.id || '';
      } catch {}
    }
    return '';
  };

  const currentUserId = getCurrentUserId();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Head>
        <title>التقييمات - عين عُمان</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* العنوان */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">التقييمات</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            إضافة تقييم
          </button>
        </div>

        {/* نموذج التقييم */}
        {showForm && (
          <FeatureGate
            feature="ratings"
            showLockedMessage={true}
            context={{ userId: currentUserId }}
          >
            <div className="mb-8">
              <AdvancedRatingForm
                reviewerId={currentUserId}
                revieweeId={router.query.revieweeId as string || ''}
                reviewType={(router.query.reviewType as ReviewType) || 'property'}
                propertyId={router.query.propertyId as string}
                onSubmit={handleSubmitRating}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </FeatureGate>
        )}

        {/* الفلاتر */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter />
            <h2 className="text-lg font-semibold">الفلاتر</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحد الأدنى
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                className="w-full p-2 border rounded-lg"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحد الأقصى
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={filters.maxRating}
                onChange={(e) => setFilters({ ...filters, maxRating: e.target.value })}
                className="w-full p-2 border rounded-lg"
                placeholder="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع التقييم
              </label>
              <select
                value={filters.reviewType}
                onChange={(e) => setFilters({ ...filters, reviewType: e.target.value as ReviewType | '' })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">الكل</option>
                <option value="tenant">مستأجر</option>
                <option value="owner">مالك</option>
                <option value="property">عقار</option>
                <option value="company">شركة</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البحث
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full p-2 border rounded-lg pr-10"
                  placeholder="ابحث في التعليقات..."
                />
                <FaSearch className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">موثق فقط</span>
            </label>
          </div>
        </div>

        {/* قائمة التقييمات */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">لا توجد تقييمات</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <RatingDisplay
                key={rating.id}
                rating={rating}
                response={responses[rating.id]}
                currentUserId={currentUserId}
                onRespond={() => {
                  // TODO: فتح نموذج الرد
                  alert('ميزة الرد قريباً');
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

