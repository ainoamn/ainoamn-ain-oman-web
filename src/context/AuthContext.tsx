// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { paymentService } from '@/services/paymentService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
  hasFeature: (feature: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* إضافات متوافقة: مزامنة مع localStorage["ain_auth"] + حدث تغيّر */
const AUTH_TOKEN_KEY = 'auth_token';
const AIN_AUTH_KEY = 'ain_auth';
const AUTH_EVENT = 'ain_auth:change';

function readLS(): User | null {
  try {
    const s = localStorage.getItem(AIN_AUTH_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}
function writeLS(u: User | null) {
  try {
    if (u) {
      localStorage.setItem(AIN_AUTH_KEY, JSON.stringify(u));
      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(AIN_AUTH_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    window.dispatchEvent(new CustomEvent(AUTH_EVENT));
  } catch (_e) {}
}

/** بديل آمن عند غياب authService.getCurrentUser */
async function fetchCurrentUserFallback(): Promise<User | null> {
  try {
    const endpoint = process.env.NEXT_PUBLIC_AUTH_ME_ENDPOINT || "/api/auth/me";
    const headers: Record<string, string> = {};
    // أرسل التوكن كـ Bearer إن وُجد
    const raw = localStorage.getItem(AUTH_TOKEN_KEY);
    let token: string | null = null;
    try { token = raw && raw.startsWith('"') ? JSON.parse(raw) : raw; } catch (_e) {}
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const r = await fetch(endpoint, { credentials: "include", headers });
    if (!r.ok) return null;
    const d = await r.json().catch(() => null);
    return (d?.user ?? d ?? null) as User | null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    // متابعة أي تغيّر خارجي للجلسة
    const onStorage = (e: StorageEvent) => {
      if (e.key === AIN_AUTH_KEY || e.key === AUTH_TOKEN_KEY) setUser(readLS());
    };
    const onCustom = () => setUser(readLS());
    window.addEventListener('storage', onStorage);
    window.addEventListener(AUTH_EVENT, onCustom as any);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(AUTH_EVENT, onCustom as any);
    };
  }, []);

  const checkAuth = async () => {
    try {
      // 1) تهيئة فورية من LS لتفادي وميض "سجّل الدخول"
      const boot = readLS();
      if (boot) setUser(boot);

      // 2) إن وُجد رمز، حدّث بيانات المستخدم من الخادم
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        const maybe = (authService as any)?.getCurrentUser;
        const userData: User | null =
          typeof maybe === 'function' ? await maybe() : await fetchCurrentUserFallback();
        if (userData) {
          setUser(userData);
          writeLS(userData); // توحيد المصدرين
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { user: userData, token } = await authService.login(email, password);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setUser(userData);
    writeLS(userData);
  };

  const register = async (userData: any) => {
    const { user: newUser, token } = await authService.register(userData);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setUser(newUser);
    writeLS(newUser);
  };

  const logout = () => {
    try { authService.logout(); } catch (_e) {}
    setUser(null);
    writeLS(null);
  };

  const hasRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const hasFeature = (feature: string): boolean => {
    if (!user) return false;
    const a = Array.isArray(user.features) ? user.features : [];
    const b = Array.isArray(user.subscription?.features) ? user.subscription!.features : [];
    return new Set([...a, ...b]).has(feature);
  };

  const refreshUser = async () => {
    try {
      const maybe = (authService as any)?.getCurrentUser;
      const userData: User | null =
        typeof maybe === 'function' ? await maybe() : await fetchCurrentUserFallback();
      if (userData) {
        setUser(userData);
        writeLS(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    hasRole,
    hasFeature,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
