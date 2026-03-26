import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/lib/auth-context';

const SITE_URL = 'https://luckmaker3000.com';
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-4ZQBLZ0Z3J';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Luck Maker 3000 — Smart Lottery Analytics & EV Calculator',
    template: '%s — Luck Maker 3000',
  },
  description: 'Free expected value calculator for Powerball, Mega Millions, and Texas Lottery. Know when the math is in your favor. Smart number generator, wheeling systems, and historical analytics.',
  keywords: 'lottery EV calculator, lottery expected value, powerball odds, mega millions odds, texas lottery analytics, lottery number generator, wheeling system, lottery results, smart lottery tool',
  authors: [{ name: 'Luck Maker 3000' }],
  openGraph: {
    title: 'Luck Maker 3000 — Smart Lottery Analytics',
    description: 'Free EV calculator shows you exactly when to play. Powerball, Mega Millions, and all Texas Lottery games.',
    url: SITE_URL,
    siteName: 'Luck Maker 3000',
    type: 'website',
    locale: 'en_US',
    images: [{
      url: `${SITE_URL}/opengraph-image`,
      width: 1200,
      height: 630,
      alt: 'Luck Maker 3000 — Smart Lottery Analytics',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luck Maker 3000 — Smart Lottery Analytics',
    description: 'Free EV calculator shows you exactly when to play.',
    images: [`${SITE_URL}/opengraph-image`],
  },
  icons: {
    icon: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
