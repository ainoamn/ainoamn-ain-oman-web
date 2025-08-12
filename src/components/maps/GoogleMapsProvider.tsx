// src/components/maps/GoogleMapsProvider.tsx
import { createContext, useContext, useMemo, useState } from "react";
import { LoadScriptNext } from "@react-google-maps/api";

type Ctx = { isLoaded: boolean; error?: string };
const GoogleMapsCtx = createContext<Ctx>({ isLoaded: false });

export const GMAPS_LIBRARIES = ["places"] as const; // لا تستخدم "maps" فهي غير صالحة

export default function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const ctx = useMemo(() => ({ isLoaded, error }), [isLoaded, error]);

  return (
    <GoogleMapsCtx.Provider value={ctx}>
      <LoadScriptNext
        id="google-maps-script" // تحميل واحد ثابت
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
        libraries={GMAPS_LIBRARIES as unknown as string[]}
        // يمكن ضبط اللغة/المنطقة إن رغبت:
        // language="ar"
        // region="OM"
        onLoad={() => setIsLoaded(true)}
        onError={(e) => setError("فشل تحميل خرائط جوجل")}
      >
        {children}
      </LoadScriptNext>
    </GoogleMapsCtx.Provider>
  );
}

export function useGoogleMaps() {
  return useContext(GoogleMapsCtx);
}
