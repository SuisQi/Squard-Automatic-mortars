/**
 * 国际化 React hooks
 */

import * as React from 'react';
import { Language } from './types';
import { i18n } from './i18n';

/**
 * 翻译hook
 */
export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = React.useState<Language>(i18n.getCurrentLanguage());

  // 翻译函数
  const t = React.useCallback((key: string): string => {
    return i18n.translate(key);
  }, [currentLanguage]);

  // 改变语言函数
  const changeLanguage = React.useCallback((language: Language) => {
    i18n.setLanguage(language);
    setCurrentLanguage(language);
  }, []);

  // 获取当前语言
  const getCurrentLanguage = React.useCallback((): Language => {
    return i18n.getCurrentLanguage();
  }, [currentLanguage]);

  // 获取可用语言列表
  const getAvailableLanguages = React.useCallback((): Language[] => {
    return i18n.getAvailableLanguages();
  }, []);

  return {
    t,
    currentLanguage,
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages
  };
};

/**
 * 语言选择器hook
 */
export const useLanguageSelector = () => {
  const { currentLanguage, changeLanguage, getAvailableLanguages } = useTranslation();

  return {
    currentLanguage,
    changeLanguage,
    availableLanguages: getAvailableLanguages()
  };
};