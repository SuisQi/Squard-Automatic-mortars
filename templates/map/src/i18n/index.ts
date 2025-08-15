/**
 * 国际化系统入口文件
 */

export * from './types';
export * from './constants';
export * from './i18n';
export * from './hooks';

// 导入所有语言包
import './locales/zh';
import './locales/en';