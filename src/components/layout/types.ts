// src/components/layout/types.ts - Type Definitions for Ultra Layout Components
import React from 'react';

// Menu Item Types
export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
  description?: string;
  isNew?: boolean;
  isHot?: boolean;
  badge?: string;
  children?: MenuItem[];
  permissions?: string[];
  roles?: string[];
}

// Header Configuration
export interface HeaderConfig {
  showLogo: boolean;
  showSearch: boolean;
  showNotifications: boolean;
  showUserMenu: boolean;
  showThemeToggle: boolean;
  showLanguageSelector: boolean;
  showCurrencySelector: boolean;
  showMusicControls: boolean;
  showQuickActions: boolean;
  showLiveStats: boolean;
  style: 'default' | 'transparent' | 'fixed' | 'sticky';
  height: 'sm' | 'md' | 'lg';
  theme: 'light' | 'dark' | 'auto';
}

// Session User
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  permissions: string[];
  preferences: any;
  isOnline: boolean;
  lastSeen: Date;
  subscription: {
    plan: string;
    status: string;
    expiresAt: Date;
  };
}

// Footer Section
export interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
  icon?: React.ComponentType<any>;
}

export interface FooterLink {
  id: string;
  label: string;
  href: string;
  description?: string;
  isNew?: boolean;
  isHot?: boolean;
  badge?: string;
  icon?: React.ComponentType<any>;
}

// Footer Settings
export interface FooterSettings {
  showCompanyInfo: boolean;
  showSocialLinks: boolean;
  showPaymentMethods: boolean;
  showContactInfo: boolean;
  showNewsletter: boolean;
  showLiveStats: boolean;
  showQuickActions: boolean;
  showTrustIndicators: boolean;
  showCopyright: boolean;
  showLegalLinks: boolean;
  style: 'default' | 'minimal' | 'extended';
  theme: 'light' | 'dark' | 'auto';
}

// Theme
export type Theme = 'light' | 'dark' | 'auto';

// Currency
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

// Search Suggestion
export interface SearchSuggestion {
  id: string;
  label: string;
  href: string;
  type: 'property' | 'case' | 'auction' | 'user' | 'page';
  description?: string;
  icon?: React.ComponentType<any>;
  score: number;
}

// Notification Item
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'property' | 'legal' | 'auction' | 'user';
}

// Social Link
export interface SocialLink {
  id: string;
  name: string;
  href: string;
  icon: string;
  color: string;
  followers?: string;
  verified?: boolean;
}

// Payment Method
export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  isPopular?: boolean;
  isNew?: boolean;
  isSecure?: boolean;
  fees?: number;
  processingTime?: string;
}

// Contact Info
export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  workingHours: string;
  supportHours: string;
  website?: string;
  socialMedia?: SocialLink[];
}

// Quick Action Item
export interface QuickActionItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
  isNew?: boolean;
  isHot?: boolean;
  badge?: string;
  permissions?: string[];
  roles?: string[];
}

// Announcement Configuration
export interface AnnouncementConfig {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  isDismissible: boolean;
  action?: {
    label: string;
    href: string;
  };
  style: {
    backgroundColor: string;
    textColor: string;
    borderColor?: string;
  };
  animation: AnimationType;
  targetAudience: {
    roles?: string[];
    permissions?: string[];
    userGroups?: string[];
  };
}

export type AnnouncementType = 'info' | 'success' | 'warning' | 'error' | 'promotion' | 'maintenance';

export type AnimationType = 'none' | 'fade' | 'slide' | 'bounce' | 'pulse' | 'shake';

// Layout Configuration
export interface LayoutConfig {
  showHeader: boolean;
  showFooter: boolean;
  showSidebar: boolean;
  showBreadcrumbs: boolean;
  showBackButton: boolean;
  showSearchBar: boolean;
  showNotifications: boolean;
  showUserMenu: boolean;
  showThemeToggle: boolean;
  showMusicControls: boolean;
  showQuickActions: boolean;
  showLiveStats: boolean;
  showAnnouncementBar: boolean;
  headerStyle: 'default' | 'transparent' | 'fixed' | 'sticky';
  footerStyle: 'default' | 'minimal' | 'extended';
  sidebarStyle: 'default' | 'collapsible' | 'floating';
  theme: Theme;
  layout: 'default' | 'wide' | 'narrow' | 'fullscreen';
  animations: boolean;
  sounds: boolean;
  music: boolean;
  notifications: boolean;
  autoSave: boolean;
  realTimeUpdates: boolean;
  aiAssistance: boolean;
  accessibility: boolean;
  rtl: boolean;
  language: string;
  currency: string;
  timezone: string;
}
