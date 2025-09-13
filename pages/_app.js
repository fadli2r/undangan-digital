// pages/_app.js
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";

// ---- Helpers ----
function ensureKTGlobals() {
  if (typeof window === "undefined") return;

  const ns = [
    "KTApp","KTMenu","KTDrawer","KTScroll","KTSticky","KTSwapper","KTToggle",
    "KTScrolltop","KTDialer","KTImageInput","KTPasswordMeter","KTThemeMode",
  ];
  window.KTComponents = window.KTComponents || {
    createInstances: () => {},
    init: () => {},
  };
  ns.forEach((k) => {
    window[k] = window[k] || { createInstances: () => {}, init: () => {} };
  });
}

function aliasInitToCreateInstances() {
  const keys = [
    "KTDrawer","KTMenu","KTScroll","KTSticky","KTSwapper",
    "KTToggle","KTScrolltop","KTDialer","KTImageInput","KTPasswordMeter",
  ];
  keys.forEach((k) => {
    const obj = window[k];
    if (obj && !obj.init && typeof obj.createInstances === "function") {
      obj.init = function () {
        try { obj.createInstances(); } catch {}
      };
    }
  });
}

function reinitializeMetronic() {
  if (typeof window === "undefined") return;
  try {
    window.KTMenu?.createInstances?.('[data-kt-menu="true"]');
    window.KTDrawer?.createInstances?.();
    window.KTScroll?.createInstances?.();
    window.KTSticky?.createInstances?.();
    window.KTSwapper?.createInstances?.();
    window.KTToggle?.createInstances?.();
    window.KTScrolltop?.createInstances?.();
    window.KTDialer?.createInstances?.();
    window.KTImageInput?.createInstances?.();
    window.KTPasswordMeter?.createInstances?.();

        window.KTThemeMode?.init?.(); // bind menu Light/Dark/System jika ada di halaman

  } catch (e) {
    console.warn('Metronic init error:', e);
  }
}

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const initializedRef = useRef(false);


  // ✅ Inisialisasi saat pertama kali render (fix untuk tombol tidak bisa diklik)
  useEffect(() => {
    ensureKTGlobals();
    aliasInitToCreateInstances(); // ini kamu buat tapi belum pernah dipanggil
    reinitializeMetronic();       // <<< Tambahkan ini agar semua komponen Metronic aktif di awal
  }, []);

  // ✅ Inisialisasi ulang saat routing (SPA)
  useEffect(() => {
    let t;
    const onComplete = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => reinitializeMetronic());
        });
      }, 60);
    };
    router.events.on("routeChangeComplete", onComplete);
    router.events.on("routeChangeError", onComplete);
    return () => {
      router.events.off("routeChangeComplete", onComplete);
      router.events.off("routeChangeError", onComplete);
      clearTimeout(t);
    };
  }, [router.events]);

  return (
    <ErrorBoundary>
      <SessionProvider session={session}>
        <LanguageProvider>
          <Component {...pageProps} />
        </LanguageProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
