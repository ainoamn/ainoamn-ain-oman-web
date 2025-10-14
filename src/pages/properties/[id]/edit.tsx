import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  FaHome, FaBuilding, FaMapMarkerAlt, FaImages, FaSave, FaArrowLeft,
  FaPlus, FaTrash, FaUpload, FaInfoCircle, FaCog, FaUser, FaPhone,
  FaEnvelope, FaTag, FaRuler, FaBed, FaBath, FaCar, FaSwimmingPool,
  FaWifi, FaRobot, FaShieldAlt, FaTree, FaUtensils, FaShoppingCart,
  FaHospital, FaGraduationCap, FaPlane, FaSubway, FaBus, FaTaxi,
  FaFireExtinguisher, FaVideo, FaSpinner, FaMap, FaPrint, FaEye,
  FaParking, FaGamepad, FaTv, FaSnowflake,
  FaSun, FaWind, FaWater, FaBolt, FaLock, FaKey,
  FaDog, FaCat, FaChild, FaWheelchair, FaDoorOpen,
  FaWindowMaximize, FaCouch, FaChair, FaTable, FaBed as FaBedIcon,
  FaBath as FaBathIcon, FaSwimmer,
  FaRunning, FaBicycle, FaMotorcycle, FaTruck, FaShip, FaAnchor,
  FaMountain, FaUmbrellaBeach, FaCampground, FaHiking, FaCamera,
  FaMusic, FaBook, FaLaptop, FaDesktop, FaMobile, FaTablet,
  FaHeadphones, FaMicrophone, FaVolumeUp, FaVolumeDown, FaVolumeMute,
  FaBox, FaFire, FaCopy
} from 'react-icons/fa';

// الواجهات
interface PropertyFormData {
  // Basic Information
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  
  // Location
  province: string;
  state: string;
  city: string;
  village: string;
  address: string;
  
  // Single unit details
  halls: string;
  majlis: string;
  kitchens: string;
  latitude: string;
  longitude: string;
  mapAddress: string;
  
  // Property Details
  type: string;
  usageType: string;
  purpose: string;
  buildingType: 'single' | 'multi';
  buildingAge: string;
  area: string;
  beds: string;
  baths: string;
  floors: string;
  totalUnits: string;
  totalArea: string;
  
  // Pricing
  priceOMR: string;
  rentalPrice: string;
  
  // Features
  amenities: string[];
  customAmenities: string[];
  
  // Media
  images: File[];
  videoUrl: string;
  coverIndex: number;
  
  // Contact
  useUserContact: boolean;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  
  // Additional
  notes: string;
  published: boolean;
  referenceNo: string;
  surveyNumber: string;
  landNumber: string;
  
  // Units (for multi-unit buildings)
  units: UnitData[];
}

interface UnitData {
  id: string;
  unitNo: string;
  type: string;
  area: string;
  beds: string;
  baths: string;
  price: string;
  rentalPrice: string;
  status: string;
  features: string[];
  images: File[];
  halls: string;
  majlis: string;
  amenities: string[];
  videoUrl: string;
  videoFile: File | null;
  paymentMethods: string[];
  deposit: string;
}

// الثوابت
const PROPERTY_TYPES = [
  { value: 'apartment', label: 'شقة' },
  { value: 'villa', label: 'فيلا' },
  { value: 'house', label: 'منزل' },
  { value: 'office', label: 'مكتب' },
  { value: 'shop', label: 'محل' },
  { value: 'warehouse', label: 'مستودع' },
  { value: 'land', label: 'أرض' },
  { value: 'building', label: 'مبنى' }
];

const USAGE_TYPES = [
  { value: 'residential', label: 'سكني' },
  { value: 'commercial', label: 'تجاري' },
  { value: 'mixed', label: 'مختلط' },
  { value: 'industrial', label: 'صناعي' },
  { value: 'tourism', label: 'سياحي' },
  { value: 'agricultural', label: 'زراعي' }
];

const PURPOSES = [
  { value: 'sale', label: 'للبيع' },
  { value: 'rent', label: 'للإيجار' },
  { value: 'investment', label: 'للاستثمار' }
];

const BUILDING_AGES = [
  { value: 'under-construction', label: 'قيد الإنشاء' },
  { value: 'new', label: 'جديد (0-2 سنة)' },
  { value: 'modern', label: 'حديث (3-10 سنوات)' },
  { value: 'old', label: 'قديم (10+ سنوات)' }
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'نقداً' },
  { value: 'checks', label: 'شيكات' },
  { value: 'bank-transfer', label: 'تحويل بنكي' },
  { value: 'electronic', label: 'دفع إلكتروني' }
];

const PROVINCES = ['مسقط', 'ظفار', 'الباطنة', 'الظاهرة', 'الداخلية', 'الشرقية', 'الوسطى'];

const PROVINCE_STATES: { [key: string]: string[] } = {
  'مسقط': ['مسقط', 'مطرح', 'السيب', 'قريات', 'العامرات'],
  'ظفار': ['صلالة', 'طاقة', 'مرباط', 'ضلكوت', 'مقشن'],
  'الباطنة': ['صحار', 'الرستاق', 'شناص', 'لوى', 'السويق'],
  'الظاهرة': ['عبري', 'ينقل', 'ضنك', 'البريمي'],
  'الداخلية': ['نزوى', 'بهلاء', 'منح', 'الحمراء', 'أدم'],
  'الشرقية': ['صور', 'إبراء', 'المضيبي', 'بدية', 'وادي بني خالد'],
  'الوسطى': ['هيما', 'محوت', 'الدقم', 'الجازر']
};

const STATE_CITIES: { [key: string]: string[] } = {
  'مسقط': ['الخوير', 'الغبرة', 'الوطية', 'الروضة', 'الغبرة الجنوبية'],
  'مطرح': ['مطرح', 'الوطية', 'الغبرة', 'الخوير'],
  'صلالة': ['الحافة', 'النهضة', 'السلامة', 'الغبرة'],
  'صحار': ['الخابورة', 'الرستاق', 'شناص', 'لوى']
};

const AMENITIES = [
  // المواصلات
  { id: 'parking', label: 'موقف سيارات', icon: FaCar, category: 'transport' },
  { id: 'elevator', label: 'مصعد', icon: FaBuilding, category: 'transport' },
  { id: 'metro', label: 'مترو', icon: FaSubway, category: 'transport' },
  { id: 'bus', label: 'حافلات', icon: FaBus, category: 'transport' },
  { id: 'taxi', label: 'تاكسي', icon: FaTaxi, category: 'transport' },
  { id: 'airport', label: 'مطار', icon: FaPlane, category: 'transport' },
  
  // المرافق الترفيهية
  { id: 'pool', label: 'مسبح', icon: FaSwimmingPool, category: 'recreation' },
  { id: 'gym', label: 'صالة رياضية', icon: FaRunning, category: 'recreation' },
  { id: 'tennis', label: 'ملعب تنس', icon: FaGamepad, category: 'recreation' },
  { id: 'basketball', label: 'ملعب كرة سلة', icon: FaGamepad, category: 'recreation' },
  { id: 'football', label: 'ملعب كرة قدم', icon: FaGamepad, category: 'recreation' },
  { id: 'garden', label: 'حديقة', icon: FaTree, category: 'recreation' },
  { id: 'balcony', label: 'شرفة', icon: FaWindowMaximize, category: 'recreation' },
  
  // التكنولوجيا
  { id: 'wifi', label: 'واي فاي', icon: FaWifi, category: 'technology' },
  { id: 'tv', label: 'تلفزيون', icon: FaTv, category: 'technology' },
  { id: 'cctv', label: 'كاميرات مراقبة', icon: FaVideo, category: 'technology' },
  { id: 'smart-home', label: 'منزل ذكي', icon: FaCog, category: 'technology' },
  
  // الأمان
  { id: 'security', label: 'أمن', icon: FaShieldAlt, category: 'security' },
  { id: 'fire-safety', label: 'أمان من الحرائق', icon: FaFireExtinguisher, category: 'security' },
  { id: 'lock', label: 'أقفال أمنية', icon: FaLock, category: 'security' },
  { id: 'key-card', label: 'بطاقة مفتاح', icon: FaKey, category: 'security' },
  
  // الخدمات
  { id: 'kitchen', label: 'مطبخ', icon: FaUtensils, category: 'services' },
  { id: 'shopping', label: 'مراكز تسوق', icon: FaShoppingCart, category: 'services' },
  { id: 'hospital', label: 'مستشفى', icon: FaHospital, category: 'services' },
  { id: 'school', label: 'مدرسة', icon: FaGraduationCap, category: 'services' },
  { id: 'pharmacy', label: 'صيدلية', icon: FaHospital, category: 'services' },
  
  // الراحة
  { id: 'ac', label: 'تكييف', icon: FaSnowflake, category: 'comfort' },
  { id: 'heating', label: 'تدفئة', icon: FaSun, category: 'comfort' },
  { id: 'furnished', label: 'مفروش', icon: FaCouch, category: 'comfort' },
  { id: 'balcony', label: 'شرفة', icon: FaWindowMaximize, category: 'comfort' },
  
  // الحيوانات الأليفة
  { id: 'pet-friendly', label: 'مسموح الحيوانات الأليفة', icon: FaDog, category: 'pets' },
  { id: 'no-pets', label: 'غير مسموح الحيوانات الأليفة', icon: FaCat, category: 'pets' },
  
  // إمكانية الوصول
  { id: 'wheelchair', label: 'متاح للكراسي المتحركة', icon: FaWheelchair, category: 'accessibility' },
  { id: 'child-friendly', label: 'مناسب للأطفال', icon: FaChild, category: 'accessibility' },
  
  // المرافق الإضافية
  { id: 'laundry', label: 'غسيل', icon: FaWater, category: 'utilities' },
  { id: 'storage', label: 'مخزن', icon: FaBox, category: 'utilities' },
  { id: 'water', label: 'مياه', icon: FaWater, category: 'utilities' },
  { id: 'electricity', label: 'كهرباء', icon: FaBolt, category: 'utilities' },
  { id: 'gas', label: 'غاز', icon: FaFire, category: 'utilities' }
];

