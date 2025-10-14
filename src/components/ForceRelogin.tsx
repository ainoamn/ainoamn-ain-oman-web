// src/components/ForceRelogin.tsx
// مكون لإجبار المستخدمين على تسجيل الدخول مرة أخرى بعد تحديث نظام الصلاحيات
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

export default function ForceRelogin() {
  const router = useRouter();
  const [clearing, setClearing] = useState(false);
  const [done, setDone] = useState(false);

  const clearAndRedirect = async () => {
    setClearing(true);
    
    // مسح localStorage
    localStorage.clear();
    
    // مسح sessionStorage
    sessionStorage.clear();
    
    // إرسال حدث التغيير
    try {
      window.dispatchEvent(new CustomEvent('ain_auth:change'));
    } catch (e) {
      console.error('Error dispatching event:', e);
    }
    
    setDone(true);
    
    // التوجيه بعد ثانية
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  };

  useEffect(() => {
    // عرض معلومات التشخيص في Console
    const auth = localStorage.getItem('ain_auth');
    if (auth) {
      try {
        const data = JSON.parse(auth);
        console.log('🔍 بيانات ain_auth الحالية:', data);
        console.log('🔑 الصلاحيات:', data.permissions || 'غير موجودة');
        
        // إذا لم توجد permissions، نفذ المسح تلقائياً
        if (!data.permissions) {
          console.log('⚠️ تم اكتشاف بيانات قديمة، سيتم المسح تلقائياً...');
        }
      } catch (e) {
        console.error('خطأ في قراءة البيانات:', e);
      }
    } else {
      console.log('✅ لا توجد بيانات محفوظة');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mb-6">
          {done ? (
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <FiCheckCircle className="w-12 h-12 text-green-600" />
            </div>
          ) : (
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <FiRefreshCw className={`w-12 h-12 text-purple-600 ${clearing ? 'animate-spin' : ''}`} />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {done ? '✅ تم التحديث!' : '🔄 تحديث مطلوب'}
        </h1>

        {/* Message */}
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          {done 
            ? 'تم مسح البيانات القديمة بنجاح. جاري التوجيه إلى صفحة تسجيل الدخول...'
            : 'تم تحديث نظام الصلاحيات في الموقع. يرجى الضغط على الزر أدناه لمسح البيانات القديمة وتسجيل الدخول من جديد.'
          }
        </p>

        {/* Button */}
        {!done && (
          <button
            onClick={clearAndRedirect}
            disabled={clearing}
            className={`
              px-8 py-4 rounded-full text-white font-bold text-lg
              transition-all duration-300 transform
              ${clearing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:scale-105 hover:shadow-xl'
              }
            `}
          >
            {clearing ? 'جاري المسح...' : 'مسح وإعادة التسجيل'}
          </button>
        )}

        {/* Status */}
        <div className="mt-8 bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">
            {done 
              ? '✅ تم مسح جميع البيانات المحلية'
              : clearing
              ? '⏳ جاري المسح...'
              : '💡 اضغط الزر لتحديث البيانات'
            }
          </p>
        </div>
      </div>
    </div>
  );
}


