// src/pages/admin/ai-panel/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=ai-panel", permanent: false }});
function RedirectAIPanel(){ return null; }
