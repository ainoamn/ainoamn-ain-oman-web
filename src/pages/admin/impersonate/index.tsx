// src/pages/admin/impersonate/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=impersonate", permanent: false }});
export default function RedirectImpersonate(){ return null; }
