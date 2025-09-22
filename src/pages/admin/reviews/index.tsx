// src/pages/admin/reviews/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=reviews", permanent: false }});
function RedirectReviews(){ return null; }
