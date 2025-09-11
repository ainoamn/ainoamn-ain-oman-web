/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: { locales: ["ar","en","fr","hi","fa","ur"], defaultLocale: "ar", localeDetection: false },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  pageExtensions: ["prod.tsx", "prod.ts"] // يبني فقط صفحات .prod
};
module.exports = nextConfig;