// src/pages/ratings/[id].tsx - صفحة تفاصيل التقييم
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import InstantLink from '@/components/InstantLink';
import RatingDisplay from '@/components/ratings/RatingDisplay';
import { Rating, RatingResponse } from '@/types/ratings';
import { FaArrowRight, FaSpinner, FaReply } from 'react-icons/fa';

export default function RatingDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [rating, setRating] = useState<Rating | null>(null);
  const [response, setResponse] = useState<RatingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    if (id) {
      loadRating();
    }
  }, [id]);

  const loadRating = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ratings/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRating(data.rating);
        setResponse(data.response || null);
      }
    } catch (error) {
      console.error('Error loading rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      alert('يرجى إدخال نص الرد');
      return;
    }

    try {
      // الحصول على معرف المستخدم الحالي
      const authData = localStorage.getItem('ain_auth');
      if (!authData) {
        alert('يجب تسجيل الدخول أولاً');
        return;
      }

      const user = JSON.parse(authData);
      const response = await fetch(`/api/ratings/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond',
          responderId: user.id,
          responseText,
        }),
      });

      if (response.ok) {
        setShowResponseForm(false);
        setResponseText('');
        loadRating();
      } else {
        throw new Error('Failed to submit response');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('حدث خطأ أثناء إرسال الرد');
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!rating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">التقييم غير موجود</h1>
          <InstantLink href="/ratings" className="text-blue-600 hover:underline">
            العودة إلى التقييمات
          </InstantLink>
        </div>
      </div>
    );
  }

  const canRespond = !response && getCurrentUserId() === rating.revieweeId;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Head>
        <title>تفاصيل التقييم - عين عُمان</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <InstantLink
          href="/ratings"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <FaArrowRight />
          العودة إلى التقييمات
        </InstantLink>

        <div className="max-w-3xl mx-auto">
          <RatingDisplay
            rating={rating}
            response={response}
            currentUserId={getCurrentUserId()}
            onRespond={() => setShowResponseForm(true)}
          />

          {/* نموذج الرد */}
          {showResponseForm && canRespond && (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">الرد على التقييم</h3>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                placeholder="اكتب ردك هنا..."
              />
              <div className="flex gap-4">
                <button
                  onClick={handleSubmitResponse}
                  className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إرسال الرد
                </button>
                <button
                  onClick={() => {
                    setShowResponseForm(false);
                    setResponseText('');
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}






