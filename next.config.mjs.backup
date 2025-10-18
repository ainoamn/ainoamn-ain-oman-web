// root: next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // تحسينات الأداء
  swcMinify: true,
  compress: true,
  optimizeFonts: true,
  images: {
    domains: ['ui-avatars.com', 'images.unsplash.com', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Code splitting تلقائي
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['next-auth/react'] = require('path').resolve(__dirname, 'src/lib/next-auth-react-shim.ts');
    
    // تحسين bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
          recharts: {
            name: 'recharts',
            test: /[\\/]node_modules[\\/](recharts)[\\/]/,
            priority: 10,
          },
          react: {
            name: 'react',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 20,
          },
        },
      },
    };
    
    return config;
  },
};
export default nextConfig;
