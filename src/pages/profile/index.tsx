// src/pages/profile/index.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  FiUser, FiSettings, FiEdit, FiStar, FiHome, FiCalendar, 
  FiDollarSign, FiClock, FiBuilding, FiCreditCard, FiFileText, 
  FiTrendingUp, FiHeart, FiActivity
} from 'react-icons/fi';

interface UserStats {
  totalProperties: number;
  activeBookings: number;
  totalSpent: number;
  pendingPayments: number;
  rating: number;
  reviews: number;
  level: number;
  points: number;
  badges: string[];
}

export default function UserProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<UserStats>({
    totalProperties: 0,
    activeBookings: 0,
    totalSpent: 0,
    pendingPayments: 0,
    rating: 4.5,
    reviews: 0,
    level: 1,
    points: 0,
    badges: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR',
      maximumFractionDigits: 3
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>ملفي الشخصي - عين عُمان</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ملفي الشخصي</h1>
                <p className="mt-1 text-sm text-gray-500">
                  إدارة حسابك وأنشطتك في عين عُمان
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => router.push('/profile/settings')}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <FiSettings className="w-4 h-4 ml-2" />
                  الإعدادات
                </button>
                <button 
                  onClick={() => router.push('/profile/edit')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FiEdit className="w-4 h-4 ml-2" />
                  تعديل الملف
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUser className="w-12 h-12 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {user?.name || 'المستخدم'}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {user?.email || 'user@example.com'}
                  </p>
                  
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">المستوى</span>
                      <span className="text-lg font-bold">{stats.level}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(stats.points % 1000) / 10}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1">{stats.points} نقطة</p>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">الشارات</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {stats.badges.length > 0 ? stats.badges.slice(0, 6).map((badge, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                        >
                          🏆 {badge}
                        </span>
                      )) : (
                        <span className="text-xs text-gray-500">لا توجد شارات بعد</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex items-center">
                      <FiStar className="w-4 h-4 text-yellow-400" />
                      <FiStar className="w-4 h-4 text-yellow-400" />
                      <FiStar className="w-4 h-4 text-yellow-400" />
                      <FiStar className="w-4 h-4 text-yellow-400" />
                      <FiStar className="w-4 h-4 text-gray-300" />
                    </div>
                    <span className="text-sm text-gray-600">
                      {stats.rating.toFixed(1)} ({stats.reviews} تقييم)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">الإشعارات</h3>
                <p className="text-center text-gray-500 py-4">لا توجد إشعارات</p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiHome className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-600">العقارات</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiCalendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-600">الحجوزات</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FiDollarSign className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-600">الإنفاق</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FiClock className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="mr-4">
                      <p className="text-sm font-medium text-gray-600">معلقة</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingPayments)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">إدارة العقارات</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">🏢</span>
                        <span className="text-sm font-medium">عقاراتي</span>
                      </div>
                      <span className="text-xs text-gray-500">{stats.totalProperties}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">📅</span>
                        <span className="text-sm font-medium">حجوزاتي</span>
                      </div>
                      <span className="text-xs text-gray-500">{stats.activeBookings}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-red-600">❤️</span>
                        <span className="text-sm font-medium">المفضلة</span>
                      </div>
                      <span className="text-xs text-gray-500">0</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">المالية</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600">💳</span>
                        <span className="text-sm font-medium">المدفوعات</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatCurrency(stats.totalSpent)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600">📄</span>
                        <span className="text-sm font-medium">الفواتير</span>
                      </div>
                      <span className="text-xs text-gray-500">0</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">📊</span>
                        <span className="text-sm font-medium">التقارير</span>
                      </div>
                      <span className="text-xs text-gray-500">عرض</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">الأنشطة الأخيرة</h3>
                <div className="text-center py-8">
                  <FiActivity className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد أنشطة</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    سيتم عرض أنشطتك الأخيرة هنا.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
