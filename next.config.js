// root: next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // تعطيل TypeScript type checking أثناء البناء (مؤقتاً)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // تعطيل ESLint أثناء البناء (مؤقتاً)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // ✅ زيادة حد حجم الملفات لرفع الصور الكبيرة
  serverRuntimeConfig: {
    maxDuration: 300, // 5 minutes
  },
  
  // Compression for faster loading
  compress: true,
  
  // صور محسنة للسرعة القصوى
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // سنة واحدة
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Lazy loading تلقائي
    loader: 'default',
    // تحسين تلقائي للصور
    unoptimized: false,
  },
  
  // تحسين الإنتاج
  productionBrowserSourceMaps: false,
  
  // Prefetch تلقائي لجميع الروابط
  experimental: {
    // optimizeCss: true, // تعطيل مؤقتاً (يحتاج critters)
    // Do not optimize react-icons here — barrel names like FiSparkles/FaEyeOff break the prod build.
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },
  
  i18n: {
    locales: ["ar", "en", "fr", "hi", "fa", "ur"],
    defaultLocale: "ar",
    localeDetection: false,
  },
  
  // Headers للـ caching المتقدم
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://id.bhd-om.com https://maps.googleapis.com",
              "connect-src 'self' https://id.bhd-om.com https://*.bhd-om.com https://maps.googleapis.com wss:",
              "img-src 'self' data: blob: https: http:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "frame-src 'self' https://id.bhd-om.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
  
  webpack: (config, { dev, isServer }) => {
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
    
    // تحسينات Webpack للأداء
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // مكتبات خارجية كبيرة
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // React & React DOM
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'react',
              priority: 30,
            },
            // مكونات UI
            ui: {
              test: /[\\/]node_modules[\\/](@heroicons|lucide-react|react-icons)[\\/]/,
              name: 'ui',
              priority: 25,
            },
            // مكونات مشتركة
            common: {
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
