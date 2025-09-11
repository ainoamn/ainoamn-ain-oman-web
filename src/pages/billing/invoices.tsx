// src/pages/billing/invoices.tsx
// يدعم /billing/invoices
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async()=>({redirect:{destination:"/admin/dashboard?section=invoices",permanent:false}});
export default function RedirectBillingInvoices(){return null;}
