import React from "react";
import Link from "next/link";

export function PageHeader({ title, subtitle, cta }: { title: string; subtitle?: string; cta?: { href: string; label: string } }) {
  return (
    <section className="bg-white border-b">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}
          </div>
          {cta && (
            <Link href={cta.href} className="rounded-2xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700">
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}