import { SessionProvider } from "next-auth/react";
import '../styles/globals.css';          // (jika kamu sudah punya)
import '../styles/modern-template.css';   // ← inilah file CSS yang baru dibuat
import { LanguageProvider } from '../contexts/LanguageContext';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <LanguageProvider>
        <Component {...pageProps} />
      </LanguageProvider>
    </SessionProvider>
  );
}
