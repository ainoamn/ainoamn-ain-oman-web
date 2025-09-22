import { useEffect, useState } from "react";
function usePersistedState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.setTimeout(() => {
      window.localStorage.setItem(key, JSON.stringify(state));
    }, 300);
    return () => window.clearTimeout(id);
  }, [key, state]);

  return [state, setState] as const;
}
