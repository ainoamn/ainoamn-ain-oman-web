// src/components/SafeText.tsx
// مكون آمن لعرض النصوص - يحل مشكلة Objects في React ⚡

import React from 'react';

interface SafeTextProps {
  value: any;
  lang?: 'ar' | 'en';
  fallback?: string;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
}

/**
 * SafeText - مكون آمن لعرض النصوص
 * 
 * يحل مشكلة: Objects are not valid as a React child
 * 
 * @example
 * <SafeText value={property.title} />
 * <SafeText value={{ar: "نص", en: "text"}} lang="ar" />
 */
export default function SafeText({
  value,
  lang = 'ar',
  fallback = '',
  className = '',
  as: Component = 'span',
}: SafeTextProps) {
  const text = toSafeText(value, lang, fallback);
  
  return <Component className={className}>{text}</Component>;
}

/**
 * تحويل أي قيمة إلى نص آمن
 */
export function toSafeText(value: any, lang: 'ar' | 'en' = 'ar', fallback: string = ''): string {
  // null أو undefined
  if (value == null) return fallback;
  
  // string بالفعل
  if (typeof value === 'string') return value;
  
  // number
  if (typeof value === 'number') return value.toString();
  
  // boolean
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
  
  // object مع ar/en
  if (typeof value === 'object') {
    // تحقق من وجود المفاتيح
    if ('ar' in value || 'en' in value) {
      return value[lang] || value.ar || value.en || fallback;
    }
    
    // إذا كان object عادي، حاول تحويله
    if (Object.keys(value).length > 0) {
      const firstKey = Object.keys(value)[0];
      return toSafeText(value[firstKey], lang, fallback);
    }
  }
  
  // array
  if (Array.isArray(value)) {
    return value.map(v => toSafeText(v, lang, fallback)).join(', ');
  }
  
  // fallback
  return fallback || String(value);
}

/**
 * SafeTitle - مكون خاص للعناوين
 */
export function SafeTitle({ value, lang, className, level = 1 }: 
  SafeTextProps & { level?: 1 | 2 | 3 | 4 | 5 | 6 }
) {
  const Component = `h${level}` as any;
  return <SafeText value={value} lang={lang} className={className} as={Component} />;
}

/**
 * SafeDescription - مكون خاص للأوصاف
 */
export function SafeDescription({ value, lang, className }: SafeTextProps) {
  return <SafeText value={value} lang={lang} className={className} as="p" />;
}

