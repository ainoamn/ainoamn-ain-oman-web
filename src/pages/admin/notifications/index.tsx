// src/pages/notifications/index.tsx
// إعادة توجيه للوحة القسم
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async()=>({redirect:{destination:"/admin/dashboard?section=notifications",permanent:false}});
function RedirectNotifications(){return null;}
