// src/pages/properties/index.tsx - صفحة العقارات المحسّنة مع AI
import Head from "next/head";
import InstantImage from '@/components/InstantImage';
import InstantLink from '@/components/InstantLink';
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { FaSearch, FaFilter, FaBolt, FaBed, FaBath, FaRulerCombined, FaStar, FaHeart, FaMapMarkerAlt, FaBuilding, FaHome, FaStore, FaRobot, FaChartLine, FaFire, FaRegHeart, FaTimes, FaChevronDown } from 'react-icons/fa';

interface Property {
  id: string;
  titleAr?: string;
  title?: string | { ar?: string; en?: string };
  priceOMR?: number;
  rentalPrice?: number;
  province?: string;
  state?: string;
  city?: string;
  beds?: number;
  baths?: number;
  area?: number;
  type?: string;
  purpose?: string;
  images?: string[];
  coverImage?: string;
  coverIndex?: number;
  rating?: number;
  promoted?: boolean;
  status?: string;
  published?: boolean;
  amenities?: string[];
  isUnit?: boolean;
  parentPropertyId?: string;
  referenceNo?: string;
}

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPurpose, setSelectedPurpose] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBeds, setMinBeds] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // AI Features
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [trendingProperties, setTrendingProperties] = useState<Property[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    loadProperties();
    loadAIRecommendations();
  }, [mounted]);

  const loadProperties = async () => {
        try {
          const response = await fetch('/api/properties');
          console.log('🌐 API response status:', response.status);
          if (response.ok) {
            const data = await response.json();
            console.log('📊 API Response keys:', Object.keys(data));
            const props = data.properties || data.items || [];
            console.log('🏘️ Total properties from API:', props.length);
            
            // استخراج الوحدات من العقارات متعددة الوحدات
            const allItems: Property[] = [];
            
            for (const property of props) {
              // إضافة العقار الرئيسي (فقط إذا كان منشور)
              if (property.published !== false) {
                allItems.push(property);
              }
              
              // استخراج الوحدات المنشورة وإضافتها كعقارات منفصلة
              if (property.units && Array.isArray(property.units)) {
                for (const unit of property.units) {
                  if (unit.published !== false) {
                    allItems.push({
                      ...unit,
                      id: unit.id,
                      referenceNo: unit.referenceNo || `UNIT-${property.referenceNo || property.id}-${unit.unitNo}`,
                      isUnit: true,
                      parentPropertyId: property.id,
                      
                      // نسخ البيانات من الأم
                      titleAr: unit.titleAr || `وحدة ${unit.unitNo} - ${property.titleAr || ''}`,
                      title: unit.title || `وحدة ${unit.unitNo} - ${property.titleAr || ''}`,
                      province: unit.province || property.province,
                      state: unit.state || property.state,
                      city: unit.city || property.city,
                      
                      // السعر من الوحدة
                      priceOMR: unit.price || unit.priceOMR || unit.rentalPrice,
                      rentalPrice: unit.rentalPrice || unit.price,
                      
                      // التفاصيل
                      beds: unit.beds || unit.bedrooms,
                      baths: unit.baths || unit.bathrooms,
                      area: unit.area,
                      type: unit.type || 'apartment',
                      purpose: unit.purpose || property.purpose || 'rent',
                      
                      // الصور
                      images: unit.images && unit.images.length > 0 ? unit.images : property.images,
                      coverImage: unit.coverImage || (unit.images && unit.images[0]),
                      coverIndex: unit.coverIndex || 0,
                      
                      // الحالة
                      status: unit.status,
                      published: unit.published !== false,
                      amenities: [...(property.amenities || []), ...(unit.amenities || [])],
                    });
                  }
                }
              }
            }
            
            console.log('🏘️ Total items (properties + units):', allItems.length);
            
            // فلترة المنشورة فقط
            const filtered = allItems.filter((p: Property) => p.published !== false);
            console.log('✅ Published items:', filtered.length);
            setProperties(filtered);
        
            // Trending properties (محاكاة)
            const trending = filtered
              .filter((p: Property) => p.promoted || p.rating && p.rating >= 4)
              .slice(0, 3);
            setTrendingProperties(trending);
          }
        } catch (error) {
          console.error('Error loading properties:', error);
        } finally {
          setLoading(false);
    }
  };

  const loadAIRecommendations = async () => {
    // محاكاة AI recommendations
    setAiRecommendations([
      { icon: '🔥', title: 'الأكثر طلباً', desc: 'فلل في الموالح', color: 'red' },
      { icon: '📈', title: 'سعر مناسب', desc: 'شقق تحت 50,000', color: 'green' },
      { icon: '⭐', title: 'تقييم عالي', desc: 'عقارات 5 نجوم', color: 'yellow' }
    ]);
  };

  const getTitleText = (property: Property): string => {
    if (property.titleAr) return property.titleAr;
    if (typeof property.title === 'string') return property.title;
    if (typeof property.title === 'object') return property.title.ar || property.title.en || '';
    return 'عقار';
  };

  const getCoverImage = (property: Property): string => {
    if (property.coverImage) return property.coverImage;
    if (property.images && property.images.length > 0) {
      const idx = property.coverIndex || 0;
      return property.images[idx] || property.images[0];
    }
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  // Filtered properties
  const filteredProperties = useMemo(() => {
    let filtered = [...properties];
    console.log('🔍 Starting with properties:', filtered.length);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        getTitleText(p).toLowerCase().includes(term) ||
        p.city?.toLowerCase().includes(term) ||
        p.province?.toLowerCase().includes(term)
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.type === selectedType);
    }

    if (selectedPurpose !== 'all') {
      filtered = filtered.filter(p => p.purpose === selectedPurpose);
    }

    if (selectedProvince !== 'all') {
      filtered = filtered.filter(p => p.province === selectedProvince);
    }

    if (minPrice) {
      filtered = filtered.filter(p => (p.priceOMR || p.rentalPrice || 0) >= Number(minPrice));
    }

    if (maxPrice) {
      filtered = filtered.filter(p => (p.priceOMR || p.rentalPrice || 0) <= Number(maxPrice));
    }

    if (minBeds) {
      filtered = filtered.filter(p => (p.beds || 0) >= Number(minBeds));
    }

    // Sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.priceOMR || a.rentalPrice || 0) - (b.priceOMR || b.rentalPrice || 0));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.priceOMR || b.rentalPrice || 0) - (a.priceOMR || a.rentalPrice || 0));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    console.log('✨ Final filtered properties:', filtered.length);
    return filtered;
  }, [properties, searchTerm, selectedType, selectedPurpose, selectedProvince, minPrice, maxPrice, minBeds, sortBy]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>العقارات | Ain Oman</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Hero Header مع AI */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <FaRobot className="text-5xl" />
                <div>
                  <h1 className="text-4xl font-bold">🏠 استكشف العقارات</h1>
                  <p className="text-blue-100 text-lg">مدعوم بالذكاء الاصطناعي • {properties.length} عقار متاح</p>
      </div>
            </div>

              {/* AI Recommendations */}
              {aiRecommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {aiRecommendations.map((rec, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{rec.icon}</span>
              <div>
                          <p className="font-bold">{rec.title}</p>
                          <p className="text-sm text-blue-100">{rec.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              )}

              {/* Search Bar */}
              <div className="mt-6">
                <div className="relative">
                  <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن عقار أو موقع..."
                    className="w-full pr-12 pl-6 py-4 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/50 shadow-xl"
                  />
                </div>
              </div>
                </div>
              </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                >
                  <FaFilter />
                  {showFilters ? 'إخفاء الفلاتر' : 'فلاتر متقدمة'}
                </button>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="newest">الأحدث</option>
                  <option value="price-low">السعر: من الأقل</option>
                  <option value="price-high">السعر: من الأعلى</option>
                  <option value="rating">الأعلى تقييماً</option>
                  </select>

                <div className="flex gap-2 border-2 border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-md transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                  >
                    شبكة
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-md transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                  >
                    قائمة
                  </button>
                </div>
              </div>

              <p className="text-gray-600 font-medium">
                {filteredProperties.length} عقار
              </p>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200 animate-fade-in">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                >
                  <option value="all">كل الأنواع</option>
                  <option value="apartment">شقة</option>
                  <option value="villa">فيلا</option>
                  <option value="land">أرض</option>
                  <option value="office">مكتب</option>
                  <option value="shop">محل</option>
                </select>

                <select
                  value={selectedPurpose}
                  onChange={(e) => setSelectedPurpose(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                >
                  <option value="all">كل الأغراض</option>
                  <option value="sale">للبيع</option>
                  <option value="rent">للإيجار</option>
                  <option value="investment">للاستثمار</option>
                </select>

                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                >
                  <option value="all">كل المحافظات</option>
                  <option value="muscat">مسقط</option>
                  <option value="dhofar">ظفار</option>
                  <option value="dakhliyah">الداخلية</option>
                </select>

                  <input
                    type="number"
                    value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="السعر من"
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                  />

                  <input
                    type="number"
                    value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="السعر إلى"
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                  />
                </div>
            )}
                </div>

          {/* Trending Properties */}
          {trendingProperties.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <FaFire className="text-orange-500 text-2xl" />
                <h2 className="text-2xl font-bold text-gray-900">العقارات الأكثر طلباً</h2>
                </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trendingProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} featured />
                ))}
              </div>
            </div>
          )}

          {/* Properties Grid/List */}
          {filteredProperties.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <FaHome className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">لا توجد عقارات</h3>
              <p className="text-gray-600">جرّب تغيير الفلاتر أو البحث بكلمة أخرى</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
            }>
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} viewMode={viewMode} />
              ))}
            </div>
          )}
                </div>
              </div>
    </>
  );
}

