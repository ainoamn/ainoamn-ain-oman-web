// src/pages/admin/invoices/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=invoices", permanent: false }});
export default function RedirectInvoices(){ return null; }
