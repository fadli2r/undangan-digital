import { SessionProvider } from "next-auth/react";
import '../styles/globals.css';          // (jika kamu sudah punya)
import '../styles/modern-template.css';   // ← inilah file CSS yang baru dibuat

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
