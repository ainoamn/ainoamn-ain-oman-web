// next-seo.config.js - SEO Configuration
export default {
  titleTemplate: '%s | عين عُمان',
  defaultTitle: 'عين عُمان - منصة عقارية متقدمة',
  description: 'منصة عقارية متقدمة في سلطنة عمان - بيع وشراء وتأجير العقارات بسهولة وأمان',
  canonical: 'https://www.ainoman.om',
  openGraph: {
    type: 'website',
    locale: 'ar_OM',
    url: 'https://www.ainoman.om',
    site_name: 'عين عُمان',
    title: 'عين عُمان - منصة عقارية متقدمة',
    description: 'منصة عقارية متقدمة في سلطنة عمان',
    images: [
      {
        url: 'https://www.ainoman.om/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'عين عُمان',
      },
    ],
  },
  twitter: {
    handle: '@ainoman',
    site: '@ainoman',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content: 'عقارات عمان, بيع عقارات, تأجير عقارات, عقارات مسقط, فلل للبيع, شقق للإيجار',
    },
    {
      name: 'author',
      content: 'عين عُمان',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=5',
    },
    {
      name: 'theme-color',
      content: '#3b82f6',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
  ],
};

