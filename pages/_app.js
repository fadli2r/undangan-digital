// pages/_app.js
import { SessionProvider } from "next-auth/react";
import Script from "next/script";
import "../styles/globals.css";
import { LanguageProvider } from "../contexts/LanguageContext";
import ErrorBoundary from "../components/ErrorBoundary";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
      {/* JS Metronic: aman via next/script */}
      <Script src="/metronic/assets/plugins/global/plugins.bundle.js" strategy="beforeInteractive" />
      <Script src="/metronic/assets/js/scripts.bundle.js" strategy="afterInteractive" />

      <ErrorBoundary>
        <SessionProvider session={session}>
          <LanguageProvider>
            <Component {...pageProps} />
          </LanguageProvider>
        </SessionProvider>
      </ErrorBoundary>
    </>
  );
}
