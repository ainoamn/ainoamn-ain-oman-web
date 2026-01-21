// src/components/dashboard/AIPredictionsPanel.tsx
// لوحة التنبؤات الذكية
import React, { useState, useEffect } from 'react';
import { 
  FiZap, FiTrendingUp, FiAlertCircle, FiCheckCircle,
  FiArrowRight, FiX
} from 'react-icons/fi';
import { aiPredictionEngine, Prediction, UserBehavior } from '@/lib/aiPredictions';

interface AIPredictionsPanelProps {
  userId: string;
  userRole: string;
  stats: any;
  onDismiss?: (predictionId: string) => void;
}

const typeConfig = {
  opportunity: {
    icon: FiTrendingUp,
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800'
  },
  warning: {
    icon: FiAlertCircle,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-800'
  },
  recommendation: {
    icon: FiCheckCircle,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800'
  },
  trend: {
    icon: FiZap,
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    iconColor: 'text-purple-600',
    titleColor: 'text-purple-800'
  }
};

export default function AIPredictionsPanel({
  userId,
  userRole,
  stats,
  onDismiss
}: AIPredictionsPanelProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPredictions();
  }, [userId, userRole, stats]);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      
      // الحصول على سلوك المستخدم
      const behavior = aiPredictionEngine['getUserBehavior'](userId);
      behavior.role = userRole as any;
      behavior.lastLogin = new Date();

      // توليد التنبؤات
      const preds = await aiPredictionEngine.generatePredictions(behavior, stats);
      
      // تصفية التنبؤات المنتهية
      const validPreds = preds.filter(p => {
        if (p.expiresAt && new Date(p.expiresAt) < new Date()) {
          return false;
        }
        return !dismissed.has(p.id);
      });

      setPredictions(validPreds.slice(0, 5)); // عرض أول 5 تنبؤات
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FiZap className="text-purple-600" />
            التنبؤات الذكية
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <FiZap className="text-purple-600" />
          التنبؤات الذكية
          <span className="text-sm font-normal text-gray-500">
            ({predictions.length})
          </span>
        </h2>
      </div>

      <div className="space-y-3">
        {predictions.map(prediction => {
          const config = typeConfig[prediction.type];
          const Icon = config.icon;

          return (
            <div
              key={prediction.id}
              className={`${config.bg} ${config.border} border rounded-lg p-4 relative group`}
            >
              <button
                onClick={() => handleDismiss(prediction.id)}
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded"
              >
                <FiX className="w-4 h-4 text-gray-400" />
              </button>

              <div className="flex items-start gap-3 pr-6">
                <div className={`${config.iconColor} mt-1`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${config.titleColor} mb-1`}>
                    {prediction.title}
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    {prediction.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        ثقة: {prediction.confidence}%
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        prediction.impact === 'critical' ? 'bg-red-100 text-red-800' :
                        prediction.impact === 'high' ? 'bg-orange-100 text-orange-800' :
                        prediction.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {prediction.impact === 'critical' ? 'حرج' :
                         prediction.impact === 'high' ? 'عالي' :
                         prediction.impact === 'medium' ? 'متوسط' : 'منخفض'}
                      </span>
                    </div>
                    {prediction.actionUrl && (
                      <a
                        href={prediction.actionUrl}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {prediction.actionLabel || 'عرض'}
                        <FiArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
