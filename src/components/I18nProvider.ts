import React, { useContext } from "react";

const lang = "en";
const I18nContext = React.createContext(lang);

export const I18nProvider = I18nContext.Provider;

export const useI18n = () => useContext(I18nContext);
