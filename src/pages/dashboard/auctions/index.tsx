// src/pages/dashboard/auctions/index.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Head from 'next/head';
import InstantLink from '@/components/InstantLink';
import { auctionService } from '@/services/auctionService';
import { paymentService } from '@/services/paymentService';

export default function AuctionDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active');
  const [auctions, setAuctions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    completed: 0,
    pending: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const authStr = localStorage.getItem('ain_auth');
        if (authStr) {
          const auth = JSON.parse(authStr);
          setUser(auth);
        }
      } catch (e) {
        console.error('Error loading user:', e);
      }
    }
    
    loadAuctions();
    loadStats();
  }, [activeTab]);

  const loadAuctions = async () => {
    try {
      const data = await auctionService.getUserAuctions(activeTab);
      setAuctions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading auctions:', error);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await auctionService.getDashboardStats();
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const createAuction = async () => {
    if (user && user.subscription && !user.subscription.active) {
      alert('يجب أن يكون لديك اشتراك نشط لإنشاء مزاد');
      await router.push('/subscriptions');
      return;
    }

    const listingFee = 100;
    if (user && user.balance && user.balance < listingFee) {
      alert('رصيدك غير كافٍ لدفع رسوم الإدراج');
      await router.push('/dashboard/wallet');
      return;
    }

    try {
      if (user && user.balance) {
        await paymentService.deductListingFee(listingFee);
      }
      await router.push('/dashboard/auctions/create');
    } catch (error) {
      alert('فشل في الخصم: ' + (error as any).message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>لوحة تحكم المزادات | Ain Oman</title>
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">لوحة المزادات</h1>
            <button 
              onClick={createAuction}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
            >
              إنشاء مزاد جديد
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 font-bold text-2xl">{stats.total}</div>
              <div className="text-blue-800">إجمالي المزادات</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 font-bold text-2xl">{stats.active}</div>
              <div className="text-green-800">مزادات نشطة</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-yellow-600 font-bold text-2xl">{stats.scheduled}</div>
              <div className="text-yellow-800">مجدولة</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-purple-600 font-bold text-2xl">{stats.revenue} ر.ع</div>
              <div className="text-purple-800">إجمالي الإيرادات</div>
            </div>
          </div>
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {['active', 'scheduled', 'completed', 'pending', 'draft'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {getTabName(tab)}
                </button>
              ))}
            </nav>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العنوان</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">أعلى مزايدة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد المزايدات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وقت المتبقي</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auctions.length > 0 ? auctions.map(auction => (
                  <AuctionRow key={auction.id} auction={auction} onUpdate={loadAuctions} />
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">لا توجد مزادات</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuctionRow({ auction, onUpdate }: { auction: any; onUpdate: () => void }) {
  const router = useRouter();
  
  const hasRole = (role: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const authStr = localStorage.getItem('ain_auth');
      if (authStr) {
        const auth = JSON.parse(authStr);
        return auth.role === role || auth.role === 'admin';
      }
    } catch (e) {
      return false;
    }
    return false;
  };
  
  const handleAction = async (action: string, auctionId: string) => {
    switch (action) {
      case 'edit':
        router.push(`/dashboard/auctions/edit/${auctionId}`);
        break;
      case 'approve':
        try {
          await auctionService.approveAuction(auctionId);
          onUpdate();
        } catch (error) {
          console.error('Error approving auction:', error);
        }
        break;
      case 'reject':
        try {
          await auctionService.rejectAuction(auctionId);
          onUpdate();
        } catch (error) {
          console.error('Error rejecting auction:', error);
        }
        break;
      case 'promote':
        try {
          await auctionService.promoteAuction(auctionId);
          onUpdate();
        } catch (error) {
          console.error('Error promoting auction:', error);
        }
        break;
      case 'delete':
        if (confirm('هل أنت متأكد من حذف هذا المزاد؟')) {
          try {
            await auctionService.deleteAuction(auctionId);
            onUpdate();
          } catch (error) {
            console.error('Error deleting auction:', error);
          }
        }
        break;
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {auction.images?.[0] ? (
              <Image 
                className="h-10 w-10 rounded-md object-cover" 
                src={auction.images[0]} 
                alt={auction.title || 'مزاد'} 
                width={40} 
                height={40}
                unoptimized
              />
            ) : (
              <div className="h-10 w-10 rounded-md bg-gray-200" />
            )}
          </div>
          <div className="mr-4">
            <div className="text-sm font-medium text-gray-900">{auction.title || 'بدون عنوان'}</div>
            <div className="text-sm text-gray-500">{auction.location?.address || ''}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(auction.status)}`}>
          {getStatusText(auction.status)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatPrice(auction.currentBid)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {auction.bids?.length || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {auction.status === 'active' ? getTimeRemaining(auction.endTime) : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          <InstantLink href={`/auctions/${auction.id}`} className="text-blue-600 hover:text-blue-900">عرض</InstantLink>
          {['draft', 'rejected'].includes(auction.status) && (
            <button onClick={() => handleAction('edit', auction.id)} className="text-yellow-600 hover:text-yellow-900">تعديل</button>
          )}
          {auction.status === 'pending' && hasRole('admin') && (
            <>
              <button onClick={() => handleAction('approve', auction.id)} className="text-green-600 hover:text-green-900">الموافقة</button>
              <button onClick={() => handleAction('reject', auction.id)} className="text-red-600 hover:text-red-900">رفض</button>
            </>
          )}
          {auction.status === 'active' && (
            <button onClick={() => handleAction('promote', auction.id)} className="text-purple-600 hover:text-purple-900">ترقية</button>
          )}
          <button onClick={() => handleAction('delete', auction.id)} className="text-red-600 hover:text-red-900">حذف</button>
        </div>
      </td>
    </tr>
  );
}

function getTabName(tab: string): string {
  const names: Record<string, string> = {
    active: 'نشطة',
    scheduled: 'مجدولة',
    completed: 'مكتملة',
    pending: 'قيد المراجعة',
    draft: 'مسودات'
  };
  return names[tab] || tab;
}

function getStatusText(status: string): string {
  const statuses: Record<string, string> = {
    active: 'نشط',
    scheduled: 'مجدول',
    completed: 'مكتمل',
    pending: 'قيد المراجعة',
    draft: 'مسودة',
    rejected: 'مرفوض'
  };
  return statuses[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    draft: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function formatPrice(amount: number): string {
  if (!amount) return '0 ر.ع';
  return `${amount.toLocaleString()} ر.ع`;
}

function getTimeRemaining(endTime: string): string {
  if (!endTime) return '-';
  const end = new Date(endTime);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  if (diff < 0) return 'منتهي';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days} يوم`;
  if (hours > 0) return `${hours} ساعة`;
  return `${minutes} دقيقة`;
}
