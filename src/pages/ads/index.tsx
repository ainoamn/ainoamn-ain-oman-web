// src/pages/ads/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async()=>({redirect:{destination:"/admin/dashboard?section=ads",permanent:false}});
function RedirectAds(){return null;}
