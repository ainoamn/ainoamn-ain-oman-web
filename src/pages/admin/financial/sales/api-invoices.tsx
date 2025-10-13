// src/pages/admin/financial/sales/api-invoices.tsx - فواتير API
import React, { useState } from 'react';
import Head from 'next/head';
import { FiSend, FiPlus, FiX, FiSave, FiLink } from 'react-icons/fi';

export default function APIInvoicesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    apiSource: '',
    apiKey: '',
    endpoint: ''
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head><title>فواتير API - المبيعات</title></Head>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FiSend className="text-pink-600" />
              فواتير من API
            </h1>
            <p className="text-gray-600 mt-2">فواتير مستوردة من أنظمة خارجية عبر API</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-pink-700"
          >
            <FiPlus />
            ربط API جديد
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-600 text-center py-8">لا توجد اتصالات API</p>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
              <div className="bg-pink-600 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">ربط API جديد</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-white p-2 rounded hover:bg-white hover:bg-opacity-20">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">مصدر API *</label>
                  <select
                    value={formData.apiSource}
                    onChange={(e) => setFormData({ ...formData, apiSource: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">اختر المصدر...</option>
                    <option value="shopify">Shopify</option>
                    <option value="woocommerce">WooCommerce</option>
                    <option value="custom">مخصص</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">API Key</label>
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Endpoint URL</label>
                  <input
                    type="url"
                    value={formData.endpoint}
                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="https://api.example.com/invoices"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 border rounded-lg">إلغاء</button>
                <button
                  onClick={() => {
                    if (!formData.apiSource) {
                      alert('الرجاء اختيار مصدر API');
                      return;
                    }
                    alert('تم ربط API بنجاح!');
                    setShowCreateModal(false);
                  }}
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  <FiLink className="inline ml-2" />
                  ربط
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
