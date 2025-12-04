import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from './translations';

export type Language = 'id' | 'en' | 'jp' | 'zh';

const LANGUAGE_KEY = '@app_language';

// Pluralization rules per language
type PluralForm = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

const pluralRules: Record<Language, (count: number) => PluralForm> = {
  // Indonesian: no plural distinction
  id: (count: number) => 'other',
  
  // English: one, other
  en: (count: number) => count === 1 ? 'one' : 'other',
  
  // Japanese: no plural distinction
  jp: (count: number) => 'other',
  
  // Chinese: no plural distinction
  zh: (count: number) => 'other',
};

class I18nService {
  private currentLanguage: Language = 'en';
  private listeners: Set<(lang: Language) => void> = new Set();

  async init() {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage === 'id' || savedLanguage === 'en' || savedLanguage === 'jp' || savedLanguage === 'zh') {
        this.currentLanguage = savedLanguage;
      }
    } catch (error) {
      console.error('Failed to load language preference:', error);
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  async setLanguage(lang: Language) {
    this.currentLanguage = lang;
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }

  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = translations[this.currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // Replace parameters
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  }

  /**
   * Pluralization support
   * @param key - Base translation key
   * @param count - Number to determine plural form
   * @param params - Additional parameters for translation
   * @returns Translated string with correct plural form
   * 
   * Usage:
   * plural('common.day', 1) => "1 day"
   * plural('common.day', 5) => "5 days"
   */
  plural(key: string, count: number, params?: Record<string, string | number>): string {
    const pluralForm = pluralRules[this.currentLanguage](count);
    const pluralKey = `${key}_${pluralForm}`;
    
    // Try plural form first
    const keys = pluralKey.split('.');
    let value: any = translations[this.currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Fallback to base key if plural form not found
        return this.t(key, { count, ...params });
      }
    }
    
    if (typeof value === 'string') {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        if (paramKey === 'count') return count.toString();
        return params?.[paramKey]?.toString() || match;
      });
    }
    
    // Final fallback
    return this.t(key, { count, ...params });
  }

  /**
   * Format number according to locale
   * @param value - Number to format
   * @param options - Formatting options
   * @returns Formatted number string
   */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    const localeMap: Record<Language, string> = {
      id: 'id-ID',
      en: 'en-US',
      jp: 'ja-JP',
      zh: 'zh-CN',
    };
    
    try {
      return new Intl.NumberFormat(localeMap[this.currentLanguage], options).format(value);
    } catch (error) {
      console.error('Number formatting error:', error);
      return value.toString();
    }
  }

  /**
   * Format date according to locale
   * @param date - Date to format
   * @param options - Formatting options
   * @returns Formatted date string
   */
  formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    const localeMap: Record<Language, string> = {
      id: 'id-ID',
      en: 'en-US',
      jp: 'ja-JP',
      zh: 'zh-CN',
    };
    
    try {
      const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      return new Intl.DateTimeFormat(localeMap[this.currentLanguage], options).format(dateObj);
    } catch (error) {
      console.error('Date formatting error:', error);
      return date.toString();
    }
  }

  /**
   * Format relative time (e.g., "2 hours ago", "in 3 days")
   * @param date - Date to compare
   * @param baseDate - Base date for comparison (default: now)
   * @returns Relative time string
   */
  formatRelativeTime(date: Date | string | number, baseDate: Date = new Date()): string {
    try {
      const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      const diffInSeconds = Math.floor((baseDate.getTime() - dateObj.getTime()) / 1000);
      
      const rtf = new Intl.RelativeTimeFormat(this.getLocale(), { numeric: 'auto' });
      
      // Determine the appropriate unit
      const intervals = [
        { unit: 'year' as Intl.RelativeTimeFormatUnit, seconds: 31536000 },
        { unit: 'month' as Intl.RelativeTimeFormatUnit, seconds: 2592000 },
        { unit: 'week' as Intl.RelativeTimeFormatUnit, seconds: 604800 },
        { unit: 'day' as Intl.RelativeTimeFormatUnit, seconds: 86400 },
        { unit: 'hour' as Intl.RelativeTimeFormatUnit, seconds: 3600 },
        { unit: 'minute' as Intl.RelativeTimeFormatUnit, seconds: 60 },
      ];
      
      for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (Math.abs(count) >= 1) {
          return rtf.format(-count, interval.unit);
        }
      }
      
      return rtf.format(-diffInSeconds, 'second');
    } catch (error) {
      console.error('Relative time formatting error:', error);
      return date.toString();
    }
  }

  /**
   * Get locale string for current language
   */
  private getLocale(): string {
    const localeMap: Record<Language, string> = {
      id: 'id-ID',
      en: 'en-US',
      jp: 'ja-JP',
      zh: 'zh-CN',
    };
    return localeMap[this.currentLanguage];
  }

  subscribe(callback: (lang: Language) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentLanguage));
  }
}

export const i18n = new I18nService();
