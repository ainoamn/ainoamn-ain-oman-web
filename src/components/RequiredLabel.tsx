// src/components/RequiredLabel.tsx
// مكون لعرض التسمية مع نجمة حمراء للحقول الإجبارية

import React from 'react';

interface RequiredLabelProps {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
  htmlFor?: string;
}

export default function RequiredLabel({ 
  children, 
  required = true, 
  className = '',
  htmlFor 
}: RequiredLabelProps) {
  return (
    <label 
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
    >
      {children}
      {required && (
        <span className="text-red-600 ml-1 font-bold text-lg" aria-label="حقل إجباري" title="حقل إجباري">
          *
        </span>
      )}
    </label>
  );
}

// مكون بديل للاستخدام المباشر
export function RequiredMark({ className = '' }: { className?: string }) {
  return (
    <span 
      className={`text-red-600 font-bold text-lg ${className}`} 
      aria-label="حقل إجباري"
      title="حقل إجباري"
    >
      *
    </span>
  );
}

// CSS Classes للحقول الإجبارية - للاستخدام في جميع أنحاء الموقع
export const REQUIRED_INPUT_CLASSES = 
  "w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50 bg-opacity-30 placeholder-red-400 placeholder-opacity-50";

export const REQUIRED_SELECT_CLASSES = 
  "w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50 bg-opacity-30";

export const REQUIRED_TEXTAREA_CLASSES = 
  "w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50 bg-opacity-30 placeholder-red-400 placeholder-opacity-50";

export const OPTIONAL_INPUT_CLASSES = 
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500";

