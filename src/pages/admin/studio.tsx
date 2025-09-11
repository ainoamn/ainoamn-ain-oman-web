// src/pages/admin/studio.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: "/admin/settings?tab=studio", permanent: false }
});
export default function RedirectStudio(){ return null; }
