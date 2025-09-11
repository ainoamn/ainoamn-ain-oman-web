import React from 'react';
import Layout from '../../../components/layout/Layout'; // استيراد التخطيط

const LawFirmsPage: React.FC = () => {
  return (
    <Layout> {/* إحاطة المحتوى بمكون التخطيط */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">مكاتب المحاماة</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">هذه الصفحة قيد التطوير.</p>
          <p className="text-gray-600">سيتم عرض قائمة بمكاتب المحاماة المتعاونة هنا.</p>
        </div>
      </div>
    </Layout>
  );
};

export default LawFirmsPage;