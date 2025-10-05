// src/pages/admin/coupons/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=coupons", permanent: false }});
export default function RedirectCoupons(){ return null; }
