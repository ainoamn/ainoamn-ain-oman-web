// src/components/maps/GoogleMapsProvider.tsx
import { createContext, useContext, useMemo } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

type Ctx = { isLoaded: boolean; error?: string };
const GoogleMapsCtx = createContext<Ctx>({ isLoaded: false });

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"], // أضف ما تحتاجه
    id: "ain-oman-maps",
  });

  const value = useMemo<Ctx>(() => ({
    isLoaded,
    error: loadError ? String(loadError) : undefined
  }), [isLoaded, loadError]);

  return <GoogleMapsCtx.Provider value={value}>{children}</GoogleMapsCtx.Provider>;
}

export function useGoogleMaps() {
  return useContext(GoogleMapsCtx);
}
