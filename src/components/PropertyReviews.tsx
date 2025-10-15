// src/components/PropertyReviews.tsx - عرض وإضافة التقييمات
import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaThumbsUp, FaFlag, FaUser } from 'react-icons/fa';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  aspects: {
    cleanliness: number;
    location: number;
    value: number;
    communication: number;
  };
  createdAt: string;
  helpful: number;
}

interface PropertyReviewsProps {
  propertyId: string;
}

export default function PropertyReviews({ propertyId }: PropertyReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    aspects: {
      cleanliness: 5,
      location: 5,
      value: 5,
      communication: 5,
    }
  });

  useEffect(() => {
    loadReviews();
  }, [propertyId]);

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?propertyId=${propertyId}&status=approved`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    const authData = localStorage.getItem('ain_auth');
    if (!authData) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    const user = JSON.parse(authData);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          userId: user.id,
          userName: user.name,
          userAvatar: user.picture,
          ...newReview
        })
      });

      if (response.ok) {
        alert('تم إرسال تقييمك بنجاح! سيتم مراجعته قريباً.');
        setShowAddReview(false);
        setNewReview({
          rating: 5,
          comment: '',
          aspects: { cleanliness: 5, location: 5, value: 5, communication: 5 }
        });
        loadReviews();
      } else {
        const error = await response.json();
        alert(error.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('حدث خطأ أثناء إرسال التقييم');
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-xl';
    return (
      <div className={`flex gap-1 ${sizeClass}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <FaStar key={star} className="text-yellow-400" />
          ) : (
            <FaRegStar key={star} className="text-gray-300" />
          )
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6" dir="rtl">
      {/* الإحصائيات */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">التقييمات والآراء</h2>
          <button
            onClick={() => setShowAddReview(!showAddReview)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            {showAddReview ? 'إلغاء' : '+ أضف تقييمك'}
          </button>
        </div>

        {stats && stats.total > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                {renderStars(Math.round(stats.averageRating), 'lg')}
                <p className="text-gray-600 mt-2">من {stats.total} تقييم</p>
              </div>
              
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-8">{rating} ⭐</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{
                          width: `${stats.total > 0 ? (stats.ratings[rating] / stats.total) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">{stats.ratings[rating]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* نموذج إضافة تقييم */}
      {showAddReview && (
        <div className="bg-gray-50 rounded-xl p-6 mb-6 animate-fade-in">
          <h3 className="text-xl font-bold mb-4">أضف تقييمك</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التقييم الإجمالي
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="text-3xl hover:scale-110 transition-transform"
                  >
                    {star <= newReview.rating ? (
                      <FaStar className="text-yellow-400" />
                    ) : (
                      <FaRegStar className="text-gray-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تعليقك
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="شاركنا تجربتك مع هذا العقار..."
              />
            </div>

            <button
              onClick={submitReview}
              disabled={!newReview.comment.trim()}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
            >
              إرسال التقييم
            </button>
          </div>
        </div>
      )}

      {/* قائمة التقييمات */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">لا توجد تقييمات بعد</p>
            <p className="text-sm">كن أول من يقيّم هذا العقار!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  {review.userAvatar ? (
                    <img src={review.userAvatar} alt={review.userName} className="w-12 h-12 rounded-full" />
                  ) : (
                    <FaUser className="text-blue-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{review.userName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    {renderStars(review.rating, 'sm')}
                  </div>
                  
                  <p className="text-gray-700 mb-3">{review.comment}</p>
                  
                  <div className="flex gap-4 text-sm">
                    <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition">
                      <FaThumbsUp />
                      <span>مفيد ({review.helpful})</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition">
                      <FaFlag />
                      <span>إبلاغ</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

