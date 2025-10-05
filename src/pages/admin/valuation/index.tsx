// src/pages/admin/valuation/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=valuation", permanent: false }});
export default function RedirectValuation(){ return null; }
