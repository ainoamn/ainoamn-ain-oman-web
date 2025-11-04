import { NextPage } from "next";
import Head from "next/head";
import InstantLink from "@/components/InstantLink";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaFileContract, FaFileAlt, FaEnvelope, FaLink, FaUnlink, 
  FaSearch, FaPlus, FaFilter, FaStar, FaClock, FaCheckCircle,
  FaBuilding, FaHome, FaIndustry, FaLayerGroup, FaEye, FaDownload,
  FaPrint, FaEdit, FaArrowRight, FaChartLine, FaFire, FaRocket
} from "react-icons/fa";

interface Template {
  id: string;
  name: string | { ar: string; en: string };
  description: string | { ar: string; en: string };
  category: 'contracts' | 'requests' | 'letters';
  type: string;
  usageTypes: string[];
  linkedProperties?: string[];
  linkedUnits?: string[];
  linkedUsageTypes?: string[];
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const getText = (obj: any, lang: 'ar' | 'en' = 'ar'): string => {
  if (typeof obj === 'string') return obj;
  if (obj && typeof obj === 'object') {
    return obj[lang] || obj.ar || obj.en || '';
  }
  return '';
};

const ContractTemplatesPage: NextPage = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsageType, setSelectedUsageType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/contract-templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
        if (data.templates?.length > 0) {
          setSelectedTemplate(data.templates[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { 
      id: 'all', 
      name: 'جميع القوالب', 
      icon: FaLayerGroup,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      activeColor: 'bg-gradient-to-r from-gray-500 to-gray-600'
    },
    { 
      id: 'contracts', 
      name: 'العقود', 
      icon: FaFileContract,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      activeColor: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    { 
      id: 'requests', 
      name: 'الطلبات', 
      icon: FaFileAlt,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      activeColor: 'bg-gradient-to-r from-orange-500 to-orange-600'
    },
    { 
      id: 'letters', 
      name: 'الرسائل', 
      icon: FaEnvelope,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      activeColor: 'bg-gradient-to-r from-purple-500 to-purple-600'
    }
  ];

  const usageTypes = [
    { id: 'all', name: 'جميع الأنواع', icon: FaLayerGroup },
    { id: 'residential', name: 'سكني', icon: FaHome },
    { id: 'commercial', name: 'تجاري', icon: FaBuilding },
    { id: 'industrial', name: 'صناعي', icon: FaIndustry }
  ];

  // الفلترة الذكية
  const filteredTemplates = templates.filter(t => {
    // فلتر التصنيف
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    
    // فلتر نوع الاستخدام
    if (selectedUsageType !== 'all' && !t.usageTypes?.includes(selectedUsageType)) return false;
    
    // فلتر البحث
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const nameAr = getText(t.name, 'ar').toLowerCase();
      const nameEn = getText(t.name, 'en').toLowerCase();
      const descAr = getText(t.description, 'ar').toLowerCase();
      const descEn = getText(t.description, 'en').toLowerCase();
      
      if (!nameAr.includes(searchLower) && 
          !nameEn.includes(searchLower) && 
          !descAr.includes(searchLower) && 
          !descEn.includes(searchLower) &&
          !t.type.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || FaFileContract;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'from-gray-500 to-gray-600';
  };

  const getUsageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'residential': 'سكني',
      'commercial': 'تجاري',
      'industrial': 'صناعي'
    };
    return labels[type] || type;
  };

  const getUsageTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'residential': 'bg-green-100 text-green-700 border-green-200',
      'commercial': 'bg-blue-100 text-blue-700 border-blue-200',
      'industrial': 'bg-orange-100 text-orange-700 border-orange-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // إحصائيات
  const stats = {
    total: templates.length,
    contracts: templates.filter(t => t.category === 'contracts').length,
    requests: templates.filter(t => t.category === 'requests').length,
    letters: templates.filter(t => t.category === 'letters').length,
    linked: templates.filter(t => t.linkedProperties?.length || t.linkedUnits?.length).length
  };

  return (
    <>
      <Head>
        <title>قوالب العقود والطلبات | Ain Oman</title>
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                >
                  <FaFileContract className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                مكتبة القوالب الاحترافية
              </h1>
              <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
                قوالب جاهزة للعقود والطلبات والرسائل - يتم ملؤها تلقائياً بالبيانات
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8">
                {[
                  { label: 'إجمالي القوالب', value: stats.total, icon: FaLayerGroup, color: 'from-blue-400 to-blue-500' },
                  { label: 'العقود', value: stats.contracts, icon: FaFileContract, color: 'from-purple-400 to-purple-500' },
                  { label: 'الطلبات', value: stats.requests, icon: FaFileAlt, color: 'from-orange-400 to-orange-500' },
                  { label: 'قوالب مربوطة', value: stats.linked, icon: FaLink, color: 'from-green-400 to-green-500' }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-blue-100">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* البحث والفلاتر */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
          >
            {/* شريط البحث */}
            <div className="mb-6">
              <div className="relative">
                <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن قالب... (اسم، نوع، وصف)"
                  className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* التصنيفات */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <FaFilter className="text-gray-600" />
                <h3 className="font-semibold text-gray-900">التصنيف</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <motion.button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative overflow-hidden rounded-xl p-4 transition-all ${
                        isActive
                          ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                          : `${cat.bgColor} ${cat.textColor} hover:shadow-md`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isActive ? 'bg-white/20' : 'bg-white'
                        }`}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : cat.textColor}`} />
                        </div>
                        <div className="text-right flex-1">
                          <div className="font-semibold">{cat.name}</div>
                          <div className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                            {cat.id === 'all' ? stats.total : 
                             cat.id === 'contracts' ? stats.contracts :
                             cat.id === 'requests' ? stats.requests :
                             stats.letters} قالب
                          </div>
                        </div>
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="activeCategory"
                          className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* أنواع الاستخدام */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FaHome className="text-gray-600" />
                <h3 className="font-semibold text-gray-900">نوع الاستخدام</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {usageTypes.map((type) => {
                  const Icon = type.icon;
                  const isActive = selectedUsageType === type.id;
                  return (
                    <motion.button
                      key={type.id}
                      onClick={() => setSelectedUsageType(type.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {type.name}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* نتائج البحث */}
            {(searchQuery || selectedCategory !== 'all' || selectedUsageType !== 'all') && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{filteredTemplates.length}</span> قالب من أصل <span className="font-semibold text-gray-900">{templates.length}</span>
                  </div>
                  {(searchQuery || selectedCategory !== 'all' || selectedUsageType !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setSelectedUsageType('all');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      مسح الفلاتر
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <InstantLink
              href="/rentals/new"
              className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaRocket className="w-5 h-5" />
                    <h3 className="text-lg font-bold">إنشاء عقد إيجار</h3>
                  </div>
                  <p className="text-sm text-blue-100">ابدأ الآن بإنشاء عقد جديد</p>
                </div>
                <FaArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </InstantLink>

            <InstantLink
              href="/contracts/create"
              className="group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaFileContract className="w-5 h-5" />
                    <h3 className="text-lg font-bold">إنشاء عقد عام</h3>
                  </div>
                  <p className="text-sm text-purple-100">من القوالب المتاحة</p>
                </div>
                <FaArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </InstantLink>

            <InstantLink
              href="/contracts/templates/new"
              className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaPlus className="w-5 h-5" />
                    <h3 className="text-lg font-bold">قالب جديد</h3>
                  </div>
                  <p className="text-sm text-orange-100">أنشئ قالباً مخصصاً</p>
                </div>
                <FaArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </InstantLink>
          </motion.div>

          {/* القوالب */}
          {loading ? (
            <div className="text-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
              />
              <p className="mt-4 text-gray-600 font-medium">جاري تحميل القوالب...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-2xl shadow-lg"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد قوالب مطابقة</h3>
              <p className="text-gray-600 mb-6">جرب تغيير معايير البحث أو الفلاتر</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedUsageType('all');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                إعادة تعيين الفلاتر
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredTemplates.map((template, index) => {
                  const CategoryIcon = getCategoryIcon(template.category);
                  const categoryData = categories.find(c => c.id === template.category);
                  
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all border border-gray-100 overflow-hidden"
                    >
                      {/* Header with gradient */}
                      <div className={`bg-gradient-to-r ${getCategoryColor(template.category)} p-4 relative overflow-hidden`}>
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute inset-0" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/svg%3E")`
                          }}></div>
                        </div>
                        <div className="relative flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                              <CategoryIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                                {getText(template.name)}
                              </h3>
                              <p className="text-sm text-white/80 line-clamp-1">
                                {getText(template.name, 'en')}
                              </p>
                            </div>
                          </div>
                          {template.isDefault && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                              title="قالب افتراضي"
                            >
                              <FaStar className="w-4 h-4 text-yellow-900" />
                            </motion.div>
                          )}
                        </div>
                      </div>

                      <div className="p-6">
                        {/* الوصف */}
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
                          {getText(template.description)}
                        </p>

                        {/* أنواع الاستخدام */}
                        {template.usageTypes && template.usageTypes.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {template.usageTypes.map(type => (
                                <span 
                                  key={type} 
                                  className={`px-3 py-1 text-xs font-medium rounded-full border ${getUsageTypeColor(type)}`}
                                >
                                  {getUsageTypeLabel(type)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* معلومات إضافية */}
                        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                          {(template.linkedProperties?.length || template.linkedUnits?.length) ? (
                            <div className="flex items-center gap-1">
                              <FaLink className="w-3 h-3" />
                              <span>{(template.linkedProperties?.length || 0) + (template.linkedUnits?.length || 0)} ربط</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <FaUnlink className="w-3 h-3" />
                              <span>غير مرتبط</span>
                            </div>
                          )}
                          {template.createdAt && (
                            <div className="flex items-center gap-1">
                              <FaClock className="w-3 h-3" />
                              <span suppressHydrationWarning>{new Date(template.createdAt).toLocaleDateString('ar-SA', { timeZone: 'UTC' })}</span>
                            </div>
                          )}
                        </div>

                        {/* الإجراءات */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <InstantLink
                              href={`/rentals/new?template=${template.id}`}
                              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all text-sm font-medium shadow-sm"
                            >
                              <FaRocket className="w-3.5 h-3.5" />
                              عقد إيجار
                            </InstantLink>
                            <InstantLink
                              href={`/contracts/create?template=${template.id}`}
                              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-medium shadow-sm"
                            >
                              <FaFileContract className="w-3.5 h-3.5" />
                              عقد عام
                            </InstantLink>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <InstantLink
                              href={`/contracts/templates/${template.id}`}
                              className="flex items-center justify-center gap-1 px-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs"
                              title="معاينة"
                            >
                              <FaEye className="w-3.5 h-3.5" />
                              <span>معاينة</span>
                            </InstantLink>
                            <InstantLink
                              href={`/contracts/templates/${template.id}/link`}
                              className="flex items-center justify-center gap-1 px-2 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs"
                              title="ربط"
                            >
                              <FaLink className="w-3.5 h-3.5" />
                              <span>ربط</span>
                            </InstantLink>
                            <button
                              className="flex items-center justify-center gap-1 px-2 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-xs"
                              title="تعديل"
                            >
                              <FaEdit className="w-3.5 h-3.5" />
                              <span>تعديل</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* شريط سفلي */}
                      <div className={`${categoryData?.bgColor} px-6 py-3 border-t border-gray-100`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-medium ${categoryData?.textColor}`}>
                            {categoryData?.name}
                          </span>
                          <span className="text-gray-500">
                            {template.type}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Footer Info */}
          {!loading && filteredTemplates.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md">
                <FaCheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">
                  جميع القوالب تُملأ تلقائياً بالبيانات عند الاستخدام
                </span>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
};

export default ContractTemplatesPage;
