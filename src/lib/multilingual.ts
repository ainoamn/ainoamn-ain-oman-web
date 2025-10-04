// src/lib/multilingual.ts - نظام اللغات المتعددة
export type SupportedLanguage = 'ar' | 'en' | 'ur' | 'hi' | 'bn';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  direction: 'rtl' | 'ltr';
  flag: string;
  enabled: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', flag: '🇴🇲', enabled: true },
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', flag: '🇺🇸', enabled: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: 'rtl', flag: '🇵🇰', enabled: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', flag: '🇮🇳', enabled: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', flag: '🇧🇩', enabled: true }
];

export class MultilingualSystem {
  private translations: Map<string, any> = new Map();
  private currentLanguage: SupportedLanguage = 'ar';

  async loadTranslations(language: SupportedLanguage): Promise<void> {
    // تحميل الترجمات من API أو ملفات
    const translations = await this.fetchTranslations(language);
    this.translations.set(language, translations);
  }

  translate(key: string, params?: any): string {
    const translation = this.getTranslation(key);
    return this.interpolate(translation, params);
  }

  setLanguage(language: SupportedLanguage): void {
    this.currentLanguage = language;
    document.documentElement.lang = language;
    document.documentElement.dir = this.getLanguageDirection(language);
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  getLanguageDirection(language: SupportedLanguage): 'rtl' | 'ltr' {
    return SUPPORTED_LANGUAGES.find(l => l.code === language)?.direction || 'rtl';
  }

  private getTranslation(key: string): string {
    const langTranslations = this.translations.get(this.currentLanguage);
    return this.getNestedValue(langTranslations, key) || key;
  }

  private async fetchTranslations(language: SupportedLanguage): Promise<any> {
    // محاكاة تحميل الترجمات
    return {
      'common.save': language === 'ar' ? 'حفظ' : 'Save',
      'common.cancel': language === 'ar' ? 'إلغاء' : 'Cancel',
      'common.search': language === 'ar' ? 'بحث' : 'Search',
      'properties.title': language === 'ar' ? 'العقارات' : 'Properties',
      'dashboard.title': language === 'ar' ? 'لوحة التحكم' : 'Dashboard'
    };
  }

  private interpolate(text: string, params?: any): string {
    if (!params) return text;
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => params[key] || match);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

export const multilingualSystem = new MultilingualSystem();