export default function EditProperty({ property }: { property: any }) {
  const router = useRouter();
  const { id } = router.query;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  
  // تشخيص: طباعة البيانات المستلمة
  console.log('EditProperty component received property:', property);
  console.log('EditProperty component received id:', id);
  const [customAmenity, setCustomAmenity] = useState('');
  const [filteredStates, setFilteredStates] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);

  const [formData, setFormData] = useState<PropertyFormData>({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    province: '',
    state: '',
    city: '',
    village: '',
    address: '',
    halls: '',
    majlis: '',
    kitchens: '',
    latitude: '',
    longitude: '',
    mapAddress: '',
    type: '',
    usageType: '',
    purpose: '',
    buildingType: 'single',
    buildingAge: '',
    area: '',
    beds: '',
    baths: '',
    floors: '',
    totalUnits: '',
    totalArea: '',
    priceOMR: '',
    rentalPrice: '',
    amenities: [],
    customAmenities: [],
    images: [],
    videoUrl: '',
    coverIndex: 0,
    useUserContact: true,
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    notes: '',
    published: false,
    referenceNo: '',
    surveyNumber: '',
    landNumber: '',
    units: []
  });

  // Load property data from API - حل مباشر للمشكلة
  useEffect(() => {
    if (id) {
      console.log('Loading property data from API for ID:', id);
      loadPropertyData();
    } else {
      console.log('No ID - new property form');
      const refNo = `P-${Date.now()}`;
      setFormData(prev => ({ ...prev, referenceNo: refNo }));
      setLoading(false);
    }
  }, [id]);

  // تحميل بيانات العقار من getServerSideProps
  const loadPropertyDataFromProps = async (propertyData: any) => {
    try {
      setLoading(true);
      
      console.log('=== LOADING PROPERTY DATA ===');
      console.log('Property data received:', propertyData);
      
      // إصلاح مشكلة الترميز المشوه
      const fixCorruptedText = (text: string): string => {
        if (!text) return '';
        if (text.includes('') || text.includes('') || text.includes('')) {
          return '';
        }
        return text;
      };

      // تحميل الصور إذا كانت موجودة
      let loadedImages: File[] = [];
      if (propertyData.images && propertyData.images.length > 0) {
        loadedImages = await loadImagesFromServer(propertyData.images);
      }

      // تحديث البيانات مباشرة
      const newFormData = {
        titleAr: fixCorruptedText(propertyData.titleAr || propertyData.title?.ar || ''),
        titleEn: fixCorruptedText(propertyData.titleEn || propertyData.title?.en || ''),
        descriptionAr: fixCorruptedText(propertyData.description?.ar || propertyData.descriptionAr || ''),
        descriptionEn: fixCorruptedText(propertyData.description?.en || propertyData.descriptionEn || ''),
        province: fixCorruptedText(propertyData.province || ''),
        state: fixCorruptedText(propertyData.state || ''),
        city: fixCorruptedText(propertyData.city || ''),
        village: fixCorruptedText(propertyData.village || ''),
        address: fixCorruptedText(propertyData.address || ''),
        halls: propertyData.halls || '',
        majlis: propertyData.majlis || '',
        kitchens: propertyData.kitchens || '',
        latitude: propertyData.latitude || '',
        longitude: propertyData.longitude || '',
        mapAddress: propertyData.mapAddress || '',
        type: propertyData.type || 'apartment',
        usageType: propertyData.usageType || 'residential',
        purpose: propertyData.purpose || 'rent',
        buildingType: propertyData.buildingType || 'single',
        buildingAge: propertyData.buildingAge || '',
        area: propertyData.area?.toString() || '',
        beds: propertyData.beds?.toString() || '',
        baths: propertyData.baths?.toString() || '',
        floors: propertyData.floors?.toString() || '',
        totalUnits: propertyData.totalUnits?.toString() || '',
        totalArea: propertyData.totalArea?.toString() || '',
        priceOMR: propertyData.priceOMR?.toString() || '',
        rentalPrice: propertyData.rentalPrice?.toString() || '',
        amenities: propertyData.amenities || [],
        customAmenities: propertyData.customAmenities || [],
        images: loadedImages,
        videoUrl: propertyData.videoUrl || '',
        coverIndex: propertyData.coverIndex || 0,
        useUserContact: !propertyData.ownerName,
        ownerName: propertyData.ownerName || '',
        ownerPhone: propertyData.ownerPhone || '',
        ownerEmail: propertyData.ownerEmail || '',
        notes: propertyData.notes || '',
        published: propertyData.published || false,
        referenceNo: propertyData.referenceNo || propertyData.id || '',
        surveyNumber: propertyData.surveyNumber || '',
        landNumber: propertyData.landNumber || '',
        units: propertyData.units || []
      };

      console.log('=== SETTING FORM DATA ===');
      console.log('New form data:', newFormData);
      
      setFormData(newFormData);
      
      // تحديث القوائم المفلترة
      if (propertyData.province) {
        setFilteredStates(PROVINCE_STATES[propertyData.province] || []);
      }
      if (propertyData.state) {
        setFilteredCities(STATE_CITIES[propertyData.state] || []);
      }

      setLoading(false);
      console.log('=== FORM DATA LOADED SUCCESSFULLY ===');
    } catch (error) {
      console.error('Error loading property data from props:', error);
      setLoading(false);
    }
  };

  // وظيفة تحميل الصور من الخادم
  const loadImagesFromServer = async (imageUrls: string[]): Promise<File[]> => {
    const imageFiles: File[] = [];
    
    if (!imageUrls || imageUrls.length === 0) {
      return imageFiles;
    }
    
    for (const imageUrl of imageUrls) {
      try {
        // تحقق من أن الرابط صحيح
        if (!imageUrl || typeof imageUrl !== 'string') {
          continue;
        }
        
        // إضافة http:// إذا لم يكن موجوداً
        const fullUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:3000${imageUrl}`;
        
        const response = await fetch(fullUrl);
        if (response.ok) {
          const blob = await response.blob();
          const fileName = imageUrl.split('/').pop() || `image-${Date.now()}.jpg`;
          const file = new File([blob], fileName, { type: blob.type });
          imageFiles.push(file);
          console.log('Successfully loaded image:', fileName);
        } else {
          console.warn('Failed to load image:', fullUrl, response.status);
        }
      } catch (error) {
        console.error('Error loading image:', imageUrl, error);
      }
    }
    
    console.log(`Loaded ${imageFiles.length} images out of ${imageUrls.length}`);
    return imageFiles;
  };

  const loadPropertyData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/${id}`);
      if (response.ok) {
        const data = await response.json();
        const property = data.item;
        
        console.log('Loaded property data:', property);
        
        // إصلاح مشكلة الترميز المشوه
        const fixCorruptedText = (text: string): string => {
          if (!text) return '';
          if (text.includes('�') || text.includes('�') || text.includes('�')) {
            return '';
          }
          return text;
        };
        
        // تحميل الصور من الخادم
        setLoadingImages(true);
        const loadedImages = await loadImagesFromServer(property.images || []);
        
        // تحميل صور الوحدات
        const unitsArray = Array.isArray(property.units) ? property.units : [];
        const loadedUnits = await Promise.all(
          unitsArray.map(async (unit: any, index: number) => {
            const unitImages = await loadImagesFromServer(unit.images || []);
            return {
              id: unit.id || `unit-${index}`,
              unitNo: unit.unitNo || `U${index + 1}`,
              type: unit.type || '',
              area: unit.area?.toString() || '',
              beds: unit.beds?.toString() || '',
              baths: unit.baths?.toString() || '',
              price: unit.price?.toString() || unit.priceOMR?.toString() || '',
              rentalPrice: unit.rentalPrice?.toString() || unit.rentAmount?.toString() || '',
              status: unit.status || 'available',
              features: Array.isArray(unit.features) ? unit.features : [],
              images: unitImages,
              halls: unit.halls || '',
              majlis: unit.majlis || '',
              amenities: Array.isArray(unit.amenities) ? unit.amenities : [],
              videoUrl: unit.videoUrl || '',
              videoFile: null,
              paymentMethods: Array.isArray(unit.paymentMethods) ? unit.paymentMethods : [],
              deposit: unit.deposit || ''
            };
          })
        );
        
        setLoadingImages(false);
        
        // تحويل البيانات إلى تنسيق النموذج
        setFormData({
          titleAr: fixCorruptedText(property.titleAr || property.title?.ar || ''),
          titleEn: fixCorruptedText(property.titleEn || property.title?.en || ''),
          descriptionAr: fixCorruptedText(property.descriptionAr || property.description?.ar || ''),
          descriptionEn: fixCorruptedText(property.descriptionEn || property.description?.en || ''),
          province: fixCorruptedText(property.province || ''),
          state: fixCorruptedText(property.state || ''),
          city: fixCorruptedText(property.city || ''),
          village: fixCorruptedText(property.village || ''),
          address: fixCorruptedText(property.address || ''),
          halls: property.halls || '',
          majlis: property.majlis || '',
          kitchens: property.kitchens || '',
          latitude: property.latitude || property.geo?.latitude || '',
          longitude: property.longitude || property.geo?.longitude || '',
          mapAddress: property.mapAddress || '',
          type: property.type || '',
          usageType: property.usageType || property.category || '',
          purpose: property.purpose || '',
          buildingType: property.buildingType || (property.units && property.units.length > 1 ? 'multi' : 'single'),
          buildingAge: property.buildingAge || property.age || '',
          area: property.area?.toString() || '',
          beds: property.beds?.toString() || '',
          baths: property.baths?.toString() || '',
          floors: property.floors?.toString() || '',
          totalUnits: property.totalUnits?.toString() || property.units?.length?.toString() || '',
          totalArea: property.totalArea?.toString() || '',
          priceOMR: property.priceOMR?.toString() || '',
          rentalPrice: property.rentalPrice?.toString() || '',
          amenities: Array.isArray(property.amenities) ? property.amenities.filter((a: string) => !fixCorruptedText(a).includes('�')) : [],
          customAmenities: Array.isArray(property.customAmenities) ? property.customAmenities.filter((a: string) => !fixCorruptedText(a).includes('�')) : [],
          images: loadedImages, // تحميل الصور من الخادم
          videoUrl: property.videoUrl || '',
          coverIndex: property.coverIndex || 0,
          useUserContact: property.useUserContact !== false,
          ownerName: fixCorruptedText(property.ownerName || property.owner?.nameAr || ''),
          ownerPhone: property.ownerPhone || property.owner?.phone || '',
          ownerEmail: property.ownerEmail || property.owner?.email || '',
          notes: property.notes || '',
          published: property.published || false,
          referenceNo: property.referenceNo || property.id || '',
          surveyNumber: property.surveyNumber || property.geo?.landNo || '',
          landNumber: property.landNumber || property.geo?.mapNo || '',
          units: loadedUnits
        });

        // تحديث القوائم المفلترة
        if (property.province) {
          setFilteredStates(PROVINCE_STATES[property.province] || []);
        }
        if (property.state) {
          setFilteredCities(STATE_CITIES[property.state] || []);
        }
      } else {
        console.error('Failed to load property:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // AI Translation function
  const translateText = (text: string, fromLang: 'ar' | 'en', toLang: 'ar' | 'en'): string => {
    if (!text.trim()) return '';
    
    const translations: { [key: string]: { ar: string; en: string } } = {
      'فيلا': { ar: 'فيلا', en: 'Villa' },
      'شقة': { ar: 'شقة', en: 'Apartment' },
      'منزل': { ar: 'منزل', en: 'House' },
      'مكتب': { ar: 'مكتب', en: 'Office' },
      'محل': { ar: 'محل', en: 'Shop' },
      'مستودع': { ar: 'مستودع', en: 'Warehouse' },
      'أرض': { ar: 'أرض', en: 'Land' },
      'مبنى': { ar: 'مبنى', en: 'Building' },
      'للبيع': { ar: 'للبيع', en: 'For Sale' },
      'للإيجار': { ar: 'للإيجار', en: 'For Rent' },
      'للاستثمار': { ar: 'للاستثمار', en: 'For Investment' },
      'سكني': { ar: 'سكني', en: 'Residential' },
      'تجاري': { ar: 'تجاري', en: 'Commercial' },
      'مختلط': { ar: 'مختلط', en: 'Mixed' },
      'صناعي': { ar: 'صناعي', en: 'Industrial' },
      'سياحي': { ar: 'سياحي', en: 'Tourism' },
      'زراعي': { ar: 'زراعي', en: 'Agricultural' }
    };

    // Try exact match first
    if (translations[text]) {
      return translations[text][toLang];
    }

    // Try partial match
    for (const [key, value] of Object.entries(translations)) {
      if (text.includes(key)) {
        return text.replace(key, value[toLang]);
      }
    }

    // If no translation found, return original text
    return text;
  };

  // AI Description Generation
  const generateDescription = (lang: 'ar' | 'en'): string => {
    const typeLabels = {
      'apartment': { ar: 'شقة', en: 'Apartment' },
      'villa': { ar: 'فيلا', en: 'Villa' },
      'house': { ar: 'منزل', en: 'House' },
      'office': { ar: 'مكتب', en: 'Office' },
      'shop': { ar: 'محل', en: 'Shop' },
      'warehouse': { ar: 'مستودع', en: 'Warehouse' },
      'land': { ar: 'أرض', en: 'Land' },
      'building': { ar: 'مبنى', en: 'Building' }
    };

    const purposeLabels = {
      'sale': { ar: 'للبيع', en: 'For Sale' },
      'rent': { ar: 'للإيجار', en: 'For Rent' },
      'investment': { ar: 'للاستثمار', en: 'For Investment' }
    };

    const usageLabels = {
      'residential': { ar: 'سكني', en: 'Residential' },
      'commercial': { ar: 'تجاري', en: 'Commercial' },
      'mixed': { ar: 'مختلط', en: 'Mixed' },
      'industrial': { ar: 'صناعي', en: 'Industrial' },
      'tourism': { ar: 'سياحي', en: 'Tourism' },
      'agricultural': { ar: 'زراعي', en: 'Agricultural' }
    };

    const ageLabels = {
      'under-construction': { ar: 'قيد الإنشاء', en: 'Under Construction' },
      'new': { ar: 'جديد (0-2 سنة)', en: 'New (0-2 years)' },
      'modern': { ar: 'حديث (3-10 سنوات)', en: 'Modern (3-10 years)' },
      'old': { ar: 'قديم (10+ سنوات)', en: 'Old (10+ years)' }
    };

    const type = typeLabels[formData.type as keyof typeof typeLabels]?.[lang] || formData.type;
    const purpose = purposeLabels[formData.purpose as keyof typeof purposeLabels]?.[lang] || formData.purpose;
    const usage = usageLabels[formData.usageType as keyof typeof usageLabels]?.[lang] || formData.usageType;
    const location = formData.province && formData.state ? `${formData.state}, ${formData.province}` : '';
    const area = formData.area ? `${formData.area} م²` : '';
    const beds = formData.beds ? `${formData.beds} غرف` : '';
    const baths = formData.baths ? `${formData.baths} حمامات` : '';
    const buildingAge = ageLabels[formData.buildingAge as keyof typeof ageLabels]?.[lang] || formData.buildingAge;
    
    // Get selected amenities
    const selectedAmenities = formData.amenities.map(amenityId => {
      const amenity = AMENITIES.find(a => a.id === amenityId);
      return amenity ? amenity.label : '';
    }).filter(Boolean);

    if (lang === 'ar') {
      let description = `${type} ${usage} ${purpose} في ${location}.`;
      
      if (area) description += ` المساحة: ${area}`;
      if (beds) description += `، ${beds}`;
      if (baths) description += `، ${baths}`;
      if (buildingAge) description += `. عمر المبنى: ${buildingAge}`;
      
      if (selectedAmenities.length > 0) {
        description += `. يحتوي على: ${selectedAmenities.slice(0, 5).join('، ')}`;
        if (selectedAmenities.length > 5) {
          description += ` و${selectedAmenities.length - 5} مزايا أخرى`;
        }
      }
      
      if (formData.buildingType === 'multi' && formData.totalUnits) {
        description += `. مبنى متعدد الوحدات يحتوي على ${formData.totalUnits} وحدة`;
      }
      
      description += '. موقع مميز ومناسب لجميع الاحتياجات.';
      
      return description;
    } else {
      let description = `${type} ${usage} property ${purpose} in ${location}.`;
      
      if (area) description += ` Area: ${area}`;
      if (beds) description += `, ${beds}`;
      if (baths) description += `, ${baths}`;
      if (buildingAge) description += `. Building age: ${buildingAge}`;
      
      if (selectedAmenities.length > 0) {
        description += `. Features: ${selectedAmenities.slice(0, 5).join(', ')}`;
        if (selectedAmenities.length > 5) {
          description += ` and ${selectedAmenities.length - 5} other amenities`;
        }
      }
      
      if (formData.buildingType === 'multi' && formData.totalUnits) {
        description += `. Multi-unit building with ${formData.totalUnits} units`;
      }
      
      description += '. Prime location suitable for all needs.';
      
      return description;
    }
  };

  // Auto-save function
  const autoSave = async () => {
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          published: false,
          status: 'draft'
        })
      });
      
      if (response.ok) {
        console.log('Auto-saved successfully');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  // Print function
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Convert images to base64 for printing
    const convertImagesToBase64 = (images: File[]) => {
      return Promise.all(images.map(image => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve(''); // Return empty string if image fails to load
          reader.readAsDataURL(image);
        });
      }));
    };

    // Convert unit images to base64
    const convertUnitImagesToBase64 = (units: any[]) => {
      return Promise.all(units.map(unit => {
        if (unit.images && unit.images.length > 0) {
          return convertImagesToBase64(unit.images);
        }
        return Promise.resolve([]);
      }));
    };

    Promise.all([
      convertImagesToBase64(formData.images),
      convertUnitImagesToBase64(formData.units)
    ]).then(([imageBase64s, unitImageBase64s]) => {
      const printContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>تقرير العقار - ${formData.titleAr}</title>
          <style>
            @page { 
              size: A4; 
              margin: 1.5cm; 
            }
            body { 
              font-family: 'Arial', sans-serif; 
              line-height: 1.6; 
              color: #333; 
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #2563eb; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .header h1 { 
              color: #2563eb; 
              font-size: 24px; 
              margin: 0; 
              font-weight: bold;
            }
            .header p { 
              color: #666; 
              font-size: 12px; 
              margin: 3px 0; 
            }
            .section { 
              margin-bottom: 20px; 
              page-break-inside: avoid;
            }
            .section h2 { 
              color: #2563eb; 
              font-size: 16px; 
              border-bottom: 2px solid #e5e7eb; 
              padding-bottom: 8px; 
              margin-bottom: 12px; 
              font-weight: bold;
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 10px; 
              margin-bottom: 15px; 
            }
            .info-item { 
              display: flex; 
              justify-content: space-between; 
              padding: 6px 0; 
              border-bottom: 1px dotted #d1d5db; 
              font-size: 11px;
            }
            .info-label { 
              font-weight: bold; 
              color: #374151; 
            }
            .info-value { 
              color: #6b7280; 
            }
            .amenities-grid { 
              display: grid; 
              grid-template-columns: repeat(4, 1fr); 
              gap: 8px; 
            }
            .amenity-item { 
              background: #f3f4f6; 
              padding: 6px; 
              border-radius: 4px; 
              text-align: center; 
              font-size: 10px;
            }
            .images-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              margin: 15px 0;
            }
            .image-item {
              text-align: center;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              padding: 5px;
            }
            .image-item img {
              width: 100%;
              height: 80px;
              object-fit: cover;
              border-radius: 4px;
            }
            .image-item .cover-badge {
              background: #10b981;
              color: white;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 9px;
              margin-top: 3px;
              display: inline-block;
            }
            .units-section {
              margin-top: 20px;
            }
            .unit-item {
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              padding: 10px;
              margin-bottom: 10px;
            }
            .unit-header {
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 8px;
            }
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              font-size: 10px; 
              color: #9ca3af; 
              border-top: 1px solid #e5e7eb; 
              padding-top: 15px; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${formData.titleAr || 'تقرير العقار'}</h1>
            <h2 style="color: #4b5563; font-size: 18px; margin: 10px 0;">${formData.titleEn || ''}</h2>
            <p>رقم المرجع: ${formData.referenceNo}</p>
            <p>تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}</p>
            ${formData.surveyNumber ? `<p>رقم الرسم المساحي: ${formData.surveyNumber}</p>` : ''}
            ${formData.landNumber ? `<p>رقم الأرض: ${formData.landNumber}</p>` : ''}
          </div>

          <div class="section">
            <h2>معلومات العقار الأساسية</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">نوع العقار:</span>
                <span class="info-value">${formData.type}</span>
              </div>
              <div class="info-item">
                <span class="info-label">نوع الاستخدام:</span>
                <span class="info-value">${formData.usageType}</span>
              </div>
              <div class="info-item">
                <span class="info-label">الغرض:</span>
                <span class="info-value">${formData.purpose}</span>
              </div>
              <div class="info-item">
                <span class="info-label">نوع المبنى:</span>
                <span class="info-value">${formData.buildingType === 'single' ? 'عقار وحيد' : 'مبنى متعدد الوحدات'}</span>
              </div>
              ${formData.buildingType === 'multi' ? `
              <div class="info-item">
                <span class="info-label">إجمالي الوحدات:</span>
                <span class="info-value">${formData.totalUnits}</span>
              </div>
              <div class="info-item">
                <span class="info-label">إجمالي المساحة:</span>
                <span class="info-value">${formData.totalArea} م²</span>
              </div>
              <div class="info-item">
                <span class="info-label">عدد الطوابق:</span>
                <span class="info-value">${formData.floors}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <div class="section">
            <h2>الموقع والتفاصيل</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">المحافظة:</span>
                <span class="info-value">${formData.province}</span>
              </div>
              <div class="info-item">
                <span class="info-label">الولاية:</span>
                <span class="info-value">${formData.state}</span>
              </div>
              <div class="info-item">
                <span class="info-label">المدينة:</span>
                <span class="info-value">${formData.city}</span>
              </div>
              <div class="info-item">
                <span class="info-label">القرية/الحي:</span>
                <span class="info-value">${formData.village}</span>
              </div>
              <div class="info-item">
                <span class="info-label">المساحة:</span>
                <span class="info-value">${formData.area} م²</span>
              </div>
              <div class="info-item">
                <span class="info-label">عمر المبنى:</span>
                <span class="info-value">${formData.buildingAge}</span>
              </div>
              ${formData.buildingType === 'single' ? `
              <div class="info-item">
                <span class="info-label">عدد الغرف:</span>
                <span class="info-value">${formData.beds}</span>
              </div>
              <div class="info-item">
                <span class="info-label">عدد الحمامات:</span>
                <span class="info-value">${formData.baths}</span>
              </div>
              <div class="info-item">
                <span class="info-label">عدد القاعات:</span>
                <span class="info-value">${formData.halls}</span>
              </div>
              <div class="info-item">
                <span class="info-label">عدد المجالس:</span>
                <span class="info-value">${formData.majlis}</span>
              </div>
              <div class="info-item">
                <span class="info-label">عدد المطابخ:</span>
                <span class="info-value">${formData.kitchens}</span>
              </div>
              ` : ''}
            </div>
            <div class="info-item">
              <span class="info-label">العنوان التفصيلي:</span>
              <span class="info-value">${formData.address}</span>
            </div>
            ${formData.latitude && formData.longitude ? `
            <div class="info-item">
              <span class="info-label">الإحداثيات:</span>
              <span class="info-value">${formData.latitude}, ${formData.longitude}</span>
            </div>
            ` : ''}
            ${formData.mapAddress ? `
            <div class="info-item">
              <span class="info-label">عنوان الخريطة:</span>
              <span class="info-value">${formData.mapAddress}</span>
            </div>
            ` : ''}
          </div>

          ${formData.descriptionAr || formData.descriptionEn ? `
          <div class="section">
            <h2>وصف العقار</h2>
            ${formData.descriptionAr ? `
            <div style="margin-bottom: 15px;">
              <h3 style="color: #374151; font-size: 14px; margin-bottom: 8px;">الوصف بالعربية:</h3>
              <p style="line-height: 1.8; color: #4b5563; text-align: justify;">${formData.descriptionAr}</p>
            </div>
            ` : ''}
            ${formData.descriptionEn ? `
            <div>
              <h3 style="color: #374151; font-size: 14px; margin-bottom: 8px;">الوصف بالإنجليزية:</h3>
              <p style="line-height: 1.8; color: #4b5563; text-align: justify;">${formData.descriptionEn}</p>
            </div>
            ` : ''}
          </div>
          ` : ''}

          ${formData.images.length > 0 ? `
          <div class="section">
            <h2>صور العقار</h2>
            <div class="images-grid">
              ${imageBase64s.map((imageBase64, index) => `
                <div class="image-item">
                  <img src="${imageBase64}" alt="صورة العقار ${index + 1}" />
                  ${index === formData.coverIndex ? '<div class="cover-badge">صورة الغلاف</div>' : ''}
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <div class="section">
            <h2>المزايا والخدمات</h2>
            <div class="amenities-grid">
              ${formData.amenities.map(amenityId => {
                const amenity = AMENITIES.find(a => a.id === amenityId);
                return amenity ? `<div class="amenity-item">${amenity.label}</div>` : '';
              }).join('')}
              ${formData.customAmenities.map(amenity => 
                `<div class="amenity-item">${amenity}</div>`
              ).join('')}
            </div>
          </div>

          <div class="section">
            <h2>التسعير</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">السعر:</span>
                <span class="info-value">${formData.priceOMR ? formData.priceOMR + ' ريال عماني' : 'غير محدد'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">الإيجار الشهري:</span>
                <span class="info-value">${formData.rentalPrice ? formData.rentalPrice + ' ريال عماني' : 'غير محدد'}</span>
              </div>
            </div>
          </div>

          ${formData.buildingType === 'multi' && formData.units.length > 0 ? `
          <div class="section units-section">
            <h2>تفاصيل الوحدات</h2>
            ${formData.units.map((unit, unitIndex) => `
              <div class="unit-item">
                <div class="unit-header">الوحدة ${unit.unitNo}</div>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">نوع الوحدة:</span>
                    <span class="info-value">${unit.type}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">المساحة:</span>
                    <span class="info-value">${unit.area} م²</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">عدد الغرف:</span>
                    <span class="info-value">${unit.beds}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">عدد الحمامات:</span>
                    <span class="info-value">${unit.baths}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">عدد القاعات:</span>
                    <span class="info-value">${unit.halls}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">عدد المجالس:</span>
                    <span class="info-value">${unit.majlis}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">الإيجار الشهري:</span>
                    <span class="info-value">${unit.rentalPrice} ريال عماني</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">الضمان:</span>
                    <span class="info-value">${unit.deposit} ريال عماني</span>
                  </div>
                </div>
                ${unit.amenities && unit.amenities.length > 0 ? `
                <div style="margin-top: 10px;">
                  <h4 style="color: #374151; font-size: 12px; margin-bottom: 5px;">مزايا الوحدة:</h4>
                  <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                    ${unit.amenities.map(amenity => `
                      <span style="background: #e5e7eb; padding: 2px 6px; border-radius: 3px; font-size: 10px;">${amenity}</span>
                    `).join('')}
                  </div>
                </div>
                ` : ''}
                ${unitImageBase64s[unitIndex] && unitImageBase64s[unitIndex].length > 0 ? `
                <div style="margin-top: 10px;">
                  <h4 style="color: #374151; font-size: 12px; margin-bottom: 5px;">صور الوحدة:</h4>
                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;">
                    ${unitImageBase64s[unitIndex].map((imageBase64, imgIndex) => `
                      <div style="text-align: center; border: 1px solid #e5e7eb; border-radius: 3px; padding: 3px;">
                        <img src="${imageBase64}" alt="صورة الوحدة ${imgIndex + 1}" style="width: 100%; height: 50px; object-fit: cover; border-radius: 2px;" />
                      </div>
                    `).join('')}
                  </div>
                </div>
                ` : ''}
                ${unit.videoUrl ? `
                <div style="margin-top: 10px;">
                  <h4 style="color: #374151; font-size: 12px; margin-bottom: 5px;">فيديو الوحدة:</h4>
                  <p style="font-size: 10px; color: #6b7280;">${unit.videoUrl}</p>
                </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div class="section">
            <h2>معلومات الاتصال</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">اسم المالك:</span>
                <span class="info-value">${formData.ownerName}</span>
              </div>
              <div class="info-item">
                <span class="info-label">رقم الهاتف:</span>
                <span class="info-value">${formData.ownerPhone}</span>
              </div>
              <div class="info-item">
                <span class="info-label">البريد الإلكتروني:</span>
                <span class="info-value">${formData.ownerEmail}</span>
              </div>
            </div>
            ${formData.notes ? `
            <div style="margin-top: 15px;">
              <h3 style="color: #374151; font-size: 14px; margin-bottom: 8px;">ملاحظات إضافية:</h3>
              <p style="line-height: 1.8; color: #4b5563; text-align: justify;">${formData.notes}</p>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>تم إنشاء هذا التقرير تلقائياً من نظام إدارة العقارات</p>
            <p>© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    });
  };

  // Handle province change
  const handleProvinceChange = (province: string) => {
    setFormData(prev => ({ ...prev, province, state: '', city: '' }));
    setFilteredStates(PROVINCE_STATES[province] || []);
    setFilteredCities([]);
  };

  // Handle state change
  const handleStateChange = (state: string) => {
    setFormData(prev => ({ ...prev, state, city: '' }));
    setFilteredCities(STATE_CITIES[state] || []);
  };

  // Generate detailed address automatically
  const generateDetailedAddress = () => {
    const parts = [];
    if (formData.village) parts.push(formData.village);
    if (formData.city) parts.push(formData.city);
    if (formData.state) parts.push(formData.state);
    if (formData.province) parts.push(formData.province);
    
    const generatedAddress = parts.join('، ');
    if (generatedAddress && generatedAddress !== formData.address) {
      setFormData(prev => ({ ...prev, address: generatedAddress }));
    }
  };

  // Auto-generate address when location changes
  useEffect(() => {
    if (formData.province && formData.state) {
      generateDetailedAddress();
    }
  }, [formData.province, formData.state, formData.city, formData.village]);

  // Handle amenity toggle
  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  // Add custom amenity
  const addCustomAmenity = () => {
    if (customAmenity.trim() && !formData.customAmenities.includes(customAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        customAmenities: [...prev.customAmenities, customAmenity.trim()]
      }));
      setCustomAmenity('');
    }
  };

  // Remove custom amenity
  const removeCustomAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      customAmenities: prev.customAmenities.filter(a => a !== amenity)
    }));
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < 5 && validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else if (!validateStep(currentStep)) {
      alert('يرجى إكمال جميع الحقول الإجبارية قبل الانتقال للخطوة التالية');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    // Check if all previous steps are valid
    let canNavigate = true;
    for (let i = 1; i < step; i++) {
      if (!validateStep(i)) {
        canNavigate = false;
        break;
      }
    }
    
    if (canNavigate) {
      setCurrentStep(step);
    } else {
      alert('يرجى إكمال جميع الخطوات السابقة قبل الانتقال لهذه الخطوة');
    }
  };

  // Validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.titleAr && formData.type && formData.usageType && formData.purpose);
      case 2:
        return formData.buildingType === 'single' || formData.buildingType === 'multi';
      case 3:
        return !!(formData.province && formData.state && formData.area);
      case 4:
        return formData.amenities.length > 0 || formData.customAmenities.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // التحقق من وجود صور جديدة (File objects)
      const hasNewImages = formData.images.some(image => image instanceof File);
      
      // للتبسيط، استخدم JSON دائماً للتعديل
      // FormData فقط عند إضافة عقار جديد مع صور
      if (false && hasNewImages) {
        // إذا كانت هناك صور جديدة، استخدم FormData
      const formDataToSend = new FormData();
      
      // Add all text fields
      formDataToSend.append('titleAr', formData.titleAr);
      formDataToSend.append('titleEn', formData.titleEn);
      formDataToSend.append('descriptionAr', formData.descriptionAr);
      formDataToSend.append('descriptionEn', formData.descriptionEn);
      formDataToSend.append('province', formData.province);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('village', formData.village);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('usageType', formData.usageType);
      formDataToSend.append('purpose', formData.purpose);
      formDataToSend.append('buildingType', formData.buildingType);
      formDataToSend.append('buildingAge', formData.buildingAge);
      formDataToSend.append('area', formData.area);
      formDataToSend.append('beds', formData.beds);
      formDataToSend.append('baths', formData.baths);
      formDataToSend.append('floors', formData.floors);
      formDataToSend.append('priceOMR', formData.priceOMR);
      formDataToSend.append('rentalPrice', formData.rentalPrice);
      formDataToSend.append('published', String(formData.published));
      formDataToSend.append('referenceNo', formData.referenceNo);
      formDataToSend.append('surveyNumber', formData.surveyNumber);
      formDataToSend.append('landNumber', formData.landNumber);
      formDataToSend.append('latitude', formData.latitude);
      formDataToSend.append('longitude', formData.longitude);
      formDataToSend.append('mapAddress', formData.mapAddress);
      formDataToSend.append('halls', formData.halls);
      formDataToSend.append('majlis', formData.majlis);
      formDataToSend.append('kitchens', formData.kitchens);
      
      if (formData.buildingType === 'multi') {
        formDataToSend.append('totalUnits', formData.totalUnits);
        formDataToSend.append('totalArea', formData.totalArea);
      }
      
      // Add amenities
      formDataToSend.append('amenities', JSON.stringify(formData.amenities));
      formDataToSend.append('customAmenities', JSON.stringify(formData.customAmenities));
      
        // Add images (only File objects)
      formData.images.forEach((image, index) => {
          if (image instanceof File) {
        formDataToSend.append(`images`, image);
          }
      });
      
      // Add cover index
      formDataToSend.append('coverIndex', String(formData.coverIndex));
      
      // Add video URL
      if (formData.videoUrl) {
        formDataToSend.append('videoUrl', formData.videoUrl);
      }
      
      // Add contact info
      formDataToSend.append('useUserContact', String(formData.useUserContact));
      if (!formData.useUserContact) {
        formDataToSend.append('ownerName', formData.ownerName);
        formDataToSend.append('ownerPhone', formData.ownerPhone);
        formDataToSend.append('ownerEmail', formData.ownerEmail);
      }
      
      // Add notes
      if (formData.notes) {
        formDataToSend.append('notes', formData.notes);
      }
      
      // Add units data if multi-unit building
      if (formData.buildingType === 'multi' && formData.units.length > 0) {
        formDataToSend.append('units', JSON.stringify(formData.units));
      }

      // استخدام PUT للتعديل أو POST للإضافة
      const url = id ? `/api/properties/${id}` : '/api/properties';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        alert(id ? 'تم تحديث العقار بنجاح!' : 'تم حفظ العقار بنجاح!');
        router.push('/properties/unified-management');
      } else {
          try {
        const error = await response.json();
        alert('حدث خطأ: ' + (error.message || 'فشل في حفظ العقار'));
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
            alert('حدث خطأ في حفظ العقار - استجابة غير صحيحة من الخادم');
          }
        }
      } else {
        // إذا لم تكن هناك صور جديدة، استخدم JSON
        const dataToSend = {
          titleAr: formData.titleAr,
          titleEn: formData.titleEn,
          descriptionAr: formData.descriptionAr,
          descriptionEn: formData.descriptionEn,
          province: formData.province,
          state: formData.state,
          city: formData.city,
          village: formData.village,
          address: formData.address,
          type: formData.type,
          usageType: formData.usageType,
          purpose: formData.purpose,
          buildingType: formData.buildingType,
          buildingAge: formData.buildingAge,
          area: formData.area,
          beds: formData.beds,
          baths: formData.baths,
          floors: formData.floors,
          priceOMR: formData.priceOMR,
          rentalPrice: formData.rentalPrice,
          published: formData.published,
          referenceNo: formData.referenceNo,
          surveyNumber: formData.surveyNumber,
          landNumber: formData.landNumber,
          latitude: formData.latitude,
          longitude: formData.longitude,
          mapAddress: formData.mapAddress,
          halls: formData.halls,
          majlis: formData.majlis,
          kitchens: formData.kitchens,
          amenities: formData.amenities,
          customAmenities: formData.customAmenities,
          images: formData.images.filter(img => typeof img === 'string'), // Only existing images (strings)
          coverIndex: formData.coverIndex,
          videoUrl: formData.videoUrl,
          useUserContact: formData.useUserContact,
          ownerName: formData.ownerName,
          ownerPhone: formData.ownerPhone,
          ownerEmail: formData.ownerEmail,
          notes: formData.notes,
          units: formData.units
        };
        
        if (formData.buildingType === 'multi') {
          dataToSend.totalUnits = formData.totalUnits;
          dataToSend.totalArea = formData.totalArea;
        }

        // استخدام PUT للتعديل أو POST للإضافة
        const url = id ? `/api/properties/${id}` : '/api/properties';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          const data = await response.json();
          alert(id ? 'تم تحديث العقار بنجاح!' : 'تم حفظ العقار بنجاح!');
          router.push('/properties/unified-management');
        } else {
          try {
            const error = await response.json();
            alert('حدث خطأ: ' + (error.message || 'فشل في حفظ العقار'));
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
            alert('حدث خطأ في حفظ العقار - استجابة غير صحيحة من الخادم');
          }
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('حدث خطأ في حفظ العقار');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">
            {loadingImages ? 'جاري تحميل الصور...' : 'جاري تحميل بيانات العقار...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{id ? 'تعديل العقار' : 'إضافة عقار جديد'} - نظام إدارة العقارات</title>
        <meta name="description" content={id ? 'تعديل بيانات العقار' : 'إضافة عقار جديد إلى النظام'} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/properties/unified-management')}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <FaArrowLeft className="ml-2" />
                  العودة للإدارة
                </button>
          </div>
              <h1 className="text-2xl font-bold text-gray-900">{id ? 'تعديل العقار' : 'إضافة عقار جديد'}</h1>
        </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
            {/* Step Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center">
                {[1, 2, 3, 4, 5].map((step) => {
                  const stepColors = {
                    1: 'bg-blue-600 hover:bg-blue-700',
                    2: 'bg-green-600 hover:bg-green-700', 
                    3: 'bg-purple-600 hover:bg-purple-700',
                    4: 'bg-orange-600 hover:bg-orange-700',
                    5: 'bg-red-600 hover:bg-red-700'
                  };
                  
                  const lineColors = {
                    1: 'bg-blue-600',
                    2: 'bg-green-600',
                    3: 'bg-purple-600', 
                    4: 'bg-orange-600'
                  };
                  
                  return (
                    <div key={step} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => goToStep(step)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 transform hover:scale-110 ${
                          step <= currentStep 
                            ? `${stepColors[step as keyof typeof stepColors]} text-white shadow-lg` 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        } ${validateStep(step) ? 'ring-4 ring-green-300' : step <= currentStep ? 'ring-4 ring-red-300' : ''}`}
                      >
                        {step}
                      </button>
                      {step < 5 && (
                        <div className={`w-20 h-2 mx-3 rounded-full transition-all duration-300 ${
                          step < currentStep ? `${lineColors[step as keyof typeof lineColors]} shadow-md` : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Step Labels */}
              <div className="flex justify-center mt-4">
                <div className="flex space-x-20">
                  {[
                    { step: 1, label: 'المعلومات الأساسية', color: 'text-blue-600' },
                    { step: 2, label: 'نوع المبنى', color: 'text-green-600' },
                    { step: 3, label: 'الموقع والتفاصيل', color: 'text-purple-600' },
                    { step: 4, label: 'المزايا والخدمات', color: 'text-orange-600' },
                    { step: 5, label: 'الوسائط والاتصال', color: 'text-red-600' }
                  ].map(({ step, label, color }) => (
                    <div key={step} className={`text-xs font-medium ${currentStep >= step ? color : 'text-gray-400'}`}>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step Content */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات العقار الأساسية</h2>
                
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaHome className="inline ml-2" />
                    عنوان العقار (عربي) *
              </label>
                  <div className="flex gap-2">
              <input
                      type="text"
                      value={formData.titleAr}
                      onChange={(e) => handleInputChange('titleAr', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل عنوان العقار باللغة العربية"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const translated = translateText(formData.titleAr, 'ar', 'en');
                        handleInputChange('titleEn', translated);
                      }}
                      className="px-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="ترجمة ذكية"
                    >
                      <FaRobot />
                    </button>
            </div>
            </div>
            
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaHome className="inline ml-2" />
                    عنوان العقار (إنجليزي)
                  </label>
              <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.titleEn}
                      onChange={(e) => handleInputChange('titleEn', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter property title in English"
                    />
                <button 
                      type="button"
                      onClick={() => {
                        const translated = translateText(formData.titleEn, 'en', 'ar');
                        handleInputChange('titleAr', translated);
                      }}
                      className="px-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="ترجمة ذكية"
                    >
                      <FaRobot />
                </button>
          </div>
        </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaTag className="inline ml-2" />
                    نوع العقار *
                    </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">اختر نوع العقار</option>
                    {PROPERTY_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaTag className="inline ml-2" />
                    نوع الاستخدام *
                  </label>
                  <select
                    value={formData.usageType}
                    onChange={(e) => handleInputChange('usageType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">اختر نوع الاستخدام</option>
                    {USAGE_TYPES.map(usage => (
                      <option key={usage.value} value={usage.value}>
                        {usage.label}
                      </option>
                    ))}
                  </select>
                          </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaTag className="inline ml-2" />
                    الغرض *
                  </label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">اختر الغرض</option>
                    {PURPOSES.map(purpose => (
                      <option key={purpose.value} value={purpose.value}>
                        {purpose.label}
                      </option>
                    ))}
                  </select>
                </div>
                    </div>
                  )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">نوع المبنى</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    onClick={() => handleInputChange('buildingType', 'single')}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      formData.buildingType === 'single'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <FaHome className="text-4xl mx-auto mb-4 text-blue-600" />
                      <h3 className="text-lg font-semibold mb-2">عقار وحيد</h3>
                      <p className="text-gray-600">فيلا، منزل، شقة واحدة</p>
                  </div>
                </div>

                  <div
                    onClick={() => handleInputChange('buildingType', 'multi')}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      formData.buildingType === 'multi'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <FaBuilding className="text-4xl mx-auto mb-4 text-blue-600" />
                      <h3 className="text-lg font-semibold mb-2">مبنى متعدد الوحدات</h3>
                      <p className="text-gray-600">عمارة، مجمع سكني، برج</p>
                    </div>
                  </div>
                </div>

                {formData.buildingType === 'multi' && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عدد الوحدات
                </label>
                <input
                  type="number"
                      value={formData.totalUnits}
                      onChange={(e) => handleInputChange('totalUnits', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل عدد الوحدات"
                      min="1"
                />
              </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">الموقع والتفاصيل</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline ml-2" />
                      المحافظة *
                </label>
                    <select
                      value={formData.province}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">اختر المحافظة</option>
                      {PROVINCES.map(province => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                </select>
              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline ml-2" />
                      الولاية *
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={!formData.province}
                    >
                      <option value="">اختر الولاية</option>
                      {filteredStates.map(state => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
            </div>

            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline ml-2" />
                      المدينة
              </label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!formData.state}
                    >
                      <option value="">اختر المدينة</option>
                      {filteredCities.map(city => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                      placeholder="أو أدخل المدينة يدوياً"
                    />
            </div>
                </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaMapMarkerAlt className="inline ml-2" />
                    القرية أو الحي
                  </label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => handleInputChange('village', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل القرية أو الحي"
                  />
            </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaMapMarkerAlt className="inline ml-2" />
                    العنوان التفصيلي *
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل العنوان التفصيلي"
                      required
                    />
              <button
                      type="button"
                      onClick={generateDetailedAddress}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="توليد العنوان تلقائياً"
                    >
                      <FaRobot />
              </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaRuler className="inline ml-2" />
                      المساحة (م²) *
                </label>
                    <input
                      type="number"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="المساحة"
                      required
                    />
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عمر المبنى
                  </label>
                    <select
                      value={formData.buildingAge}
                      onChange={(e) => handleInputChange('buildingAge', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">اختر عمر المبنى</option>
                      {BUILDING_AGES.map(age => (
                        <option key={age.value} value={age.value}>
                          {age.label}
                        </option>
                      ))}
                    </select>
            </div>
        </div>

                {formData.buildingType === 'single' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaBed className="inline ml-2" />
                        عدد الغرف
                      </label>
                      <input
                        type="number"
                        value={formData.beds}
                        onChange={(e) => handleInputChange('beds', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="عدد الغرف"
                      />
              </div>

              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaBath className="inline ml-2" />
                        عدد الحمامات
                      </label>
                      <input
                        type="number"
                        value={formData.baths}
                        onChange={(e) => handleInputChange('baths', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="عدد الحمامات"
                />
              </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaBuilding className="inline ml-2" />
                        عدد الطوابق
                      </label>
                      <input
                        type="number"
                        value={formData.floors}
                        onChange={(e) => handleInputChange('floors', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="عدد الطوابق"
                      />
            </div>
                </div>
                )}
                      </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">المزايا والخدمات</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    المزايا المتاحة
                  </label>
                  
                  {['transport', 'recreation', 'technology', 'security', 'services', 'comfort', 'pets', 'accessibility', 'utilities'].map(category => {
                    const categoryAmenities = AMENITIES.filter(a => a.category === category);
                    const categoryLabels = {
                      'transport': 'المواصلات',
                      'recreation': 'الترفيه',
                      'technology': 'التكنولوجيا',
                      'security': 'الأمان',
                      'services': 'الخدمات',
                      'comfort': 'الراحة',
                      'pets': 'الحيوانات الأليفة',
                      'accessibility': 'إمكانية الوصول',
                      'utilities': 'المرافق'
                    };
                    
                    return (
                      <div key={category} className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                          {categoryLabels[category as keyof typeof categoryLabels]}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {categoryAmenities.map(amenity => {
                            const IconComponent = amenity.icon;
                            return (
                              <div
                                key={amenity.id}
                                onClick={() => handleAmenityToggle(amenity.id)}
                                className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                                  formData.amenities.includes(amenity.id)
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                <div className="text-center">
                                  <IconComponent className="text-xl mx-auto mb-2 text-blue-600" />
                                  <span className="text-xs font-medium leading-tight">{amenity.label}</span>
                                </div>
    </div>
  );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    إضافة مزايا مخصصة
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customAmenity}
                      onChange={(e) => setCustomAmenity(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل ميزة جديدة"
                      onKeyPress={(e) => e.key === 'Enter' && addCustomAmenity()}
                    />
                    <button
                      type="button"
                      onClick={addCustomAmenity}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaPlus />
                    </button>
                    </div>
                  
                  {formData.customAmenities.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {formData.customAmenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                          >
                            {amenity}
                            <button
                              type="button"
                              onClick={() => removeCustomAmenity(amenity)}
                              className="ml-2 text-green-600 hover:text-green-800"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </span>
                  ))}
                </div>
              </div>
                  )}
                </div>

                {formData.buildingType === 'single' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaTag className="inline ml-2" />
                        السعر (ريال عماني)
                      </label>
                      <input
                        type="number"
                        value={formData.priceOMR}
                        onChange={(e) => handleInputChange('priceOMR', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="السعر"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaTag className="inline ml-2" />
                        الإيجار الشهري (ريال عماني)
                      </label>
                      <input
                        type="number"
                        value={formData.rentalPrice}
                        onChange={(e) => handleInputChange('rentalPrice', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="الإيجار الشهري"
                      />
                    </div>
                  </div>
                )}

                {formData.buildingType === 'multi' && formData.totalUnits && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">تفاصيل الوحدات</h3>
                    <div className="space-y-6">
                      {Array.from({ length: parseInt(formData.totalUnits) }, (_, index) => {
                        const unitId = `unit-${index + 1}`;
                        let unit = formData.units.find(u => u.id === unitId);
                        
                        if (!unit) {
                          // Create new unit if it doesn't exist
                          unit = {
                            id: unitId,
                            unitNo: `U${index + 1}`,
                            type: '',
                            area: '',
                            beds: '',
                            baths: '',
                            price: '',
                            rentalPrice: '',
                            status: 'available',
                            features: [],
                            images: [],
                            halls: '',
                            majlis: '',
                            amenities: [],
                            videoUrl: '',
                            videoFile: null,
                            paymentMethods: [],
                            deposit: ''
                          };
                          
                          // Add to units array
                          setFormData(prev => ({
                            ...prev,
                            units: [...prev.units, unit!]
                          }));
                        }

                        return (
                          <div key={unitId} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-md font-semibold text-gray-800">الوحدة {index + 1}</h4>
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const prevUnit = formData.units.find(u => u.id === `unit-${index}`);
                                    if (prevUnit) {
                                      setFormData(prev => ({
                                        ...prev,
                                        units: prev.units.map(u => 
                                          u.id === unitId ? { ...prevUnit, id: unitId, unitNo: `U${index + 1}` } : u
                                        )
                                      }));
                                    }
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                >
                                  <FaCopy className="inline ml-1" />
                                  نسخ من الوحدة السابقة
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الوحدة</label>
                                <input
                                  type="text"
                                  value={unit.unitNo}
                                  onChange={(e) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      units: prev.units.map(u => 
                                        u.id === unitId ? { ...u, unitNo: e.target.value } : u
                                      )
                                    }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">نوع الوحدة</label>
                                <select
                                  value={unit.type}
                                  onChange={(e) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      units: prev.units.map(u => 
                                        u.id === unitId ? { ...u, type: e.target.value } : u
                                      )
                                    }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">اختر النوع</option>
                                  <option value="studio">استوديو</option>
                                  <option value="1-bedroom">غرفة واحدة</option>
                                  <option value="2-bedroom">غرفتان</option>
                                  <option value="3-bedroom">ثلاث غرف</option>
                                  <option value="4-bedroom">أربع غرف</option>
                                  <option value="penthouse">بنتهاوس</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">المساحة (م²)</label>
                                <input
                                  type="number"
                                  value={unit.area}
                                  onChange={(e) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      units: prev.units.map(u => 
                                        u.id === unitId ? { ...u, area: e.target.value } : u
                                      )
                                    }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">عدد الغرف</label>
                                <input
                                  type="number"
                                  value={unit.beds}
                                  onChange={(e) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      units: prev.units.map(u => 
                                        u.id === unitId ? { ...u, beds: e.target.value } : u
                                      )
                                    }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">عدد الحمامات</label>
                                <input
                                  type="number"
                                  value={unit.baths}
                                  onChange={(e) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      units: prev.units.map(u => 
                                        u.id === unitId ? { ...u, baths: e.target.value } : u
                                      )
                                    }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الإيجار الشهري (ريال)</label>
                                <input
                                  type="number"
                                  value={unit.rentalPrice}
                                  onChange={(e) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      units: prev.units.map(u => 
                                        u.id === unitId ? { ...u, rentalPrice: e.target.value } : u
                                      )
                                    }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            {/* Unit Images and Video */}
                            <div className="mt-4 border-t pt-4">
                              <h5 className="text-sm font-semibold text-gray-700 mb-3">صور وفيديو الوحدة</h5>
                              
                              {/* Unit Images */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  <FaImages className="inline ml-2" />
                                  صور الوحدة
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                  <FaUpload className="text-2xl text-gray-400 mx-auto mb-2" />
                                  <p className="text-gray-600 text-sm mb-2">
                                    اسحب الصور هنا أو انقر للاختيار
                                    {loadingImages && <span className="text-blue-600 text-xs block mt-1">جاري تحميل الصور...</span>}
                                  </p>
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {
                                      const files = Array.from(e.target.files || []);
                                      setFormData(prev => ({
                                        ...prev,
                                        units: prev.units.map(u => 
                                          u.id === unitId ? { ...u, images: [...u.images, ...files] } : u
                                        )
                                      }));
                                    }}
                                    className="hidden"
                                    id={`unit-image-upload-${unitId}`}
                                  />
                                  <label
                                    htmlFor={`unit-image-upload-${unitId}`}
                                    className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-sm cursor-pointer hover:bg-blue-700 transition-colors"
                                  >
                                    اختيار الصور
                                  </label>
                                </div>
                                
                                {unit.images && unit.images.length > 0 && (
                                  <div className="mt-3">
                                    <div className="grid grid-cols-3 gap-2">
                                      {unit.images.map((image, imgIndex) => (
                                        <div key={imgIndex} className="relative">
                                          <img
                                            src={URL.createObjectURL(image)}
                                            alt={`صورة الوحدة ${imgIndex + 1}`}
                                            className="w-full h-20 object-cover rounded"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setFormData(prev => ({
                                                ...prev,
                                                units: prev.units.map(u => 
                                                  u.id === unitId ? { 
                                                    ...u, 
                                                    images: u.images.filter((_, i) => i !== imgIndex) 
                                                  } : u
                                                )
                                              }));
                                            }}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                          >
                                            <FaTrash />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Unit Video */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  <FaVideo className="inline ml-2" />
                                  فيديو الوحدة (اختياري)
                                </label>
                                <div className="space-y-2">
                                  <input
                                    type="url"
                                    value={unit.videoUrl}
                                    onChange={(e) => {
                                      setFormData(prev => ({
                                        ...prev,
                                        units: prev.units.map(u => 
                                          u.id === unitId ? { ...u, videoUrl: e.target.value } : u
                                        )
                                      }));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    placeholder="رابط الفيديو (YouTube, Vimeo, etc.)"
                                  />
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                                    <input
                                      type="file"
                                      accept="video/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setFormData(prev => ({
                                            ...prev,
                                            units: prev.units.map(u => 
                                              u.id === unitId ? { ...u, videoFile: file } : u
                                            )
                                          }));
                                        }
                                      }}
                                      className="hidden"
                                      id={`unit-video-upload-${unitId}`}
                                    />
                                    <label
                                      htmlFor={`unit-video-upload-${unitId}`}
                                      className="inline-block px-3 py-1 bg-green-600 text-white rounded text-sm cursor-pointer hover:bg-green-700 transition-colors"
                                    >
                                      أو رفع ملف فيديو
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">الوسائط والاتصال</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaImages className="inline ml-2" />
                    صور العقار (4 صور على الأقل)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      اسحب الصور هنا أو انقر للاختيار
                      {loadingImages && <span className="text-blue-600 text-sm block mt-2">جاري تحميل الصور...</span>}
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      اختيار الصور
                    </label>
        </div>

                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`صورة ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            {index === formData.coverIndex && (
                              <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                غلاف
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  coverIndex: index
                                }));
                              }}
                              className={`absolute bottom-1 left-1 px-2 py-1 text-xs rounded ${
                                index === formData.coverIndex 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-600 text-white hover:bg-gray-700'
                              }`}
                            >
                              {index === formData.coverIndex ? 'غلاف' : 'اختيار غلاف'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== index),
                                  coverIndex: prev.coverIndex > index ? prev.coverIndex - 1 : prev.coverIndex
                                }));
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaVideo className="inline ml-2" />
                    الفيديو (اختياري)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="رابط الفيديو (YouTube, Vimeo, etc.)"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <FaUpload className="text-2xl text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm mb-2">أو رفع ملف فيديو</p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Handle video file upload
                            console.log('Video file selected:', file.name);
                          }
                        }}
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
                      >
                        اختيار ملف فيديو
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">معلومات الاتصال</h3>
                  
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="useUserContact"
                      checked={formData.useUserContact}
                      onChange={(e) => handleInputChange('useUserContact', e.target.checked)}
                      className="ml-2"
                    />
                    <label htmlFor="useUserContact" className="text-sm font-medium text-gray-700">
                      استخدام بياناتي الشخصية
                    </label>
                </div>

                  {!formData.useUserContact && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaUser className="inline ml-2" />
                          اسم المالك
                        </label>
                        <input
                          type="text"
                          value={formData.ownerName}
                          onChange={(e) => handleInputChange('ownerName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="اسم المالك"
                        />
                    </div>

                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaPhone className="inline ml-2" />
                          رقم الهاتف
                        </label>
                        <input
                          type="tel"
                          value={formData.ownerPhone}
                          onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="رقم الهاتف"
                        />
                </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaEnvelope className="inline ml-2" />
                          البريد الإلكتروني
                        </label>
                        <input
                          type="email"
                          value={formData.ownerEmail}
                          onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="البريد الإلكتروني"
                        />
                  </div>
                  </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaInfoCircle className="inline ml-2" />
                    الوصف (عربي)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <textarea
                      value={formData.descriptionAr}
                      onChange={(e) => handleInputChange('descriptionAr', e.target.value)}
                      rows={4}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="وصف العقار باللغة العربية..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const generated = generateDescription('ar');
                        handleInputChange('descriptionAr', generated);
                      }}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="توليد وصف ذكي"
                    >
                      <FaRobot />
                    </button>
                </div>
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaInfoCircle className="inline ml-2" />
                    الوصف (إنجليزي)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                      rows={4}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Property description in English..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const generated = generateDescription('en');
                        handleInputChange('descriptionEn', generated);
                      }}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Generate smart description"
                    >
                      <FaRobot />
                    </button>
    </div>
        </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaInfoCircle className="inline ml-2" />
                      رقم الرسم المساحي
                    </label>
                    <input
                      type="text"
                      value={formData.surveyNumber}
                      onChange={(e) => handleInputChange('surveyNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="رقم الرسم المساحي"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaInfoCircle className="inline ml-2" />
                      رقم الأرض
                    </label>
                    <input
                      type="text"
                      value={formData.landNumber}
                      onChange={(e) => handleInputChange('landNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="رقم الأرض"
                    />
                  </div>
                </div>

    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaInfoCircle className="inline ml-2" />
                    ملاحظات إضافية
                  </label>
      <textarea 
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أي ملاحظات إضافية..."
      />
    </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">موقع العقار على الخريطة</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان الخريطة
                    </label>
                    <input
                      type="text"
                      value={formData.mapAddress}
                      onChange={(e) => handleInputChange('mapAddress', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل عنوان العقار للبحث في الخريطة"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.mapAddress) {
                          const geocodeUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.mapAddress)}`;
                          window.open(geocodeUrl, '_blank');
                        }
                      }}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FaMap className="inline ml-2" />
                      البحث في خرائط جوجل
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaMap className="inline ml-2" />
                        خط العرض
                      </label>
                      <input
                        type="text"
                        value={formData.latitude}
                        onChange={(e) => handleInputChange('latitude', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="23.6142"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaMap className="inline ml-2" />
                        خط الطول
                      </label>
                      <input
                        type="text"
                        value={formData.longitude}
                        onChange={(e) => handleInputChange('longitude', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="58.5928"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              handleInputChange('latitude', position.coords.latitude.toString());
                              handleInputChange('longitude', position.coords.longitude.toString());
                            },
                            (error) => {
                              alert('تعذر الحصول على الموقع الحالي');
                            }
                          );
                        } else {
                          alert('المتصفح لا يدعم تحديد الموقع');
                        }
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <FaMap className="inline ml-2" />
                      الحصول على الموقع الحالي
                    </button>
                  </div>

                  {formData.latitude && formData.longitude && (
                    <div className="mb-4">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">معاينة الخريطة</h4>
                        <iframe
                          src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWWgUjqU8X0Y&center=${formData.latitude},${formData.longitude}&zoom=15`}
                          width="100%"
                          height="300"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                      <div className="mt-2 flex gap-2">
                        <a
                          href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FaMap className="ml-2" />
                          فتح في خرائط جوجل
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${formData.latitude},${formData.longitude}`;
                            window.open(directionsUrl, '_blank');
                          }}
                          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          <FaMap className="ml-2" />
                          الحصول على الاتجاهات
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                السابق
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    validateStep(currentStep)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  التالي
                </button>
              ) : (
                <div className="flex gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    <FaPrint className="inline ml-2" />
                    طباعة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      autoSave();
                      window.open(`/properties/${formData.referenceNo}`, '_blank');
                    }}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <FaEye className="inline ml-2" />
                    معاينة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, published: false }));
                      handleSubmit(new Event('submit') as any);
                    }}
                    className="px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    <FaSave className="inline ml-2" />
                    حفظ كمسودة
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="inline ml-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <FaSave className="inline ml-2" />
                        نشر العقار
                      </>
                    )}
                  </button>
          </div>
        )}
      </div>
    </div>
      </div>
    </>
  );
}

// تم إزالة getServerSideProps - الصفحة تحمل البيانات من API مباشرة