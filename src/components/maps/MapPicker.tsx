// src/components/maps/MapPicker.tsx
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";
import { useMemo } from "react";

type Point = { lat: number; lng: number };
function MapPicker({
  center,
  height = 320,
  point,
  onPointChange,
  multi = false,
  points = [],
  onPointsChange,
  onMapClick,
}: {
  center?: Point;
  height?: number;
  /** وضع نقطة واحدة */
  point?: Point | undefined;
  onPointChange?: (p: Point) => void;
  /** وضع نقاط متعددة */
  multi?: boolean;
  points?: Point[];
  onPointsChange?: (ps: Point[]) => void;
  /** تمرير النقرة للصفحة (اختياري) */
  onMapClick?: (p: Point) => void;
}) {
  const { isLoaded, error } = useGoogleMaps();
  const defaultCenter = useMemo<Point>(() => center ?? { lat: 23.5859, lng: 58.4059 }, [center]);

  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!isLoaded) return <div className="text-sm text-gray-500">جاري تحميل الخريطة…</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height }}
      center={multi ? (points[0] ?? defaultCenter) : (point ?? defaultCenter)}
      zoom={(multi ? points.length : point) ? 13 : 7}
      onClick={(e) => {
        const lat = e.latLng?.lat(), lng = e.latLng?.lng();
        if (lat == null || lng == null) return;
        const p = { lat, lng };
        if (multi && onPointsChange) onPointsChange([...(points || []), p]);
        if (!multi && onPointChange) onPointChange(p);
        onMapClick?.(p);
      }}
    >
      {multi
        ? points.map((p, i) => <Marker key={`${p.lat}-${p.lng}-${i}`} position={p} />)
        : point && <Marker position={point} />}
    </GoogleMap>
  );
}
