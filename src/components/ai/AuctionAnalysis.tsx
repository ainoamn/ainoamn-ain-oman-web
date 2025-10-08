import React from 'react';
import { AIAnalysis } from '@/types/auction';
import { useI18n } from '@/lib/i18n';

interface AuctionAnalysisProps {
  analysis: AIAnalysis;
  loading?: boolean;
}

const AuctionAnalysis: React.FC<AuctionAnalysisProps> = ({ analysis, loading = false }) => {
  const { t, dir } = useI18n();
  
  if (loading) {
    return (
      <div dir={dir} className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">{t('ai.analysis')}</h3>
        <div className="mt-4 flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
          <span className="mr-3 text-gray-500">{t('ai.analyzing')}</span>
        </div>
      </div>
    );
  }

  const formatPrice = (n: number) => new Intl.NumberFormat('ar-OM').format(n) + ' ر.ع';

  const riskColors = {
    low: 'text-emerald-600',
    medium: 'text-amber-600',
    high: 'text-rose-600'
  };

  const trendIcons = {
    rising: '📈',
    stable: '➡️',
    declining: '📉'
  };

  return (
    <div dir={dir} className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('ai.analysis')}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">{t('ai.fairValue')}</div>
          <div className="text-lg font-semibold">{formatPrice(analysis.fairValue)}</div>
        </div>
        
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">{t('ai.risk')}</div>
          <div className={`text-lg font-semibold ${riskColors[analysis.risk as keyof typeof riskColors] || 'text-gray-600'}`}>
            {t(`ai.riskLevel.${analysis.risk}`)}
          </div>
        </div>
        
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">{t('ai.marketTrend')}</div>
          <div className="text-lg font-semibold">
            {trendIcons[analysis.marketTrend]} {t(`ai.trend.${analysis.marketTrend}`)}
          </div>
        </div>
        
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">{t('ai.confidence')}</div>
          <div className="text-lg font-semibold">{analysis.confidence}%</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500 mb-2">{t('ai.predictedPrice')}</div>
          <div className="text-xl font-bold text-purple-600">{formatPrice(analysis.predictedFinalPrice)}</div>
          <div className="text-sm text-slate-500 mt-1">{t('ai.predictionNote')}</div>
        </div>
        
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500 mb-2">{t('ai.recommendation')}</div>
          <div className="text-sm text-slate-700">{analysis.nextStepRecommendation}</div>
        </div>
      </div>
      
      {analysis.comparableProperties && analysis.comparableProperties.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 mb-2">{t('ai.comparableProperties')}</div>
          <div className="text-sm text-slate-700">
            {t('ai.analysisBasedOn')} {analysis.comparableProperties.length} {t('ai.similarProperties')}
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-slate-400 text-left">
        {t('ai.lastUpdated')} {new Date(analysis.updatedAt).toLocaleString('ar', { calendar: 'gregory', numberingSystem: 'latn' })}
      </div>
    </div>
  );
};

export default AuctionAnalysis;