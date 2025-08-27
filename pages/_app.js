import { SessionProvider } from "next-auth/react";
import Head from "next/head";
import Script from "next/script";
import '../styles/globals.css';
import '../styles/modern-template.css';
import { LanguageProvider } from '../contexts/LanguageContext';
import ErrorBoundary from '../components/ErrorBoundary';
import "@/styles/globals.css";
import "/public/metronic/assets/plugins/global/plugins.bundle.css";
import "/public/metronic/assets/css/style.bundle.css";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" />
      </Head>
      
      {/* Load SweetAlert2 */}
      <Script 
        src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js"
        strategy="beforeInteractive"
      />
      
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
