import React, { useState, useEffect } from 'react';
import InstantImage from '@/components/InstantImage';
import Head from 'next/head';
import { useRouter } from 'next/router';
import InstantLink from '@/components/InstantLink';
import { useI18n } from '@/lib/i18n';
import { 
  FaUser, FaBell, FaLock, FaPalette, FaGlobe, FaCog,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera, FaSave,
  FaKey, FaShieldAlt, FaEye, FaEyeOff, FaMoon, FaSun,
  FaDesktop, FaCheckCircle, FaExclamationTriangle, FaTrash,
  FaSignOutAlt, FaEdit, FaUpload, FaClock, FaLanguage
} from 'react-icons/fa';

interface UserSettings {
  id: string;
  userId: string;
  profile: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    bio?: string;
    location?: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
    bookings: boolean;
    payments: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  security: {
    twoFactorAuth: boolean;
    loginAlerts: boolean;
  };
}

type TabType = 'profile' | 'notifications' | 'privacy' | 'appearance' | 'security' | 'account';

export default function SettingsPage() {
  const router = useRouter();
  const { dir } = useI18n();
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // نماذج
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  // حقول كلمة المرور
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    loadUserData();
    loadSettings();
  }, []);

  const loadUserData = () => {
    try {
      const authData = localStorage.getItem('ain_auth');
      if (authData) {
        setUser(JSON.parse(authData));
      } else {
        router.replace('/login?return=/settings');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      router.replace('/login?return=/settings');
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const authData = localStorage.getItem('ain_auth');
      if (!authData) {
        router.replace('/login?return=/settings');
        return;
      }

      const userData = JSON.parse(authData);
      const userId = userData.id;

      const res = await fetch(`/api/settings/user?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      } else {
        // إنشاء إعدادات افتراضية
        const defaultSettings: UserSettings = {
          id: `SETTINGS-${Date.now()}`,
          userId,
          profile: {
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            avatar: userData.picture || userData.avatar,
            bio: '',
            location: 'مسقط، سلطنة عُمان'
          },
          notifications: {
            email: true,
            sms: true,
            push: true,
            marketing: false,
            bookings: true,
            payments: true
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showPhone: false,
            allowMessages: true
          },
          appearance: {
            theme: 'auto',
            language: 'ar',
            fontSize: 'medium'
          },
          security: {
            twoFactorAuth: false,
            loginAlerts: true
          }
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: settings.id, ...settings })
      });

      if (res.ok) {
        alert('✅ تم حفظ الإعدادات بنجاح!');
        
        // تحديث بيانات المستخدم في localStorage
        const authData = localStorage.getItem('ain_auth');
        if (authData) {
          const userData = JSON.parse(authData);
          userData.name = settings.profile.name;
          userData.email = settings.profile.email;
          userData.phone = settings.profile.phone;
          localStorage.setItem('ain_auth', JSON.stringify(userData));
          window.dispatchEvent(new CustomEvent('ain_auth:change'));
        }
      } else {
        const error = await res.json();
        alert('خطأ: ' + (error.error || 'فشل حفظ الإعدادات'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return alert('الرجاء ملء جميع الحقول');
    }
    
    if (newPassword !== confirmPassword) {
      return alert('كلمة المرور الجديدة وتأكيدها غير متطابقتين');
    }
    
    if (newPassword.length < 8) {
      return alert('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          currentPassword, 
          newPassword 
        })
      });

      if (res.ok) {
        alert('✅ تم تغيير كلمة المرور بنجاح!');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const error = await res.json();
        alert('خطأ: ' + (error.error || 'فشل تغيير كلمة المرور'));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('حدث خطأ أثناء تغيير كلمة المرور');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      return;
    }

    try {
      const res = await fetch(`/api/auth/delete-account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (res.ok) {
        alert('تم حذف حسابك بنجاح');
        localStorage.removeItem('ain_auth');
        localStorage.removeItem('auth_token');
        router.replace('/');
      } else {
        const error = await res.json();
        alert('خطأ: ' + (error.error || 'فشل حذف الحساب'));
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('حدث خطأ أثناء حذف الحساب');
    }
  };

  if (loading) {
    return (
      <>
        <Head><title>جاري التحميل... | Ain Oman</title></Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل الإعدادات...</p>
          </div>
        </div>
      </>
    );
  }

  if (!settings || !user) {
    return (
      <>
        <Head><title>خطأ | Ain Oman</title></Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">خطأ في تحميل الإعدادات</h1>
            <InstantLink href="/login?return=/settings" className="text-green-600 hover:text-green-700 font-medium">
              تسجيل الدخول
            </InstantLink>
          </div>
        </div>
      </>
    );
  }

  const tabs = [
    { id: 'profile', label: 'الملف الشخصي', icon: FaUser },
    { id: 'notifications', label: 'الإشعارات', icon: FaBell },
    { id: 'privacy', label: 'الخصوصية', icon: FaShieldAlt },
    { id: 'appearance', label: 'المظهر', icon: FaPalette },
    { id: 'security', label: 'الأمان', icon: FaLock },
    { id: 'account', label: 'الحساب', icon: FaCog }
  ];

  return (
    <>
      <Head>
        <title>الإعدادات | Ain Oman</title>
      </Head>

      <div dir={dir} className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">الإعدادات</h1>
                <p className="text-gray-600">إدارة حسابك وتفضيلاتك</p>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <FaSave />
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-24">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="text-xl" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <FaUser className="text-3xl text-green-600" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">الملف الشخصي</h2>
                        <p className="text-gray-600">إدارة معلوماتك الشخصية</p>
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                          {settings.profile.avatar ? (
                            <InstantImage src={settings.profile.avatar} alt="Avatar" className="w-full h-full object-cover"  loading="lazy" width={400} height={300}/>
                          ) : (
                            settings.profile.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-all shadow-lg">
                          <FaCamera className="text-sm" />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{settings.profile.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{settings.profile.email}</p>
                        <button
                          onClick={() => setShowAvatarUpload(true)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          تغيير الصورة
                        </button>
                      </div>
                    </div>

                    {/* Profile Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaUser className="inline-block ml-2" />
                          الاسم الكامل
                        </label>
                        <input
                          type="text"
                          value={settings.profile.name}
                          onChange={(e) => setSettings({
                            ...settings,
                            profile: { ...settings.profile, name: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaEnvelope className="inline-block ml-2" />
                          البريد الإلكتروني
                        </label>
                        <input
                          type="email"
                          value={settings.profile.email}
                          onChange={(e) => setSettings({
                            ...settings,
                            profile: { ...settings.profile, email: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaPhone className="inline-block ml-2" />
                          رقم الهاتف
                        </label>
                        <input
                          type="tel"
                          value={settings.profile.phone}
                          onChange={(e) => setSettings({
                            ...settings,
                            profile: { ...settings.profile, phone: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaMapMarkerAlt className="inline-block ml-2" />
                          الموقع
                        </label>
                        <input
                          type="text"
                          value={settings.profile.location || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            profile: { ...settings.profile, location: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نبذة عنك
                      </label>
                      <textarea
                        value={settings.profile.bio || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, bio: e.target.value }
                        })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                        placeholder="أخبرنا عن نفسك..."
                      />
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <FaBell className="text-3xl text-blue-600" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">الإشعارات</h2>
                        <p className="text-gray-600">تحكم في الإشعارات التي تتلقاها</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'email', label: 'إشعارات البريد الإلكتروني', desc: 'تلقي إشعارات عبر البريد', icon: FaEnvelope },
                        { key: 'sms', label: 'إشعارات الرسائل النصية', desc: 'تلقي إشعارات عبر SMS', icon: FaPhone },
                        { key: 'push', label: 'الإشعارات الفورية', desc: 'إشعارات المتصفح', icon: FaBell },
                        { key: 'bookings', label: 'إشعارات الحجوزات', desc: 'تحديثات حول حجوزاتك', icon: FaCheckCircle },
                        { key: 'payments', label: 'إشعارات المدفوعات', desc: 'تنبيهات الدفع والفواتير', icon: FaCheckCircle },
                        { key: 'marketing', label: 'إشعارات تسويقية', desc: 'عروض وأخبار', icon: FaBell }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                          <div className="flex items-center gap-3">
                            <item.icon className="text-xl text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-900">{item.label}</p>
                              <p className="text-sm text-gray-600">{item.desc}</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                              onChange={(e) => setSettings({
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  [item.key]: e.target.checked
                                }
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <FaShieldAlt className="text-3xl text-purple-600" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">الخصوصية</h2>
                        <p className="text-gray-600">تحكم في من يرى معلوماتك</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          ظهور الملف الشخصي
                        </label>
                        <div className="space-y-2">
                          {[
                            { value: 'public', label: 'عام', desc: 'يمكن للجميع رؤية ملفك' },
                            { value: 'private', label: 'خاص', desc: 'أنت فقط من يمكنه رؤية ملفك' }
                          ].map((option) => (
                            <label key={option.value} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-all">
                              <input
                                type="radio"
                                name="profileVisibility"
                                value={option.value}
                                checked={settings.privacy.profileVisibility === option.value}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  privacy: {
                                    ...settings.privacy,
                                    profileVisibility: e.target.value as 'public' | 'private'
                                  }
                                })}
                                className="w-5 h-5 text-green-600 focus:ring-green-500"
                              />
                              <div>
                                <p className="font-medium text-gray-900">{option.label}</p>
                                <p className="text-sm text-gray-600">{option.desc}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {[
                          { key: 'showEmail', label: 'إظهار البريد الإلكتروني', icon: FaEnvelope },
                          { key: 'showPhone', label: 'إظهار رقم الهاتف', icon: FaPhone },
                          { key: 'allowMessages', label: 'السماح بالرسائل', icon: FaBell }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <item.icon className="text-xl text-gray-600" />
                              <span className="font-medium text-gray-900">{item.label}</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.privacy[item.key as keyof typeof settings.privacy] as boolean}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  privacy: {
                                    ...settings.privacy,
                                    [item.key]: e.target.checked
                                  }
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <FaPalette className="text-3xl text-pink-600" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">المظهر</h2>
                        <p className="text-gray-600">خصص شكل الموقع حسب ذوقك</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <FaPalette className="inline-block ml-2" />
                        المظهر
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'light', label: 'فاتح', icon: FaSun },
                          { value: 'dark', label: 'داكن', icon: FaMoon },
                          { value: 'auto', label: 'تلقائي', icon: FaDesktop }
                        ].map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => setSettings({
                              ...settings,
                              appearance: { ...settings.appearance, theme: theme.value as any }
                            })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              settings.appearance.theme === theme.value
                                ? 'border-green-600 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <theme.icon className={`text-3xl mx-auto mb-2 ${
                              settings.appearance.theme === theme.value ? 'text-green-600' : 'text-gray-600'
                            }`} />
                            <p className="font-medium text-gray-900">{theme.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <FaLanguage className="inline-block ml-2" />
                        اللغة
                      </label>
                      <select
                        value={settings.appearance.language}
                        onChange={(e) => setSettings({
                          ...settings,
                          appearance: { ...settings.appearance, language: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        حجم الخط
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'small', label: 'صغير' },
                          { value: 'medium', label: 'متوسط' },
                          { value: 'large', label: 'كبير' }
                        ].map((size) => (
                          <button
                            key={size.value}
                            onClick={() => setSettings({
                              ...settings,
                              appearance: { ...settings.appearance, fontSize: size.value as any }
                            })}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              settings.appearance.fontSize === size.value
                                ? 'border-green-600 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <p className="font-medium">{size.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <FaLock className="text-3xl text-red-600" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">الأمان</h2>
                        <p className="text-gray-600">حماية حسابك وبياناتك</p>
                      </div>
                    </div>

                    {/* Change Password */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                            <FaKey className="text-blue-600" />
                            كلمة المرور
                          </h3>
                          <p className="text-sm text-gray-600">آخر تغيير: منذ 30 يوم</p>
                        </div>
                        <button
                          onClick={() => setShowPasswordModal(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                        >
                          تغيير كلمة المرور
                        </button>
                      </div>
                    </div>

                    {/* Security Options */}
                    <div className="space-y-4">
                      {[
                        { 
                          key: 'twoFactorAuth', 
                          label: 'المصادقة الثنائية (2FA)', 
                          desc: 'طبقة أمان إضافية لحسابك',
                          icon: FaShieldAlt
                        },
                        { 
                          key: 'loginAlerts', 
                          label: 'تنبيهات تسجيل الدخول', 
                          desc: 'إشعار عند تسجيل دخول جديد',
                          icon: FaBell
                        }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <item.icon className="text-xl text-red-600" />
                            <div>
                              <p className="font-medium text-gray-900">{item.label}</p>
                              <p className="text-sm text-gray-600">{item.desc}</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.security[item.key as keyof typeof settings.security] as boolean}
                              onChange={(e) => setSettings({
                                ...settings,
                                security: {
                                  ...settings.security,
                                  [item.key]: e.target.checked
                                }
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <FaCog className="text-3xl text-gray-600" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">الحساب</h2>
                        <p className="text-gray-600">إدارة حسابك وبياناتك</p>
                      </div>
                    </div>

                    {/* Account Info */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
                      <h3 className="font-semibold text-gray-900 mb-4">معلومات الحساب</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">معرف المستخدم:</span>
                          <span className="font-mono text-gray-900">{user.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">نوع الحساب:</span>
                          <span className="font-medium text-gray-900">{user.role || 'user'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">حالة التوثيق:</span>
                          <span className={`font-medium ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                            {user.isVerified ? '✅ موثق' : '⚠️ غير موثق'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Export Data */}
                    <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FaUpload className="text-blue-600" />
                        تصدير البيانات
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        احصل على نسخة من جميع بياناتك
                      </p>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
                        تصدير البيانات
                      </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200">
                      <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                        <FaExclamationTriangle className="text-red-600" />
                        منطقة الخطر
                      </h3>
                      <p className="text-sm text-red-700 mb-4">
                        الإجراءات التالية لا يمكن التراجع عنها
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            localStorage.removeItem('ain_auth');
                            localStorage.removeItem('auth_token');
                            router.push('/login');
                          }}
                          className="w-full bg-white border-2 border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                        >
                          <FaSignOutAlt />
                          تسجيل الخروج من جميع الأجهزة
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                        >
                          <FaTrash />
                          حذف الحساب نهائياً
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Change Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">تغيير كلمة المرور</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      كلمة المرور الحالية
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? <FaEyeOff /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      كلمة المرور الجديدة
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? <FaEyeOff /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تأكيد كلمة المرور
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleChangePassword}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all"
                  >
                    حفظ
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Account Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaExclamationTriangle className="text-3xl text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">حذف الحساب</h3>
                  <p className="text-gray-600">
                    هل أنت متأكد من حذف حسابك؟ سيتم حذف جميع بياناتك ولا يمكن استعادتها.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all"
                  >
                    نعم، احذف حسابي
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

