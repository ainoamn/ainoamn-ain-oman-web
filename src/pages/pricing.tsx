// 301/302 redirect to the single source of truth: /subscriptions
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/subscriptions",
      permanent: false, // غيّرها إلى true بعد التأكد لإعطاء 301
    },
  };
};

export default function PricingRedirect() {
  return null;
}
