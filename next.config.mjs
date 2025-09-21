// root: next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['next-auth/react'] = require('path').resolve(__dirname, 'src/lib/next-auth-react-shim.ts');
    return config;
  },
};
export default nextConfig;
