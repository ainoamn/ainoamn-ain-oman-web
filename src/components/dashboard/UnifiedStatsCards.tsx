// src/components/dashboard/UnifiedStatsCards.tsx
// بطاقات إحصائيات موحدة لجميع لوحات التحكم
import React from 'react';
import { IconType } from 'react-icons';

interface StatCard {
  title: string;
  value: string | number;
  change?: number; // نسبة التغيير (موجب = زيادة، سالب = نقصان)
  changeLabel?: string;
  icon: IconType;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo';
  trend?: 'up' | 'down' | 'stable';
  loading?: boolean;
}

interface UnifiedStatsCardsProps {
  stats: StatCard[];
  columns?: 2 | 3 | 4;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200',
    text: 'text-blue-700'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200',
    text: 'text-green-700'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200',
    text: 'text-purple-700'
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    border: 'border-yellow-200',
    text: 'text-yellow-700'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-200',
    text: 'text-red-700'
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    border: 'border-indigo-200',
    text: 'text-indigo-700'
  }
};

export default function UnifiedStatsCards({ 
  stats, 
  columns = 4 
}: UnifiedStatsCardsProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 mb-8`}>
      {stats.map((stat, index) => {
        const colors = colorClasses[stat.color];
        const Icon = stat.icon;
        const isPositive = stat.change !== undefined && stat.change > 0;
        const isNegative = stat.change !== undefined && stat.change < 0;
        
        return (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-sm border ${colors.border} p-6 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                {stat.loading ? (
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {typeof stat.value === 'number' 
                      ? stat.value.toLocaleString('ar-OM')
                      : stat.value
                    }
                  </p>
                )}
                {stat.change !== undefined && !stat.loading && (
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-sm font-medium ${
                        isPositive
                          ? 'text-green-600'
                          : isNegative
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {isPositive && '+'}
                      {stat.change.toFixed(1)}%
                    </span>
                    {stat.changeLabel && (
                      <span className="text-xs text-gray-500 mr-2">
                        {stat.changeLabel}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className={`${colors.bg} rounded-lg p-3`}>
                <Icon className={`w-6 h-6 ${colors.icon}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
