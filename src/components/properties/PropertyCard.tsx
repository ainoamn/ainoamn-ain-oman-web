import { useCurrency } from "@/context/CurrencyContext";
import { Property } from "@/types/property";
import Link from "next/link";
import { FaBed, FaBath, FaRulerCombined, FaStar, FaBolt } from "react-icons/fa";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { format } = useCurrency();
  
  return (
    <Link href={`/property/${property.id}`} className="block border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      <div className="relative">
        <img src={property.images?.[0] || "/default-property.jpg"} alt={property.title} className="w-full h-48 object-cover" />
        
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
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.title}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-1">
          {property.location || `${property.province} - ${property.state}`}
        </p>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-brand-700 font-bold text-xl">
            {format(property.priceOMR)}
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
    </Link>
  );
}