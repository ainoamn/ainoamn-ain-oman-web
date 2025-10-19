import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaPlus, FaSearch, FaFilter, FaCalendar, FaUser, FaDownload, FaEye, FaEdit, FaTrash, FaPrint, FaArrowUp, FaArrowDown, FaSort, FaSync, FaUpload, FaFilePdf, FaFileWord, FaFileImage, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaFile, FaFolder, FaCloudUploadAlt, FaShare, FaCopy, FaLock, FaUnlock } from 'react-icons/fa';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  category: 'contract' | 'invoice' | 'legal' | 'maintenance' | 'insurance' | 'other';
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
  tags?: string[];
  isPublic: boolean;
  propertyId: string;
  relatedEntityId?: string;
  relatedEntityType?: 'task' | 'invoice' | 'contract' | 'reservation';
}

interface DocumentsTabProps {
  propertyId: string;
}

export default function DocumentsTab({ propertyId }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDocuments();
  }, [propertyId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents?propertyId=${propertyId}`);
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    const fileType = type.toLowerCase();
    if (fileType.includes('pdf')) return <FaFilePdf className="h-8 w-8 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('doc')) return <FaFileWord className="h-8 w-8 text-blue-500" />;
    if (fileType.includes('excel') || fileType.includes('xls')) return <FaFileExcel className="h-8 w-8 text-green-500" />;
    if (fileType.includes('powerpoint') || fileType.includes('ppt')) return <FaFilePowerpoint className="h-8 w-8 text-orange-500" />;
    if (fileType.includes('image') || fileType.includes('jpg') || fileType.includes('png') || fileType.includes('gif')) return <FaFileImage className="h-8 w-8 text-purple-500" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return <FaFileArchive className="h-8 w-8 text-yellow-500" />;
    return <FaFile className="h-8 w-8 text-gray-500" />;
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'contract': return 'عقود';
      case 'invoice': return 'فواتير';
      case 'legal': return 'قانونية';
      case 'maintenance': return 'صيانة';
      case 'insurance': return 'تأمين';
      case 'other': return 'أخرى';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'contract': return 'bg-blue-100 text-blue-800';
      case 'invoice': return 'bg-green-100 text-green-800';
      case 'legal': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'insurance': return 'bg-purple-100 text-purple-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn' });
  };

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || document.category === categoryFilter;
    const matchesType = typeFilter === 'all' || document.type.toLowerCase().includes(typeFilter.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'size':
        aValue = a.size;
        bValue = b.size;
        break;
      case 'uploadedAt':
        aValue = new Date(a.uploadedAt).getTime();
        bValue = new Date(b.uploadedAt).getTime();
        break;
      case 'category':
        aValue = a.category;
        bValue = b.category;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const documentStats = {
    total: documents.length,
    totalSize: documents.reduce((sum, doc) => sum + doc.size, 0),
    byCategory: documents.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    recentUploads: documents.filter(doc => {
      const uploadDate = new Date(doc.uploadedAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return uploadDate >= weekAgo;
    }).length
  };

  const handleDocumentSelect = (documentId: string) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
    }
    setSelectedDocuments(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedDocuments.size === sortedDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(sortedDocuments.map(doc => doc.id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-3 text-gray-600">جارٍ تحميل المستندات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <FaFileAlt className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">المستندات</h2>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <FaDownload className="h-4 w-4 ml-2" />
            تحميل المحدد
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <FaShare className="h-4 w-4 ml-2" />
            مشاركة
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <FaUpload className="h-4 w-4 ml-2" />
            رفع مستند
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي المستندات</p>
              <p className="text-2xl font-bold text-gray-900">{documentStats.total}</p>
            </div>
            <FaFileAlt className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الحجم الإجمالي</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatFileSize(documentStats.totalSize)}
              </p>
            </div>
            <FaFolder className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">رفع حديث</p>
              <p className="text-2xl font-bold text-blue-600">{documentStats.recentUploads}</p>
              <p className="text-sm text-gray-500">آخر 7 أيام</p>
            </div>
            <FaCloudUploadAlt className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">محدد</p>
              <p className="text-2xl font-bold text-purple-600">{selectedDocuments.size}</p>
              <p className="text-sm text-gray-500">مستند</p>
            </div>
            <FaCopy className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="البحث في المستندات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الفئات</option>
            <option value="contract">عقود</option>
            <option value="invoice">فواتير</option>
            <option value="legal">قانونية</option>
            <option value="maintenance">صيانة</option>
            <option value="insurance">تأمين</option>
            <option value="other">أخرى</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الأنواع</option>
            <option value="pdf">PDF</option>
            <option value="word">Word</option>
            <option value="excel">Excel</option>
            <option value="image">صور</option>
            <option value="archive">أرشيف</option>
          </select>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="uploadedAt">تاريخ الرفع</option>
              <option value="name">الاسم</option>
              <option value="size">الحجم</option>
              <option value="category">الفئة</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? <FaArrowUp className="h-4 w-4" /> : <FaArrowDown className="h-4 w-4" />}
            </button>
            
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FaFolder className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FaFileAlt className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Display */}
      <div className="bg-white rounded-lg border">
        {sortedDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FaFileAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مستندات</h3>
            <p className="text-gray-500 mb-4">لم يتم العثور على مستندات تطابق المعايير المحددة</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <FaUpload className="h-4 w-4 ml-2" />
              رفع مستند جديد
            </button>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="px-6 py-3 border-b border-gray-200">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedDocuments.size === sortedDocuments.length && sortedDocuments.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="mr-2 text-sm text-gray-600">
                  تحديد الكل ({selectedDocuments.size} محدد)
                </span>
              </label>
            </div>

            {viewMode === 'grid' ? (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedDocuments.map((document) => (
                  <div
                    key={document.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                      selectedDocuments.has(document.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleDocumentSelect(document.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.has(document.id)}
                        onChange={() => handleDocumentSelect(document.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        {document.isPublic ? (
                          <FaUnlock className="h-3 w-3 text-green-500" />
                        ) : (
                          <FaLock className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center mb-3">
                      {getFileIcon(document.type)}
                    </div>
                    
                    <h3 className="font-medium text-gray-900 text-sm mb-1 truncate" title={document.name}>
                      {document.name}
                    </h3>
                    
                    <div className="space-y-1 text-xs text-gray-500">
                      <div>{formatFileSize(document.size)}</div>
                      <div>{formatDate(document.uploadedAt)}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(document.category)}`}>
                        {getCategoryText(document.category)}
                      </span>
                    </div>
                    
                    {document.description && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {document.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المحدد
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المستند
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الفئة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحجم
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رفع بواسطة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاريخ الرفع
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedDocuments.map((document) => (
                      <tr key={document.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.has(document.id)}
                            onChange={() => handleDocumentSelect(document.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 ml-3">
                              {getFileIcon(document.type)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{document.name}</div>
                              {document.description && (
                                <div className="text-sm text-gray-500">{document.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(document.category)}`}>
                            {getCategoryText(document.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(document.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {document.uploadedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(document.uploadedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <button className="text-blue-600 hover:text-blue-900">
                              <FaEye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <FaDownload className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <FaShare className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
