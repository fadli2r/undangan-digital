import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
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
        <style dangerouslySetInnerHTML={{
          __html: `
            body, html {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
            }
            
            /* Preserve icon fonts */
            [class*="ki-"], [class*="path"], .ki-duotone, .ki-solid, .ki-outline,
            [class*="fa-"], [class*="fas"], [class*="far"], [class*="fab"], [class*="fal"],
            [class*="icon-"], [class*="glyphicon"], [class*="material-icons"] {
              font-family: inherit !important;
            }
            
            /* Apply Inter to specific elements only */
            .btn:not([class*="ki-"]), .form-control, .form-select, 
            .card:not([class*="ki-"]), .table:not([class*="ki-"]), 
            .nav:not([class*="ki-"]), .navbar:not([class*="ki-"]), 
            .dropdown-menu:not([class*="ki-"]) {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
            }
            
            h1:not([class*="ki-"]), h2:not([class*="ki-"]), h3:not([class*="ki-"]), 
            h4:not([class*="ki-"]), h5:not([class*="ki-"]), h6:not([class*="ki-"]),
            .fs-1:not([class*="ki-"]), .fs-2:not([class*="ki-"]), .fs-3:not([class*="ki-"]), 
            .fs-4:not([class*="ki-"]), .fs-5:not([class*="ki-"]), .fs-6:not([class*="ki-"]), 
            .fs-2hx:not([class*="ki-"]), .fs-3x:not([class*="ki-"]) {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
            }
            
            .fw-bold:not([class*="ki-"]), .fw-bolder:not([class*="ki-"]), 
            .fw-semibold:not([class*="ki-"]) {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
            }
          `
        }} />
      </Head>
      <body id="kt_body" className="auth-bg" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif" }}>
        <Main />
        <NextScript />
        
        {/* Metronic JS */}
        <script src="/metronic/assets/plugins/global/plugins.bundle.js"></script>
        <script src="/metronic/assets/js/scripts.bundle.js"></script>
      </body>
    </Html>
  )
}
