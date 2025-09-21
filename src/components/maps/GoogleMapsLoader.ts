// src/components/maps/GoogleMapsLoader.ts
import { useJsApiLoader } from "@react-google-maps/api";

/**
 * ⚠️ مهم:
 *  - لا تستعمل "maps" ضمن libraries — ليست مكتبة صالحة.
 *  - استخدم نفس الإعدادات في كامل المشروع.
 */
export const GMAPS_LIBRARIES = ["places"] as const;

export function useGoogleMapsLoader() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "script-loader", // حافظ على نفس الـ id في كل مكان
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: Array.from(GMAPS_LIBRARIES) as ("places" | "geometry" | "drawing" | "visualization")[], // النوع المتوقع string[]
    // يمكنك توحيد اللغة/الريجون هنا إن رغبت:
    // language: "ar",
    // region: "OM",
    version: "weekly"
  });
  return { isLoaded, loadError };
}
