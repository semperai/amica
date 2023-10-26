import lang_JP from "./jp";
import lang_ZHCN from "./zh-cn";
import lang_EN from "./en";

export const langs = {
  cn: lang_ZHCN,
  jp: lang_JP,
  en: lang_EN,
};

export type TLangs = keyof typeof langs;

export const setLan = (l: TLangs) => {
  localStorage.setItem("chatvrm_language", l);
};

export default lang_EN;
