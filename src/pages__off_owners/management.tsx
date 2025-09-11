import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { useTSafe } from "@/lib/i18n-safe";
import HoaNav from "@/components/hoa/HoaNav";
import { useHoa } from "@/context/hoa";
import { FiSave, FiDownload, FiUpload, FiShield, FiCreditCard } from "react-icons/fi";

function Card({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: React.ComponentType<any> }) {
  return (
    <section className="card p-6">
      <h2 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        {Icon && <Icon size={20} />}
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function HoaManagementPage() {
  const { t, dir } = useTSafe();
  const { hoas, loading } = useHoa();
  
  const [bank, setBank] = useState({
    name: "",
    iban: "",
    account: "",
    beneficiary: ""
  });
  
  const [cheque, setCheque] = useState({
    prefix: "",
    nextNo: "1",
    printFormat: "default"
  });
  
  const [contacts, setContacts] = useState({
    email: "",
    phone: "",
    address: "",
    website: ""
  });
  
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: 60,
    passwordPolicy: "medium"
  });

  const handleSave = async (section: string) => {
    // حفظ الإعدادات
    console.log(`Saving ${section} settings`);
    
    // في التطبيق الحقيقي، سيتم إرسال البيانات إلى API
    try {
      // await saveSettings(section, data);
      console.log(`${section} settings saved successfully`);
    } catch (error) {
      console.error(`Failed to save ${section} settings:`, error);
    }
  };

  const exportData = (type: string) => {
    // تصدير البيانات
    console.log(`Exporting ${type} data`);
  };

  const importData = (type: string, file: File) => {
    // استيراد البيانات
    console.log(`Importing ${type} data from`, file.name);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{t("hoa.mgmt.title", "إدارة الجمعية")}</title>
      </Head>
      
      <div dir={dir} className="space-y-6 p-4 md:p-6">
        <HoaNav />
        
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t("hoa.mgmt.title", "إدارة الجمعية")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("hoa.mgmt.subtitle", "إعدادات وإدارة متقدمة لجمعية الملاك")}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => exportData('all')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
            >
              <FiDownload size={16} />
              {t("hoa.mgmt.export", "تصدير")}
            </button>
            
            <label className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors cursor-pointer">
              <FiUpload size={16} />
              {t("hoa.mgmt.import", "استيراد")}
              <input
                type="file"
                onChange={(e) => e.target.files?.[0] && importData('all', e.target.files[0])}
                className="hidden"
                accept=".json,.csv"
              />
            </label>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* البيانات البنكية */}
          <Card title={t("hoa.mgmt.bank", "بيانات الحساب البنكي")} icon={FiCreditCard}>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("bank.name", "اسم البنك")}
                </label>
                <input
                  type="text"
                  value={bank.name}
                  onChange={(e) => setBank({ ...bank, name: e.target.value })}
                  className="input-field"
                  placeholder={t("bank.namePlaceholder", "اسم البنك")}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  IBAN
                </label>
                <input
                  type="text"
                  value={bank.iban}
                  onChange={(e) => setBank({ ...bank, iban: e.target.value })}
                  className="input-field"
                  placeholder="SAXXXXXXXXXXXXXXXXXXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("account.number", "رقم الحساب")}
                </label>
                <input
                  type="text"
                  value={bank.account}
                  onChange={(e) => setBank({ ...bank, account: e.target.value })}
                  className="input-field"
                  placeholder={t("account.numberPlaceholder", "رقم الحساب البنكي")}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("beneficiary", "المستفيد")}
                </label>
                <input
                  type="text"
                  value={bank.beneficiary}
                  onChange={(e) => setBank({ ...bank, beneficiary: e.target.value })}
                  className="input-field"
                  placeholder={t("beneficiaryPlaceholder", "اسم المستفيد")}
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('bank')}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiSave size={16} />
                  {t("save", "حفظ")}
                </button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("hoa.mgmt.bankHint", "لن يتم الحفظ فعليًا الآن. اربطه لاحقًا بـ /api/invoices و /api/payments.")}
              </p>
            </div>
          </Card>

          {/* إعدادات الشيكات */}
          <Card title={t("hoa.mgmt.cheques", "إعدادات الشيكات")} icon={FiCreditCard}>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("prefix", "السابقة")}
                </label>
                <input
                  type="text"
                  value={cheque.prefix}
                  onChange={(e) => setCheque({ ...cheque, prefix: e.target.value })}
                  className="input-field"
                  placeholder={t("prefixPlaceholder", "مثل: CHQ")}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("next.number", "رقم الشيك التالي")}
                </label>
                <input
                  type="number"
                  value={cheque.nextNo}
                  onChange={(e) => setCheque({ ...cheque, nextNo: e.target.value })}
                  className="input-field"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("print.format", "نموذج الطباعة")}
                </label>
                <select
                  value={cheque.printFormat}
                  onChange={(e) => setCheque({ ...cheque, printFormat: e.target.value })}
                  className="input-field"
                >
                  <option value="default">{t("print.default", "النموذج الافتراضي")}</option>
                  <option value="custom">{t("print.custom", "مخصص")}</option>
                </select>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('cheque')}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiSave size={16} />
                  {t("save", "حفظ")}
                </button>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t("hoa.mgmt.chequeHint", "يمكن مستقبلاً توليد PDF للشيك وربطه بالفواتير.")}
              </div>
            </div>
          </Card>

          {/* بيانات التواصل */}
          <Card title={t("hoa.mgmt.contacts", "بيانات التواصل")}>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("email", "البريد الإلكتروني")}
                </label>
                <input
                  type="email"
                  value={contacts.email}
                  onChange={(e) => setContacts({ ...contacts, email: e.target.value })}
                  className="input-field"
                  placeholder="email@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("phone", "الهاتف")}
                </label>
                <input
                  type="tel"
                  value={contacts.phone}
                  onChange={(e) => setContacts({ ...contacts, phone: e.target.value })}
                  className="input-field"
                  placeholder="+966XXXXXXXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("address", "العنوان")}
                </label>
                <textarea
                  value={contacts.address}
                  onChange={(e) => setContacts({ ...contacts, address: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder={t("addressPlaceholder", "العنوان الكامل")}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("website", "الموقع الإلكتروني")}
                </label>
                <input
                  type="url"
                  value={contacts.website}
                  onChange={(e) => setContacts({ ...contacts, website: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('contacts')}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiSave size={16} />
                  {t("save", "حفظ")}
                </button>
              </div>
            </div>
          </Card>

          {/* الإعدادات الأمنية */}
          <Card title={t("hoa.mgmt.security", "الإعدادات الأمنية")} icon={FiShield}>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("hoa.mgmt.twoFactor", "المصادقة الثنائية")}
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={security.twoFactor}
                    onChange={(e) => setSecurity({ ...security, twoFactor: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("hoa.mgmt.sessionTimeout", "مهلة الجلسة (دقائق)")}
                </label>
                <input
                  type="number"
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity({ ...security, sessionTimeout: Number(e.target.value) })}
                  className="input-field"
                  min="5"
                  max="480"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("hoa.mgmt.passwordPolicy", "سياسة كلمة المرور")}
                </label>
                <select
                  value={security.passwordPolicy}
                  onChange={(e) => setSecurity({ ...security, passwordPolicy: e.target.value })}
                  className="input-field"
                >
                  <option value="low">{t("hoa.mgmt.policyLow", "منخفضة")}</option>
                  <option value="medium">{t("hoa.mgmt.policyMedium", "متوسطة")}</option>
                  <option value="high">{t("hoa.mgmt.policyHigh", "عالية")}</option>
                </select>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('security')}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiSave size={16} />
                  {t("save", "حفظ")}
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* روابط سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/owners-association/documents"
            className="card p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {t("hoa.nav.documents", "المستندات")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("hoa.mgmt.manageDocuments", "إدارة مستندات الجمعية")}
            </p>
          </Link>
          
          <Link
            href="/owners-association/tracking"
            className="card p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {t("hoa.nav.tracking", "المتابعة")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("hoa.mgmt.trackActivities", "متابعة أنشطة الجمعية")}
            </p>
          </Link>
          
          <Link
            href="/admin/users"
            className="card p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {t("hoa.mgmt.userManagement", "إدارة المستخدمين")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("hoa.mgmt.manageUsers", "إدارة صلاحيات المستخدمين")}
            </p>
          </Link>
        </div>
      </div>
    </Layout>
  );
}