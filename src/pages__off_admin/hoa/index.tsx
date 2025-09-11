// src/pages/admin/hoa/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=hoa", permanent: false }});
export default function RedirectHoa(){ return null; }
