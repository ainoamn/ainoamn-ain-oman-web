import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import InstantLink, { InstantButton } from '@/components/InstantLink';
import { 
  FaBuilding, 
  FaHome, 
  FaSpinner, 
  FaMapMarkerAlt, 
  FaBed, 
  FaBath, 
  FaRulerCombined, 
  FaCar, 
  FaSwimmingPool, 
  FaWifi, 
  FaParking, 
  FaShieldAlt, 
  FaStar, 
  FaHeart, 
  FaShare, 
  FaPhone, 
  FaEnvelope, 
  FaWhatsapp, 
  FaEye, 
  FaCalendarAlt, 
  FaEdit, 
  FaTrash, 
  FaChevronLeft, 
  FaChevronRight, 
  FaPlay, 
  FaPause, 
  FaVolumeUp, 
  FaVolumeMute,
  FaChartLine,
  FaBrain,
  FaComments,
  FaThumbsUp,
  FaThumbsDown,
  FaFlag,
  FaBookmark,
  FaPrint,
  FaDownload,
  FaQrcode,
  FaCalendarCheck,
  FaCreditCard,
  FaCommentDots,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaTelegram,
  FaCopy,
  FaMedal,
  FaTrophy,
  FaAward,
  FaCertificate,
  FaUserCheck,
  FaHandshake,
  FaClipboardCheck,
  FaClock,
  FaMapPin,
  FaUsers,
  FaUser,
  FaStarHalfAlt,
  FaRegStar
} from 'react-icons/fa';
import QRCode from 'qrcode';
import dynamic from 'next/dynamic';

// Dynamic import for map to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/maps/PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">جاري تحميل الخارطة...</div>
});

