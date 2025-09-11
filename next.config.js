// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["ar","en","fr","hi","fa","ur"],
    defaultLocale: "ar",
    localeDetection: false
  }
};
module.exports = nextConfig;
