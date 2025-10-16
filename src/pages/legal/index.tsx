import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
// Layout handled by _app.tsx
import { FaPlus, FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown, FaEye, FaEdit, FaShare, FaTrash, FaBalanceScale, FaUser, FaUserTie, FaBuilding, FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationTriangle, FaPlay, FaPause, FaGavel, FaFileAlt, FaMoneyBillWave, FaChartBar, FaBrain, FaDownload, FaPrint, FaQrcode, FaExternalLinkAlt, FaChevronDown, FaChevronUp, FaTimes, FaSpinner } from 'react-icons/fa';

type ViewMode = "table" | "grid";
type SortField = "caseNumber" | "title" | "status" | "priority" | "updatedAt" | "createdAt";
type SortDirection = "asc" | "desc";

interface Case {
  id: string;
  title: string;
  description?: string;
  status: "OPEN"|"ON_HOLD"|"CLOSED"|"IN_PROGRESS"|"RESOLVED";
  stage: string;
  type?: string;
  priority?: string;
  clientId: string;
  primaryLawyerId: string;
  propertyReference?: {
    propertyId: string;
    propertyTitle: string;
    buildingNumber?: string;
    address?: string;
    landNumber?: string;
    governorate?: string;
    region?: string;
    town?: string;
  };
  plaintiff?: string;
  defendant?: string;
  courtNumber?: string;
  registrationDate?: string;
  hearingDate?: string;
  caseSummary?: string;
  legalBasis?: string;
  requestedRelief?: string;
  evidence?: string;
  witnesses?: string;
  estimatedValue?: number;
  expectedOutcome?: string;
  expenses?: number;
  fees?: number;
  notes?: string;
  documents?: any[];
  createdAt: string;
  updatedAt: string;
}

interface Person {
  id: string;
  name: string;
  subscriptionNo: string;
  phone?: string;
  email?: string;
  address?: string;
  specialization?: string;
  experience?: number;
  rating?: number;
}

interface FilterOptions {
  searchTerm: string;
  status: string;
  type: string;
  priority: string;
  lawyer: string;
  client: string;
  propertyId: string;
  dateFrom: string;
  dateTo: string;
}

interface SortOptions {
  field: SortField;
  direction: SortDirection;
}

