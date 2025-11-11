import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import InstantLink from "@/components/InstantLink";
import { 
  FaLink, FaPrint, FaFileContract, FaBuilding, FaUser, FaCalendarAlt, 
  FaArrowLeft, FaDownload, FaCopy, FaStar, FaCheckCircle, FaInfoCircle,
  FaFileAlt, FaEnvelope, FaLayerGroup, FaEdit, FaEye, FaRocket,
  FaChevronDown, FaChevronUp, FaListAlt, FaExpandAlt, FaCompressAlt, FaTrash
} from "react-icons/fa";

const TemplatePreviewPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [showAllSections, setShowAllSections] = useState(true); // Changed to true by default
  const [copied, setCopied] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  useEffect(() => {
    // Expand all sections by default after mount
    if (hasMounted && template?.content?.sections) {
      const allIndexes = new Set(template.content.sections.map((_: any, idx: number) => idx));
      setExpandedSections(allIndexes);
    }
  }, [template, hasMounted]);

  const loadTemplate = async () => {
    try {
      const res = await fetch(`/api/contract-templates/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTemplate(data.template);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTemplate = () => {
    if (template?.content?.sections) {
      let text = `${getText(template.name)}\n${'='.repeat(50)}\n\n`;
      template.content.sections.forEach((section: any) => {
        text += `${getText(section.title)}\n${'-'.repeat(30)}\n`;
        section.clauses.forEach((clause: any, idx: number) => {
          text += `${idx + 1}. ${getText(clause)}\n`;
        });
        text += '\n';
      });
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!id || !template) return;
    
    const templateName = getText(template.name);
    const confirmed = confirm(`⚠️ هل أنت متأكد من حذف القالب "${templateName}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`);
    
    if (!confirmed) return;
    
    try {
      const res = await fetch(`/api/contract-templates/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        alert('✅ تم حذف القالب بنجاح');
        router.push('/contracts/templates');
      } else {
        const error = await res.json();
        alert(`❌ فشل حذف القالب: ${error.message || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('❌ حدث خطأ أثناء حذف القالب');
    }
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const toggleAllSections = () => {
    if (showAllSections) {
      setExpandedSections(new Set());
    } else {
      const allIndexes = new Set(template.content.sections.map((_: any, idx: number) => idx));
      setExpandedSections(allIndexes);
    }
    setShowAllSections(!showAllSections);
  };

  const getUsageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'residential': 'سكني',
      'commercial': 'تجاري',
      'industrial': 'صناعي'
    };
    return labels[type] || type;
  };

  const getText = (obj: any, lang: 'ar' | 'en' = 'ar') => {
    if (typeof obj === 'string') return obj;
    if (obj && typeof obj === 'object') {
      return obj[lang] || obj.ar || obj.en || '';
    }
    return '';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'contracts': FaFileContract,
      'requests': FaFileAlt,
      'letters': FaEnvelope
    };
    return icons[category] || FaLayerGroup;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'contracts': 'عقود',
      'requests': 'طلبات',
      'letters': 'رسائل'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'contracts': 'from-blue-500 to-blue-600',
      'requests': 'from-orange-500 to-orange-600',
      'letters': 'from-purple-500 to-purple-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  // تنسيق الطباعة
  const printStyles = `
    @media print {
      body * { visibility: hidden; }
      .print-area, .print-area * { visibility: visible; }
      .print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        font-size: 12pt;
        line-height: 1.6;
      }
      .no-print { display: none !important; }
      .company-header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #1f2937;
      }
      .section { page-break-inside: avoid; }
    }
  `;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-md"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaFileContract className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">القالب غير موجود</h1>
          <p className="text-gray-600 mb-6">تأكد من رابط القالب أو عد لقائمة القوالب.</p>
          <InstantLink 
            href="/contracts/templates" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
          >
            <FaArrowLeft />
            العودة للقوالب
          </InstantLink>
        </motion.div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(template.category);
  const totalClauses = template.content?.sections?.reduce((sum: number, section: any) => 
    sum + (section.clauses?.length || 0), 0) || 0;

  return (
    <>
      <Head>
        <title>معاينة القالب | {getText(template.name)} | Ain Oman</title>
      </Head>
      
      <style jsx global>{printStyles}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Hero Header */}
        <div className={`bg-gradient-to-r ${getCategoryColor(template.category)} text-white relative overflow-hidden no-print`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Back Button */}
              <div className="mb-6">
                <InstantLink
                  href="/contracts/templates"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all"
                >
                  <FaArrowLeft />
                  <span>العودة للقوالب</span>
                </InstantLink>
              </div>

              {/* Template Info */}
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CategoryIcon className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold">{getText(template.name)}</h1>
                    {template.isDefault && (
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center" title="قالب افتراضي">
                        <FaStar className="w-4 h-4 text-yellow-900" />
                      </div>
                    )}
                  </div>
                  <p className="text-xl text-white/90 mb-4">{getText(template.name, 'en')}</p>
                  <p className="text-lg text-white/80 mb-6">{getText(template.description)}</p>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                      <FaLayerGroup className="w-4 h-4" />
                      <span className="text-sm">{template.content?.sections?.length || 0} قسم</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                      <FaListAlt className="w-4 h-4" />
                      <span className="text-sm">{totalClauses} بند</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                      <CategoryIcon className="w-4 h-4" />
                      <span className="text-sm">{getCategoryLabel(template.category)}</span>
                    </div>
                    {template.usageTypes && template.usageTypes.length > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                        <FaBuilding className="w-4 h-4" />
                        <span className="text-sm">{template.usageTypes.map(getUsageTypeLabel).join(' - ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <InstantLink
                  href={`/rentals/new?template=${encodeURIComponent(id || "")}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold shadow-lg"
                >
                  <FaRocket className="w-4 h-4" />
                  إنشاء عقد إيجار
                </InstantLink>
                <InstantLink
                  href={`/contracts/create?template=${encodeURIComponent(id || "")}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all font-semibold border-2 border-white/30"
                >
                  <FaFileContract className="w-4 h-4" />
                  إنشاء عقد عام
                </InstantLink>
                <InstantLink
                  href={`/contracts/templates/${id}/link`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all font-semibold border-2 border-white/30"
                >
                  <FaLink className="w-4 h-4" />
                  ربط بعقار
                </InstantLink>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all font-semibold border-2 border-white/30"
                >
                  <FaPrint className="w-4 h-4" />
                  طباعة
                </button>
                <button
                  onClick={handleCopyTemplate}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all font-semibold border-2 border-white/30"
                >
                  <FaCopy className="w-4 h-4" />
                  {copied ? 'تم النسخ!' : 'نسخ'}
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/90 backdrop-blur-sm text-white rounded-xl hover:bg-red-600 transition-all font-semibold border-2 border-red-400"
                >
                  <FaTrash className="w-4 h-4" />
                  حذف القالب
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Template Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6 no-print"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <CategoryIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-sm text-gray-500 mb-1">التصنيف</div>
                <div className="font-semibold text-gray-900">{getCategoryLabel(template.category)}</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FaFileAlt className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-sm text-gray-500 mb-1">النوع</div>
                <div className="font-semibold text-gray-900">{template.type}</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FaLink className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-sm text-gray-500 mb-1">الروابط</div>
                <div className="font-semibold text-gray-900">
                  {(template.linkedProperties?.length || 0) + (template.linkedUnits?.length || 0)} ربط
                </div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FaCalendarAlt className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-sm text-gray-500 mb-1">تاريخ الإنشاء</div>
                <div className="font-semibold text-gray-900 text-sm" suppressHydrationWarning>
                  {template.createdAt ? new Date(template.createdAt).toLocaleDateString('ar-SA', { timeZone: 'UTC' }) : 'غير محدد'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Variables Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6 no-print"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaInfoCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">المتغيرات التلقائية</h3>
                <p className="text-sm text-gray-700 mb-4">
                  جميع المتغيرات بين [الأقواس] سيتم ملؤها تلقائياً بالبيانات الفعلية عند إنشاء العقد
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    '[اسم المالك]', '[اسم المستأجر]', '[عنوان العقار]', '[المبلغ]',
                    '[تاريخ البداية]', '[تاريخ النهاية]', '[المدة]', '[مبلغ التأمين]'
                  ].map((variable, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm">
                      <FaCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <code className="text-blue-600 font-mono">{variable}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Toggle All Sections */}
          <div className="flex items-center justify-between mb-4 no-print">
            <h2 className="text-2xl font-bold text-gray-900">محتوى القالب</h2>
            <button
              onClick={toggleAllSections}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {showAllSections ? <FaCompressAlt className="w-4 h-4" /> : <FaExpandAlt className="w-4 h-4" />}
              <span className="text-sm font-medium">{showAllSections ? 'طي الكل' : 'توسيع الكل'}</span>
            </button>
          </div>

          {/* Template Content */}
          <div className="print-area">
            {/* Company Header for Print */}
            <div className="company-header hidden print:block bg-white p-8 text-center mb-8">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                مجموعة سيد فياض العالمية ش م م
              </div>
              <div className="text-2xl font-bold text-gray-700 mb-4">
                SYED FAYYAZ GROUP INTERNATIONAL L L C
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>ص.ب: 154 ، الرمز البريدي : 111 ، سلطنة عمان</div>
                <div>هاتف : +968 24499481 | فاكس : +968 24497482</div>
              </div>
            </div>

            {/* Document Title for Print */}
            <div className="hidden print:block bg-gray-50 p-6 text-center border-b mb-8">
              <div className="text-2xl font-bold text-gray-900 mb-2">{getText(template.name, 'ar')}</div>
              <div className="text-xl font-bold text-gray-700">{getText(template.name, 'en')}</div>
            </div>

            {/* Sections */}
            {template.content?.sections ? (
              <div className="space-y-4">
                {template.content.sections.map((section: any, sectionIndex: number) => {
                  const isExpanded = expandedSections.has(sectionIndex);
                  
                  return (
                    <motion.div
                      key={sectionIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + sectionIndex * 0.05 }}
                      className="section bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
                    >
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(sectionIndex)}
                        className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 transition-all no-print"
                      >
                        <div className="flex items-center gap-4 flex-1 text-right">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white bg-gradient-to-r ${getCategoryColor(template.category)}`}>
                            {sectionIndex + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-lg font-bold text-gray-900 mb-1" dir="rtl">
                              {getText(section.title, 'ar')}
                            </div>
                            <div className="text-sm font-semibold text-gray-600" dir="ltr">
                              {getText(section.title, 'en')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FaListAlt className="w-4 h-4" />
                            <span>{section.clauses?.length || 0} بند</span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <FaChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <FaChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {/* Section Header for Print */}
                      <div className="hidden print:block p-6 bg-gray-100 border-r-4 border-blue-500">
                        <div className="text-lg font-bold text-gray-900 mb-1" dir="rtl">
                          {getText(section.title, 'ar')}
                        </div>
                        <div className="text-base font-semibold text-gray-700" dir="ltr">
                          {getText(section.title, 'en')}
                        </div>
                      </div>

                      {/* Section Content */}
                      {(isExpanded || true) && (
                        <div className={`p-6 space-y-4 ${!isExpanded ? 'hidden print:block' : ''}`}>
                          {section.clauses.map((clause: any, clauseIndex: number) => (
                            <motion.div
                              key={clauseIndex}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: clauseIndex * 0.02 }}
                              className="clause p-5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-all"
                            >
                              {/* Arabic Clause */}
                              <div className="mb-3" dir="rtl">
                                <div className="flex items-start gap-3">
                                  <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-white text-sm font-bold">{clauseIndex + 1}</span>
                                  </div>
                                  <p className="flex-1 text-base leading-relaxed text-gray-900">
                                    {getText(clause, 'ar')}
                                  </p>
                                </div>
                              </div>
                              {/* English Clause */}
                              <div dir="ltr">
                                <div className="flex items-start gap-3">
                                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-blue-600 text-sm font-bold">{clauseIndex + 1}</span>
                                  </div>
                                  <p className="flex-1 text-sm leading-relaxed text-gray-600 italic">
                                    {getText(clause, 'en')}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaFileContract className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">لا توجد بنود محددة في هذا القالب</p>
              </div>
            )}

            {/* Signatures Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="signature-section mt-8 bg-white rounded-2xl shadow-lg p-8 border-t-4 border-blue-600"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">التوقيعات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-full h-24 border-b-2 border-gray-300 mb-4"></div>
                  </div>
                  <div className="text-base font-semibold text-gray-900 mb-1">توقيع المؤجر</div>
                  <div className="text-sm text-gray-500 mb-3">Lessor Signature</div>
                  <div className="text-sm text-gray-600">التاريخ: _______________</div>
                  <div className="text-xs text-gray-500">Date: _______________</div>
                </div>
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-full h-24 border-b-2 border-gray-300 mb-4"></div>
                  </div>
                  <div className="text-base font-semibold text-gray-900 mb-1">توقيع المستأجر</div>
                  <div className="text-sm text-gray-500 mb-3">Tenant Signature</div>
                  <div className="text-sm text-gray-600">التاريخ: _______________</div>
                  <div className="text-xs text-gray-500">Date: _______________</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 no-print"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaCheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">ملاحظة مهمة</h3>
                <p className="text-gray-700 leading-relaxed">
                  هذه معاينة للبنية الأساسية للقالب. عند إنشاء عقد جديد، سيتم ملء جميع المتغيرات تلقائياً بالبيانات الفعلية من العقار والمالك والمستأجر. يمكنك البدء الآن بإنشاء عقد إيجار أو عقد عام باستخدام هذا القالب.
                </p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default TemplatePreviewPage;
