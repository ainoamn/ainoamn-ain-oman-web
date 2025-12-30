// src/components/common/LanguageSwitcher-enhanced.tsx - مبدل اللغة المحسّن
import React from 'react';
import { useI18n, SUPPORTED_LANGS, LANGUAGES } from '@/lib/i18n-enhanced';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';

export default function EnhancedLanguageSwitcher() {
  const { lang, setLang, getLanguageInfo } = useI18n();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLang = getLanguageInfo(lang);

  return (
    <div className="relative" dir="ltr">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        aria-label="Change language"
      >
        <FaGlobe className="text-gray-600" />
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-sm font-medium text-gray-700">
          {currentLang.nativeName}
        </span>
        <FaChevronDown className={`text-xs text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[200px]">
            {SUPPORTED_LANGS.map((l) => {
              const info = getLanguageInfo(l);
              const isActive = l === lang;
              
              return (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    setIsOpen(false);
                  }}
                  className={`w-full text-right px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <span className="text-xl">{info.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{info.nativeName}</div>
                    <div className="text-xs text-gray-500">{info.name}</div>
                  </div>
                  {isActive && (
                    <span className="text-blue-600">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}






