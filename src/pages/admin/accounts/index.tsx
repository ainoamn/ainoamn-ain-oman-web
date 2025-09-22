// src/pages/admin/accounts/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=accounts", permanent: false }});
function RedirectAccounts(){ return null; }
