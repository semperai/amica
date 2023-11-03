import { useEffect, useState } from "react";
import { buildUrl } from "@/utils/buildUrl";
import { Html, Head, Main, NextScript } from "next/document";
import Script from 'next/script'

export default function Document() {
  const title = "Amica";
  const description = "Converse with AI powered 3D characters with voice synthesis and speech recognition.";
  const imageUrl = "https://amica.arbius.ai/ogp.png";

  return (
    <Html lang="en">
      <Head>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="apple-mobile-web-app-title" content={title} />
        <meta name="application-name" content={title} />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+2&family=Montserrat&display=swap"
          rel="stylesheet"
        />
        <Script
          src="/debugLogger.js"
          strategy="beforeInteractive"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
