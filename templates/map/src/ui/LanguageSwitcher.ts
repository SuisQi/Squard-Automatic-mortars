/**
 * 语言切换器组件
 */

import * as React from "react";
import { connect } from 'react-redux';
import { Dropdown } from "../common/dropdown";
import { useTranslation } from "../i18n/hooks";
import { SUPPORTED_LANGUAGES } from "../i18n/constants";
import { Language } from "../i18n/types";
import { newUserSettingsWriteAction as writeUserSettings } from './actions';
import { StoreState } from "../store";

const h = React.createElement;
// @ts-ignore
const div = <P, C>(props: P, children?: C) => h("div", props as any, children);

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = (props) => {
  const { t, changeLanguage } = useTranslation();

  // 处理语言切换
  const handleLanguageChange = (newLanguage: Language) => {
    changeLanguage(newLanguage);
    props.onLanguageChange(newLanguage);
  };

  // 创建语言选项 - 使用简短的显示名称
  const languageOptions = SUPPORTED_LANGUAGES.map(lang => ({
    value: lang.code,
    elem: div({ className: "flexRow languageOption" }, [
      div({ className: "languageOptionLabel" }, 
        lang.code === 'zh' ? '中文' : 'EN'
      )
    ])
  }));

  return h(Dropdown, {
    className: "languageSwitcher",
    value: props.currentLanguage,
    onChange: handleLanguageChange,
    options: languageOptions
  });
};

// Redux 连接
const mapStateToProps = (state: StoreState) => ({
  currentLanguage: state.userSettings.language
});

const mapDispatchToProps = (dispatch: any) => ({
  onLanguageChange: (language: Language) => {
    dispatch(writeUserSettings("language", language));
  }
});

export const ConnectedLanguageSwitcher = connect(
  mapStateToProps,
  mapDispatchToProps
)(LanguageSwitcher);

export default ConnectedLanguageSwitcher;