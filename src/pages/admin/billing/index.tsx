// src/pages/admin/billing/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=billing", permanent: false }});
function RedirectBilling(){ return null; }
