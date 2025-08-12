/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["ar", "en", "fr", "hi", "fa", "ur"],
    defaultLocale: "ar",
    localeDetection: true,
  },
  images: {
    domains: ["images.unsplash.com", "picsum.photos"],
  },
};

module.exports = nextConfig;
