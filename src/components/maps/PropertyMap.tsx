// src/components/maps/PropertyMap.tsx
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { useMemo, useState } from "react";
import { useGoogleMaps } from "./GoogleMapsProvider";

type P = { id: number|string; title: string; image?: string; lat: number; lng: number; location?: string };

export default function PropertyMap({ properties }: { properties: P[] }) {
  const { isLoaded, error } = useGoogleMaps();

  const valid = properties.filter(p => Number(p.lat) && Number(p.lng));
  const center = useMemo(() => valid.length ? { lat: valid[0].lat, lng: valid[0].lng } : { lat: 23.5859, lng: 58.4059 }, [JSON.stringify(valid.map(v => [v.lat, v.lng]))]);
  const [openId, setOpenId] = useState<number|string|null>(null);

  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!isLoaded) return <div className="text-sm text-gray-500">جاري تحميل الخريطة…</div>;

  return (
    <GoogleMap mapContainerStyle={{ width: "100%", height: 360 }} center={center} zoom={valid.length ? 12 : 6}>
      {valid.map((p) => <Marker key={p.id} position={{ lat: p.lat, lng: p.lng }} onClick={() => setOpenId(p.id)} />)}
      {valid.map(p => openId === p.id && (
        <InfoWindow key={`inf-${p.id}`} position={{ lat: p.lat, lng: p.lng }} onCloseClick={() => setOpenId(null)}>
          <div className="text-sm">
            <div className="font-semibold mb-1">{p.title}</div>
            {p.image && <img src={p.image} alt={p.title} className="w-40 h-24 object-cover rounded" />}
            {p.location && <div className="text-xs text-gray-600 mt-1">{p.location}</div>}
          </div>
        </InfoWindow>
      ))}
    </GoogleMap>
  );
}
