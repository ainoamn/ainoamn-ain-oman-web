import Layout from "@/components/layout/Layout"; import { useTSafe } from "@/lib/i18n-safe"; import Head from "next/head";
export default function HoaDev() { const { t, dir } = useTSafe(); return (
  <Layout><Head><title>HOA Dev</title></Head><div dir={dir} className="space-y-4 p-6">
    <h1 className="text-xl font-semibold">Diagnostics</h1>
    <ul className="list-disc ps-6 text-sm"><li>{t("hoa.home.title","t() works with fallback")}</li><li>dir: {dir}</li></ul>
  </div></Layout>
);}
