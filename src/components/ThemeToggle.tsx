// src/components/ThemeToggle.tsx - زر تبديل الوضع الليلي/النهاري
import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="تبديل الوضع الليلي"
    >
      <div
        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          isDark ? 'translate-x-[-1.75rem]' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <FiMoon className="w-3 h-3 text-blue-600" />
        ) : (
          <FiSun className="w-3 h-3 text-yellow-500" />
        )}
      </div>
    </button>
  );
}

