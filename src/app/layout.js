// src/app/layout.js
import './globals.css';
import Script from 'next/script';
import { Anton, Inter, Cairo } from 'next/font/google';
import siteConfig from '@/config/site';

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

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  weight: ['400', '600', '700', '900'],
  display: 'swap',
});

export const viewport = {
  themeColor: '#0a0705',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  manifest: '/manifest.json',
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.fullName,
    images: [
      {
        url: '/images/pOriginal.webp',
        width: 1200,
        height: 630,
        alt: siteConfig.fullName,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ['/images/pOriginal.webp'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: siteConfig.name,
  },
};

const restaurantJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: siteConfig.fullName,
  alternateName: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  image: `${siteConfig.url}/images/pOriginal.webp`,
  telephone: siteConfig.contact.phone,
  servesCuisine: ['Italian', 'Pizza', 'Wood-Fired Pizza'],
  priceRange: '$$',
  currenciesAccepted: 'EGP',
  paymentAccepted: 'Cash, Credit Card, Vodafone Cash, InstaPay',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Cairo',
    addressRegion: 'Cairo',
    addressCountry: 'EG',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 30.0444,
    longitude: 31.2357,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '12:00',
      closes: '02:00',
    },
  ],
  hasMenu: `${siteConfig.url}#menu`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍕</text></svg>" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍕</text></svg>" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
        />
      </head>

      <body className={`${anton.variable} ${inter.variable} ${cairo.variable}`}>
        <a href="#builder" className="skip-link">Skip to Pizza Builder</a>
        {children}

        {/* تفعيل الـ Service Worker فقط في الـ Production لتجنب حظر السكربتات محلياً */}
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