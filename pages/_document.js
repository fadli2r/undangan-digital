import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Meta tags */}
        <meta charSet="utf-8" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Metronic CSS */}
        <link href="/metronic/assets/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css" />
        <link href="/metronic/assets/css/style.bundle.css" rel="stylesheet" type="text/css" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <body id="kt_body" className="auth-bg">
        <Main />
        <NextScript />
        
        {/* Metronic JS */}
        <script src="/metronic/assets/plugins/global/plugins.bundle.js"></script>
        <script src="/metronic/assets/js/scripts.bundle.js"></script>
      </body>
    </Html>
  )
}
