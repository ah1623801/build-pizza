// src/app/layout.js
import './globals.css';
import Script from 'next/script';

export const viewport = {
  themeColor: '#0a0705',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // يملأ الشاشة حول النوتش
};

export const metadata = {
  title: 'FORNO — Your Pizza. Your Rules.',
  description: 'Interactive Pizza Builder',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FORNO',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍕</text></svg>" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍕</text></svg>" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/anton@5.1.0/index.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/400.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/600.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/800.css" />
      </head>
      <body>
        {children}

        {/* تفعيل الـ Service Worker لتثبيت التطبيق */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </Script>

        {/* تحميل المكتبات */}
        <Script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}