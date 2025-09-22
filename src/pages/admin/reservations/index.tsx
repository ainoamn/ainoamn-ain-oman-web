// src/pages/admin/reservations/index.tsx
import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({ redirect: { destination: "/admin/dashboard?section=reservations", permanent: false }});
function RedirectReservations(){ return null; }
