// src/components/common/CurrencySwitcher-enhanced.tsx - مبدل العملة المحسّن
import React from 'react';
import { useCurrency, SUPPORTED_CURRENCIES, CURRENCIES } from '@/context/CurrencyContext-enhanced';
import { FaDollarSign, FaChevronDown } from 'react-icons/fa';

export default function EnhancedCurrencySwitcher() {
  const { currency, setCurrency, getCurrencyInfo } = useCurrency();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentCurrency = getCurrencyInfo(currency);

  return (
    <div className="relative" dir="ltr">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        aria-label="Change currency"
      >
        <FaDollarSign className="text-gray-600" />
        <span className="text-lg">{currentCurrency.flag}</span>
        <span className="text-sm font-medium text-gray-700">
          {currentCurrency.code}
        </span>
        <FaChevronDown className={`text-xs text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[250px]">
            {SUPPORTED_CURRENCIES.map((c) => {
              const info = getCurrencyInfo(c);
              const isActive = c === currency;
              
              return (
                <button
                  key={c}
                  onClick={() => {
                    setCurrency(c);
                    setIsOpen(false);
                  }}
                  className={`w-full text-right px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <span className="text-xl">{info.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      <span>{info.symbol}</span>
                      <span>{info.code}</span>
                    </div>
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






