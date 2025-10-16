// src/components/LazyChart.tsx - Lazy loading للرسوم البيانية
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Lazy load Recharts components
export const LazyAreaChart = dynamic(
  () => import('recharts').then(mod => mod.AreaChart as any),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-xl"></div> }
);

export const LazyBarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart as any),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-xl"></div> }
);

export const LazyLineChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart as any),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-xl"></div> }
);

export const LazyPieChart = dynamic(
  () => import('recharts').then(mod => mod.PieChart as any),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-xl"></div> }
);

// Export all Recharts components with dynamic loading
export const Area = dynamic(() => import('recharts').then(mod => mod.Area as any), { ssr: false });
export const Bar = dynamic(() => import('recharts').then(mod => mod.Bar as any), { ssr: false });
export const Line = dynamic(() => import('recharts').then(mod => mod.Line as any), { ssr: false });
export const Pie = dynamic(() => import('recharts').then(mod => mod.Pie as any), { ssr: false });
export const Cell = dynamic(() => import('recharts').then(mod => mod.Cell as any), { ssr: false });
export const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis as any), { ssr: false });
export const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis as any), { ssr: false });
export const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid as any), { ssr: false });
export const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip as any), { ssr: false });
export const Legend = dynamic(() => import('recharts').then(mod => mod.Legend as any), { ssr: false });
export const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer as any), { ssr: false });

