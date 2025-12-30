import { useCurrency } from "@/context/CurrencyContext";
import { Property } from "@/types/property";
import InstantLink from "@/components/InstantLink";
import InstantImage from "@/components/InstantImage";
import { toSafeText } from "@/components/SafeText";
import { FaBed, FaBath, FaRulerCombined, FaStar, FaBolt } from 'react-icons/fa';

interface PropertyCardProps {
  property: Property;
}

/**
 * PropertyCard - بطاقة عقار محسنة للأداء الفائق ⚡
 * 
 * تستخدم InstantLink للتنقل الفوري و InstantImage للصور المحسنة
 * تحل مشكلة Objects في React باستخدام toSafeText
 */
export default function PropertyCard({ property }: PropertyCardProps) {
  // Safe fallback for useCurrency
  let currencyFormat: (amount: number, currency?: string) => string;
  try {
    const currencyContext = useCurrency();
    currencyFormat = currencyContext.format;
  } catch {
    // Fallback if CurrencyProvider is not available
    currencyFormat = (amount: number, currency = "OMR") => {
      return new Intl.NumberFormat("ar-OM", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 3
      }).format(amount);
    };
  }
  
  // تحويل title و description إلى نص آمن
  const safeTitle = toSafeText(property.title || '', 'ar');
  const safeLocation = toSafeText(property.location || property.province || '', 'ar');
  
  return (
    <InstantLink 
      href={`/property/${property.id}`} 
      className="block border rounded-lg overflow-hidden shadow hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
    >
      <div className="relative overflow-hidden">
        <InstantImage 
          src={property.images?.[0] || "/default-property.jpg"} 
          alt={property.title} 
          width={400}
          height={300}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          priority={false}
        />
        
        {/* شارة الرقم المرجعي */}
        {property.referenceNo && (
          <div className="absolute top-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
            {property.referenceNo}
          </div>
        )}
        
        {/* شارة العقار المميز */}
        {property.promoted && (
          <div className="absolute top-2 right-2 text-xs bg-amber-500 text-white px-2 py-1 rounded flex items-center gap-1">
            <FaBolt /> مميز
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{safeTitle}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-1">
          {safeLocation || `${property.province || ''} - ${property.state || ''}`}
        </p>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-brand-700 font-bold text-xl">
            {currencyFormat(property.priceOMR)}
          </span>
          <div className="flex items-center gap-1 text-yellow-600">
            <FaStar /> {property.rating || 0}
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <FaBed /> {property.beds || 0}
          </div>
          <div className="flex items-center gap-1">
            <FaBath /> {property.baths || 0}
          </div>
          <div className="flex items-center gap-1">
            <FaRulerCombined /> {property.area || 0} م²
          </div>
        </div>
      </div>
    </InstantLink>
  );
}
