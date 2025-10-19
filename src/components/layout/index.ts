// src/components/layout/index.ts - Ultra Layout Components Export
export { default as Header } from './Header';
export { default as Footer } from './Footer';
export { default as Layout } from './Layout';
export { default as AnnouncementBar } from './AnnouncementBar';

// Re-export types and hooks
export type { 
  MenuItem,
  HeaderConfig,
  SessionUser,
  FooterSection,
  FooterSettings,
  Theme,
  Currency,
  SearchSuggestion,
  NotificationItem,
  SocialLink,
  PaymentMethod,
  ContactInfo,
  QuickActionItem,
  AnnouncementConfig,
  AnnouncementType,
  AnimationType,
  LayoutConfig
} from './types';

export { useLayout } from './Layout';

// Re-export utilities
export { 
  generateMenuItems,
  generateFooterSections,
  generateSocialLinks,
  generatePaymentMethods,
  generateContactInfo,
  generateQuickActions,
  generateAnnouncementConfig,
  generateLayoutConfig
} from './utils';
