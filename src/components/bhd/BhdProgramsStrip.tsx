import React, { useEffect, useState } from "react";
import type { BhdApp } from "@/lib/bhd/apps";
import { fetchIdentityCatalog } from "@/lib/bhd/catalog";
import { DEFAULT_IDENTITY_ISSUER } from "@/lib/bhd/identity-public";

function launchHref(app: BhdApp): string {
  if (app.mode === "identity") return `${DEFAULT_IDENTITY_ISSUER}${app.workspacePath}`;
  if (app.startUrl) return app.startUrl;
  return app.origin;
}

export default function BhdProgramsStrip() {
  const [apps, setApps] = useState<BhdApp[]>([]);

  useEffect(() => {
    let alive = true;
    void fetchIdentityCatalog().then((list) => {
      if (alive) setApps(list.filter((a) => a.enabled));
    });
    const onCatalog = () => {
      void fetchIdentityCatalog().then((list) => {
        if (alive) setApps(list.filter((a) => a.enabled));
      });
    };
    window.addEventListener("bhd-catalog", onCatalog);
    return () => {
      alive = false;
      window.removeEventListener("bhd-catalog", onCatalog);
    };
  }, []);

  if (!apps.length) return null;

  return (
    <section
      className="border-t border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-white py-6"
      aria-label="برامج BHD"
      dir="rtl"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-4">
        <span className="text-sm font-medium text-emerald-900">برامج BHD</span>
        {apps.map((app) => (
          <a
            key={app.id}
            href={launchHref(app)}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm text-emerald-900 shadow-sm transition hover:border-emerald-400"
            style={{ borderColor: `${app.accent}33` }}
          >
            {app.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={app.logoUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
            ) : (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: app.accent }}
              >
                {app.mark.slice(0, 2)}
              </span>
            )}
            <span>{app.nameAr}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
