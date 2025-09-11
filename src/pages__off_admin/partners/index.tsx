// src/pages/admin/partners/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=partners", permanent: false }});
export default function RedirectPartners(){ return null; }
