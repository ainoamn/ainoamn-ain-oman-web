// src/pages/admin/properties/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=properties", permanent: false }});
function RedirectProperties(){ return null; }
