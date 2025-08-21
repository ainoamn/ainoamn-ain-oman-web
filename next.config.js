/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // نجبر المشروع على Pages Router فقط
  experimental: { appDir: false },

  // i18n يعمل مع Pages Router، وأوقفنا auto-detect
  i18n: {
    locales: ["ar", "en", "fr", "hi", "fa", "ur"],
    defaultLocale: "ar",
    localeDetection: false,
  },

  images: {
    domains: ["images.unsplash.com", "picsum.photos"],
  },

  // مهم جدًا: لا تضع output: "export"
  // output: "export",  // ✗ احذف أو علّق هذا السطر إن كان موجودًا عندك
};

module.exports = nextConfig;
