// src/pages/admin/invoices/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=invoices", permanent: false }});
function RedirectInvoices(){ return null; }
