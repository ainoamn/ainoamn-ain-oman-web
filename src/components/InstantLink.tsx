// src/components/InstantLink.tsx
// مكون التنقل الفوري - يحمل الصفحات مسبقًا قبل النقر عليها
"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface InstantLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseEnter?: () => void;
  title?: string;
  target?: string;
  rel?: string;
  shallow?: boolean;
  scroll?: boolean;
  replace?: boolean;
  dir?: "rtl" | "ltr";
}

/**
 * InstantLink - مكون للتنقل الفوري بسرعة البرق ⚡
 * 
 * الميزات:
 * 1. Prefetch عند المرور بالماوس
 * 2. Prefetch عند التركيز (للوحة المفاتيح)
 * 3. Instant Navigation بدون تأخير
 * 4. Optimistic UI - التغيير فوري
 * 5. Smart Caching - تخزين ذكي
 */
export default function InstantLink({
  href,
  children,
  className = '',
  prefetch = true,
  onClick,
  onMouseEnter,
  title,
  target,
  rel,
  shallow = false,
  scroll = true,
  replace = false,
  dir,
}: InstantLinkProps) {
  const router = useRouter();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [isPrefetched, setIsPrefetched] = useState(false);
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Prefetch عند التحميل إذا كان الرابط مرئيًا
  useEffect(() => {
    if (!prefetch || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isPrefetched) {
            // Prefetch بعد 100ms من ظهور الرابط
            prefetchTimeoutRef.current = setTimeout(() => {
              router.prefetch(href).then(() => {
                setIsPrefetched(true);
              });
            }, 100);
          }
        });
      },
      {
        rootMargin: '50px', // ابدأ التحميل قبل 50px من ظهور الرابط
      }
    );

    if (linkRef.current) {
      observer.observe(linkRef.current);
    }

    return () => {
      if (linkRef.current) {
        observer.unobserve(linkRef.current);
      }
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, [href, prefetch, isPrefetched, router]);

  // Prefetch فوري عند المرور بالماوس
  const handleMouseEnter = () => {
    if (prefetch && !isPrefetched) {
      router.prefetch(href).then(() => {
        setIsPrefetched(true);
      });
    }
    onMouseEnter?.();
  };

  // Prefetch عند التركيز (للوحة المفاتيح)
  const handleFocus = () => {
    if (prefetch && !isPrefetched) {
      router.prefetch(href).then(() => {
        setIsPrefetched(true);
      });
    }
  };

  // معالجة النقر بطريقة فورية - سرعة البرق ⚡
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // إذا كان هناك معالج onClick مخصص
    if (onClick) {
      onClick(e);
      if (e.defaultPrevented) return;
    }

    // إذا كان الرابط يفتح في تاب جديد
    if (target === '_blank' || e.metaKey || e.ctrlKey) {
      return;
    }

    // منع السلوك الافتراضي للتنقل الفوري
    e.preventDefault();

    // Optimistic UI - تحديث فوري قبل التنقل
    if (typeof window !== 'undefined') {
      // إضافة فئة للتحميل الفوري
      document.body.classList.add('navigating');
      
      // إزالة الفئة بعد التنقل
      setTimeout(() => {
        document.body.classList.remove('navigating');
      }, 100);
    }

    // تنفيذ التنقل فورًا بدون await لتقليل التأخير
    if (replace) {
      router.replace(href, undefined, { shallow, scroll }).catch(() => {});
    } else {
      router.push(href, undefined, { shallow, scroll }).catch(() => {});
    }
  };

  return (
    <Link 
      ref={linkRef}
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      onClick={handleClick}
      title={title}
      target={target}
      rel={rel}
      dir={dir}
      prefetch={false} // نحن نتحكم في الـ prefetch يدويًا
    >
      {children}
    </Link>
  );
}

/**
 * InstantButton - زر للتنقل الفوري
 */
interface InstantButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function InstantButton({
  href,
  children,
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}: InstantButtonProps) {
  const router = useRouter();
  const [isPrefetched, setIsPrefetched] = useState(false);

  const handleMouseEnter = () => {
    if (!isPrefetched && !disabled) {
      router.prefetch(href).then(() => {
        setIsPrefetched(true);
      });
    }
  };

  const handleClick = async () => {
    if (disabled) return;
    
    if (onClick) {
      onClick();
    }

    // التنقل الفوري
    await router.push(href);
  };

  return (
    <button
      type={type}
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}


