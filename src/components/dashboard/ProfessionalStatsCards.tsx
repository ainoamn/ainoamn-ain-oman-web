// src/components/dashboard/ProfessionalStatsCards.tsx
// بطاقات إحصائيات احترافية مع تصميم مريح للعين
import React from 'react';
import { IconType } from 'react-icons';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: IconType;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo' | 'pink' | 'teal';
  trend?: 'up' | 'down' | 'stable';
  loading?: boolean;
  subtitle?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    href?: string;
  };
  details?: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
}

interface ProfessionalStatsCardsProps {
  stats: StatCard[];
  columns?: 2 | 3 | 4;
}

const colorConfigs = {
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    border: 'border-blue-200/50',
    text: 'text-blue-700',
    lightText: 'text-blue-600'
  },
  green: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    border: 'border-emerald-200/50',
    text: 'text-emerald-700',
    lightText: 'text-emerald-600'
  },
  purple: {
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
    border: 'border-purple-200/50',
    text: 'text-purple-700',
    lightText: 'text-purple-600'
  },
  yellow: {
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    border: 'border-amber-200/50',
    text: 'text-amber-700',
    lightText: 'text-amber-600'
  },
  red: {
    gradient: 'from-rose-500 to-red-500',
    bg: 'bg-gradient-to-br from-rose-50 to-red-50',
    iconBg: 'bg-gradient-to-br from-rose-500 to-red-500',
    border: 'border-rose-200/50',
    text: 'text-rose-700',
    lightText: 'text-rose-600'
  },
  indigo: {
    gradient: 'from-indigo-500 to-blue-500',
    bg: 'bg-gradient-to-br from-indigo-50 to-blue-50',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-500',
    border: 'border-indigo-200/50',
    text: 'text-indigo-700',
    lightText: 'text-indigo-600'
  },
  pink: {
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-gradient-to-br from-pink-50 to-rose-50',
    iconBg: 'bg-gradient-to-br from-pink-500 to-rose-500',
    border: 'border-pink-200/50',
    text: 'text-pink-700',
    lightText: 'text-pink-600'
  },
  teal: {
    gradient: 'from-teal-500 to-cyan-500',
    bg: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-500',
    border: 'border-teal-200/50',
    text: 'text-teal-700',
    lightText: 'text-teal-600'
  }
};

export default function ProfessionalStatsCards({ 
  stats, 
  columns = 4 
}: ProfessionalStatsCardsProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 mb-6`}>
      {stats.map((stat, index) => {
        const config = colorConfigs[stat.color];
        const Icon = stat.icon;
        const isPositive = stat.change !== undefined && stat.change > 0;
        const isNegative = stat.change !== undefined && stat.change < 0;
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`relative overflow-hidden rounded-xl ${config.bg} backdrop-blur-sm border ${config.border} shadow-md shadow-black/5 hover:shadow-lg hover:shadow-black/10 transition-all duration-300 group`}
          >
            {/* Decorative gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            
            <div className="relative p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  {stat.loading ? (
                    <div className="h-8 w-24 bg-white/50 rounded-lg animate-pulse" />
                  ) : (
                    <motion.p 
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-gray-900 mb-0.5"
                    >
                      {typeof stat.value === 'number' 
                        ? stat.value.toLocaleString('ar-OM')
                        : stat.value
                      }
                    </motion.p>
                  )}
                  {stat.subtitle && (
                    <p className="text-[10px] text-gray-500 mt-0.5">{stat.subtitle}</p>
                  )}
                </div>
                
                {/* Icon with gradient background */}
                <div className={`${config.iconBg} rounded-lg p-2 shadow-md shadow-black/10 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Details */}
              {stat.details && stat.details.length > 0 && !stat.loading && (
                <div className="flex items-center justify-between text-[10px] mt-2 pt-2 border-t border-white/50">
                  {stat.details.map((detail, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-gray-500">{detail.label}</span>
                      <span className={`font-semibold text-xs ${detail.color || 'text-gray-900'}`}>
                        {typeof detail.value === 'number' 
                          ? detail.value.toLocaleString('ar-OM')
                          : detail.value
                        }
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Change indicator */}
              {stat.change !== undefined && !stat.loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/50"
                >
                  {isPositive ? (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <FiTrendingUp className="w-3 h-3" />
                      <span className="text-xs font-semibold">
                        +{stat.change.toFixed(1)}%
                      </span>
                    </div>
                  ) : isNegative ? (
                    <div className="flex items-center gap-1 text-rose-600">
                      <FiTrendingDown className="w-3 h-3" />
                      <span className="text-xs font-semibold">
                        {stat.change.toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-500">
                      <span className="text-xs font-medium">—</span>
                    </div>
                  )}
                  {stat.changeLabel && (
                    <span className="text-[10px] text-gray-500 font-medium">
                      {stat.changeLabel}
                    </span>
                  )}
                </motion.div>
              )}

              {/* Action Button */}
              {stat.actionButton && !stat.loading && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={stat.actionButton.onClick}
                  className={`w-full mt-3 py-1.5 px-3 ${config.bg} ${config.text} rounded-lg hover:opacity-90 transition-all text-xs font-medium shadow-sm hover:shadow`}
                >
                  {stat.actionButton.label}
                </motion.button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