function PropertyCard({ property, featured = false, viewMode = 'grid' }: { 
  property: Property; 
  featured?: boolean; 
  viewMode?: 'grid' | 'list' 
}) {
  const [liked, setLiked] = useState(false);

  const getTitleText = (p: Property): string => {
    if (p.titleAr) return p.titleAr;
    if (typeof p.title === 'string') return p.title;
    if (typeof p.title === 'object') return p.title.ar || p.title.en || '';
    return 'عقار';
  };

  const getCoverImage = (p: Property): string => {
    if (p.coverImage) return p.coverImage;
    if (p.images && p.images.length > 0) {
      const idx = p.coverIndex || 0;
      return p.images[idx] || p.images[0];
    }
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  const price = property.priceOMR || property.rentalPrice || 0;

  if (viewMode === 'list') {
                    return (
      <InstantLink href={`/properties/${property.id}`}>
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-4 flex gap-6 group">
          <div className="relative w-64 h-48 flex-shrink-0">
            <InstantImage
              src={getCoverImage(property)}
              alt={getTitleText(property)}
              className="w-full h-full object-cover rounded-xl"
              width={256}
              height={192}
            />
            {featured && (
              <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <FaFire /> مميز
              </div>
            )}
            {property.isUnit && (
              <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <FaBuilding /> وحدة
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
              {getTitleText(property)}
            </h3>
            <p className="text-gray-600 mb-3 flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-600" />
              {property.city || property.province}
            </p>
            
            <div className="flex gap-4 mb-4">
              {property.beds && (
                <div className="flex items-center gap-1 text-gray-600">
                  <FaBed /> {property.beds}
                </div>
              )}
              {property.baths && (
                <div className="flex items-center gap-1 text-gray-600">
                  <FaBath /> {property.baths}
                </div>
              )}
              {property.area && (
                <div className="flex items-center gap-1 text-gray-600">
                  <FaRulerCombined /> {property.area} م²
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-blue-600">
                {price.toLocaleString()} ر.ع
              </p>
              {property.rating && (
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  <span className="font-bold">{property.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </InstantLink>
    );
  }

  return (
    <InstantLink href={`/properties/${property.id}`}>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group">
        <div className="relative h-56">
          <InstantImage
            src={getCoverImage(property)}
            alt={getTitleText(property)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            width={400}
            height={300}
          />
          
          {featured && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
              <FaFire /> مميز
            </div>
          )}
          
          {property.isUnit && !featured && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
              <FaBuilding /> وحدة
            </div>
          )}

                      <button
            onClick={(e) => {
              e.preventDefault();
              setLiked(!liked);
            }}
            className="absolute top-3 left-3 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:scale-110 transition shadow-lg"
          >
            {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-600" />}
                      </button>

          {property.type && (
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white px-3 py-1 rounded-lg text-sm font-medium">
              {property.type === 'apartment' ? '🏢 شقة' : 
               property.type === 'villa' ? '🏠 فيلا' :
               property.type === 'land' ? '🌳 أرض' :
               property.type === 'office' ? '🏛️ مكتب' : '🏪 محل'}
            </div>
                    )}
                  </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-1">
            {getTitleText(property)}
          </h3>
          
          <p className="text-gray-600 mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-600" />
            {property.city || property.province}
          </p>

          <div className="flex gap-3 mb-4 text-sm text-gray-600">
            {property.beds && (
              <div className="flex items-center gap-1">
                <FaBed /> {property.beds}
              </div>
            )}
            {property.baths && (
              <div className="flex items-center gap-1">
                <FaBath /> {property.baths}
                      </div>
            )}
            {property.area && (
              <div className="flex items-center gap-1">
                <FaRulerCombined /> {property.area} م²
                      </div>
            )}
                    </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-2xl font-bold text-blue-600">
              {price.toLocaleString()} ر.ع
            </p>
            {property.rating && (
              <div className="flex items-center gap-1">
                <FaStar className="text-yellow-400" />
                <span className="font-bold">{property.rating}</span>
                      </div>
            )}
                      </div>
                    </div>
                  </div>
                </InstantLink>
  );
}
