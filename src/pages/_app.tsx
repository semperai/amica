import '@/i18n';

import "@/styles/globals.css";
import "@charcoal-ui/icons";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { attachVrmIndexedDBHelper } from "@/utils/vrmIndexedDBConsoleHelper";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    attachVrmIndexedDBHelper();
  }, []);
  return (
    <Component {...pageProps} />
  );
}
