/**
 * /admin/development/projects — لوحة إدارة المشاريع (Baseline Restored From Docs)
 */
import React from "react";
import Head from "next/head";
import Layout from "@/components/layout/Layout";

export default function AdminDevProjectsIndex() {
  return (
    <Layout>
      <Head><title>إدارة مشاريع التطوير</title></Head>
      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">إدارة مشاريع التطوير العقاري</h1>
          <a href="/admin/development/projects/new" className="px-3 py-2 rounded-lg border">+ مشروع جديد</a>
        </div>
        <p className="text-sm text-neutral-600">من هنا يتم إنشاء وإدارة المشاريع. لعرض الجمهور: /development</p>
      </div>
    </Layout>
  );
}
