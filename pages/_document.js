import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
    dangerouslySetInnerHTML={{
      __html: `
        const defaultThemeMode = 'light';
        let themeMode;

        if (document.documentElement) {
          if (localStorage.getItem('kt-theme')) {
            themeMode = localStorage.getItem('kt-theme');
          } else if (document.documentElement.hasAttribute('data-kt-theme-mode')) {
            themeMode = document.documentElement.getAttribute('data-kt-theme-mode');
          } else {
            themeMode = defaultThemeMode;
          }

          if (themeMode === 'system') {
            themeMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }

          document.documentElement.classList.add(themeMode);
        }
      `,
    }}
  />
        {/* Meta tags */}
        <meta charSet="utf-8" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Fonts - Load first for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        
        {/* Metronic CSS */}
        <link href="/metronic/assets/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css" />
        <link href="/metronic/assets/css/style.bundle.css" rel="stylesheet" type="text/css" />
        
        {/* Font Override CSS - Load after Metronic to ensure priority */}
        <link href="/font-override.css" rel="stylesheet" type="text/css" />
        
        {/* Font Override Styles - Safe for icons */}
       
      </Head>
      <body id="kt_body" >
        
        <Main />
        <NextScript />
        
        {/* Metronic JS */}
        <script src="/metronic/assets/plugins/global/plugins.bundle.js"></script>
        <script src="/metronic/assets/js/scripts.bundle.js"></script>

        		<script src="/metronic/assets/js/widgets.bundle.js"></script>
		<script src="/metronic/assets/js/custom/widgets.js"></script>
		<script src="/metronic/assets/js/custom/apps/chat/chat.js"></script>
		<script src="/metronic/assets/js/custom/utilities/modals/users-search.js"></script>
      </body>
    </Html>
  )
}