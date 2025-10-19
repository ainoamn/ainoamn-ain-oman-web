// @ts-nocheck
import React from "react";
import Layout from "@/components/layout/Layout";

export default function AdminProjectPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Admin Project</h1>
      <p className="text-sm text-gray-500">This page was replaced with a placeholder to fix parsing errors.</p>
    </div>
  );
}

AdminProjectPage.getLayout = (page: React.ReactElement) => <Layout>{page}</Layout>;

