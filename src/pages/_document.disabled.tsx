// src/pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="ar" dir="rtl" suppressHydrationWarning>
        <Head>
          {/* افتراض ألوان العلامة في حال لم تُعرّف */}
          <style>{`:root{--brand-600:#14b8a6;--brand-700:#115e59;--brand-800:#0f766e}`}</style>
          {/* أي خطوط/ميتا عامة لديك سيقرأها Next تلقائيًا هنا */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
