// src/components/QuickNav.tsx
// مكون التنقل السريع - يستخدم InstantLink تلقائياً ⚡

import React from 'react';
import InstantLink from '@/components/InstantLink';
import { useRouter } from 'next/router';

interface QuickNavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface QuickNavProps {
  items: QuickNavItem[];
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}

/**
 * QuickNav - مكون تنقل سريع يستخدم InstantLink ⚡
 * 
 * يوفر تنقل فوري مع تمييز الصفحة النشطة
 */
export default function QuickNav({
  items,
  className = '',
  activeClassName = 'text-blue-600 bg-blue-50',
  inactiveClassName = 'text-gray-600 hover:text-blue-600 hover:bg-blue-50',
}: QuickNavProps) {
  const router = useRouter();

  return (
    <nav className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => {
        const isActive = router.pathname === item.href || router.asPath === item.href;
        const Icon = item.icon;

        return (
          <InstantLink
            key={item.href}
            href={item.href}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${isActive ? activeClassName : inactiveClassName}
            `}
          >
            {Icon && <Icon className="inline-block w-5 h-5 mr-2" />}
            {item.label}
          </InstantLink>
        );
      })}
    </nav>
  );
}

/**
 * QuickNavVertical - نسخة عمودية من QuickNav
 */
export function QuickNavVertical({
  items,
  className = '',
  activeClassName = 'text-blue-600 bg-blue-50 border-r-4 border-blue-600',
  inactiveClassName = 'text-gray-600 hover:text-blue-600 hover:bg-blue-50',
}: QuickNavProps) {
  const router = useRouter();

  return (
    <nav className={`flex flex-col gap-1 ${className}`}>
      {items.map((item) => {
        const isActive = router.pathname === item.href || router.asPath === item.href;
        const Icon = item.icon;

        return (
          <InstantLink
            key={item.href}
            href={item.href}
            className={`
              px-4 py-3 rounded-lg font-medium transition-all duration-200
              flex items-center gap-3
              ${isActive ? activeClassName : inactiveClassName}
            `}
          >
            {Icon && <Icon className="w-5 h-5" />}
            <span>{item.label}</span>
          </InstantLink>
        );
      })}
    </nav>
  );
}

/**
 * BreadcrumbNav - مسار التنقل
 */
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNav({ items, className = '' }: BreadcrumbNavProps) {
  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400">/</span>}
          {item.href ? (
            <InstantLink
              href={item.href}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              {item.label}
            </InstantLink>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

