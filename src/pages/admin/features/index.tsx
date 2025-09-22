// src/pages/admin/features/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=features", permanent: false }});
function RedirectFeatures(){ return null; }
