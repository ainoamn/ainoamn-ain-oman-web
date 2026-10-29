import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";

/**
 * Temporary lean page: the previous file was a concatenation of many modules
 * (docs + APIs + pages) and broke the production build. Identity isolation wire
 * does not depend on this admin screen.
 */
export default function AdminDevelopmentProjectPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";

  return (
    <Layout>
      <Head>
        <title>مشروع التطوير</title>
      </Head>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold">مشروع التطوير</h1>
        <p className="mt-2 text-sm text-gray-600" dir="ltr">
          {id || "—"}
        </p>
        <p className="mt-4 text-sm text-gray-500">
          صفحة التفاصيل قيد الإصلاح بعد تنظيف ملف تالف كان يمنع نشر الموقع.
        </p>
      </div>
    </Layout>
  );
}
