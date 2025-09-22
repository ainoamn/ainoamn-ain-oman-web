// src/pages/admin/auctions/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=auctions", permanent: false }});
function RedirectAuctions(){ return null; }
