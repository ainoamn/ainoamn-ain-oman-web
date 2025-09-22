// src/pages/admin/projects/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=projects", permanent: false }});
function RedirectProjects(){ return null; }
