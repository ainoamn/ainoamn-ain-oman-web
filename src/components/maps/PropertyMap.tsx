import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PropertyMapProps {
  latitude?: number;
  longitude?: number;
  propertyTitle?: string;
  propertyAddress?: string;
  height?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  latitude = 23.6142, // مسقط
  longitude = 58.5928,
  propertyTitle = 'العقار',
  propertyAddress = 'مسقط، سلطنة عمان',
  height = '400px'
}) => {
  const position: [number, number] = [latitude, longitude];

  return (
    <div style={{ height }} className="w-full rounded-lg overflow-hidden">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-gray-900 mb-1">{propertyTitle}</h3>
              <p className="text-sm text-gray-600">{propertyAddress}</p>
              <div className="text-xs text-gray-500 mt-1">
                الإحداثيات: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default PropertyMap;