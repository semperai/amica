import '@/i18n';

import "@/styles/globals.css";
import "@charcoal-ui/icons";
import type { AppProps } from "next/app";
import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      unlisten = await listen('confirm-close', () => {
        if (window.confirm('Are you sure you want to quit?')) {
          invoke('quit_app');
        }
      });
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  return (
    <Component {...pageProps} />
  );
}
