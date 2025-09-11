// src/pages/dashboard/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  FiUsers, FiShoppingCart, FiDollarSign, FiActivity,
  FiCalendar, FiMessageSquare, FiSettings, FiLogOut,
  FiHome, FiTrendingUp, FiPackage, FiUser
} from 'react-icons/fi';

// بيانات وهمية للإحصائيات
const dashboardStats = [
  { id: 1, title: 'إجمالي المستخدمين', value: '2,842', icon: <FiUsers size={24} />, change: '+12%', color: 'bg-blue-500' },
  { id: 2, title: 'إجمالي المبيعات', value: '$28,421', icon: <FiDollarSign size={24} />, change: '+8%', color: 'bg-green-500' },
  { id: 3, title: 'الطلبات الجديدة', value: '342', icon: <FiShoppingCart size={24} />, change: '-3%', color: 'bg-yellow-500' },
  { id: 4, title: 'نشاط النظام', value: '92.4%', icon: <FiActivity size={24} />, change: '+2%', color: 'bg-purple-500' }
];

// بيانات وهمية للرسم البياني
const chartData = [
  { name: 'يناير', مبيعات: 4000, مستخدمون: 2400 },
  { name: 'فبراير', مبيعات: 3000, مستخدمون: 1398 },
  { name: 'مارس', مبيعات: 2000, مستخدمون: 9800 },
  { name: 'أبريل', مبيعات: 2780, مستخدمون: 3908 },
  { name: 'مايو', مبيعات: 1890, مستخدمون: 4800 },
  { name: 'يونيو', مبيعات: 2390, مستخدمون: 3800 },
  { name: 'يوليو', مبيعات: 3490, مستخدمون: 4300 }
];

// بيانات وهمية للفئات
const categoryData = [
  { name: 'إلكترونيات', value: 35 },
  { name: 'ملابس', value: 25 },
  { name: 'أطعمة', value: 20 },
  { name: 'أخرى', value: 20 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// بيانات وهمية للطلبات الحديثة
const recentOrders = [
  { id: '#ORD-001', customer: 'أحمد محمد', date: '2023-10-01', amount: '$120', status: 'مكتمل' },
  { id: '#ORD-002', customer: 'سارة عبدالله', date: '2023-10-02', amount: '$85', status: 'قيد التجهيز' },
  { id: '#ORD-003', customer: 'محمد خالد', date: '2023-10-02', amount: '$240', status: 'مكتمل' },
  { id: '#ORD-004', customer: 'فاطمة علي', date: '2023-10-03', amount: '$65', status: 'ملغي' },
  { id: '#ORD-005', customer: 'يوسف إبراهيم', date: '2023-10-04', amount: '$150', status: 'قيد التجهيز' }
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* الشريط الجانبي */}
      <div className={`bg-white shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b">
          {sidebarOpen && <h1 className="text-xl font-bold">نظام الإدارة</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full hover:bg-gray-100">
            <FiActivity size={20} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto pt-6">
          <div className={`px-4 space-y-2 ${!sidebarOpen && 'flex flex-col items-center'}`}>
            <button className={`flex items-center w-full p-2 rounded-lg ${activeTab === 'overview' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('overview')}>
              <FiHome size={20} />
              {sidebarOpen && <span className="mr-2">نظرة عامة</span>}
            </button>
            
            <button className={`flex items-center w-full p-2 rounded-lg ${activeTab === 'analytics' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('analytics')}>
              <FiTrendingUp size={20} />
              {sidebarOpen && <span className="mr-2">التحليلات</span>}
            </button>
            
            <button className={`flex items-center w-full p-2 rounded-lg ${activeTab === 'products' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('products')}>
              <FiPackage size={20} />
              {sidebarOpen && <span className="mr-2">المنتجات</span>}
            </button>
            
            <button className={`flex items-center w-full p-2 rounded-lg ${activeTab === 'customers' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('customers')}>
              <FiUser size={20} />
              {sidebarOpen && <span className="mr-2">العملاء</span>}
            </button>
          </div>
        </nav>
        
        <div className="p-4 border-t">
          <button className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100">
            <FiLogOut size={20} />
            {sidebarOpen && <span className="mr-2">تسجيل الخروج</span>}
          </button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 overflow-y-auto">
        {/* الشريط العلوي */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">لوحة التحكم</h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <FiMessageSquare size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <FiCalendar size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <FiSettings size={20} />
            </button>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <FiUser size={16} />
            </div>
          </div>
        </header>

        {/* المحتوى */}
        <main className="p-6">
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map(stat => (
              <div key={stat.id} className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <span className={`text-xs ${stat.change.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change} من الشهر الماضي
                  </span>
                </div>
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>

          {/* الرسوم البيانية */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">مبيعات الشهر</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="مبيعات" fill="#8884d8" />
                  <Bar dataKey="مستخدمون" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">توزيع المبيعات حسب الفئة</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* جدول الطلبات الحديثة */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">الطلبات الحديثة</h3>
              <button className="text-blue-600 text-sm">عرض الكل</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-right text-sm text-gray-500 border-b">
                    <th className="pb-3 px-4">الحالة</th>
                    <th className="pb-3 px-4">المبلغ</th>
                    <th className="pb-3 px-4">التاريخ</th>
                    <th className="pb-3 px-4">العميل</th>
                    <th className="pb-3 px-4">رقم الطلب</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} className="text-sm border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'مكتمل' ? 'bg-green-100 text-green-800' :
                          order.status === 'قيد التجهيز' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{order.amount}</td>
                      <td className="py-3 px-4 text-gray-500">{order.date}</td>
                      <td className="py-3 px-4">{order.customer}</td>
                      <td className="py-3 px-4 font-medium">{order.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}