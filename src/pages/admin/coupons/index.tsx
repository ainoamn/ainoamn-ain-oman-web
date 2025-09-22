// src/pages/admin/coupons/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=coupons", permanent: false }});
function RedirectCoupons(){ return null; }
