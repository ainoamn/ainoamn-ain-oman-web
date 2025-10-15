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

// Export all Recharts components with lazy loading
export { Area, Bar, Line, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

