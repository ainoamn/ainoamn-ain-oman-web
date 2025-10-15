// src/components/AdvancedMap.tsx - خريطة تفاعلية متقدمة
import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaSearchLocation, FaLayerGroup, FaExpand, FaCompress } from 'react-icons/fa';

interface AdvancedMapProps {
  properties?: any[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  showControls?: boolean;
  onPropertyClick?: (property: any) => void;
}

export default function AdvancedMap({ 
  properties = [], 
  center = { lat: 23.5880, lng: 58.3829 }, // مسقط
  zoom = 12,
  height = '500px',
  showControls = true,
  onPropertyClick
}: AdvancedMapProps) {
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');

  // Google Maps API URL
  const getStaticMapUrl = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';
    const markers = properties
      .filter(p => p.latitude && p.longitude)
      .map((p, i) => `markers=color:red%7Clabel:${i + 1}%7C${p.latitude},${p.longitude}`)
      .join('&');
    
    return `https://maps.googleapis.com/maps/api/staticmap?center=${mapCenter.lat},${mapCenter.lng}&zoom=${mapZoom}&size=800x600&maptype=${mapType}&${markers}&key=${apiKey}`;
  };

  const handlePropertySelect = (property: any) => {
    if (property.latitude && property.longitude) {
      setMapCenter({ lat: parseFloat(property.latitude), lng: parseFloat(property.longitude) });
      setMapZoom(15);
      setSelectedProperty(property);
      if (onPropertyClick) {
        onPropertyClick(property);
      }
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`} dir="rtl">
      {/* أدوات التحكم */}
      {showControls && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-white text-xl" />
              <h3 className="text-white font-bold">الخريطة التفاعلية</h3>
              <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">
                {properties.length} عقار
              </span>
            </div>
            
            <div className="flex gap-2">
              {/* نوع الخريطة */}
              <select
                value={mapType}
                onChange={(e) => setMapType(e.target.value as any)}
                className="px-3 py-2 bg-white/20 text-white border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="roadmap" className="text-gray-900">خريطة الطرق</option>
                <option value="satellite" className="text-gray-900">القمر الصناعي</option>
                <option value="hybrid" className="text-gray-900">مختلط</option>
              </select>

              {/* ملء الشاشة */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition flex items-center gap-2"
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`flex ${isFullscreen ? 'h-screen' : ''}`}>
        {/* قائمة العقارات */}
        {properties.length > 0 && (
          <div className={`${isFullscreen ? 'w-96' : 'w-full md:w-80'} bg-gray-50 overflow-y-auto border-l border-gray-200`}
            style={{ maxHeight: isFullscreen ? '100vh' : height }}
          >
            <div className="p-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FaSearchLocation className="text-blue-600" />
                العقارات على الخريطة
              </h4>
              
              <div className="space-y-2">
                {properties.map((property, index) => (
                  <button
                    key={property.id}
                    onClick={() => handlePropertySelect(property)}
                    className={`w-full text-right p-3 rounded-lg transition-all ${
                      selectedProperty?.id === property.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-white hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedProperty?.id === property.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {property.titleAr || property.title?.ar || 'عقار'}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {property.city || property.state || property.province}
                        </p>
                        <p className="text-sm font-bold text-blue-600">
                          {property.priceOMR || property.rentalPrice} ر.ع
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* الخريطة */}
        <div className="flex-1 relative">
          <div style={{ height: isFullscreen ? '100vh' : height }}>
            {/* Static Map (يمكن استبداله بـ Google Maps Interactive) */}
            <img
              src={getStaticMapUrl()}
              alt="Map"
              className="w-full h-full object-cover"
            />
            
            {/* معلومات العقار المحدد */}
            {selectedProperty && (
              <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-2xl p-4 animate-fade-in-up max-w-md">
                <div className="flex items-start gap-3">
                  {selectedProperty.coverImage && (
                    <img
                      src={selectedProperty.coverImage}
                      alt={selectedProperty.titleAr}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">
                      {selectedProperty.titleAr || selectedProperty.title?.ar}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedProperty.address || selectedProperty.city}
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      {selectedProperty.priceOMR || selectedProperty.rentalPrice} ر.ع
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

