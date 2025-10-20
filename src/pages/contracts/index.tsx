import React from "react";
import Head from "next/head";

export default function ContractsPage() {
  return (
    <main className="min-h-screen p-6">
      <Head>
        <title>Contracts | Ain Oman</title>
      </Head>
      <h1 className="text-2xl font-bold">Contracts</h1>
      <p className="mt-4 text-sm text-gray-600">This page intentionally left simple for prerender stability.</p>
    </main>
  );
}
