/**
 * 国际化系统常量
 */

import { Language, LanguageOption } from './types';

// 支持的语言选项
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文'
  },
  {
    code: 'en', 
    name: 'English',
    nativeName: 'English'
  }
];

// 默认语言
export const DEFAULT_LANGUAGE: Language = 'zh';

// 本地存储键名
export const LANGUAGE_STORAGE_KEY = 'squad-mortar-language';