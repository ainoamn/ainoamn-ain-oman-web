// src/components/DynamicChart.tsx - Dynamic loading للرسوم البيانية
import dynamic from 'next/dynamic';
import React from 'react';

// Lazy load Recharts بالكامل
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart as any), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
});

const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart as any), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
});

const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart as any), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
});

const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart as any), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
});

export { AreaChart, BarChart, LineChart, PieChart };
export { Area, Bar, Line, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

