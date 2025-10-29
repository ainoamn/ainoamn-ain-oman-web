import { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import InstantLink from "@/components/InstantLink";

const RentalContractsPage: NextPage = () => {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/rentals?mine=true");
        if (res.ok) {
          const data = await res.json();
          setRentals(Array.isArray(data?.items) ? data.items : []);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <Head>
        <title>عقود الإيجار | Ain Oman</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">عقود الإيجار</h1>
                <p className="text-gray-600">إدارة وإنشاء عقود الإيجار</p>
              </div>
              <InstantLink
                href="/rentals/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                إنشاء عقد جديد
              </InstantLink>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {loading ? (
              <div className="p-6 text-center text-gray-500">جاري التحميل...</div>
            ) : rentals.length === 0 ? (
              <div className="p-10 text-center">
                <h3 className="text-sm font-medium text-gray-900">لا توجد عقود إيجار</h3>
                <p className="mt-1 text-sm text-gray-500">ابدأ بإنشاء أول عقد إيجار لك.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {rentals.map((rental) => (
                  <li key={rental.id}>
                    <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">عقد #{String(rental.id).slice(0, 8)}</p>
                        <p className="text-sm text-gray-500">{new Date(rental.createdAt).toLocaleDateString('ar')}</p>
                      </div>
                      <div className="text-sm text-gray-700">
                        {rental.amount} {rental.currency}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default RentalContractsPage;


