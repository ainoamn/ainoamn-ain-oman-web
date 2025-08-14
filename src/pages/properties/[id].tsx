// src/pages/properties/[id].tsx
import type { GetServerSideProps } from "next";

/** إعادة توجيه للمسار الرسمي /property/:id لضمان توحيد التصميم */
export default function RedirectProperty() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = String(ctx.params?.id || "");
  return {
    redirect: {
      destination: `/property/${encodeURIComponent(id)}`,
      permanent: true,
    },
  };
};
