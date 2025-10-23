// src/components/auth/AuthModal.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  XMarkIcon, 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
      setError('');
      setSuccess(false);
      setShowPassword(false);
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // حفظ بيانات المستخدم
        localStorage.setItem('ain_auth', JSON.stringify(data.user));
        
        setSuccess(true);
        
        // إعادة التوجيه بعد 1.5 ثانية
        setTimeout(() => {
          onClose();
          router.push('/profile');
          window.location.reload(); // لتحديث Header
        }, 1500);
      } else {
        setError(data.error || 'فشل تسجيل الدخول');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        
        // التبديل لتسجيل الدخول بعد التسجيل الناجح
        setTimeout(() => {
          setActiveTab('login');
          setSuccess(false);
          setError('');
        }, 2000);
      } else {
        setError(data.error || 'فشل إنشاء الحساب');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute -top-4 -right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>

              {/* Card */}
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                      <ShieldCheckIcon className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {activeTab === 'login' ? 'مرحباً بعودتك' : 'انضم إلينا'}
                    </h2>
                    <p className="text-blue-100">
                      {activeTab === 'login' 
                        ? 'سجل دخول للوصول إلى حسابك' 
                        : 'أنشئ حساب جديد في ثوانٍ'}
                    </p>
                  </div>
                  
                  {/* Decorative elements */}
                  <SparklesIcon className="absolute top-4 right-4 w-8 h-8 text-white/20" />
                  <SparklesIcon className="absolute bottom-4 left-4 w-6 h-6 text-white/20" />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                  <button
                    onClick={() => {
                      setActiveTab('login');
                      setError('');
                      setSuccess(false);
                    }}
                    className={`flex-1 py-4 text-center font-bold transition-all ${
                      activeTab === 'login'
                        ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('signup');
                      setError('');
                      setSuccess(false);
                    }}
                    className={`flex-1 py-4 text-center font-bold transition-all ${
                      activeTab === 'signup'
                        ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    إنشاء حساب
                  </button>
                </div>

                {/* Content */}
                <div className="p-8">
                  
                  {/* Success Message */}
                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-xl flex items-center gap-3"
                      >
                        <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-green-900">
                            {activeTab === 'login' ? '✅ تم تسجيل الدخول بنجاح!' : '✅ تم إنشاء الحساب بنجاح!'}
                          </p>
                          <p className="text-sm text-green-700">
                            {activeTab === 'login' ? 'جارٍ نقلك...' : 'يمكنك الآن تسجيل الدخول'}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl"
                      >
                        <p className="text-red-900 font-bold">❌ {error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Login Form */}
                  {activeTab === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-5">
                      
                      {/* Email */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          البريد الإلكتروني
                        </label>
                        <div className="relative">
                          <EnvelopeIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@ainoman.om"
                            required
                            className="w-full pr-12 pl-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          كلمة المرور
                        </label>
                        <div className="relative">
                          <LockClosedIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full pr-12 pl-12 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Remember & Forget */}
                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                          <span className="text-gray-600">تذكرني</span>
                        </label>
                        <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                          نسيت كلمة المرور؟
                        </button>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading || success}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>جارٍ تسجيل الدخول...</span>
                          </div>
                        ) : success ? (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircleIcon className="w-6 h-6" />
                            <span>تم بنجاح! جارٍ النقل...</span>
                          </div>
                        ) : (
                          'تسجيل الدخول'
                        )}
                      </button>

                    </form>
                  )}

                  {/* Signup Form */}
                  {activeTab === 'signup' && (
                    <form onSubmit={handleSignup} className="space-y-5">
                      
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          الاسم الكامل
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="محمد أحمد"
                            required
                            className="w-full pr-12 pl-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          البريد الإلكتروني
                        </label>
                        <div className="relative">
                          <EnvelopeIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@ainoman.om"
                            required
                            className="w-full pr-12 pl-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          كلمة المرور
                        </label>
                        <div className="relative">
                          <LockClosedIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="8 أحرف على الأقل"
                            required
                            minLength={8}
                            className="w-full pr-12 pl-12 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">يجب أن تحتوي على 8 أحرف على الأقل</p>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading || success}
                        className="w-full py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>جارٍ إنشاء الحساب...</span>
                          </div>
                        ) : success ? (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircleIcon className="w-6 h-6" />
                            <span>تم إنشاء الحساب! يمكنك الآن تسجيل الدخول</span>
                          </div>
                        ) : (
                          'إنشاء حساب جديد'
                        )}
                      </button>

                      {/* Terms */}
                      <p className="text-xs text-center text-gray-500">
                        بإنشاء حساب، أنت توافق على{' '}
                        <a href="/terms" className="text-blue-600 hover:underline">الشروط والأحكام</a>
                        {' '}و{' '}
                        <a href="/privacy" className="text-blue-600 hover:underline">سياسة الخصوصية</a>
                      </p>

                    </form>
                  )}

                  {/* Demo Accounts Info */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-xs text-blue-900 font-bold mb-2">🎯 حسابات تجريبية للاختبار:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2 rounded">
                        <p className="font-mono text-blue-600">owner@byfpro.com</p>
                        <p className="text-gray-500">ByfPro@2025</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="font-mono text-blue-600">khalid.alabri@ainoman.om</p>
                        <p className="text-gray-500">Owner@2025</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <a href="/help" className="text-gray-600 hover:text-blue-600 transition-colors">
                      مركز المساعدة
                    </a>
                    <span className="text-gray-300">|</span>
                    <a href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                      تواصل معنا
                    </a>
                    <span className="text-gray-300">|</span>
                    <a href="/faq" className="text-gray-600 hover:text-blue-600 transition-colors">
                      الأسئلة الشائعة
                    </a>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

