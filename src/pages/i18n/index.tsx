// src/pages/i18n/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async()=>({redirect:{destination:"/admin/dashboard?section=i18n",permanent:false}});
export default function RedirectI18n(){return null;}
