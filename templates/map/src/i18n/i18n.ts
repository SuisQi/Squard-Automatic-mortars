/**
 * 国际化核心类
 */

import { Language, LanguagePack, TranslationKeys } from './types';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from './constants';

export class I18n {
  private currentLanguage: Language = DEFAULT_LANGUAGE;
  private translations: Map<Language, LanguagePack> = new Map();
  private fallbackLanguage: Language = 'en';

  constructor() {
    this.loadLanguageFromStorage();
  }

  /**
   * 注册语言包
   */
  registerLanguage(language: Language, translations: LanguagePack): void {
    this.translations.set(language, translations);
  }

  /**
   * 设置当前语言
   */
  setLanguage(language: Language): void {
    if (this.translations.has(language)) {
      this.currentLanguage = language;
      this.saveLanguageToStorage();
    } else {
      console.warn(`Language '${language}' is not registered`);
    }
  }

  /**
   * 获取当前语言
   */
  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * 翻译函数 - 支持嵌套键名
   */
  translate(key: string): string {
    const currentPack = this.translations.get(this.currentLanguage);
    const fallbackPack = this.translations.get(this.fallbackLanguage);
    
    let result = this.getNestedValue(currentPack, key);
    
    // 如果当前语言没有找到翻译，使用回退语言
    if (!result && fallbackPack) {
      result = this.getNestedValue(fallbackPack, key);
    }
    
    // 如果仍然没有找到，返回键名本身
    return result || key;
  }

  /**
   * 获取嵌套对象的值
   */
  private getNestedValue(obj: any, path: string): string | undefined {
    if (!obj) return undefined;
    
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * 从本地存储加载语言设置
   */
  private loadLanguageFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (savedLanguage && this.isValidLanguage(savedLanguage)) {
        this.currentLanguage = savedLanguage;
      }
    }
  }

  /**
   * 保存语言设置到本地存储
   */
  private saveLanguageToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, this.currentLanguage);
    }
  }

  /**
   * 验证语言代码是否有效
   */
  private isValidLanguage(language: string): language is Language {
    return language === 'zh' || language === 'en';
  }

  /**
   * 获取所有已注册的语言
   */
  getAvailableLanguages(): Language[] {
    return Array.from(this.translations.keys());
  }
}

// 创建全局实例
export const i18n = new I18n();