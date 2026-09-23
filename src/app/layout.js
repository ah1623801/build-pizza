// src/app/layout.js
import './globals.css';
import Script from 'next/script';
import { Anton, Inter } from 'next/font/google';

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--disp',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--body',
  display: 'swap',
});
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

        {/* تحميل المكتبات بضمان تنفيذي كامل قبل تشغيل الفرونت */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js" strategy="beforeInteractive" />
      </head>

   <body className={`${anton.variable} ${inter.variable}`}>
        {children}

      {/* تفعيل الـ Service Worker فقط في الـ Production لتجنب حظر السكربتات محليا */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </Script>

      </body>
    </html>
  );
}