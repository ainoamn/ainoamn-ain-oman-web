// src/pages/dashboard/auctions/index.tsx
import { useState, useEffect } from 'react';
import InstantImage from '@/components/InstantImage';
import { useRouter } from 'next/router';
import Head from 'next/head';
import InstantLink from '@/components/InstantLink';
import InstantLink, { InstantButton } from '@/components/InstantLink';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { auctionService } from '@/services/auctionService';
import { paymentService } from '@/services/paymentService';

export default function AuctionDashboard() {
  const { user, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active');
  const [auctions, setAuctions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    completed: 0,
    pending: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !hasRole(['seller', 'admin'])) {
      router.push('/login');
      return;
    }
    
    loadAuctions();
    loadStats();
  }, [activeTab]);

  const loadAuctions = async () => {
    try {
      const data = await auctionService.getUserAuctions(activeTab);
      setAuctions(data);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await auctionService.getDashboardStats();
      setStats(data);
    } catch (error) {

    }
  };

  const createAuction = async () => {
    // «· Õﬁﬁ „‰ «·«‘ —«ﬂ «·‰‘ÿ
    if (!user.subscription.active) {
      alert('ÌÃ» √‰ ÌﬂÊ‰ ·œÌﬂ «‘ —«ﬂ ‰‘ÿ ·≈‰‘«¡ „“«œ');
      await router.push('/subscriptions');
      return;
    }

    // «· Õﬁﬁ „‰ «·—’Ìœ ·œ›⁄ —”Ê„ «·≈œ—«Ã
    const listingFee = 100; // —”Ê„ «·≈œ—«Ã
    if (user.balance < listingFee) {
      alert('—’Ìœﬂ €Ì— ﬂ«›Ú ·œ›⁄ —”Ê„ «·≈œ—«Ã');
      await router.push('/dashboard/wallet');
      return;
    }

    // Œ’„ —”Ê„ «·≈œ—«Ã Ê≈‰‘«¡ «·„“«œ
    try {
      await paymentService.deductListingFee(listingFee);
      await router.push('/dashboard/auctions/create');
    } catch (error) {
      alert('›‘· ›Ì Œ’„ «·—”Ê„: ' + (error as any).message);
    }
  };

  if (loading) {
    return <div>Ã«—Ì «· Õ„Ì·...</div>;
  }

  return (
    <DashboardLayout>
      <Head>
        <title>·ÊÕ…  Õﬂ„ «·„“«œ«  | Ain Oman</title>
      </Head>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">≈œ«—… «·„“«œ« </h1>
          <button 
            onClick={createAuction}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
          >
            ≈‰‘«¡ „“«œ ÃœÌœ
          </button>
        </div>

        {/* ≈Õ’«∆Ì«  ”—Ì⁄… */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-600 font-bold text-2xl">{stats.total}</div>
            <div className="text-blue-800">≈Ã„«·Ì «·„“«œ« </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-600 font-bold text-2xl">{stats.active}</div>
            <div className="text-green-800">„“«œ«  ‰‘ÿ…</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-yellow-600 font-bold text-2xl">{stats.scheduled}</div>
            <div className="text-yellow-800">„ÃœÊ·…</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-purple-600 font-bold text-2xl">{stats.revenue} —.⁄</div>
            <div className="text-purple-800">≈Ã„«·Ì «·≈Ì—«œ« </div>
          </div>
        </div>

        {/* tabs */}
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

        {/* ﬁ«∆„… «·„“«œ«  */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  «·⁄ﬁ«—
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  «·Õ«·…
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  «·”⁄— «·Õ«·Ì
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ⁄œœ «·„“«Ìœ« 
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  «·Êﬁ  «·„ »ﬁÌ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  «·≈Ã—«¡« 
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auctions.map(auction => (
                <AuctionRow 
                  key={auction.id} 
                  auction={auction} 
                  onUpdate={loadAuctions}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

function AuctionRow({ auction, onUpdate }) {
  const router = useRouter();
  
  const handleAction = async (action, auctionId) => {
    switch (action) {
      case 'edit':
        router.push(`/dashboard/auctions/edit/${auctionId}`);
        break;
      case 'approve':
        await auctionService.approveAuction(auctionId);
        onUpdate();
        break;
      case 'reject':
        await auctionService.rejectAuction(auctionId);
        onUpdate();
        break;
      case 'promote':
        await auctionService.promoteAuction(auctionId);
        onUpdate();
        break;
      case 'delete':
        if (confirm('Â· √‰  „ √ﬂœ „‰ Õ–› Â–« «·„“«œø')) {
          await auctionService.deleteAuction(auctionId);
          onUpdate();
        }
        break;
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <InstantImage className="h-10 w-10 rounded-md object-cover" src={auction.images[0]} alt={auction.title}  loading="lazy" width={400} height={300}/>
          </div>
          <div className="mr-4">
            <div className="text-sm font-medium text-gray-900">{auction.title}</div>
            <div className="text-sm text-gray-500">{auction.location.address}</div>
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
        {auction.bids.length}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {auction.status === 'active' ? getTimeRemaining(auction.endTime) : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          <InstantLink href={`/auctions/${auction.id}`} className="text-blue-600 hover:text-blue-900">
            ⁄—÷
          </InstantLink>
          {['draft', 'rejected'].includes(auction.status) && (
            <button onClick={() => handleAction('edit', auction.id)} className="text-yellow-600 hover:text-yellow-900">
               ⁄œÌ·
            </button>
          )}
          {auction.status === 'pending' && hasRole('admin') && (
            <>
              <button onClick={() => handleAction('approve', auction.id)} className="text-green-600 hover:text-green-900">
                «·„Ê«›ﬁ…
              </button>
              <button onClick={() => handleAction('reject', auction.id)} className="text-red-600 hover:text-red-900">
                —›÷
              </button>
            </>
          )}
          {auction.status === 'active' && (
            <button onClick={() => handleAction('promote', auction.id)} className="text-purple-600 hover:text-purple-900">
               —ÊÌÃ
            </button>
          )}
          <button onClick={() => handleAction('delete', auction.id)} className="text-red-600 hover:text-red-900">
            Õ–›
          </button>
        </div>
      </td>
    </tr>
  );
}