interface Property {
  id: string;
  title?: any;
  titleAr?: string;
  titleEn?: string;
  priceOMR?: any;
  province?: string;
  state?: string;
  city?: string;
  village?: string;
  address?: string;
  images?: string[];
  coverImage?: string;
  coverIndex?: number;
  descriptionAr?: string;
  descriptionEn?: string;
  type?: string;
  usageType?: string;
  purpose?: string;
  buildingType?: string;
  buildingAge?: string;
  area?: string;
  beds?: string;
  baths?: string;
  floors?: string;
  totalUnits?: string;
  totalArea?: string;
  rentalPrice?: string;
  amenities?: string[];
  customAmenities?: string[];
  videoUrl?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  notes?: string;
  published?: boolean;
  referenceNo?: string;
  surveyNumber?: string;
  landNumber?: string;
  latitude?: string;
  longitude?: string;
  mapAddress?: string;
  halls?: string;
  majlis?: string;
  kitchens?: string;
  units?: any[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface AIInsights {
  marketValue: number;
  pricePerSqm: number;
  neighborhoodScore: number;
  investmentPotential: string;
  recommendations: string[];
  marketTrend: 'rising' | 'stable' | 'declining';
  comparableProperties: number;
  marketAnalysis: {
    averageRentInArea: string;
    averageSalePriceInArea: string;
    priceComparison: string;
    marketTrend: 'rising' | 'stable' | 'declining';
    similarPropertiesCount: number;
    priceRange: {
      min: string;
      max: string;
      median: string;
    };
  };
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

interface Statistics {
  views: number;
  favorites: number;
  shares: number;
  inquiries: number;
  avgRating: number;
  totalReviews: number;
}

interface PropertyRating {
  id: string;
  userId: string;
  userName: string;
  userType: 'tenant' | 'buyer' | 'visitor';
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

interface CompanyRating {
  id: string;
  userId: string;
  userName: string;
  companyId: string;
  companyName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

interface ServiceRating {
  id: string;
  userId: string;
  userName: string;
  serviceType: 'maintenance' | 'security' | 'cleaning' | 'management' | 'other';
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: 'property' | 'user' | 'company';
  earnedDate: string;
}

interface UserProfile {
  id: string;
  name: string;
  type: 'individual' | 'company' | 'management';
  avatar?: string;
  badges: Badge[];
  points: number;
  level: number;
  verified: boolean;
}

interface SimilarProperty {
  id: string;
  title: string;
  price: string;
  location: string;
  image: string;
  type: string;
  area: string;
  beds: string;
  baths: string;
}

interface BuildingUnit {
  id: string;
  unitNumber: string;
  floor: string;
  area: string;
  beds: string;
  baths: string;
  price: string;
  status: 'available' | 'rented' | 'sold' | 'reserved';
  images: string[];
  amenities: string[];
  description: string;
  published: boolean;
  ownerId: string;
  permissions: string[];
}

interface MultiUnitBuilding {
  id: string;
  buildingName: string;
  totalUnits: number;
  totalFloors: number;
  buildingType: 'apartment' | 'villa' | 'commercial' | 'mixed';
  units: BuildingUnit[];
  buildingAmenities: string[];
  managementCompany: string;
  yearBuilt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  userType: 'individual' | 'company' | 'management';
  permissions: string[];
}

function PropertyDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Image Gallery State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  // AI Insights State
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  
  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  
  // Statistics State
  const [statistics, setStatistics] = useState<Statistics>({
    views: 0,
    favorites: 0,
    shares: 0,
    inquiries: 0,
    avgRating: 0,
    totalReviews: 0
  });
  
  // UI State
  const [isFavorited, setIsFavorited] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // QR Code State
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Rating States
  const [propertyRatings, setPropertyRatings] = useState<PropertyRating[]>([]);
  const [companyRatings, setCompanyRatings] = useState<CompanyRating[]>([]);
  const [serviceRatings, setServiceRatings] = useState<ServiceRating[]>([]);
  const [newPropertyRating, setNewPropertyRating] = useState({ rating: 5, comment: '', userType: 'visitor' as 'tenant' | 'buyer' | 'visitor' });
  const [newCompanyRating, setNewCompanyRating] = useState({ rating: 5, comment: '' });
  const [newServiceRating, setNewServiceRating] = useState({ rating: 5, comment: '', serviceType: 'management' as 'maintenance' | 'security' | 'cleaning' | 'management' | 'other' });
  
  // Badges and User Profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [propertyBadges, setPropertyBadges] = useState<Badge[]>([]);
  
  // Similar Properties
  const [similarProperties, setSimilarProperties] = useState<SimilarProperty[]>([]);
  
  // Social Sharing
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Multi-Unit Building State
  const [isMultiUnitBuilding, setIsMultiUnitBuilding] = useState(false);
  const [buildingUnits, setBuildingUnits] = useState<BuildingUnit[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userCanRate, setUserCanRate] = useState(false);

  // تحميل بيانات العقار من API
  useEffect(() => {
    if (id) {
      loadPropertyData();
      loadAIInsights();
      loadReviews();
      loadStatistics();
      generateQRCode();
      loadPropertyRatings();
      loadCompanyRatings();
      loadServiceRatings();
      loadUserProfile();
      loadPropertyBadges();
      loadSimilarProperties();
      loadCurrentUser();
      checkMultiUnitBuilding();
    }
  }, [id]);

  // تحميل رؤى الذكاء الاصطناعي
  const loadAIInsights = async () => {
    if (!property) return;
    
    setInsightsLoading(true);
    try {
      // محاكاة تحليل الذكاء الاصطناعي مع تحليل السوق
      const insights: AIInsights = {
        marketValue: property.priceOMR ? parseFloat(property.priceOMR) * 1.1 : 0,
        pricePerSqm: property.area ? parseFloat(property.priceOMR || '0') / parseFloat(property.area) : 0,
        neighborhoodScore: Math.floor(Math.random() * 40) + 60, // 60-100
        investmentPotential: ['ممتاز', 'جيد جداً', 'جيد', 'متوسط'][Math.floor(Math.random() * 4)],
        recommendations: [
          'موقع ممتاز بالقرب من المرافق الأساسية',
          'سعر مناسب مقارنة بالسوق المحلي',
          'إمكانية عالية للاستثمار',
          'منطقة آخذة في التطور'
        ],
        marketTrend: ['rising', 'stable', 'declining'][Math.floor(Math.random() * 3)] as any,
        comparableProperties: Math.floor(Math.random() * 20) + 5,
        marketAnalysis: {
          averageRentInArea: property.purpose === 'rent' ? '850 ريال' : 'غير متاح',
          averageSalePriceInArea: property.purpose === 'sale' ? '420,000 ريال' : 'غير متاح',
          priceComparison: property.purpose === 'rent' ? 
            (parseFloat(property.priceOMR || '0') > 850 ? 'أعلى من المتوسط بـ 15%' : 'أقل من المتوسط بـ 5%') :
            (parseFloat(property.priceOMR || '0') > 420000 ? 'أعلى من المتوسط بـ 7%' : 'أقل من المتوسط بـ 3%'),
          marketTrend: 'rising',
          similarPropertiesCount: 8,
          priceRange: {
            min: property.purpose === 'rent' ? '750 ريال' : '380,000 ريال',
            max: property.purpose === 'rent' ? '950 ريال' : '480,000 ريال',
            median: property.purpose === 'rent' ? '850 ريال' : '420,000 ريال'
          }
        }
      };
      
      setAiInsights(insights);
    } catch (error) {
      console.error('Error loading AI insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  // تحميل التعليقات
  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      // محاكاة بيانات التعليقات
      const mockReviews: Review[] = []; // تم إزالة البيانات الوهمية - يتم الجلب من API
      
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // تحميل الإحصائيات
  const loadStatistics = async () => {
    try {
      const mockStats: Statistics = { views: 0, favorites: 0, shares: 0, bookings: 0, avgRating: 0 }; // من API
      
      setStatistics(mockStats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadPropertyData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/${id}`);
      if (response.ok) {
        const data = await response.json();
        const propertyData = data.item; // Correctly extract 'item'
        
        
        // إصلاح مشكلة الترميز المشوه
        const fixCorruptedText = (text: string): string => {
          if (!text) return '';
          if (text.includes('') || text.includes('') || text.includes('')) {
            return '';
          }
          return text;
        };

        // تنظيف البيانات
        const cleanedProperty = {
          ...propertyData,
          titleAr: fixCorruptedText(propertyData.titleAr || propertyData.title?.ar || ''),
          titleEn: fixCorruptedText(propertyData.titleEn || propertyData.title?.en || ''),
          descriptionAr: fixCorruptedText(propertyData.descriptionAr || propertyData.description?.ar || ''),
          descriptionEn: fixCorruptedText(propertyData.descriptionEn || propertyData.description?.en || ''),
          province: fixCorruptedText(propertyData.province || ''),
          state: fixCorruptedText(propertyData.state || ''),
          city: fixCorruptedText(propertyData.city || ''),
          village: fixCorruptedText(propertyData.village || ''),
          address: fixCorruptedText(propertyData.address || '')
        };

        setProperty(cleanedProperty);
        setError(null);
      } else {
        const errorData = await response.json();
        console.error('Error fetching property:', errorData);
        setError('العقار المطلوب غير موجود أو تم حذفه');
        setProperty(null);
      }
    } catch (error) {
      console.error('Error loading property data:', error);
      setError('حدث خطأ أثناء جلب بيانات العقار');
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  // وظائف مساعدة
  const getAmenityIcon = (amenity: string) => {
    const icons: { [key: string]: any } = {
      'elevator': FaCar,
      'parking': FaParking,
      'pool': FaSwimmingPool,
      'wifi': FaWifi,
      'security': FaShieldAlt,
      'gym': FaBuilding,
      'garden': FaBuilding,
      'balcony': FaBuilding
    };
    return icons[amenity] || FaBuilding;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', {
      calendar: 'gregory', // ✅ التقويم الميلادي
      numberingSystem: 'latn', // ✅ الأرقام اللاتينية
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleSocialShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(getTitle());
    const description = encodeURIComponent(getDescription());
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${title}%20${url}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(window.location.href);
        alert('تم نسخ الرابط إلى الحافظة');
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleBookAppointment = async () => {
    // ربط مع نظام المواعيد - تنقل فوري ⚡
    await router.push(`/tasks/new?propertyId=${id}`);
  };

  const handleBookUnit = async () => {
    // ربط مع نظام الحجز والدفع - تنقل فوري ⚡
    await router.push(`/booking/new?propertyId=${id}`);
  };

  const handleChatWithManagement = async () => {
    // ربط مع نظام الدردشة - تنقل فوري ⚡
    await router.push(`/chat?propertyId=${id}&type=management`);
  };

  const handleWhatsAppContact = () => {
    if (property?.ownerPhone) {
      const message = encodeURIComponent(`مرحباً، أريد الاستفسار عن العقار: ${getTitle()}`);
      const phone = property.ownerPhone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    // هنا يمكن إضافة API call لحفظ المفضلة
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // محاكاة تحميل PDF
    const link = document.createElement('a');
    link.href = '#';
    link.download = `property-${property?.id}.pdf`;
    link.click();
    alert('سيتم تحميل ملف PDF قريباً');
  };

  // Generate QR Code
  const generateQRCode = async () => {
    if (typeof window !== 'undefined' && id) {
      try {
        const url = `${window.location.origin}/properties/${id}`;
        const qrCodeDataURL = await QRCode.toDataURL(url, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrCodeDataURL);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }
  };

  // Load Property Ratings
  const loadPropertyRatings = async () => {
    try {
      // محاكاة بيانات تقييمات العقار
      const mockRatings: PropertyRating[] = []; // تم إزالة البيانات الوهمية
      setPropertyRatings(mockRatings);
    } catch (error) {
      console.error('Error loading property ratings:', error);
    }
  };

  // Load Company Ratings
  const loadCompanyRatings = async () => {
    try {
      const mockRatings: CompanyRating[] = []; // تم إزالة البيانات الوهمية
      setCompanyRatings(mockRatings);
    } catch (error) {
      console.error('Error loading company ratings:', error);
    }
  };

  // Load Service Ratings
  const loadServiceRatings = async () => {
    try {
      const mockRatings: ServiceRating[] = []; // تم إزالة البيانات الوهمية
      setServiceRatings(mockRatings);
    } catch (error) {
      console.error('Error loading service ratings:', error);
    }
  };

  // Load User Profile
  const loadUserProfile = async () => {
    try {
      const mockProfile: UserProfile | null = null; // تم إزالة البيانات الوهمية
      setUserProfile(mockProfile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Load Property Badges
  const loadPropertyBadges = async () => {
    try {
      const mockBadges: Badge[] = []; // تم إزالة البيانات الوهمية
      setPropertyBadges(mockBadges);
    } catch (error) {
      console.error('Error loading property badges:', error);
    }
  };

  // Load Similar Properties
  const loadSimilarProperties = async () => {
    try {
      const mockSimilar: SimilarProperty[] = []; // تم إزالة البيانات الوهمية
      setSimilarProperties(mockSimilar);
    } catch (error) {
      console.error('Error loading similar properties:', error);
    }
  };

  // Load Current User
  const loadCurrentUser = async () => {
    try {
      // محاكاة بيانات المستخدم الحالي
      const mockUser: User | null = null; // تم إزالة البيانات الوهمية
      setCurrentUser(mockUser);
      setUserCanRate(mockUser ? (mockUser.verified && mockUser.permissions.includes('rate_property')) : false);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  // Check if property is part of multi-unit building
  const checkMultiUnitBuilding = async () => {
    try {
      // محاكاة فحص إذا كان العقار جزء من مبنى متعدد الوحدات
      if (property?.buildingType === 'multi' && property?.totalUnits && parseInt(property.totalUnits) > 1) {
        setIsMultiUnitBuilding(true);
        await loadBuildingUnits();
      } else {
        setIsMultiUnitBuilding(false);
      }
    } catch (error) {
      console.error('Error checking multi-unit building:', error);
    }
  };

  // Load Building Units
  const loadBuildingUnits = async () => {
    try {
      // محاكاة بيانات وحدات المبنى
      const mockUnits: BuildingUnit[] = []; // تم إزالة البيانات الوهمية
      setBuildingUnits(mockUnits);
    } catch (error) {
      console.error('Error loading building units:', error);
    }
  };

  // الحصول على العنوان
  const getTitle = () => {
    if (property?.titleAr) return property.titleAr;
    if (property?.titleEn) return property.titleEn;
    if (property?.title && property.title.ar) return property.title.ar;
    if (property?.title && property.title.en) return property.title.en;
    return `عقار ${property?.id}`;
  };

  // الحصول على الوصف
  const getDescription = () => {
    if (property?.descriptionAr) return property.descriptionAr;
    if (property?.descriptionEn) return property.descriptionEn;
    if (property?.description && property.description.ar) return property.description.ar;
    if (property?.description && property.description.en) return property.description.en;
    return 'عقار مميز في موقع رائع';
  };

  // الحصول على السعر
  const getPrice = () => {
    if (property?.priceOMR) {
      const price = typeof property.priceOMR === 'string' ? property.priceOMR : property.priceOMR.toString();
      return new Intl.NumberFormat('ar-OM', {
        style: 'currency',
        currency: 'OMR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(parseFloat(price));
    }
    return 'غير محدد';
  };

  // الحصول على الموقع
  const getLocation = () => {
    const parts = [];
    if (property?.province) parts.push(property.province);
    if (property?.state) parts.push(property.state);
    if (property?.city) parts.push(property.city);
    if (property?.village) parts.push(property.village);
    return parts.length > 0 ? parts.join(' - ') : 'الموقع غير محدد';
  };

  // الحصول على الصور
  const getImages = () => {
    if (property?.images && property.images.length > 0) {
      return property.images;
    }
    if (property?.coverImage) {
      return [property.coverImage];
    }
    return ['/demo/apartment1.jpg']; // صورة افتراضية
  };

  // عرض حالة التحميل
  if (loading) {
    return (
      <>
        <Head>
          <title>جاري التحميل...</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              جاري تحميل بيانات العقار...
            </h1>
          </div>
        </div>
      </>
    );
  }

  // إذا لم توجد البيانات، اعرض رسالة خطأ
  if (!property || !property.id || error) {
    return (
      <>
        <Head>
          <title>لم يتم العثور على العقار</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl text-gray-400 mb-4">
              <FaBuilding />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              لم يتم العثور على العقار
            </h1>
            <p className="text-gray-600 mb-6">
              العقار المطلوب غير موجود أو تم حذفه
            </p>
            <Link
              href="/properties"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <FaBuilding className="text-sm" />
              العودة للعقارات
            </Link>
          </div>
        </div>
      </>
    );
  }


  return (
    <>
      <Head>
        <title>{getTitle()} - عين عُمان</title>
        <meta name="description" content={getDescription()} />
        <meta property="og:title" content={getTitle()} />
        <meta property="og:description" content={getDescription()} />
        <meta property="og:image" content={getImages()[0]} />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm mb-4">
              <Link href="/" className="text-blue-200 hover:text-white flex items-center gap-1">
                <FaHome className="text-xs" />
                الرئيسية
              </Link>
              <span className="text-blue-300">/</span>
              <Link href="/properties" className="text-blue-200 hover:text-white">
                العقارات
              </Link>
              <span className="text-blue-300">/</span>
              <span className="text-white font-medium">{getTitle()}</span>
            </nav>

            {/* Property Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{getTitle()}</h1>
                <div className="flex items-center gap-4 text-blue-100">
                  <div className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-sm" />
                    <span>{getLocation()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaEye className="text-sm" />
                    <span>{statistics.views} مشاهدة</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaCalendarAlt className="text-sm" />
                    <span>{property?.createdAt ? formatDate(property.createdAt) : 'تاريخ غير محدد'}</span>
                  </div>
        </div>
      </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleFavorite}
                  className={`p-3 rounded-full transition-colors ${
                    isFavorited 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <FaHeart className="text-lg" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <FaShare className="text-lg" />
                </button>
                <button
                  onClick={handlePrint}
                  className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <FaPrint className="text-lg" />
                </button>
              </div>
            </div>
        </div>
      </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Price Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {getPrice()}
                  </div>
                  <div className="text-lg text-gray-600 mb-4">
                    {property?.purpose === 'rent' ? 'إيجار شهري' : 'سعر البيع'}
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaEye className="text-blue-500" />
                      {statistics.views} مشاهدة
                    </span>
                    <span className="flex items-center gap-1">
                      <FaHeart className="text-red-500" />
                      {statistics.favorites} مفضلة
                    </span>
                    <span className="flex items-center gap-1">
                      <FaShare className="text-green-500" />
                      {statistics.shares} مشاركة
                  </span>
                  </div>
              </div>
            </div>

              {/* Image Gallery */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative">
                  <div className="aspect-video bg-gray-200 relative">
                    <img
                      src={getImages()[currentImageIndex]}
                      alt={getTitle()}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setIsGalleryOpen(true)}
                    />
                    {getImages().length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <FaChevronLeft />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(Math.min(getImages().length - 1, currentImageIndex + 1))}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <FaChevronRight />
                        </button>
                      </>
                    )}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {getImages().length}
              </div>
            </div>

                  {/* Thumbnail Gallery */}
                  {Array.isArray(getImages()) && getImages().length > 1 && (
                    <div className="p-4">
                      <div className="flex gap-2 overflow-x-auto">
                        {getImages().map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                              index === currentImageIndex 
                                ? 'border-blue-500' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                      <img
                        src={image}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                          </button>
                  ))}
                </div>
              </div>
            )}
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="bg-white rounded-2xl shadow-lg relative z-20">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6 overflow-x-auto">
                    {[
                      { id: 'overview', label: 'نظرة عامة', icon: FaBuilding },
                      { id: 'details', label: 'التفاصيل', icon: FaRulerCombined },
                      { id: 'amenities', label: 'المرافق', icon: FaWifi },
                      { id: 'property-ratings', label: 'تقييم العقار', icon: FaStar },
                      { id: 'company-ratings', label: 'تقييم الإدارة', icon: FaUser },
                      { id: 'service-ratings', label: 'تقييم الخدمات', icon: FaClipboardCheck },
                      { id: 'badges', label: 'الشارات', icon: FaMedal },
                      { id: 'additional-info', label: 'معلومات إضافية', icon: FaClipboardCheck },
                      ...(isMultiUnitBuilding ? [{ id: 'building-units', label: 'وحدات المبنى', icon: FaBuilding }] : []),
                      { id: 'map', label: 'الموقع على الخارطة', icon: FaMapMarkerAlt },
                      { id: 'ai-insights', label: 'الذكاء الاصطناعي', icon: FaBrain }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap min-w-fit ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="text-sm" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="p-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">وصف العقار</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {getDescription() || 'عقار مميز في موقع رائع مع إطلالة خلابة ومرافق متكاملة. يتميز بموقعه الاستراتيجي القريب من جميع الخدمات والمرافق الأساسية.'}
                        </p>
                      </div>

                      {/* Property Features */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {property?.beds && (
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <FaBed className="text-2xl text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-gray-900">{property.beds}</div>
                            <div className="text-sm text-gray-600">غرف نوم</div>
                          </div>
                        )}
                        {property?.baths && (
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <FaBath className="text-2xl text-green-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-gray-900">{property.baths}</div>
                            <div className="text-sm text-gray-600">حمامات</div>
                          </div>
                        )}
                        {property?.area && (
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <FaRulerCombined className="text-2xl text-purple-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-gray-900">{property.area}</div>
                            <div className="text-sm text-gray-600">متر مربع</div>
                          </div>
                        )}
                        {property?.floors && (
                          <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <FaBuilding className="text-2xl text-orange-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-gray-900">{property.floors}</div>
                            <div className="text-sm text-gray-600">طوابق</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Details Tab */}
                  {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900">معلومات العقار</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">رقم المرجع:</span>
                            <span className="font-medium">{property?.referenceNo || property?.id}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">نوع العقار:</span>
                            <span className="font-medium">{property?.type || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">الغرض:</span>
                            <span className="font-medium">{property?.purpose === 'rent' ? 'إيجار' : 'بيع'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">عمر المبنى:</span>
                            <span className="font-medium">{property?.buildingAge || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">نوع الاستخدام:</span>
                            <span className="font-medium">{property?.usageType || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">نوع البناء:</span>
                            <span className="font-medium">{property?.buildingType || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">عدد القاعات:</span>
                            <span className="font-medium">{property?.halls || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">عدد المجالس:</span>
                            <span className="font-medium">{property?.majlis || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">عدد المطابخ:</span>
                            <span className="font-medium">{property?.kitchens || 'غير محدد'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900">معلومات الموقع</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">المحافظة:</span>
                            <span className="font-medium">{property?.province || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">الولاية:</span>
                            <span className="font-medium">{property?.state || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">المدينة:</span>
                            <span className="font-medium">{property?.city || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">القرية:</span>
                            <span className="font-medium">{property?.village || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">العنوان:</span>
                            <span className="font-medium">{property?.address || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">رقم المساحة:</span>
                            <span className="font-medium">{property?.surveyNumber || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">رقم الأرض:</span>
                            <span className="font-medium">{property?.landNumber || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">الإحداثيات:</span>
                            <span className="font-medium">
                              {property?.latitude && property?.longitude 
                                ? `${property.latitude}, ${property.longitude}` 
                                : 'غير محدد'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amenities Tab */}
                  {activeTab === 'amenities' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900">المرافق والخدمات</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {(property?.amenities || []).map((amenity, index) => {
                          const Icon = getAmenityIcon(amenity);
                          return (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <Icon className="text-blue-600" />
                              <span className="text-gray-700">{amenity}</span>
                            </div>
                          );
                        })}
                        {(property?.customAmenities || []).map((amenity, index) => (
                          <div key={`custom-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <FaBuilding className="text-blue-600" />
                            <span className="text-gray-700">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Property Ratings Tab */}
                  {activeTab === 'property-ratings' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">تقييم العقار</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`text-sm ${
                                  i < Math.floor(statistics.avgRating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-semibold text-gray-900">
                            {statistics.avgRating.toFixed(1)}
                          </span>
                          <span className="text-gray-500">
                            ({propertyRatings.length} تقييم)
                          </span>
                        </div>
                      </div>

                      {/* Add Property Rating Form */}
                      {userCanRate ? (
              <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">أضف تقييمك للعقار</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">نوع المستخدم:</span>
                            <select
                              value={newPropertyRating.userType}
                              onChange={(e) => setNewPropertyRating({ ...newPropertyRating, userType: e.target.value as any })}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="visitor">زائر</option>
                              <option value="tenant">مستأجر</option>
                              <option value="buyer">مشتري</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">التقييم:</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setNewPropertyRating({ ...newPropertyRating, rating: i + 1 })}
                                  className={`text-lg ${
                                    i < newPropertyRating.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  <FaStar />
                                </button>
                              ))}
                            </div>
                          </div>
                          <textarea
                            value={newPropertyRating.comment}
                            onChange={(e) => setNewPropertyRating({ ...newPropertyRating, comment: e.target.value })}
                            placeholder="اكتب تقييمك للعقار..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            إضافة التقييم
                          </button>
                        </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <FaUserCheck />
                            <span className="font-medium">يجب تسجيل الدخول لتقييم العقار</span>
                          </div>
                          <p className="text-sm text-yellow-700 mt-2">
                            يجب أن يكون لديك حساب موثق لتتمكن من إضافة تقييمات
                          </p>
                          <button className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                            تسجيل الدخول
                          </button>
                        </div>
                      )}

                      {/* Property Ratings List */}
                      <div className="space-y-4">
                        {propertyRatings.map((rating) => (
                          <div key={rating.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold">
                                    {rating.userName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{rating.userName}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      rating.userType === 'tenant' ? 'bg-green-100 text-green-800' :
                                      rating.userType === 'buyer' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {rating.userType === 'tenant' ? 'مستأجر' :
                                       rating.userType === 'buyer' ? 'مشتري' : 'زائر'}
                                    </span>
                                    {rating.verified && (
                                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                        موثق
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <FaStar
                                        key={i}
                                        className={`text-sm ${
                                          i < rating.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">{formatDate(rating.date)}</span>
                            </div>
                            <p className="text-gray-700 mb-3">{rating.comment}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <button className="flex items-center gap-1 hover:text-blue-600">
                                <FaThumbsUp />
                                مفيد ({rating.helpful})
                              </button>
                              <button className="flex items-center gap-1 hover:text-red-600">
                                <FaThumbsDown />
                                غير مفيد
                              </button>
                              <button className="flex items-center gap-1 hover:text-gray-600">
                                <FaFlag />
                                إبلاغ
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Company Ratings Tab */}
                  {activeTab === 'company-ratings' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">تقييم الإدارة/المالك</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`text-sm ${
                                  i < 4 ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-semibold text-gray-900">4.2</span>
                          <span className="text-gray-500">
                            ({companyRatings.length} تقييم)
                          </span>
                        </div>
                      </div>

                      {/* Add Company Rating Form */}
                      {userCanRate ? (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">أضف تقييمك للإدارة</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">التقييم:</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setNewCompanyRating({ ...newCompanyRating, rating: i + 1 })}
                                  className={`text-lg ${
                                    i < newCompanyRating.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  <FaStar />
                                </button>
                              ))}
                            </div>
                          </div>
                          <textarea
                            value={newCompanyRating.comment}
                            onChange={(e) => setNewCompanyRating({ ...newCompanyRating, comment: e.target.value })}
                            placeholder="اكتب تقييمك للإدارة..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            إضافة التقييم
                          </button>
                        </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <FaUserCheck />
                            <span className="font-medium">يجب تسجيل الدخول لتقييم الإدارة</span>
                          </div>
                          <p className="text-sm text-yellow-700 mt-2">
                            يجب أن يكون لديك حساب موثق لتتمكن من تقييم الإدارة
                          </p>
                          <button className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                            تسجيل الدخول
                          </button>
                        </div>
                      )}

                      {/* Company Ratings List */}
                      <div className="space-y-4">
                        {companyRatings.map((rating) => (
                          <div key={rating.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                  <span className="text-purple-600 font-semibold">
                                    {rating.userName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{rating.userName}</span>
                                    {rating.verified && (
                                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                        موثق
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600">{rating.companyName}</div>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <FaStar
                                        key={i}
                                        className={`text-sm ${
                                          i < rating.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">{formatDate(rating.date)}</span>
                            </div>
                            <p className="text-gray-700 mb-3">{rating.comment}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <button className="flex items-center gap-1 hover:text-blue-600">
                                <FaThumbsUp />
                                مفيد ({rating.helpful})
                              </button>
                              <button className="flex items-center gap-1 hover:text-red-600">
                                <FaThumbsDown />
                                غير مفيد
                              </button>
                              <button className="flex items-center gap-1 hover:text-gray-600">
                                <FaFlag />
                                إبلاغ
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Service Ratings Tab */}
                  {activeTab === 'service-ratings' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">تقييم الخدمات</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`text-sm ${
                                  i < 4 ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-semibold text-gray-900">4.5</span>
                          <span className="text-gray-500">
                            ({serviceRatings.length} تقييم)
                          </span>
                        </div>
                      </div>

                      {/* Add Service Rating Form */}
                      {userCanRate ? (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">أضف تقييمك للخدمات</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">نوع الخدمة:</span>
                            <select
                              value={newServiceRating.serviceType}
                              onChange={(e) => setNewServiceRating({ ...newServiceRating, serviceType: e.target.value as any })}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="maintenance">الصيانة</option>
                              <option value="security">الأمن</option>
                              <option value="cleaning">النظافة</option>
                              <option value="management">الإدارة</option>
                              <option value="other">أخرى</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">التقييم:</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setNewServiceRating({ ...newServiceRating, rating: i + 1 })}
                                  className={`text-lg ${
                                    i < newServiceRating.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  <FaStar />
                                </button>
                              ))}
                            </div>
                          </div>
                          <textarea
                            value={newServiceRating.comment}
                            onChange={(e) => setNewServiceRating({ ...newServiceRating, comment: e.target.value })}
                            placeholder="اكتب تقييمك للخدمة..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            إضافة التقييم
                          </button>
                        </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <FaUserCheck />
                            <span className="font-medium">يجب تسجيل الدخول لتقييم الخدمات</span>
                          </div>
                          <p className="text-sm text-yellow-700 mt-2">
                            يجب أن يكون لديك حساب موثق لتتمكن من تقييم الخدمات
                          </p>
                          <button className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                            تسجيل الدخول
                          </button>
                        </div>
                      )}

                      {/* Service Ratings List */}
                      <div className="space-y-4">
                        {serviceRatings.map((rating) => (
                          <div key={rating.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-green-600 font-semibold">
                                    {rating.userName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{rating.userName}</span>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {rating.serviceType === 'maintenance' ? 'الصيانة' :
                                     rating.serviceType === 'security' ? 'الأمن' :
                                     rating.serviceType === 'cleaning' ? 'النظافة' :
                                     rating.serviceType === 'management' ? 'الإدارة' : 'أخرى'}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <FaStar
                                        key={i}
                                        className={`text-sm ${
                                          i < rating.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">{formatDate(rating.date)}</span>
                            </div>
                            <p className="text-gray-700 mb-3">{rating.comment}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <button className="flex items-center gap-1 hover:text-blue-600">
                                <FaThumbsUp />
                                مفيد ({rating.helpful})
                              </button>
                              <button className="flex items-center gap-1 hover:text-red-600">
                                <FaThumbsDown />
                                غير مفيد
                              </button>
                              <button className="flex items-center gap-1 hover:text-gray-600">
                                <FaFlag />
                                إبلاغ
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Badges Tab */}
                  {activeTab === 'badges' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <FaMedal className="text-2xl text-yellow-600" />
                        <h3 className="text-xl font-bold text-gray-900">الشارات والميداليات</h3>
                      </div>

                      {/* Property Badges */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">شارات العقار</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {propertyBadges.map((badge) => (
                            <div key={badge.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  badge.color === 'green' ? 'bg-green-100' :
                                  badge.color === 'blue' ? 'bg-blue-100' :
                                  badge.color === 'purple' ? 'bg-purple-100' :
                                  'bg-yellow-100'
                                }`}>
                                  {badge.icon === 'FaCertificate' && <FaCertificate className={`text-lg ${
                                    badge.color === 'green' ? 'text-green-600' :
                                    badge.color === 'blue' ? 'text-blue-600' :
                                    badge.color === 'purple' ? 'text-purple-600' :
                                    'text-yellow-600'
                                  }`} />}
                                  {badge.icon === 'FaMapPin' && <FaMapPin className={`text-lg ${
                                    badge.color === 'green' ? 'text-green-600' :
                                    badge.color === 'blue' ? 'text-blue-600' :
                                    badge.color === 'purple' ? 'text-purple-600' :
                                    'text-yellow-600'
                                  }`} />}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{badge.name}</div>
                                  <div className="text-sm text-gray-600">{badge.description}</div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                حُصل عليها في: {formatDate(badge.earnedDate)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* User Profile Badges */}
                      {userProfile && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">شارات المستخدم</h4>
                          <div className="bg-blue-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-lg">
                                  {userProfile.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{userProfile.name}</div>
                                <div className="text-sm text-gray-600">
                                  المستوى {userProfile.level} • {userProfile.points} نقطة
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {userProfile.badges.map((badge) => (
                              <div key={badge.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    badge.color === 'green' ? 'bg-green-100' :
                                    badge.color === 'blue' ? 'bg-blue-100' :
                                    badge.color === 'purple' ? 'bg-purple-100' :
                                    'bg-yellow-100'
                                  }`}>
                                    {badge.icon === 'FaUserCheck' && <FaUserCheck className={`text-lg ${
                                      badge.color === 'green' ? 'text-green-600' :
                                      badge.color === 'blue' ? 'text-blue-600' :
                                      badge.color === 'purple' ? 'text-purple-600' :
                                      'text-yellow-600'
                                    }`} />}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{badge.name}</div>
                                    <div className="text-sm text-gray-600">{badge.description}</div>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  حُصل عليها في: {formatDate(badge.earnedDate)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional Info Tab */}
                  {activeTab === 'additional-info' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <FaClipboardCheck className="text-2xl text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-900">معلومات إضافية</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Financial Information */}
                        <div className="bg-blue-50 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">المعلومات المالية</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-blue-200">
                              <span className="text-gray-600">سعر البيع:</span>
                              <span className="font-medium text-blue-600">{getPrice()}</span>
                            </div>
                            {property?.rentalPrice && (
                              <div className="flex justify-between py-2 border-b border-blue-200">
                                <span className="text-gray-600">سعر الإيجار:</span>
                                <span className="font-medium text-blue-600">{property.rentalPrice} ريال</span>
                              </div>
                            )}
                            {property?.area && property?.priceOMR && (
                              <div className="flex justify-between py-2 border-b border-blue-200">
                                <span className="text-gray-600">السعر للمتر:</span>
                                <span className="font-medium text-blue-600">
                                  {(parseFloat(property.priceOMR) / parseFloat(property.area)).toFixed(0)} ريال/م²
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between py-2 border-b border-blue-200">
                              <span className="text-gray-600">الحالة:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                property?.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {property?.published ? 'منشور' : 'مسودة'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Technical Information */}
                        <div className="bg-green-50 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">المعلومات التقنية</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-green-200">
                              <span className="text-gray-600">تاريخ الإنشاء:</span>
                              <span className="font-medium">{property?.createdAt ? formatDate(property.createdAt) : 'غير محدد'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-green-200">
                              <span className="text-gray-600">آخر تحديث:</span>
                              <span className="font-medium">{property?.updatedAt ? formatDate(property.updatedAt) : 'غير محدد'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-green-200">
                              <span className="text-gray-600">رقم المرجع:</span>
                              <span className="font-medium">{property?.referenceNo || property?.id}</span>
                            </div>
                            {property?.videoUrl && (
                              <div className="flex justify-between py-2 border-b border-green-200">
                                <span className="text-gray-600">فيديو:</span>
                                <a 
                                  href={property.videoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  مشاهدة الفيديو
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Owner Information */}
                        <div className="bg-purple-50 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">معلومات المالك</h4>
                          <div className="space-y-3">
                            {property?.ownerName && (
                              <div className="flex justify-between py-2 border-b border-purple-200">
                                <span className="text-gray-600">اسم المالك:</span>
                                <span className="font-medium">{property.ownerName}</span>
                              </div>
                            )}
                            {property?.ownerPhone && (
                              <div className="flex justify-between py-2 border-b border-purple-200">
                                <span className="text-gray-600">هاتف المالك:</span>
                                <span className="font-medium">{property.ownerPhone}</span>
                              </div>
                            )}
                            {property?.ownerEmail && (
                              <div className="flex justify-between py-2 border-b border-purple-200">
                                <span className="text-gray-600">إيميل المالك:</span>
                                <span className="font-medium">{property.ownerEmail}</span>
                              </div>
                            )}
                            <div className="flex justify-between py-2 border-b border-purple-200">
                              <span className="text-gray-600">استخدام بيانات المستخدم:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                property?.useUserContact ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {property?.useUserContact ? 'نعم' : 'لا'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {property?.notes && (
                          <div className="bg-yellow-50 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">ملاحظات</h4>
                            <p className="text-gray-700 leading-relaxed">{property.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Units Information */}
                      {property?.units && property.units.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">معلومات الوحدات</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {property.units.map((unit: any, index: number) => (
                              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                <h5 className="font-semibold text-gray-900 mb-2">الوحدة {index + 1}</h5>
                <div className="space-y-2 text-sm">
                                  {unit.area && (
                  <div className="flex justify-between">
                                      <span className="text-gray-600">المساحة:</span>
                                      <span className="font-medium">{unit.area} م²</span>
                  </div>
                                  )}
                                  {unit.beds && (
                  <div className="flex justify-between">
                                      <span className="text-gray-600">غرف النوم:</span>
                                      <span className="font-medium">{unit.beds}</span>
                  </div>
                                  )}
                                  {unit.baths && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">الحمامات:</span>
                                      <span className="font-medium">{unit.baths}</span>
                                    </div>
                                  )}
                                  {unit.price && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">السعر:</span>
                                      <span className="font-medium text-blue-600">{unit.price} ريال</span>
                  </div>
                                  )}
                </div>
              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Building Units Tab */}
                  {activeTab === 'building-units' && isMultiUnitBuilding && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <FaBuilding className="text-2xl text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-900">وحدات المبنى</h3>
                      </div>

                      {/* Building Overview */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">نظرة عامة على المبنى</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{property?.totalUnits || 0}</div>
                            <div className="text-sm text-gray-600">إجمالي الوحدات</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {buildingUnits.filter(unit => unit.status === 'available').length}
                            </div>
                            <div className="text-sm text-gray-600">وحدات متاحة</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {buildingUnits.filter(unit => unit.status === 'rented').length}
                            </div>
                            <div className="text-sm text-gray-600">وحدات مؤجرة</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {buildingUnits.filter(unit => unit.status === 'sold').length}
                            </div>
                            <div className="text-sm text-gray-600">وحدات مباعة</div>
                          </div>
                        </div>
                      </div>

                      {/* Units Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {buildingUnits.map((unit) => (
                          <div key={unit.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video bg-gray-200 relative">
                              <img
                                src={unit.images[0] || '/demo/apartment1.jpg'}
                                alt={`الوحدة ${unit.unitNumber}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  unit.status === 'available' ? 'bg-green-100 text-green-800' :
                                  unit.status === 'rented' ? 'bg-orange-100 text-orange-800' :
                                  unit.status === 'sold' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {unit.status === 'available' ? 'متاحة' :
                                   unit.status === 'rented' ? 'مؤجرة' :
                                   unit.status === 'sold' ? 'مباعة' : 'محجوزة'}
                                </span>
                              </div>
                              <div className="absolute top-2 left-2 bg-white/90 text-gray-800 px-2 py-1 rounded text-sm font-medium">
                                الطابق {unit.floor}
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-semibold text-gray-900">الوحدة {unit.unitNumber}</h5>
                                <div className="text-lg font-bold text-blue-600">{unit.price} ريال</div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <FaRulerCombined className="text-xs" />
                                  <span>{unit.area} م²</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FaBed className="text-xs" />
                                  <span>{unit.beds}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FaBath className="text-xs" />
                                  <span>{unit.baths}</span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-700 mb-3">{unit.description}</p>
                              
                              {/* Amenities */}
                              {unit.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {unit.amenities.slice(0, 3).map((amenity, index) => (
                                    <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                      {amenity}
                                    </span>
                                  ))}
                                  {unit.amenities.length > 3 && (
                                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                      +{unit.amenities.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              {/* Actions */}
                              <div className="flex gap-2">
                                {unit.published && unit.permissions.includes('view') && (
              <Link
                                    href={`/properties/${unit.id}`}
                                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm text-center hover:bg-blue-700 transition-colors"
              >
                                    عرض التفاصيل
              </Link>
                                )}
                                {unit.status === 'available' && (
                                  <button
                                    onClick={() => handleBookUnit()}
                                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                                  >
                                    حجز
                                  </button>
                                )}
                              </div>
                              
                              {/* Permission Notice */}
                              {!unit.published && (
                                <div className="mt-2 text-xs text-gray-500 text-center">
                                  هذه الوحدة غير متاحة للعرض العام
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">التقييمات والآراء</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`text-sm ${
                                  i < Math.floor(statistics.avgRating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-semibold text-gray-900">
                            {statistics.avgRating.toFixed(1)}
                          </span>
                          <span className="text-gray-500">
                            ({statistics.totalReviews} تقييم)
                          </span>
                        </div>
                      </div>

                      {/* Add Review Form */}
              <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">أضف تقييمك</h4>
                <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">التقييم:</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                                  className={`text-lg ${
                                    i < newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  <FaStar />
                                </button>
                              ))}
                </div>
              </div>
                          <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            placeholder="اكتب تعليقك هنا..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            إضافة التقييم
                          </button>
            </div>
          </div>

                      {/* Reviews List */}
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold">
                                    {review.userName.charAt(0)}
                                  </span>
        </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{review.userName}</span>
                                    {review.verified && (
                                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                        موثق
                                      </span>
                                    )}
              </div>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <FaStar
                                        key={i}
                                        className={`text-sm ${
                                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
            </div>
          </div>
        </div>
                              <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                            </div>
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <button className="flex items-center gap-1 hover:text-blue-600">
                                <FaThumbsUp />
                                مفيد ({review.helpful})
                              </button>
                              <button className="flex items-center gap-1 hover:text-red-600">
                                <FaThumbsDown />
                                غير مفيد
                              </button>
                              <button className="flex items-center gap-1 hover:text-gray-600">
                                <FaFlag />
                                إبلاغ
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Map Tab */}
                  {activeTab === 'map' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <FaMapMarkerAlt className="text-2xl text-green-600" />
                        <h3 className="text-xl font-bold text-gray-900">الموقع على الخارطة</h3>
                      </div>

                      {/* Map Component */}
                      <div className="bg-white rounded-lg p-4">
                        <MapComponent
                          latitude={property?.latitude ? parseFloat(property.latitude) : undefined}
                          longitude={property?.longitude ? parseFloat(property.longitude) : undefined}
                          propertyTitle={getTitle()}
                          propertyAddress={getLocation()}
                          height="500px"
                        />
                      </div>

                      {/* Location Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">تفاصيل الموقع</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">المدينة:</span>
                              <span className="font-medium">{property?.city || 'غير محدد'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">المنطقة:</span>
                              <span className="font-medium">{property?.area || 'غير محدد'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">القرية:</span>
                              <span className="font-medium">{property?.village || 'غير محدد'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">العنوان:</span>
                              <span className="font-medium">{property?.address || 'غير محدد'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">الإحداثيات</h4>
                          <div className="space-y-2">
                            {property?.latitude && property?.longitude ? (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">خط العرض:</span>
                                  <span className="font-medium font-mono">{property.latitude}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">خط الطول:</span>
                                  <span className="font-medium font-mono">{property.longitude}</span>
                                </div>
                                <div className="mt-3">
                                  <a
                                    href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                  >
                                    <FaMapMarkerAlt />
                                    فتح في خرائط جوجل
                                  </a>
                                </div>
                              </>
                            ) : (
                              <div className="text-gray-500 text-center py-4">
                                <FaMapMarkerAlt className="text-2xl mx-auto mb-2" />
                                <p>لم يتم تحديد الإحداثيات لهذا العقار</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Nearby Amenities */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">المرافق القريبة</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <FaCar className="text-blue-600" />
                            </div>
                            <div className="text-sm font-medium">مواقف السيارات</div>
                            <div className="text-xs text-gray-500">200م</div>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <FaBuilding className="text-green-600" />
                            </div>
                            <div className="text-sm font-medium">مركز تجاري</div>
                            <div className="text-xs text-gray-500">500م</div>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <FaMapMarkerAlt className="text-purple-600" />
                            </div>
                            <div className="text-sm font-medium">مستشفى</div>
                            <div className="text-xs text-gray-500">1.2كم</div>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <FaBuilding className="text-orange-600" />
                            </div>
                            <div className="text-sm font-medium">مدرسة</div>
                            <div className="text-xs text-gray-500">800م</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Insights Tab */}
                  {activeTab === 'ai-insights' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <FaBrain className="text-2xl text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-900">تحليل الذكاء الاصطناعي</h3>
                      </div>

                      {insightsLoading ? (
                        <div className="text-center py-8">
                          <FaSpinner className="text-2xl text-blue-600 animate-spin mx-auto mb-2" />
                          <p className="text-gray-600">جاري تحليل العقار...</p>
                        </div>
                      ) : aiInsights ? (
                        <div className="space-y-6">
                          {/* Market Analysis */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <FaChartLine className="text-blue-600" />
                                <span className="font-semibold text-gray-900">القيمة السوقية</span>
                              </div>
                              <div className="text-2xl font-bold text-blue-600">
                                {aiInsights.marketValue.toLocaleString()} ريال
                              </div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <FaRulerCombined className="text-green-600" />
                                <span className="font-semibold text-gray-900">السعر للمتر</span>
                              </div>
                              <div className="text-2xl font-bold text-green-600">
                                {aiInsights.pricePerSqm.toFixed(0)} ريال/م²
                              </div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <FaMapMarkerAlt className="text-purple-600" />
                                <span className="font-semibold text-gray-900">تقييم الحي</span>
                              </div>
                              <div className="text-2xl font-bold text-purple-600">
                                {aiInsights.neighborhoodScore}/100
                              </div>
                            </div>
                          </div>

                          {/* Market Analysis */}
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">تحليل السوق المحلي</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">متوسط السعر في المنطقة:</span>
                                  <span className="font-semibold text-green-600">
                                    {property?.purpose === 'rent' ? aiInsights.marketAnalysis.averageRentInArea : aiInsights.marketAnalysis.averageSalePriceInArea}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">مقارنة السعر:</span>
                                  <span className={`font-semibold ${
                                    aiInsights.marketAnalysis.priceComparison.includes('أعلى') ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {aiInsights.marketAnalysis.priceComparison}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">العقارات المشابهة:</span>
                                  <span className="font-semibold text-blue-600">
                                    {aiInsights.marketAnalysis.similarPropertiesCount} عقار
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="text-sm text-gray-600 font-medium">نطاق الأسعار في المنطقة:</div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>أقل سعر:</span>
                                    <span className="font-medium">{aiInsights.marketAnalysis.priceRange.min}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>متوسط السعر:</span>
                                    <span className="font-medium">{aiInsights.marketAnalysis.priceRange.median}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>أعلى سعر:</span>
                                    <span className="font-medium">{aiInsights.marketAnalysis.priceRange.max}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Investment Potential */}
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">إمكانية الاستثمار</h4>
                            <div className="flex items-center gap-3 mb-4">
                              <span className="text-3xl font-bold text-blue-600">{aiInsights.investmentPotential}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">اتجاه السوق:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  aiInsights.marketTrend === 'rising' 
                                    ? 'bg-green-100 text-green-800'
                                    : aiInsights.marketTrend === 'stable'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {aiInsights.marketTrend === 'rising' ? 'صاعد' : 
                                   aiInsights.marketTrend === 'stable' ? 'مستقر' : 'هابط'}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-700">
                              بناءً على تحليل السوق المحلي، هذا العقار يظهر إمكانية استثمارية {aiInsights.investmentPotential.toLowerCase()}.
                              تم العثور على {aiInsights.comparableProperties} عقار مشابه في المنطقة.
                            </p>
                          </div>

                          {/* Recommendations */}
                          <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">التوصيات</h4>
                            <ul className="space-y-2">
                              {aiInsights.recommendations.map((recommendation, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-700">{recommendation}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FaBrain className="text-4xl text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">لا توجد رؤى متاحة حالياً</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              
              {/* Contact Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6 z-10">
                <h3 className="text-lg font-bold text-gray-900 mb-4">تواصل معنا</h3>
                
                {property?.ownerName && (
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {property.ownerName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{property.ownerName}</div>
                        <div className="text-sm text-gray-600">مالك العقار</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {property?.ownerPhone && (
                    <a
                      href={`tel:${property.ownerPhone}`}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <FaPhone className="text-green-600" />
                      <span className="text-gray-900">{property.ownerPhone}</span>
                    </a>
                  )}
                  
                  {property?.ownerPhone && (
                    <a
                      href={`https://wa.me/${property.ownerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <FaWhatsapp className="text-green-600" />
                      <span className="text-gray-900">واتساب</span>
                    </a>
                  )}

                  {property?.ownerEmail && (
                    <a
                      href={`mailto:${property.ownerEmail}`}
                      className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <FaEnvelope className="text-blue-600" />
                      <span className="text-gray-900">{property.ownerEmail}</span>
                    </a>
                  )}
                </div>

                <div className="space-y-3 mt-4">
                  <button
                    onClick={handleBookAppointment}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <FaCalendarCheck />
                    طلب موعد للمعاينة
                  </button>
                  
                  <button
                    onClick={handleBookUnit}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <FaCreditCard />
                    حجز الوحدة
                  </button>
                  
                  <button
                    onClick={handleChatWithManagement}
                    className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <FaCommentDots />
                    دردشة مع الإدارة
                  </button>
                  
                  <button
                    onClick={handleWhatsAppContact}
                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <FaWhatsapp />
                    واتساب
                  </button>
                  
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    إرسال استفسار
                  </button>
                </div>
              </div>

              {/* Statistics Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">إحصائيات العقار</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">المشاهدات</span>
                    <span className="font-semibold text-gray-900">{statistics.views}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">المفضلة</span>
                    <span className="font-semibold text-gray-900">{statistics.favorites}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">المشاركات</span>
                    <span className="font-semibold text-gray-900">{statistics.shares}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">الاستفسارات</span>
                    <span className="font-semibold text-gray-900">{statistics.inquiries}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">إجراءات سريعة</h3>
                <div className="space-y-3">
                  <Link
                    href={`/properties/${property?.id}/edit`}
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FaEdit className="text-blue-600" />
                    <span className="text-gray-900">تعديل العقار</span>
                  </Link>
                  
                  <button
                    onClick={handlePrint}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FaPrint className="text-gray-600" />
                    <span className="text-gray-900">طباعة</span>
                  </button>
                  
                  <button
                    onClick={() => setShowQRCode(true)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FaQrcode className="text-gray-600" />
                    <span className="text-gray-900">QR Code</span>
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FaDownload className="text-gray-600" />
                    <span className="text-gray-900">تحميل PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">عقارات مشابهة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarProperties.map((similarProperty) => (
                  <Link
                    key={similarProperty.id}
                    href={`/properties/${similarProperty.id}`}
                    className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-video bg-gray-200 relative">
                      <img
                        src={similarProperty.image}
                        alt={similarProperty.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 text-gray-800 px-2 py-1 rounded text-sm font-medium">
                        {similarProperty.type}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {similarProperty.title}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <FaMapMarkerAlt className="text-xs" />
                        <span>{similarProperty.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FaBed className="text-xs" />
                            <span>{similarProperty.beds}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaBath className="text-xs" />
                            <span>{similarProperty.baths}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaRulerCombined className="text-xs" />
                            <span>{similarProperty.area}م²</span>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {similarProperty.price}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">QR Code للعقار</h3>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTrash />
                </button>
              </div>
              <div className="text-center">
                {qrCodeUrl ? (
                  <div className="mb-4">
                    <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
                    <p className="text-sm text-gray-600 mt-2">
                      امسح الكود لفتح صفحة العقار
                    </p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <FaSpinner className="text-2xl text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600">جاري إنشاء QR Code...</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    تحميل PDF
                  </button>
                  <button
                    onClick={() => setShowQRCode(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">مشاركة العقار</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTrash />
                </button>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => handleSocialShare('facebook')}
                  className="w-full flex items-center gap-3 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaFacebook />
                  <span>مشاركة على فيسبوك</span>
                </button>
                <button
                  onClick={() => handleSocialShare('twitter')}
                  className="w-full flex items-center gap-3 p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  <FaTwitter />
                  <span>مشاركة على تويتر</span>
                </button>
                <button
                  onClick={() => handleSocialShare('linkedin')}
                  className="w-full flex items-center gap-3 p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <FaLinkedin />
                  <span>مشاركة على لينكد إن</span>
                </button>
                <button
                  onClick={() => handleSocialShare('telegram')}
                  className="w-full flex items-center gap-3 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FaTelegram />
                  <span>مشاركة على تليجرام</span>
                </button>
                <button
                  onClick={() => handleSocialShare('whatsapp')}
                  className="w-full flex items-center gap-3 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FaWhatsapp />
                  <span>مشاركة على واتساب</span>
                </button>
                <button
                  onClick={() => handleSocialShare('copy')}
                  className="w-full flex items-center gap-3 p-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <FaCopy />
                  <span>نسخ الرابط</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

// تم إزالة getServerSideProps - الصفحة تحمل البيانات من API مباشرة

export default PropertyDetailsPage;
