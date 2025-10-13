// src/pages/admin/users/index.tsx - صفحة إدارة المستخدمين
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  FiUsers, FiUser, FiUserCheck, FiUserX, FiEdit, FiEye,
  FiMail, FiPhone, FiMapPin, FiGlobe, FiShield, FiActivity,
  FiCalendar, FiClock, FiSearch, FiFilter, FiRefreshCw, FiPlus,
  FiChevronDown, FiChevronUp, FiCheck, FiX, FiAlertTriangle, FiBarChart, FiInfo,
  FiCheckCircle, FiTrash2, FiTrendingUp, FiBell, FiKey, FiSettings,
  FiFileText, FiMoreVertical, FiSend
} from 'react-icons/fi';
import { 
  USER_ROLES, 
  UserRole, 
  getUserRoleConfig,
  getRoleName,
  getRoleIcon,
  getRoleColor,
  getRoleFeatures,
  getDashboardPath,
  hasPermission
} from '@/lib/user-roles';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  subscription?: {
    planName: string;
    status: 'active' | 'expired' | 'cancelled';
    expiryDate: string;
    remainingDays: number;
  };
  profile?: {
    avatar?: string;
    company?: string;
    location?: string;
    ipAddress?: string;
    userAgent?: string;
    lastLogin?: string;
    loginCount?: number;
    documents?: Array<{
      type: string;
      name: string;
      url: string;
      verified: boolean;
    }>;
  };
  stats?: {
    properties: number;
    units: number;
    bookings: number;
    revenue: number;
    tasks: number;
    legalCases: number;
  };
  createdAt: string;
  lastActive: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  pendingUsers: number;
  usersByRole: Record<string, number>;
  recentRegistrations: number;
  topUsers: User[];
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('lastActive');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: '' as UserRole | '',
    status: 'pending' as 'active' | 'inactive' | 'suspended' | 'pending',
    company: '',
    location: ''
  });
  
  // Modals state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [userToAction, setUserToAction] = useState<User | null>(null);

  // جلب البيانات
  useEffect(() => {
    fetchUsers();
  }, []);

  // تحديث الإحصائيات عند تغيير المستخدمين
  useEffect(() => {
    if (users.length > 0) {
      fetchStats();
    }
  }, [users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // محاكاة البيانات
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'أحمد محمد السالمي',
          email: 'ahmed@example.com',
          phone: '+968 9123 4567',
          role: 'property_landlord',
          status: 'active',
          subscription: {
            planName: 'الخطة المعيارية',
            status: 'active',
            expiryDate: '2025-12-31',
            remainingDays: 350
          },
          profile: {
            avatar: '/avatars/ahmed.jpg',
            company: 'شركة السالمي العقارية',
            location: 'مسقط، سلطنة عُمان',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            lastLogin: '2025-01-15T10:30:00Z',
            loginCount: 156,
            documents: [
              { type: 'id', name: 'بطاقة الهوية', url: '/docs/ahmed_id.pdf', verified: true },
              { type: 'license', name: 'رخصة تجارية', url: '/docs/ahmed_license.pdf', verified: true }
            ]
          },
          stats: {
            properties: 12,
            units: 45,
            bookings: 23,
            revenue: 15420.50,
            tasks: 8,
            legalCases: 2
          },
          createdAt: '2024-06-15T08:00:00Z',
          lastActive: '2025-01-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'فاطمة علي الشنفري',
          email: 'fatima@company.com',
          phone: '+968 9876 5432',
          role: 'corporate_tenant',
          status: 'active',
          subscription: {
            planName: 'الخطة المميزة',
            status: 'active',
            expiryDate: '2025-11-30',
            remainingDays: 319
          },
          profile: {
            avatar: '/avatars/fatima.jpg',
            company: 'شركة الشنفري للتجارة',
            location: 'صلالة، سلطنة عُمان',
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            lastLogin: '2025-01-15T09:15:00Z',
            loginCount: 89,
            documents: [
              { type: 'id', name: 'بطاقة الهوية', url: '/docs/fatima_id.pdf', verified: true },
              { type: 'commercial', name: 'السجل التجاري', url: '/docs/fatima_commercial.pdf', verified: true }
            ]
          },
          stats: {
            properties: 0,
            units: 8,
            bookings: 12,
            revenue: 0,
            tasks: 3,
            legalCases: 0
          },
          createdAt: '2024-08-20T12:00:00Z',
          lastActive: '2025-01-15T09:15:00Z'
        },
        {
          id: '3',
          name: 'سالم بن راشد الغافري',
          email: 'salim@realestate.com',
          phone: '+968 9234 5678',
          role: 'real_estate_agent',
          status: 'active',
          subscription: {
            planName: 'الخطة الأساسية',
            status: 'active',
            expiryDate: '2025-10-15',
            remainingDays: 273
          },
          profile: {
            avatar: '/avatars/salim.jpg',
            company: 'مكتب الغافري العقاري',
            location: 'نزوى، سلطنة عُمان',
            ipAddress: '192.168.1.102',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
            lastLogin: '2025-01-14T16:45:00Z',
            loginCount: 234,
            documents: [
              { type: 'id', name: 'بطاقة الهوية', url: '/docs/salim_id.pdf', verified: true },
              { type: 'license', name: 'رخصة الوساطة العقارية', url: '/docs/salim_broker.pdf', verified: true }
            ]
          },
          stats: {
            properties: 25,
            units: 67,
            bookings: 45,
            revenue: 8750.25,
            tasks: 12,
            legalCases: 1
          },
          createdAt: '2024-03-10T14:30:00Z',
          lastActive: '2025-01-14T16:45:00Z'
        },
        {
          id: '4',
          name: 'مريم أحمد العبري',
          email: 'mariam@tenant.com',
          phone: '+968 9456 7890',
          role: 'individual_tenant',
          status: 'active',
          subscription: {
            planName: 'مجاني',
            status: 'active',
            expiryDate: 'غير محدد',
            remainingDays: 999999
          },
          profile: {
            avatar: '/avatars/mariam.jpg',
            company: undefined,
            location: 'صور، سلطنة عُمان',
            ipAddress: '192.168.1.103',
            userAgent: 'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0',
            lastLogin: '2025-01-13T20:15:00Z',
            loginCount: 67,
            documents: [
              { type: 'id', name: 'بطاقة الهوية', url: '/docs/mariam_id.pdf', verified: true },
              { type: 'contract', name: 'عقد الإيجار', url: '/docs/mariam_contract.pdf', verified: true }
            ]
          },
          stats: {
            properties: 0,
            units: 1,
            bookings: 2,
            revenue: 0,
            tasks: 1,
            legalCases: 0
          },
          createdAt: '2024-11-05T10:00:00Z',
          lastActive: '2025-01-13T20:15:00Z'
        },
        {
          id: '5',
          name: 'خالد بن سعيد الكندي',
          email: 'khalid@admin.com',
          phone: '+968 9567 8901',
          role: 'site_admin',
          status: 'active',
          subscription: {
            planName: 'إدارة الموقع',
            status: 'active',
            expiryDate: 'غير محدد',
            remainingDays: 999999
          },
          profile: {
            avatar: '/avatars/khalid.jpg',
            company: 'عين عُمان',
            location: 'مسقط، سلطنة عُمان',
            ipAddress: '192.168.1.104',
            userAgent: 'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36',
            lastLogin: '2025-01-15T11:00:00Z',
            loginCount: 567,
            documents: [
              { type: 'id', name: 'بطاقة الهوية', url: '/docs/khalid_id.pdf', verified: true },
              { type: 'employment', name: 'عقد العمل', url: '/docs/khalid_employment.pdf', verified: true }
            ]
          },
          stats: {
            properties: 0,
            units: 0,
            bookings: 0,
            revenue: 0,
            tasks: 0,
            legalCases: 0
          },
          createdAt: '2024-01-01T00:00:00Z',
          lastActive: '2025-01-15T11:00:00Z'
        }
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // حساب الإحصائيات من البيانات الفعلية
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.status === 'active').length;
      const inactiveUsers = users.filter(u => u.status === 'inactive').length;
      const suspendedUsers = users.filter(u => u.status === 'suspended').length;
      const pendingUsers = users.filter(u => u.status === 'pending').length;

      // حساب المستخدمين حسب الدور
      const usersByRole: Record<string, number> = {};
      users.forEach(user => {
        usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
      });

      // حساب التسجيلات الأخيرة (آخر 7 أيام)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentRegistrations = users.filter(u => new Date(u.createdAt) > weekAgo).length;

      const calculatedStats: UserStats = {
        totalUsers,
        activeUsers,
        inactiveUsers,
        suspendedUsers,
        pendingUsers,
        usersByRole,
        recentRegistrations,
        topUsers: users.slice(0, 5)
      };

      setStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // فلترة وترتيب المستخدمين
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.profile?.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !selectedRole || user.role === selectedRole;
    const matchesStatus = !selectedStatus || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  }).sort((a, b) => {
    let aValue = a[sortBy as keyof User];
    let bValue = b[sortBy as keyof User];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'suspended': return 'معلق';
      case 'pending': return 'في الانتظار';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-OM', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-OM', {
      style: 'currency',
      currency: 'OMR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.phone || !newUser.role) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const user: User = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role as UserRole,
      status: newUser.status,
      profile: {
        company: newUser.company || undefined,
        location: newUser.location,
        ipAddress: '0.0.0.0',
        lastLogin: new Date().toISOString(),
        loginCount: 0,
        documents: []
      },
      stats: {
        properties: 0,
        units: 0,
        bookings: 0,
        revenue: 0,
        tasks: 0,
        legalCases: 0
      },
      subscription: {
        planName: 'مجاني',
        status: 'active',
        expiryDate: 'غير محدد',
        remainingDays: 999999
      },
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    setUsers([...users, user]);
    setShowCreateModal(false);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: '',
      status: 'pending',
      company: '',
      location: ''
    });
    alert('تم إضافة المستخدم بنجاح!');
    fetchUsers();
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    
    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    setShowEditModal(false);
    setSelectedUser(null);
    alert('تم تحديث المستخدم بنجاح!');
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      setUsers(users.filter(u => u.id !== userId));
      alert('تم حذف المستخدم بنجاح!');
    }
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === 'active' ? 'suspended' : 'active';
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  // ترقية الباقة
  const handleUpgradePackage = (packageName: string) => {
    if (!userToAction) return;
    
    setUsers(users.map(user => {
      if (user.id === userToAction.id) {
        return {
          ...user,
          subscription: {
            ...user.subscription!,
            planName: packageName,
            status: 'active',
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            remainingDays: 365
          }
        };
      }
      return user;
    }));
    
    setShowUpgradeModal(false);
    setUserToAction(null);
    alert(`تم ترقية الباقة إلى ${packageName} بنجاح!`);
  };

  // إرسال إشعار
  const handleSendNotification = (message: string, type: 'info' | 'warning' | 'alert') => {
    if (!userToAction) return;
    
    // في التطبيق الحقيقي، سيتم إرسال إشعار عبر API
    console.log(`Sending ${type} notification to ${userToAction.name}: ${message}`);
    
    setShowNotificationModal(false);
    setUserToAction(null);
    alert(`تم إرسال ${type === 'info' ? 'إشعار' : type === 'warning' ? 'تنبيه' : 'تحذير'} إلى ${userToAction.name}`);
  };

  // إعادة تعيين كلمة المرور
  const handleResetPassword = () => {
    if (!userToAction) return;
    
    const tempPassword = Math.random().toString(36).slice(-8);
    console.log(`Temporary password for ${userToAction.email}: ${tempPassword}`);
    
    setShowResetPasswordModal(false);
    setUserToAction(null);
    alert(`تم إرسال كلمة مرور مؤقتة إلى ${userToAction.email}\nكلمة المرور المؤقتة: ${tempPassword}`);
  };

  // تغيير البريد الإلكتروني
  const handleChangeEmail = (newEmail: string) => {
    if (!userToAction) return;
    
    setUsers(users.map(user => {
      if (user.id === userToAction.id) {
        return { ...user, email: newEmail };
      }
      return user;
    }));
    
    setShowChangeEmailModal(false);
    setUserToAction(null);
    alert(`تم تغيير البريد الإلكتروني بنجاح!`);
  };

  // حذف مستخدم نهائياً
  const handleDeleteUserPermanently = () => {
    if (!userToAction) return;
    
    setUsers(users.filter(u => u.id !== userToAction.id));
    setShowDeleteConfirmModal(false);
    setUserToAction(null);
    alert('تم حذف المستخدم نهائياً!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات المستخدمين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>إدارة المستخدمين - عين عُمان</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiUsers className="text-blue-600" />
                إدارة المستخدمين
              </h1>
              <p className="text-gray-600 mt-2">
                إدارة شاملة لجميع المستخدمين في النظام
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FiPlus />
                إضافة مستخدم جديد
              </button>
              <button
                onClick={fetchUsers}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <FiRefreshCw />
                تحديث
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiUsers className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">المستخدمون النشطون</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeUsers.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiUserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">غير النشطين</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.inactiveUsers.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <FiUserX className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">المعلقون</p>
                  <p className="text-2xl font-bold text-red-600">{stats.suspendedUsers.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <FiAlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">في الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingUsers.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FiClock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث عن مستخدم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">جميع الأدوار</option>
              {Object.values(USER_ROLES).map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name.ar}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="suspended">معلق</option>
              <option value="pending">في الانتظار</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="lastActive-desc">الأحدث نشاطاً</option>
              <option value="lastActive-asc">الأقدم نشاطاً</option>
              <option value="name-asc">الاسم (أ-ي)</option>
              <option value="name-desc">الاسم (ي-أ)</option>
              <option value="createdAt-desc">الأحدث تسجيلاً</option>
              <option value="createdAt-asc">الأقدم تسجيلاً</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المستخدم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الدور والشركة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الباقة والاشتراك
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة والموقع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإحصائيات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    آخر نشاط
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const roleConfig = getUserRoleConfig(user.role);
                  const isExpanded = expandedUser === user.id;

                  return (
                    <React.Fragment key={user.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        {/* المستخدم */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <img
                                className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                                src={user.profile?.avatar || '/default-avatar.png'}
                                alt={user.name}
                              />
                            </div>
                            <div className="mr-4">
                              <div className="text-sm font-bold text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <FiMail className="w-3 h-3" />
                                {user.email}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <FiPhone className="w-3 h-3" />
                                {user.phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* الدور والشركة */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-2">
                            <span className="text-2xl">{roleConfig?.icon}</span>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {roleConfig?.name.ar}
                              </div>
                              {user.profile?.company && (
                                <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                  <FiUsers className="w-3 h-3" />
                                  {user.profile.company}
                                </div>
                              )}
                              <div className="text-xs text-blue-600 mt-1">
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* الباقة والاشتراك */}
                        <td className="px-6 py-4">
                          {user.subscription ? (
                            <div className="space-y-1">
                              <div className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                user.subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                                user.subscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                <FiCheckCircle className="w-3 h-3 ml-1" />
                                {user.subscription.planName}
                              </div>
                              <div className="text-xs text-gray-600 mt-2">
                                <div className="flex items-center gap-1">
                                  <FiCalendar className="w-3 h-3" />
                                  ينتهي: {user.subscription.expiryDate}
                                </div>
                                {user.subscription.remainingDays < 999999 && (
                                  <div className={`flex items-center gap-1 mt-1 ${
                                    user.subscription.remainingDays < 30 ? 'text-red-600 font-semibold' :
                                    user.subscription.remainingDays < 90 ? 'text-yellow-600' :
                                    'text-green-600'
                                  }`}>
                                    <FiClock className="w-3 h-3" />
                                    متبقي: {user.subscription.remainingDays} يوم
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">لا يوجد اشتراك</span>
                          )}
                        </td>

                        {/* الحالة والموقع */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                              {user.status === 'active' ? <FiUserCheck className="w-3 h-3 ml-1" /> :
                               user.status === 'suspended' ? <FiUserX className="w-3 h-3 ml-1" /> :
                               <FiClock className="w-3 h-3 ml-1" />}
                              {getStatusText(user.status)}
                            </span>
                            {user.profile?.location && (
                              <div className="text-xs text-gray-600 flex items-center gap-1">
                                <FiMapPin className="w-3 h-3" />
                                {user.profile.location}
                              </div>
                            )}
                            {user.profile?.ipAddress && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <FiGlobe className="w-3 h-3" />
                                {user.profile.ipAddress}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* الإحصائيات */}
                        <td className="px-6 py-4 text-sm">
                          <div className="space-y-1">
                            {user.stats?.properties !== undefined && user.stats.properties > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">عقارات:</span>
                                <span className="font-semibold text-blue-600">{user.stats.properties}</span>
                              </div>
                            )}
                            {user.stats?.units !== undefined && user.stats.units > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">وحدات:</span>
                                <span className="font-semibold text-green-600">{user.stats.units}</span>
                              </div>
                            )}
                            {user.stats?.bookings !== undefined && user.stats.bookings > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">حجوزات:</span>
                                <span className="font-semibold text-purple-600">{user.stats.bookings}</span>
                              </div>
                            )}
                            {user.stats?.revenue && user.stats.revenue > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">إيرادات:</span>
                                <span className="font-semibold text-green-700">{formatCurrency(user.stats.revenue)}</span>
                              </div>
                            )}
                            {user.stats?.tasks !== undefined && user.stats.tasks > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">مهام:</span>
                                <span className="font-semibold text-orange-600">{user.stats.tasks}</span>
                              </div>
                            )}
                            {user.stats?.legalCases !== undefined && user.stats.legalCases > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">قضايا:</span>
                                <span className="font-semibold text-red-600">{user.stats.legalCases}</span>
                              </div>
                            )}
                            {(!user.stats || (user.stats.properties === 0 && user.stats.units === 0 && user.stats.bookings === 0)) && (
                              <span className="text-xs text-gray-400">لا توجد إحصائيات</span>
                            )}
                          </div>
                        </td>

                        {/* آخر نشاط */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs">
                              <FiActivity className="w-3 h-3 text-green-500" />
                              <span className="font-medium">آخر نشاط:</span>
                            </div>
                            <div className="text-xs">{formatDate(user.lastActive)}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                              <FiClock className="w-3 h-3" />
                              {user.profile?.loginCount || 0} تسجيل دخول
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <FiCalendar className="w-3 h-3" />
                              انضم: {new Date(user.createdAt).toLocaleDateString('ar-OM', { year: 'numeric', month: 'short' })}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-1">
                            {/* إجراءات أساسية */}
                            <button
                              onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                              className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                              title="عرض التفاصيل"
                            >
                              {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                            </button>
                            
                            {/* إجراءات متقدمة - Dropdown */}
                            <div className="relative group">
                              <button
                                className="text-gray-600 hover:bg-gray-100 p-2 rounded transition-colors"
                                title="إجراءات متقدمة"
                              >
                                <FiMoreVertical className="w-4 h-4" />
                              </button>
                              
                              {/* القائمة المنسدلة */}
                              <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="py-2">
                                  {/* تعديل المستخدم */}
                                  <button
                                    onClick={() => handleEditUser(user)}
                                    className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                                  >
                                    <FiEdit className="w-4 h-4" />
                                    <span>تعديل البيانات</span>
                                  </button>
                                  
                                  {/* عرض البروفايل */}
                                  <button
                                    onClick={() => router.push(`/profile?user=${user.id}`)}
                                    className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 flex items-center gap-2 transition-colors"
                                  >
                                    <FiEye className="w-4 h-4" />
                                    <span>عرض البروفايل</span>
                                  </button>
                                  
                                  {/* لوحة التحكم */}
                                  <button
                                    onClick={() => router.push(getDashboardPath(user.role))}
                                    className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2 transition-colors"
                                  >
                                    <FiBarChart className="w-4 h-4" />
                                    <span>لوحة التحكم</span>
                                  </button>
                                  
                                  <div className="my-1 border-t border-gray-200"></div>
                                  
                                  {/* ترقية الباقة */}
                                  <button
                                    onClick={() => {
                                      setUserToAction(user);
                                      setShowUpgradeModal(true);
                                    }}
                                    className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                                  >
                                    <FiTrendingUp className="w-4 h-4" />
                                    <span>ترقية الباقة</span>
                                  </button>
                                  
                                  {/* عرض المستندات */}
                                  <button
                                    onClick={() => {
                                      setUserToAction(user);
                                      setShowDocumentsModal(true);
                                    }}
                                    className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 flex items-center gap-2 transition-colors"
                                  >
                                    <FiFileText className="w-4 h-4" />
                                    <span>المستندات ({user.profile?.documents?.length || 0})</span>
                                  </button>
                                  
                                  {/* إرسال إشعار */}
                                  <button
                                    onClick={() => {
                                      setUserToAction(user);
                                      setShowNotificationModal(true);
                                    }}
                                    className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                                  >
                                    <FiBell className="w-4 h-4" />
                                    <span>إرسال إشعار</span>
                                  </button>
                                  
                                  {/* إعادة تعيين كلمة المرور */}
                                  <button
                                    onClick={() => {
                                      setUserToAction(user);
                                      setShowResetPasswordModal(true);
                                    }}
                                    className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition-colors"
                                  >
                                    <FiKey className="w-4 h-4" />
                                    <span>إعادة تعيين كلمة المرور</span>
                                  </button>
                                  
                                  {/* تغيير البريد الإلكتروني */}
                                  <button
                                    onClick={() => {
                                      setUserToAction(user);
                                      setShowChangeEmailModal(true);
                                    }}
                                    className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 flex items-center gap-2 transition-colors"
                                  >
                                    <FiMail className="w-4 h-4" />
                                    <span>تغيير البريد الإلكتروني</span>
                                  </button>
                                  
                                  <div className="my-1 border-t border-gray-200"></div>
                                  
                                  {/* تفعيل/تعليق */}
                                  <button
                                    onClick={() => handleToggleStatus(user.id)}
                                    className={`w-full px-4 py-2 text-right text-sm ${
                                      user.status === 'active' 
                                        ? 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-600' 
                                        : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                                    } flex items-center gap-2 transition-colors`}
                                  >
                                    {user.status === 'active' ? <FiUserX className="w-4 h-4" /> : <FiUserCheck className="w-4 h-4" />}
                                    <span>{user.status === 'active' ? 'تعليق الحساب' : 'تفعيل الحساب'}</span>
                                  </button>
                                  
                                  {/* حذف نهائي */}
                                  <button
                                    onClick={() => {
                                      setUserToAction(user);
                                      setShowDeleteConfirmModal(true);
                                    }}
                                    className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                    <span>حذف نهائي</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* معلومات الاتصال */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3">معلومات الاتصال</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <FiMail className="text-gray-400" />
                                    <span>{user.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FiPhone className="text-gray-400" />
                                    <span>{user.phone}</span>
                                  </div>
                                  {user.profile?.location && (
                                    <div className="flex items-center gap-2">
                                      <FiMapPin className="text-gray-400" />
                                      <span>{user.profile.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* معلومات النظام */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3">معلومات النظام</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <FiGlobe className="text-gray-400" />
                                    <span>IP: {user.profile?.ipAddress}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FiCalendar className="text-gray-400" />
                                    <span>تاريخ التسجيل: {formatDate(user.createdAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FiActivity className="text-gray-400" />
                                    <span>آخر تسجيل دخول: {formatDate(user.profile?.lastLogin || '')}</span>
                                  </div>
                                </div>
                              </div>

                              {/* المستندات */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3">المستندات</h4>
                                <div className="space-y-2">
                                  {user.profile?.documents?.map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                      <span>{doc.name}</span>
                                      <div className="flex items-center gap-2">
                                        {doc.verified ? (
                                          <span className="text-green-600 flex items-center gap-1">
                                            <FiCheck />
                                            موثق
                                          </span>
                                        ) : (
                                          <span className="text-red-600 flex items-center gap-1">
                                            <FiX />
                                            غير موثق
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* صلاحيات الدور */}
                              {roleConfig && (
                                <div className="md:col-span-2 lg:col-span-3">
                                  <h4 className="font-medium text-gray-900 mb-3">صلاحيات الدور</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {roleConfig.features.map((feature, index) => (
                                      <div key={index} className="text-sm text-gray-600 bg-white p-2 rounded border">
                                        • {feature}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد نتائج</h3>
              <p className="mt-1 text-sm text-gray-500">
                لم يتم العثور على مستخدمين يطابقون معايير البحث.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            عرض <span className="font-medium">1</span> إلى <span className="font-medium">{filteredUsers.length}</span> من <span className="font-medium">{users.length}</span> نتيجة
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
              السابق
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
              التالي
            </button>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FiUserCheck className="text-blue-600" />
                  إضافة مستخدم جديد
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* الاسم */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="مثال: أحمد محمد السالمي"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* البريد الإلكتروني */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="example@domain.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* رقم الهاتف */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="+968 9123 4567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* الدور */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الدور <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">اختر الدور...</option>
                    {Object.values(USER_ROLES).map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.icon} {role.name.ar}
                      </option>
                    ))}
                  </select>
                </div>

                {/* الحالة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة
                  </label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">نشط</option>
                    <option value="pending">في الانتظار</option>
                    <option value="inactive">غير نشط</option>
                    <option value="suspended">معلق</option>
                  </select>
                </div>

                {/* الشركة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الشركة (اختياري)
                  </label>
                  <input
                    type="text"
                    value={newUser.company}
                    onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
                    placeholder="اسم الشركة"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* الموقع */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموقع
                  </label>
                  <input
                    type="text"
                    value={newUser.location}
                    onChange={(e) => setNewUser({ ...newUser, location: e.target.value })}
                    placeholder="مسقط، سلطنة عُمان"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* معلومات الدور المختار */}
                {newUser.role && (
                  <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <FiInfo className="w-5 h-5" />
                      معلومات الدور المختار
                    </h3>
                    <div className="text-sm text-blue-800">
                      <p className="mb-2">
                        <strong>الدور:</strong> {getUserRoleConfig(newUser.role as UserRole)?.name.ar || ''}
                      </p>
                      <p className="mb-2">
                        <strong>الوصف:</strong> {typeof getUserRoleConfig(newUser.role as UserRole)?.description === 'string' ? getUserRoleConfig(newUser.role as UserRole)?.description : (getUserRoleConfig(newUser.role as UserRole)?.description as any)?.ar || 'لا يوجد وصف'}
                      </p>
                      <div>
                        <strong>الميزات الرئيسية:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {getUserRoleConfig(newUser.role as UserRole)?.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateUser}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FiUserCheck />
                إضافة المستخدم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FiEdit className="text-indigo-600" />
                  تعديل المستخدم: {selectedUser.name}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* الاسم */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* البريد الإلكتروني */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* رقم الهاتف */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={selectedUser.phone}
                    onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* الدور */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الدور
                  </label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as UserRole })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {Object.values(USER_ROLES).map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.icon} {role.name.ar}
                      </option>
                    ))}
                  </select>
                </div>

                {/* الحالة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة
                  </label>
                  <select
                    value={selectedUser.status}
                    onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="active">نشط</option>
                    <option value="pending">في الانتظار</option>
                    <option value="inactive">غير نشط</option>
                    <option value="suspended">معلق</option>
                  </select>
                </div>

                {/* الموقع */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموقع
                  </label>
                  <input
                    type="text"
                    value={selectedUser.profile?.location || ''}
                    onChange={(e) => setSelectedUser({ 
                      ...selectedUser, 
                      profile: { ...selectedUser.profile, location: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <FiCheck />
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Package Modal - نافذة ترقية الباقة */}
      {showUpgradeModal && userToAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FiTrendingUp />
                ترقية الباقة
              </h2>
              <p className="text-blue-100 mt-2">{userToAction.name}</p>
            </div>
            
            <div className="p-6 space-y-3">
              <p className="text-gray-600 mb-4">اختر الباقة الجديدة:</p>
              
              {['الباقة المجانية', 'الخطة الأساسية', 'الخطة المعيارية', 'الخطة المميزة', 'الخطة الاحترافية'].map(pkg => (
                <button
                  key={pkg}
                  onClick={() => handleUpgradePackage(pkg)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-right transition-all"
                >
                  <div className="font-semibold text-gray-900">{pkg}</div>
                  <div className="text-sm text-gray-500">سنة واحدة - تجديد تلقائي</div>
                </button>
              ))}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-b-xl">
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  setUserToAction(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal - نافذة المستندات */}
      {showDocumentsModal && userToAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FiFileText />
                المستندات المرفوعة
              </h2>
              <p className="text-yellow-100 mt-2">{userToAction.name}</p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              {userToAction.profile?.documents && userToAction.profile.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userToAction.profile.documents.map((doc, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{doc.name}</div>
                          <div className="text-sm text-gray-500 mt-1">{doc.type}</div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                            doc.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.verified ? '✓ موثق' : '⏳ قيد المراجعة'}
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiEye className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">لا توجد مستندات مرفوعة</p>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 border-t">
              <button
                onClick={() => {
                  setShowDocumentsModal(false);
                  setUserToAction(null);
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal - نافذة إرسال إشعار */}
      {showNotificationModal && userToAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FiBell />
                إرسال إشعار
              </h2>
              <p className="text-indigo-100 mt-2">إلى: {userToAction.name}</p>
            </div>
            
            <div className="p-6">
              <textarea
                id="notification-message"
                placeholder="اكتب رسالة الإشعار هنا..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-32"
              />
              
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => {
                    const msg = (document.getElementById('notification-message') as HTMLTextAreaElement)?.value;
                    if (msg) handleSendNotification(msg, 'info');
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <FiSend /> إرسال إشعار
                </button>
                <button
                  onClick={() => {
                    const msg = (document.getElementById('notification-message') as HTMLTextAreaElement)?.value;
                    if (msg) handleSendNotification(msg, 'warning');
                  }}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2"
                >
                  <FiAlertTriangle /> إرسال تنبيه
                </button>
                <button
                  onClick={() => {
                    const msg = (document.getElementById('notification-message') as HTMLTextAreaElement)?.value;
                    if (msg) handleSendNotification(msg, 'alert');
                  }}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <FiX /> إرسال تحذير
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-b-xl border-t">
              <button
                onClick={() => {
                  setShowNotificationModal(false);
                  setUserToAction(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal - نافذة إعادة تعيين كلمة المرور */}
      {showResetPasswordModal && userToAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FiKey />
                إعادة تعيين كلمة المرور
              </h2>
            </div>
            
            <div className="p-6">
              <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 mb-4">
                <div className="flex items-start gap-3">
                  <FiAlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">تحذير</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      سيتم إنشاء كلمة مرور مؤقتة وإرسالها إلى:
                    </p>
                    <p className="text-sm font-medium text-yellow-900 mt-2">
                      {userToAction.email}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleResetPassword}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                >
                  <FiKey />
                  تأكيد وإرسال
                </button>
                <button
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setUserToAction(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Email Modal - نافذة تغيير البريد الإلكتروني */}
      {showChangeEmailModal && userToAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FiMail />
                تغيير البريد الإلكتروني
              </h2>
              <p className="text-teal-100 mt-2">{userToAction.name}</p>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الحالي
                </label>
                <input
                  type="email"
                  value={userToAction.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الجديد
                </label>
                <input
                  id="new-email"
                  type="email"
                  placeholder="example@domain.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const newEmail = (document.getElementById('new-email') as HTMLInputElement)?.value;
                    if (newEmail && newEmail !== userToAction.email) {
                      handleChangeEmail(newEmail);
                    } else {
                      alert('يرجى إدخال بريد إلكتروني صحيح ومختلف');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  حفظ التغيير
                </button>
                <button
                  onClick={() => {
                    setShowChangeEmailModal(false);
                    setUserToAction(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - نافذة تأكيد الحذف */}
      {showDeleteConfirmModal && userToAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FiTrash2 />
                تأكيد الحذف النهائي
              </h2>
            </div>
            
            <div className="p-6">
              <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <FiAlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-900 mb-2">تحذير خطير!</p>
                    <p className="text-sm text-red-700">
                      أنت على وشك حذف المستخدم التالي نهائياً:
                    </p>
                    <div className="mt-3 bg-white p-3 rounded border border-red-200">
                      <p className="font-bold text-gray-900">{userToAction.name}</p>
                      <p className="text-sm text-gray-600">{userToAction.email}</p>
                      <p className="text-sm text-gray-600">{userToAction.phone}</p>
                    </div>
                    <p className="text-sm text-red-700 mt-3 font-semibold">
                      ⚠️ هذا الإجراء لا يمكن التراجع عنه!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteUserPermanently}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 font-bold"
                >
                  <FiTrash2 />
                  نعم، احذف نهائياً
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setUserToAction(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}