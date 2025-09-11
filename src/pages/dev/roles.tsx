// src/pages/dev/roles.tsx
// يدعم /dev/roles المستخدم في شريط الأدوات (انتحال)
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async()=>({redirect:{destination:"/admin/dashboard?section=impersonate",permanent:false}});
export default function RedirectDevRoles(){return null;}