export default function LegalCasesPage() {
  const router = useRouter();
  const { propertyId } = router.query;
  
  const [cases, setCases] = useState<Case[]>([]);
  const [lawyers, setLawyers] = useState<Person[]>([]);
  const [clients, setClients] = useState<Person[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    totalCases: 0,
    openCases: 0,
    inProgressCases: 0,
    resolvedCases: 0
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    status: '',
    type: '',
    priority: '',
    lawyer: '',
    client: '',
    propertyId: propertyId as string || '',
    dateFrom: '',
    dateTo: ''
  });
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'updatedAt',
    direction: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (propertyId) {
      setFilters(prev => ({ ...prev, propertyId: propertyId as string }));
    }
  }, [propertyId]);

  const load = async () => {
    try {
      setLoading(true);
      const [casesRes, lawyersRes, clientsRes, analyticsRes] = await Promise.all([
        fetch('/api/legal/cases', {
          headers: { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" }
        }),
        fetch('/api/legal/directory?kind=LAWYER', {
          headers: { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" }
        }),
        fetch('/api/legal/directory?kind=CLIENT', {
          headers: { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" }
        }),
        fetch('/api/legal/cases?analytics=true', {
          headers: { "x-tenant-id":"TENANT-1","x-user-id":"U1","x-roles":"LAWYER" }
        })
      ]);

      const casesData = await casesRes.json();
      const lawyersData = await lawyersRes.json();
      const clientsData = await clientsRes.json();
      const analyticsData = await analyticsRes.json();

      // console.log('Loaded data:', { casesData, lawyersData, clientsData, analyticsData });

      setCases(Array.isArray(casesData) ? casesData : []);
      setLawyers(Array.isArray(lawyersData) ? lawyersData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setAnalytics(analyticsData && typeof analyticsData === 'object' ? {
        totalCases: analyticsData.totalCases || 0,
        openCases: analyticsData.openCases || 0,
        inProgressCases: analyticsData.inProgressCases || 0,
        resolvedCases: analyticsData.resolvedCases || 0
      } : {
        totalCases: 0,
        openCases: 0,
        inProgressCases: 0,
        resolvedCases: 0
      });
    } catch (error) {

      setCases([]);
      setLawyers([]);
      setClients([]);
      setAnalytics({
        totalCases: 0,
        openCases: 0,
        inProgressCases: 0,
        resolvedCases: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedCases = useMemo(() => {
    if (!Array.isArray(cases)) return [];
    
    let filtered = cases.filter(case_ => {
      if (!case_ || typeof case_ !== 'object') return false;
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          (case_.title || '').toLowerCase().includes(searchLower) ||
          (case_.id || '').toLowerCase().includes(searchLower) ||
          (case_.description || '').toLowerCase().includes(searchLower) ||
          (case_.plaintiff || '').toLowerCase().includes(searchLower) ||
          (case_.defendant || '').toLowerCase().includes(searchLower) ||
          (case_.propertyReference && case_.propertyReference.propertyTitle ? case_.propertyReference.propertyTitle : '').toLowerCase().includes(searchLower) ||
          (case_.propertyReference && case_.propertyReference.buildingNumber ? case_.propertyReference.buildingNumber : '').toLowerCase().includes(searchLower) ||
          (case_.propertyReference && case_.propertyReference.address ? case_.propertyReference.address : '').toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && case_.status !== filters.status) return false;

      // Type filter
      if (filters.type && case_.type !== filters.type) return false;

      // Priority filter
      if (filters.priority && case_.priority !== filters.priority) return false;

      // Lawyer filter
      if (filters.lawyer && case_.primaryLawyerId !== filters.lawyer) return false;

      // Client filter
      if (filters.client && case_.clientId !== filters.client) return false;

      // Property filter
      if (filters.propertyId && (!case_.propertyReference || case_.propertyReference.propertyId !== filters.propertyId)) return false;

      // Date filters
      if (filters.dateFrom) {
        const caseDate = new Date(case_.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (caseDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const caseDate = new Date(case_.createdAt);
        const toDate = new Date(filters.dateTo);
        if (caseDate > toDate) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortOptions.field) {
        case 'caseNumber':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority':
          aValue = a.priority || 'MEDIUM';
          bValue = b.priority || 'MEDIUM';
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.updatedAt;
          bValue = b.updatedAt;
      }

      if (aValue < bValue) return sortOptions.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOptions.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [cases, filters, sortOptions]);

  const handleFilterChange = (field: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSort = (field: SortField) => {
    setSortOptions(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectCase = (caseId: any) => {
    const id = String(caseId || '');
    setSelectedCases(prev => 
      prev.includes(id) 
        ? prev.filter(prevId => prevId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCases.length === filteredAndSortedCases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(filteredAndSortedCases.map(c => String(c.id || '')));
    }
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: '',
      type: '',
      priority: '',
      lawyer: '',
      client: '',
      propertyId: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <FaPlay className="text-green-600" />;
      case 'IN_PROGRESS': return <FaClock className="text-blue-600" />;
      case 'ON_HOLD': return <FaPause className="text-yellow-600" />;
      case 'CLOSED': return <FaCheckCircle className="text-gray-600" />;
      case 'RESOLVED': return <FaCheckCircle className="text-green-600" />;
      default: return <FaExclamationTriangle className="text-red-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'OPEN': '„› ÊÕ…',
      'IN_PROGRESS': 'ﬁÌœ «·⁄„·',
      'ON_HOLD': '„⁄·ﬁ…',
      'CLOSED': '„€·ﬁ…',
      'RESOLVED': '„Õ·Ê·…'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'URGENT': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'HIGH': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'RENTAL_DISPUTE': '‰“«⁄ ≈ÌÃ«—',
      'PAYMENT_DISPUTE': '‰“«⁄ œ›⁄',
      'CONTRACT_BREACH': 'Œ—ﬁ ⁄ﬁœ',
      'PROPERTY_DAMAGE': ' ·› ⁄ﬁ«—',
      'EVICTION': '≈Œ·«¡',
      'MAINTENANCE': '’Ì«‰…',
      'INSURANCE': ' √„Ì‰',
      'CRIMINAL': 'Ã‰«∆Ì',
      'CIVIL': '„œ‰Ì',
      'ADMINISTRATIVE': '≈œ«—Ì',
      'OTHER': '√Œ—Ï'
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn', 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'OMR'
    }).format(amount);
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Ã«—Ì  Õ„Ì· «·ﬁ÷«Ì«...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>≈œ«—… «·ﬁ÷«Ì« «·ﬁ«‰Ê‰Ì… - ‰Ÿ«„ ≈œ«—… «·ﬁ÷«Ì«</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">≈œ«—… «·ﬁ÷«Ì« «·ﬁ«‰Ê‰Ì…</h1>
              <p className="text-blue-100">≈œ«—… Ê„ «»⁄… Ã„Ì⁄ «·ﬁ÷«Ì« «·ﬁ«‰Ê‰Ì…</p>
            </div>
            <button
              onClick={() => router.push('/legal/new')}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <FaPlus />
              ≈÷«›… ﬁ÷Ì… ÃœÌœ…
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">≈Ã„«·Ì «·ﬁ÷«Ì«</p>
                <p className="text-2xl font-bold text-gray-900">{String(analytics.totalCases || 0)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaBalanceScale className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ﬁ÷«Ì« „› ÊÕ…</p>
                <p className="text-2xl font-bold text-green-600">{String(analytics.openCases || 0)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaPlay className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ﬁ÷«Ì« ﬁÌœ «·⁄„·</p>
                <p className="text-2xl font-bold text-blue-600">{String(analytics.inProgressCases || 0)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaClock className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ﬁ÷«Ì« „Õ·Ê·…</p>
                <p className="text-2xl font-bold text-purple-600">{String(analytics.resolvedCases || 0)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaCheckCircle className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">«·»ÕÀ Ê«· ’›Ì…</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FaFilter />
              {showFilters ? '≈Œ›«¡ «·„—‘Õ« ' : '≈ŸÂ«— «·„—‘Õ« '}
            </button>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="«»ÕÀ ›Ì «·ﬁ÷«Ì«..."
              />
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">«·Õ«·…</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Ã„Ì⁄ «·Õ«·« </option>
                  <option value="OPEN">„› ÊÕ…</option>
                  <option value="IN_PROGRESS">ﬁÌœ «·⁄„·</option>
                  <option value="ON_HOLD">„⁄·ﬁ…</option>
                  <option value="CLOSED">„€·ﬁ…</option>
                  <option value="RESOLVED">„Õ·Ê·…</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">«·‰Ê⁄</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Ã„Ì⁄ «·√‰Ê«⁄</option>
                  <option value="RENTAL_DISPUTE">‰“«⁄ ≈ÌÃ«—</option>
                  <option value="PAYMENT_DISPUTE">‰“«⁄ œ›⁄</option>
                  <option value="CONTRACT_BREACH">Œ—ﬁ ⁄ﬁœ</option>
                  <option value="PROPERTY_DAMAGE"> ·› ⁄ﬁ«—</option>
                  <option value="EVICTION">≈Œ·«¡</option>
                  <option value="MAINTENANCE">’Ì«‰…</option>
                  <option value="INSURANCE"> √„Ì‰</option>
                  <option value="CRIMINAL">Ã‰«∆Ì</option>
                  <option value="CIVIL">„œ‰Ì</option>
                  <option value="ADMINISTRATIVE">≈œ«—Ì</option>
                  <option value="OTHER">√Œ—Ï</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">«·„Õ«„Ì</label>
                <select
                  value={filters.lawyer}
                  onChange={(e) => handleFilterChange('lawyer', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Ã„Ì⁄ «·„Õ«„Ì‰</option>
                  {lawyers.map((lawyer) => (
                    <option key={lawyer.id} value={lawyer.id}>
                      {lawyer.name || '€Ì— „Õœœ'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">«·⁄„Ì·</label>
                <select
                  value={filters.client}
                  onChange={(e) => handleFilterChange('client', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Ã„Ì⁄ «·⁄„·«¡</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name || '€Ì— „Õœœ'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Cases Display */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  «·ﬁ÷«Ì« ({filteredAndSortedCases.length})
                </h2>
                
                {selectedCases.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedCases.length} „Õœœ
                    </span>
                    <button
                      onClick={() => setSelectedCases([])}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      ≈·€«¡ «· ÕœÌœ
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <FaSort />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <FaChartBar />
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedCases.length === filteredAndSortedCases.length && filteredAndSortedCases.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('caseNumber')}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        —ﬁ„ «·ﬁ÷Ì…
                        {sortOptions.field === 'caseNumber' && (
                          sortOptions.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('title')}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        ⁄‰Ê«‰ «·ﬁ÷Ì…
                        {sortOptions.field === 'title' && (
                          sortOptions.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      «·Õ«·…
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      «·‰Ê⁄
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      «·√Ê·ÊÌ…
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      «·⁄ﬁ«—
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      «·„Õ«„Ì
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      «·⁄„Ì·
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('updatedAt')}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        ¬Œ—  ÕœÌÀ
                        {sortOptions.field === 'updatedAt' && (
                          sortOptions.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      «·≈Ã—«¡« 
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedCases.map((case_) => {
                    const lawyer = lawyers.find(l => l.id === case_.primaryLawyerId);
                    const client = clients.find(c => c.id === case_.clientId);
                    
                    return (
                      <tr key={case_.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedCases.includes(String(case_.id || ''))}
                            onChange={() => handleSelectCase(case_.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {String(case_.id || '€Ì— „Õœœ')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{case_.title || '€Ì— „Õœœ'}</div>
                          {case_.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {case_.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(case_.status)}
                            <span className="text-sm text-gray-900">{getStatusLabel(case_.status)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getTypeLabel(case_.type || 'OTHER')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(case_.priority || 'MEDIUM')}`}>
                            {case_.priority || 'MEDIUM'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {case_.propertyReference && case_.propertyReference.propertyTitle ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{case_.propertyReference.propertyTitle || '€Ì— „Õœœ'}</div>
                              {case_.propertyReference.buildingNumber && (
                                <div className="text-gray-500">—ﬁ„ «·„»‰Ï: {case_.propertyReference.buildingNumber}</div>
                              )}
                              {case_.propertyReference.address && (
                                <div className="text-gray-500 truncate max-w-xs">{case_.propertyReference.address}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">€Ì— „— »ÿ</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lawyer ? (
                            <div>
                              <div className="font-medium">{lawyer.name || '€Ì— „Õœœ'}</div>
                              <div className="text-gray-500">{lawyer.subscriptionNo || ''}</div>
                            </div>
                          ) : (
                            '€Ì— „Õœœ'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {client ? (
                            <div>
                              <div className="font-medium">{client.name || '€Ì— „Õœœ'}</div>
                              <div className="text-gray-500">{client.subscriptionNo || ''}</div>
                            </div>
                          ) : (
                            '€Ì— „Õœœ'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(case_.updatedAt || '')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/legal/${String(case_.id || '')}`)}
                              className="text-blue-600 hover:text-blue-900"
                              title="⁄—÷ «· ›«’Ì·"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => router.push(`/legal/${String(case_.id || '')}/edit`)}
                              className="text-green-600 hover:text-green-900"
                              title=" ⁄œÌ·"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="text-purple-600 hover:text-purple-900"
                              title="„‘«—ﬂ…"
                            >
                              <FaShare />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedCases.map((case_) => {
                  const lawyer = lawyers.find(l => l.id === case_.primaryLawyerId);
                  const client = clients.find(c => c.id === case_.clientId);
                  
                  return (
                    <div key={case_.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{case_.title || '€Ì— „Õœœ'}</h3>
                          <p className="text-sm text-gray-600 mb-2">—ﬁ„ «·ﬁ÷Ì…: {String(case_.id || '€Ì— „Õœœ')}</p>
                          {case_.description && (
                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">{case_.description}</p>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedCases.includes(String(case_.id || ''))}
                          onChange={() => handleSelectCase(case_.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(case_.status)}
                          <span className="text-sm font-medium text-gray-900">{getStatusLabel(case_.status)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">«·‰Ê⁄:</span>
                          <span className="text-sm font-medium text-gray-900">{getTypeLabel(case_.type || 'OTHER')}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">«·√Ê·ÊÌ…:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(case_.priority || 'MEDIUM')}`}>
                            {case_.priority || 'MEDIUM'}
                          </span>
                        </div>

                        {case_.propertyReference && case_.propertyReference.propertyTitle && (
                          <div className="flex items-center gap-2">
                            <FaBuilding className="text-gray-400" />
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{case_.propertyReference.propertyTitle || '€Ì— „Õœœ'}</div>
                              {case_.propertyReference.buildingNumber && (
                                <div className="text-gray-500">—ﬁ„ «·„»‰Ï: {case_.propertyReference.buildingNumber}</div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <FaUserTie className="text-gray-400" />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{lawyer && lawyer.name ? lawyer.name : '€Ì— „Õœœ'}</div>
                            <div className="text-gray-500">{lawyer && lawyer.subscriptionNo ? lawyer.subscriptionNo : ''}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <FaUser className="text-gray-400" />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{client && client.name ? client.name : '€Ì— „Õœœ'}</div>
                            <div className="text-gray-500">{client && client.subscriptionNo ? client.subscriptionNo : ''}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          <span className="text-sm text-gray-600">¬Œ—  ÕœÌÀ: {formatDate(case_.updatedAt || '')}</span>
        </div>
      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => router.push(`/legal/${String(case_.id || '')}`)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          ⁄—÷ «· ›«’Ì·
                        </button>
                        <button
                          onClick={() => router.push(`/legal/${String(case_.id || '')}/edit`)}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          <FaShare />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredAndSortedCases.length === 0 && (
            <div className="text-center py-12">
              <FaBalanceScale className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">·«  ÊÃœ ﬁ÷«Ì«</h3>
              <p className="text-gray-500 mb-4">
                {filters.searchTerm || filters.status || filters.type || filters.priority || filters.lawyer || filters.client || filters.propertyId
                  ? '·„ Ì „ «·⁄ÀÊ— ⁄·Ï ﬁ÷«Ì«  ÿ«»ﬁ „⁄«ÌÌ— «·»ÕÀ'
                  : '·„ Ì „ ≈‰‘«¡ √Ì ﬁ÷«Ì« »⁄œ'
                }
              </p>
              <button
                onClick={() => router.push('/legal/new')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus />
                ≈÷«›… ﬁ÷Ì… ÃœÌœ…
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
