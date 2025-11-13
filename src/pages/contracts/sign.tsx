import { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import InstantLink from "@/components/InstantLink";
import { FaCheckCircle, FaClock, FaUserCheck, FaBuilding, FaUserTie, FaShieldAlt, FaPaperPlane } from "react-icons/fa";

// أنواع التوقيعات
type SignatureType = 'tenant' | 'owner' | 'admin';

// حالات سير العمل
type WorkflowState = 
  | 'draft'
  | 'sent_for_signatures'
  | 'pending_tenant_signature'
  | 'pending_owner_signature'
  | 'pending_admin_approval'
  | 'active'
  | 'rejected';

interface Signature {
  type: SignatureType;
  name: string;
  email?: string;
  signedAt: number;
  ipAddress?: string;
}

const ElectronicSignPage: NextPage = () => {
  const router = useRouter();
  const { contractId, userRole } = router.query as { contractId?: string; userRole?: SignatureType };
  
  const [rental, setRental] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [workflowState, setWorkflowState] = useState<WorkflowState>('draft');
  const [signatures, setSignatures] = useState<Signature[]>([]);
  
  // قائمة جميع العقود
  const [allContracts, setAllContracts] = useState<any[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  
  // محاكاة دور المستخدم الحالي (في الإنتاج سيأتي من session/auth)
  const [currentUserRole, setCurrentUserRole] = useState<SignatureType | 'viewer'>(userRole || 'admin');

  useEffect(() => {
    if (contractId) {
      loadContractData();
    } else {
      setLoading(false);
      loadAllContracts();
    }
  }, [contractId]);

  const loadAllContracts = async () => {
    setContractsLoading(true);
    try {
      const response = await fetch('/api/rentals');
      if (response.ok) {
        const data = await response.json();
        const contracts = data.items || [];
        setAllContracts(contracts);
        console.log(`📋 تم جلب ${contracts.length} عقد`);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setContractsLoading(false);
    }
  };

  const loadContractData = async () => {
    try {
      setLoading(true);
      console.log(`🔍 جلب بيانات العقد للتوقيع: ${contractId}`);
      
      const rentalRes = await fetch(`/api/rentals/${contractId}`);
      if (rentalRes.ok) {
        const data = await rentalRes.json();
        console.log('📦 البيانات المستلمة:', data);
        
        // تعيين بيانات العقد
        const rentalData = data.rental || data;
        setRental(rentalData);
        setWorkflowState(rentalData.signatureWorkflow || 'draft');
        setSignatures(rentalData.signatures || []);
        console.log('✅ تم تعيين بيانات العقد:', rentalData);
        
        // تعيين بيانات العقار (إذا كانت موجودة في الرد)
        if (data.property) {
          setProperty(data.property);
          console.log('✅ تم تعيين بيانات العقار:', data.property);
        } else if (rentalData.propertyId) {
          // إذا لم تكن موجودة، جلبها من API منفصل
          const propertyRes = await fetch(`/api/properties/${rentalData.propertyId}`);
          if (propertyRes.ok) {
            const propertyData = await propertyRes.json();
            setProperty(propertyData.property || propertyData);
            console.log('✅ تم جلب بيانات العقار من API منفصل');
          }
        }
      } else {
        console.error('❌ فشل جلب بيانات العقد:', rentalRes.status);
      }
    } catch (error) {
      console.error('❌ خطأ في جلب بيانات العقد:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendForSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId) return;
    
    setProcessing(true);
    setStatus(null);
    
    try {
      const response = await fetch(`/api/rentals/${contractId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_for_signatures',
          sentBy: 'admin'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setStatus('✅ ' + result.message);
        setWorkflowState('sent_for_signatures');
        // إعادة تحميل البيانات
        await loadContractData();
      } else {
        setStatus('❌ فشل إرسال العقد للتوقيع');
      }
    } catch (error) {
      console.error('Error sending for signatures:', error);
      setStatus('❌ حدث خطأ أثناء الإرسال');
    } finally {
      setProcessing(false);
    }
  };

  const handleSign = async (signatureType: SignatureType) => {
    if (!contractId) return;
    
    const signerName = prompt(`أدخل اسم ${getSignerLabel(signatureType)}:`);
    if (!signerName) return;
    
    const signerEmail = prompt(`أدخل البريد الإلكتروني (اختياري):`);
    
    setProcessing(true);
    setStatus(null);
    
    try {
      const response = await fetch(`/api/rentals/${contractId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign',
          signatureType,
          signerName,
          signerEmail: signerEmail || undefined
        })
      });

      if (response.ok) {
        const result = await response.json();
        setStatus('✅ ' + result.message);
        // إعادة تحميل البيانات
        await loadContractData();
      } else {
        const error = await response.json();
        setStatus('❌ ' + (error.error || 'فشل التوقيع'));
      }
    } catch (error) {
      console.error('Error signing:', error);
      setStatus('❌ حدث خطأ أثناء التوقيع');
    } finally {
      setProcessing(false);
    }
  };

  const getSignerLabel = (type: SignatureType): string => {
    switch (type) {
      case 'tenant': return 'المستأجر';
      case 'owner': return 'المالك';
      case 'admin': return 'إدارة العقار';
      default: return type;
    }
  };

  const getWorkflowStateLabel = (state: WorkflowState): string => {
    switch (state) {
      case 'draft': return 'مسودة';
      case 'sent_for_signatures': return 'تم الإرسال للتوقيع';
      case 'pending_tenant_signature': return 'في انتظار توقيع المستأجر';
      case 'pending_owner_signature': return 'في انتظار توقيع المالك';
      case 'pending_admin_approval': return 'في انتظار موافقة الإدارة';
      case 'active': return 'مفعّل';
      case 'rejected': return 'مرفوض';
      default: return state;
    }
  };

  const getWorkflowStateColor = (state: WorkflowState): string => {
    switch (state) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent_for_signatures': return 'bg-blue-100 text-blue-800';
      case 'pending_tenant_signature': return 'bg-yellow-100 text-yellow-800';
      case 'pending_owner_signature': return 'bg-orange-100 text-orange-800';
      case 'pending_admin_approval': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hasSigned = (type: SignatureType): boolean => {
    return signatures.some(s => s.type === type);
  };

  const canSign = (type: SignatureType): boolean => {
    if (currentUserRole !== type) return false;
    if (hasSigned(type)) return false;
    
    // المستأجر يوقع أولاً (بعد الإرسال)
    if (type === 'tenant' && (workflowState === 'sent_for_signatures' || workflowState === 'pending_tenant_signature')) {
      return true;
    }
    
    // المالك يوقع بعد المستأجر
    if (type === 'owner' && workflowState === 'pending_owner_signature' && hasSigned('tenant')) {
      return true;
    }
    
    // الإدارة توقع بعد المالك والمستأجر
    if (type === 'admin' && workflowState === 'pending_admin_approval' && hasSigned('tenant') && hasSigned('owner')) {
      return true;
    }
    
    return false;
  };

  return (
    <>
      <Head>
        <title>التوقيع الإلكتروني - العقد #{contractId} | Ain Oman</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">التوقيع الإلكتروني</h1>
                <p className="text-purple-100 mt-1">نظام التوقيع الإلكتروني الآمن والموثوق</p>
              </div>
              {rental && (
                <div className={`px-4 py-2 rounded-lg font-semibold ${getWorkflowStateColor(workflowState)}`}>
                  {getWorkflowStateLabel(workflowState)}
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
              <p className="mr-4 text-gray-600">جاري التحميل...</p>
            </div>
          ) : rental ? (
            <div className="space-y-6">
              {/* محاكي الدور - للاختبار فقط */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="font-semibold text-yellow-900 mb-2">🧪 وضع الاختبار - اختر الدور:</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentUserRole('tenant')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentUserRole === 'tenant' ? 'bg-yellow-600 text-white' : 'bg-white text-yellow-900 hover:bg-yellow-100'
                    }`}
                  >
                    👤 المستأجر
                  </button>
                  <button
                    onClick={() => setCurrentUserRole('owner')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentUserRole === 'owner' ? 'bg-yellow-600 text-white' : 'bg-white text-yellow-900 hover:bg-yellow-100'
                    }`}
                  >
                    🏢 المالك
                  </button>
                  <button
                    onClick={() => setCurrentUserRole('admin')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentUserRole === 'admin' ? 'bg-yellow-600 text-white' : 'bg-white text-yellow-900 hover:bg-yellow-100'
                    }`}
                  >
                    🛡️ الإدارة
                  </button>
                </div>
                <p className="text-sm text-yellow-700 mt-2">الدور الحالي: <strong>{getSignerLabel(currentUserRole as any)}</strong></p>
              </div>

              {/* ملخص العقد */}
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📄 ملخص العقد
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">رقم العقد</p>
                    <p className="text-lg font-bold text-blue-900 mt-1">#{rental.id}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">العقار</p>
                    <p className="text-lg font-bold text-green-900 mt-1">
                      {property?.titleAr || `مبنى ${property?.buildingNumber}` || rental.propertyId}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">المالك</p>
                    <p className="text-lg font-bold text-purple-900 mt-1">
                      {property?.ownerName || 'غير محدد'}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-600 font-medium">المستأجر</p>
                    <p className="text-lg font-bold text-orange-900 mt-1">
                      {rental.tenantName || 'غير محدد'}
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-indigo-600 font-medium">تاريخ البدء</p>
                    <p className="text-base font-bold text-indigo-900 mt-1">
                      {rental.startDate ? new Date(rental.startDate).toLocaleDateString('en-GB') : 'غير محدد'}
                    </p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <p className="text-sm text-pink-600 font-medium">تاريخ الانتهاء</p>
                    <p className="text-base font-bold text-pink-900 mt-1">
                      {rental.endDate ? new Date(rental.endDate).toLocaleDateString('en-GB') : 'غير محدد'}
                    </p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <p className="text-sm text-emerald-600 font-medium">الإيجار الشهري</p>
                    <p className="text-base font-bold text-emerald-900 mt-1">
                      {rental.monthlyRent || rental.amount || 0} {rental.currency || 'OMR'}
                    </p>
                  </div>
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <p className="text-sm text-cyan-600 font-medium">المدة</p>
                    <p className="text-base font-bold text-cyan-900 mt-1">
                      {rental.duration || 0} شهر
                    </p>
                  </div>
                </div>
              </div>

              {/* سير العمل والتوقيعات */}
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  🔄 سير عمل التوقيعات
                </h2>
                
                {/* خط زمني */}
                <div className="space-y-4">
                  {/* المرحلة 1: المستأجر */}
                  <div className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                    hasSigned('tenant') ? 'bg-green-50 border-green-300' : 
                    (workflowState === 'sent_for_signatures' || workflowState === 'pending_tenant_signature') ? 'bg-yellow-50 border-yellow-300' : 
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      hasSigned('tenant') ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                      {hasSigned('tenant') ? (
                        <FaCheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <FaClock className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <FaUserCheck className="w-5 h-5 text-blue-600" />
                        المرحلة 1: توقيع المستأجر
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{rental.tenantName}</p>
                      
                      {/* التفاصيل الزمنية */}
                      {rental.sentForSignaturesAt && (
                        <div className="mt-3 bg-white bg-opacity-70 rounded-lg p-3 border border-gray-200 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-gray-500 font-medium">📅 وقت الاستلام:</p>
                              <p className="text-sm text-gray-900 font-semibold">
                                {new Date(rental.sentForSignaturesAt).toLocaleDateString('ar-EG')}
                              </p>
                              <p className="text-xs text-gray-600">
                                {new Date(rental.sentForSignaturesAt).toLocaleTimeString('ar-EG')}
                              </p>
                            </div>
                            {hasSigned('tenant') && (() => {
                              const tenantSig = signatures.find(s => s.type === 'tenant');
                              if (!tenantSig) return null;
                              const diff = tenantSig.signedAt - rental.sentForSignaturesAt;
                              const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                              const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                              const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                              
                              return (
                                <div className="text-right">
                                  <p className="text-xs text-green-600 font-medium">⏱️ المدة:</p>
                                  <p className="text-sm text-green-700 font-bold">
                                    {days > 0 && `${days} يوم `}
                                    {hours > 0 && `${hours} ساعة `}
                                    {minutes > 0 && `${minutes} دقيقة `}
                                    {seconds} ثانية
                                  </p>
                                </div>
                              );
                            })()}
                          </div>
                          {hasSigned('tenant') && (() => {
                            const tenantSig = signatures.find(s => s.type === 'tenant');
                            return tenantSig && (
                              <div className="pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-500 font-medium">✅ وقت التوقيع:</p>
                                <p className="text-sm text-green-700 font-semibold">
                                  {new Date(tenantSig.signedAt).toLocaleDateString('ar-EG')}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {new Date(tenantSig.signedAt).toLocaleTimeString('ar-EG')}
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      
                      {hasSigned('tenant') ? (
                        <div className="mt-2">
                          <p className="text-green-700 font-medium">✅ تم التوقيع</p>
                        </div>
                      ) : canSign('tenant') ? (
                        <button
                          onClick={() => handleSign('tenant')}
                          disabled={processing}
                          className="mt-3 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                        >
                          ✍️ وقّع الآن
                        </button>
                      ) : (
                        <p className="text-yellow-700 font-medium mt-2">⏳ في انتظار التوقيع</p>
                      )}
                    </div>
                  </div>

                  {/* المرحلة 2: المالك */}
                  <div className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                    hasSigned('owner') ? 'bg-green-50 border-green-300' : 
                    workflowState === 'pending_owner_signature' ? 'bg-yellow-50 border-yellow-300' : 
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      hasSigned('owner') ? 'bg-green-500' : 
                      workflowState === 'pending_owner_signature' ? 'bg-orange-500' : 'bg-gray-400'
                    }`}>
                      {hasSigned('owner') ? (
                        <FaCheckCircle className="w-6 h-6 text-white" />
                      ) : workflowState === 'pending_owner_signature' ? (
                        <FaClock className="w-6 h-6 text-white" />
                      ) : (
                        <FaBuilding className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <FaBuilding className="w-5 h-5 text-orange-600" />
                        المرحلة 2: توقيع المالك
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{property?.ownerName || 'المالك'}</p>
                      
                      {/* التفاصيل الزمنية */}
                      {hasSigned('tenant') && (() => {
                        const tenantSig = signatures.find(s => s.type === 'tenant');
                        const ownerSig = signatures.find(s => s.type === 'owner');
                        if (!tenantSig) return null;
                        
                        return (
                          <div className="mt-3 bg-white bg-opacity-70 rounded-lg p-3 border border-gray-200 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs text-gray-500 font-medium">📅 وقت الاستلام:</p>
                                <p className="text-sm text-gray-900 font-semibold">
                                  {new Date(tenantSig.signedAt).toLocaleDateString('ar-EG')}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {new Date(tenantSig.signedAt).toLocaleTimeString('ar-EG')}
                                </p>
                              </div>
                              {ownerSig && (() => {
                                const diff = ownerSig.signedAt - tenantSig.signedAt;
                                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                                
                                return (
                                  <div className="text-right">
                                    <p className="text-xs text-green-600 font-medium">⏱️ المدة:</p>
                                    <p className="text-sm text-green-700 font-bold">
                                      {days > 0 && `${days} يوم `}
                                      {hours > 0 && `${hours} ساعة `}
                                      {minutes > 0 && `${minutes} دقيقة `}
                                      {seconds} ثانية
                                    </p>
                                  </div>
                                );
                              })()}
                            </div>
                            {ownerSig && (
                              <div className="pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-500 font-medium">✅ وقت التوقيع:</p>
                                <p className="text-sm text-green-700 font-semibold">
                                  {new Date(ownerSig.signedAt).toLocaleDateString('ar-EG')}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {new Date(ownerSig.signedAt).toLocaleTimeString('ar-EG')}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      
                      {hasSigned('owner') ? (
                        <div className="mt-2">
                          <p className="text-green-700 font-medium">✅ تم التوقيع</p>
                        </div>
                      ) : canSign('owner') ? (
                        <button
                          onClick={() => handleSign('owner')}
                          disabled={processing}
                          className="mt-3 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                        >
                          ✍️ وقّع الآن
                        </button>
                      ) : !hasSigned('tenant') ? (
                        <p className="text-gray-500 font-medium mt-2">⏸️ في انتظار توقيع المستأجر أولاً</p>
                      ) : (
                        <p className="text-orange-700 font-medium mt-2">⏳ في انتظار التوقيع</p>
                      )}
                    </div>
                  </div>

                  {/* المرحلة 3: الإدارة */}
                  <div className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                    hasSigned('admin') ? 'bg-green-50 border-green-300' : 
                    workflowState === 'pending_admin_approval' ? 'bg-purple-50 border-purple-300' : 
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      hasSigned('admin') ? 'bg-green-500' : 
                      workflowState === 'pending_admin_approval' ? 'bg-purple-500' : 'bg-gray-400'
                    }`}>
                      {hasSigned('admin') ? (
                        <FaCheckCircle className="w-6 h-6 text-white" />
                      ) : workflowState === 'pending_admin_approval' ? (
                        <FaClock className="w-6 h-6 text-white" />
                      ) : (
                        <FaShieldAlt className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <FaShieldAlt className="w-5 h-5 text-purple-600" />
                        المرحلة 3: موافقة الإدارة
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">إدارة العقار</p>
                      
                      {/* التفاصيل الزمنية */}
                      {hasSigned('owner') && (() => {
                        const ownerSig = signatures.find(s => s.type === 'owner');
                        const adminSig = signatures.find(s => s.type === 'admin');
                        if (!ownerSig) return null;
                        
                        return (
                          <div className="mt-3 bg-white bg-opacity-70 rounded-lg p-3 border border-gray-200 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs text-gray-500 font-medium">📅 وقت الاستلام:</p>
                                <p className="text-sm text-gray-900 font-semibold">
                                  {new Date(ownerSig.signedAt).toLocaleDateString('ar-EG')}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {new Date(ownerSig.signedAt).toLocaleTimeString('ar-EG')}
                                </p>
                              </div>
                              {adminSig && (() => {
                                const diff = adminSig.signedAt - ownerSig.signedAt;
                                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                                
                                return (
                                  <div className="text-right">
                                    <p className="text-xs text-green-600 font-medium">⏱️ المدة:</p>
                                    <p className="text-sm text-green-700 font-bold">
                                      {days > 0 && `${days} يوم `}
                                      {hours > 0 && `${hours} ساعة `}
                                      {minutes > 0 && `${minutes} دقيقة `}
                                      {seconds} ثانية
                                    </p>
                                  </div>
                                );
                              })()}
                            </div>
                            {adminSig && (
                              <div className="pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-500 font-medium">✅ وقت التوقيع:</p>
                                <p className="text-sm text-green-700 font-semibold">
                                  {new Date(adminSig.signedAt).toLocaleDateString('ar-EG')}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {new Date(adminSig.signedAt).toLocaleTimeString('ar-EG')}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      
                      {hasSigned('admin') ? (
                        <div className="mt-2">
                          <p className="text-green-700 font-medium">✅ تم التوقيع والاعتماد</p>
                        </div>
                      ) : canSign('admin') ? (
                        <button
                          onClick={() => handleSign('admin')}
                          disabled={processing}
                          className="mt-3 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                        >
                          ✍️ اعتماد وتوقيع
                        </button>
                      ) : !hasSigned('tenant') || !hasSigned('owner') ? (
                        <p className="text-gray-500 font-medium mt-2">⏸️ في انتظار توقيع جميع الأطراف</p>
                      ) : (
                        <p className="text-purple-700 font-medium mt-2">⏳ في انتظار الاعتماد</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* إرسال للتوقيع (للإدارة فقط) */}
              {currentUserRole === 'admin' && workflowState === 'draft' && (
                <div className="bg-white shadow-lg rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaPaperPlane className="w-5 h-5 text-blue-600" />
                    إرسال العقد للتوقيع
                  </h2>
                  <p className="text-gray-600 mb-4">
                    سيتم إرسال العقد إلى المستأجر والمالك للتوقيع الإلكتروني بالترتيب التالي:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-700">
                    <li>توقيع المستأجر: {rental.tenantName} ({rental.tenantEmail || rental.tenantPhone})</li>
                    <li>توقيع المالك: {property?.ownerName} ({property?.ownerEmail || property?.ownerPhone})</li>
                    <li>اعتماد إدارة العقار (التوقيع النهائي)</li>
                  </ol>
                  <button
                    onClick={handleSendForSign}
                    disabled={processing}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold text-lg disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    <FaPaperPlane className="w-5 h-5" />
                    {processing ? 'جاري الإرسال...' : 'إرسال للتوقيع الإلكتروني'}
                  </button>
                </div>
              )}

              {/* حالة العقد بعد اكتمال التوقيعات */}
              {workflowState === 'active' && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-green-900">🎉 العقد مفعّل!</h2>
                      <p className="text-green-700">تم توقيع العقد من جميع الأطراف واعتماده</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600">حالة العقد</p>
                      <p className="text-lg font-bold text-green-700">مفعّل</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600">حالة العقار</p>
                      <p className="text-lg font-bold text-green-700">مؤجر</p>
                    </div>
                  </div>
                  <InstantLink
                    href={`/contracts/rental/${contractId}`}
                    className="mt-4 w-full inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    عرض تفاصيل العقد
                  </InstantLink>
                </div>
              )}

              {/* رسائل الحالة */}
              {status && (
                <div className={`rounded-lg p-4 ${
                  status.includes('✅') ? 'bg-green-50 border border-green-200 text-green-800' :
                  status.includes('❌') ? 'bg-red-50 border border-red-200 text-red-800' :
                  'bg-blue-50 border border-blue-200 text-blue-800'
                }`}>
                  {status}
                </div>
              )}

              {/* التوقيعات المكتملة */}
              {signatures.length > 0 && (
                <div className="bg-white shadow-lg rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">✅ التوقيعات المكتملة</h2>
                  <div className="space-y-3">
                    {signatures.map((sig, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-green-900">{getSignerLabel(sig.type)}: {sig.name}</p>
                            {sig.email && (
                              <p className="text-sm text-gray-600">{sig.email}</p>
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-gray-500">
                              {new Date(sig.signedAt).toLocaleDateString('en-GB')}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(sig.signedAt).toLocaleTimeString('en-GB', {
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* أزرار الإجراءات */}
              <div className="flex gap-4">
                <InstantLink
                  href={`/contracts/rental/${contractId}`}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-center"
                >
                  عرض تفاصيل العقد
                </InstantLink>
                {currentUserRole === 'admin' && (
                  <InstantLink
                    href={`/rentals/edit/${contractId}`}
                    className="flex-1 px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors font-medium text-center"
                  >
                    تعديل العقد
                  </InstantLink>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* العقود التي تحتاج للتوقيع */}
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📝 العقود التي تحتاج للتوقيع
                </h2>
                <p className="text-gray-600 mb-6">
                  اختر عقداً من القائمة أدناه لعرض تفاصيله وإدارة التوقيعات
                </p>

                {contractsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500"></div>
                    <p className="mr-4 text-gray-600">جاري التحميل...</p>
                  </div>
                ) : allContracts.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">لا توجد عقود متاحة</p>
                    <InstantLink
                      href="/rentals/new"
                      className="mt-4 inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      إضافة عقد جديد
                    </InstantLink>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allContracts.map((contract) => {
                      const workflowState = contract.signatureWorkflow || 'draft';
                      const signatures = contract.signatures || [];
                      const hasTenantSign = signatures.some((s: any) => s.type === 'tenant');
                      const hasOwnerSign = signatures.some((s: any) => s.type === 'owner');
                      const hasAdminSign = signatures.some((s: any) => s.type === 'admin');
                      const isActive = workflowState === 'active';
                      const needsSignature = !isActive;

                      // تحديد لون الكارت حسب الحالة
                      const cardColor = isActive 
                        ? 'border-green-300 bg-green-50' 
                        : needsSignature 
                        ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400' 
                        : 'border-gray-200 bg-white hover:border-gray-300';

                      return (
                        <InstantLink
                          key={contract.id}
                          href={`/contracts/sign?contractId=${contract.id}`}
                          className={`block border-2 ${cardColor} rounded-lg p-4 transition-all cursor-pointer`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-gray-900 text-sm mb-1">
                                العقد #{contract.id}
                              </h3>
                              <p className="text-xs text-gray-600">
                                {contract.tenantName || 'مستأجر غير محدد'}
                              </p>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-semibold ${getWorkflowStateColor(workflowState)}`}>
                              {getWorkflowStateLabel(workflowState)}
                            </div>
                          </div>

                          {/* مؤشرات التوقيعات */}
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center gap-2 text-xs">
                              {hasTenantSign ? (
                                <FaCheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <FaClock className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={hasTenantSign ? 'text-green-700 font-medium' : 'text-gray-500'}>
                                المستأجر
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              {hasOwnerSign ? (
                                <FaCheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <FaClock className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={hasOwnerSign ? 'text-green-700 font-medium' : 'text-gray-500'}>
                                المالك
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              {hasAdminSign ? (
                                <FaCheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <FaClock className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={hasAdminSign ? 'text-green-700 font-medium' : 'text-gray-500'}>
                                الإدارة
                              </span>
                            </div>
                          </div>

                          {/* معلومات مالية */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                            <span className="text-xs text-gray-500">الإيجار الشهري</span>
                            <span className="text-sm font-bold text-gray-900">
                              {contract.monthlyRent || 0} {contract.currency || 'OMR'}
                            </span>
                          </div>

                          {isActive && (
                            <div className="mt-3 flex items-center gap-2 text-green-700 text-xs font-semibold">
                              <FaCheckCircle className="w-4 h-4" />
                              اكتملت جميع التوقيعات
                            </div>
                          )}
                        </InstantLink>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* إضافة عقد جديد */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">هل تريد إضافة عقد جديد؟</h3>
                <p className="text-gray-600 mb-4">
                  يمكنك إنشاء عقد إيجار جديد وإرساله للتوقيع الإلكتروني
                </p>
                <InstantLink
                  href="/rentals/new"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors gap-2"
                >
                  <FaPaperPlane className="w-4 h-4" />
                  إضافة عقد جديد
                </InstantLink>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default ElectronicSignPage;


