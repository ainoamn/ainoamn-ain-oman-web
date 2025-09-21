// root: next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["ar", "en", "fr", "hi", "fa", "ur"],
    defaultLocale: "ar",
    localeDetection: false,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    // شِم بديل لـ next-auth/react
    config.resolve.alias["next-auth/react"] = require("path").resolve(
      __dirname,
      "src/lib/next-auth-react-shim.tsx"
    );
    // شِم احتياطي لأي استيراد لـ next-auth أو مزوّد credentials
    config.resolve.alias["next-auth"] = require("path").resolve(
      __dirname,
      "src/lib/next-auth-server-shim.ts"
    );
    config.resolve.alias["next-auth/providers/credentials"] = require("path").resolve(
      __dirname,
      "src/lib/next-auth-providers-credentials-shim.ts"
    );
    return config;
  },
};
module.exports = nextConfig;
