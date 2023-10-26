import React, { useContext } from "react";
import lang from "../i18n";

const I18nContext = React.createContext(lang);

export const I18nProvider = I18nContext.Provider;

export const useI18n = () => useContext(I18nContext);
