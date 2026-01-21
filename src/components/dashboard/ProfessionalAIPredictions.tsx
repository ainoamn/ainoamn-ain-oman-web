// src/components/dashboard/ProfessionalAIPredictions.tsx
// لوحة تنبؤات ذكية احترافية مع تصميم مريح للعين
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiZap, FiTrendingUp, FiAlertCircle, FiCheckCircle,
  FiArrowRight, FiX, FiSparkles
} from 'react-icons/fi';
import { aiPredictionEngine, Prediction, UserBehavior } from '@/lib/aiPredictions';

interface ProfessionalAIPredictionsProps {
  userId: string;
  userRole: string;
  stats: any;
  onDismiss?: (predictionId: string) => void;
}

const typeConfig = {
  opportunity: {
    icon: FiTrendingUp,
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50',
    border: 'border-emerald-200/50',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    titleColor: 'text-emerald-800',
    textColor: 'text-emerald-700'
  },
  warning: {
    icon: FiAlertCircle,
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50',
    border: 'border-amber-200/50',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    titleColor: 'text-amber-800',
    textColor: 'text-amber-700'
  },
  recommendation: {
    icon: FiCheckCircle,
    gradient: 'from-blue-500 to-indigo-500',
    bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
    border: 'border-blue-200/50',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-500',
    titleColor: 'text-blue-800',
    textColor: 'text-blue-700'
  },
  trend: {
    icon: FiSparkles,
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50',
    border: 'border-purple-200/50',
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
    titleColor: 'text-purple-800',
    textColor: 'text-purple-700'
  }
};

export default function ProfessionalAIPredictions({
  userId,
  userRole,
  stats,
  onDismiss
}: ProfessionalAIPredictionsProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPredictions();
  }, [userId, userRole, stats]);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      
      const behavior = aiPredictionEngine['getUserBehavior'](userId);
      behavior.role = userRole as any;
      behavior.lastLogin = new Date();

      const preds = await aiPredictionEngine.generatePredictions(behavior, stats);
      
      const validPreds = preds.filter(p => {
        if (p.expiresAt && new Date(p.expiresAt) < new Date()) {
          return false;
        }
        return !dismissed.has(p.id);
      });

      setPredictions(validPreds.slice(0, 5));
    } catch (error) {
      console.error('Error loading predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (predictionId: string) => {
    setDismissed(prev => new Set([...prev, predictionId]));
    setPredictions(prev => prev.filter(p => p.id !== predictionId));
    if (onDismiss) {
      onDismiss(predictionId);
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-md shadow-black/5 p-4 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <FiZap className="w-4 h-4 text-white" />
            </div>
            التنبؤات الذكية
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (predictions.length === 0) {
    return null;
  }

  return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-md shadow-black/5 p-4 mb-6"
      >
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-rose-500/5"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md"
              >
                <FiZap className="w-4 h-4 text-white" />
              </motion.div>
              التنبؤات الذكية
              <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {predictions.length}
              </span>
            </h2>
          </div>

          <AnimatePresence>
            <div className="space-y-3">
            {predictions.map((prediction, index) => {
              const config = typeConfig[prediction.type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={prediction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  className={`relative overflow-hidden ${config.bg} ${config.border} border rounded-lg p-3 group cursor-pointer`}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <button
                    onClick={() => handleDismiss(prediction.id)}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/80 rounded-lg backdrop-blur-sm"
                  >
                    <FiX className="w-3 h-3 text-gray-400" />
                  </button>

                  <div className="relative flex items-start gap-3 pr-6">
                    <div className={`${config.iconBg} rounded-lg p-2 shadow-md`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold ${config.titleColor} mb-1 text-sm`}>
                        {prediction.title}
                      </h3>
                      <p className="text-xs text-gray-700 mb-2 leading-relaxed">
                        {prediction.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            prediction.impact === 'critical' ? 'bg-red-100 text-red-800' :
                            prediction.impact === 'high' ? 'bg-orange-100 text-orange-800' :
                            prediction.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {prediction.impact === 'critical' ? 'حرج' :
                             prediction.impact === 'high' ? 'عالي' :
                             prediction.impact === 'medium' ? 'متوسط' : 'منخفض'}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            ثقة: {prediction.confidence}%
                          </span>
                        </div>
                        {prediction.actionUrl && (
                          <a
                            href={prediction.actionUrl}
                            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {prediction.actionLabel || 'عرض'}
                            <FiArrowRight className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
