import Head from "next/head";

export default function Page() {
  return (
    <div className="min-h-screen p-6">
      <Head>
        <title>Badge Rules – Ain Oman</title>
        <meta name="description" content="Badge Rules page" />
      </Head>
      <main className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Badge Rules</h1>
        <p className="text-slate-600">This is the badge-rules page placeholder. Replace with real content.</p>
      </main>
    </div>
  );
}