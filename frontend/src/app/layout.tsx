import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',         // Show text immediately with fallback font
  preload: true,
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Market Signals24 — Live Trading Signals | Forex, Crypto & Binary Options',
  description: 'Get real-time AI-powered trading signals for Forex, Crypto, Indices & Binary Options. Free live trading signals validated by AI. Start trading smarter today.',
  keywords: 'trading signals, live trading signals, forex signals, crypto signals, binary options signals, free trading signals, AI trading signals, OTC signals, trading bot, signaux trading, meilleurs signaux trading, señales trading, live signals forex crypto',
  authors: [{ name: 'MarketSignals24', url: 'https://marketsignals24.com' }],
  creator: 'MarketSignals24',
  publisher: 'MarketSignals24',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: 'eb94bneSZzVTVa4QRfdu_IplBWIW-1n-P2ge5k604Pc',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: ['en_US', 'es_ES', 'de_DE', 'pt_BR', 'it_IT'],
    url: 'https://marketsignals24.com',
    siteName: 'MarketSignals24',
    title: 'Market Signals24 — Live Trading Signals | Forex, Crypto & Binary Options',
    description: 'Real-time AI trading signals for Forex, Crypto, Indices & Binary Options. Free live signals with 85%+ confidence. Join thousands of traders.',
    images: [
      {
        url: 'https://marketsignals24.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MarketSignals24 — Live Trading Signals Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Market Signals24 — Live Trading Signals',
    description: 'AI-powered live trading signals for Forex, Crypto & Binary Options. Free signals with high accuracy.',
    images: ['https://marketsignals24.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://marketsignals24.com',
    languages: {
      'fr': 'https://marketsignals24.com',
      'en': 'https://marketsignals24.com',
      'es': 'https://marketsignals24.com',
    },
  },
};

// JSON-LD structured data — helps Google understand and rank the site for "trading signals"
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://marketsignals24.com/#website',
      url: 'https://marketsignals24.com',
      name: 'MarketSignals24',
      description: 'Live AI-powered trading signals for Forex, Crypto, Indices & Binary Options',
      inLanguage: ['fr', 'en', 'es', 'de', 'pt', 'it'],
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://marketsignals24.com/register',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://marketsignals24.com/#organization',
      name: 'MarketSignals24',
      url: 'https://marketsignals24.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://marketsignals24.com/logo.svg',
      },
      sameAs: [],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'MarketSignals24 — Live Trading Signals',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web, iOS, Android',
      description: 'Real-time AI trading signals for Forex, Crypto, Indices and Binary Options. Get live signals with 85%+ confidence score.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        description: 'Free live trading signals available',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '1200',
      },
    },
  ],
};

// Inline script to set theme class BEFORE any CSS renders (prevents FOUC)
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
`;

// Register service worker for PWA
const swRegisterScript = `
(function(){
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(reg) {
      // Check for updates every 30 seconds and on visibility resume
      setInterval(function() { reg.update(); }, 30000);
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') { reg.update(); }
      });

      // New SW waiting → tell it to skip waiting, then reload
      reg.addEventListener('updatefound', function() {
        var newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', function() {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    }).catch(function(){});

    // When controller changes (new SW took over) → reload to get fresh assets
    var refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', function() {
      if (!refreshing) { refreshing = true; window.location.reload(); }
    });
  });
})();
`;

// Critical inline CSS — ensures basic styling even if Tailwind CSS file is delayed
const criticalCSS = `
  html { background: #ffffff; color: #1f2937; }
  html.dark { background: #0d1117; color: #e6edf3; }
  body { margin: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
  /* Skeleton loading essentials — visible before Tailwind loads */
  .min-h-screen { min-height: 100vh; }
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .bg-background { background: hsl(222 47% 6%); }
  html:not(.dark) .bg-background { background: hsl(0 0% 100%); }
  .bg-muted { background: hsl(217 33% 17%); }
  html:not(.dark) .bg-muted { background: hsl(220 14% 96%); }
  .border-border { border-color: hsl(217 33% 17%); }
  html:not(.dark) .border-border { border-color: hsl(220 13% 91%); }
  .border-b { border-bottom-width: 1px; border-bottom-style: solid; }
  .rounded-xl { border-radius: 0.75rem; }
  .rounded-lg { border-radius: 0.5rem; }
  .rounded-full { border-radius: 9999px; }
  .rounded { border-radius: 0.25rem; }
  .gap-3 { gap: 0.75rem; }
  .gap-4 { gap: 1rem; }
  .p-4 { padding: 1rem; }
  .w-full { width: 100%; }
  .shrink-0 { flex-shrink: 0; }
  .overflow-hidden { overflow: hidden; }
  @keyframes pulse { 50% { opacity: .5; } }
  .animate-pulse { animation: pulse 2s cubic-bezier(.4,0,.6,1) infinite; }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: swRegisterScript }} />
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google AdSense — doit être dans le <head> pour la validation */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5343389597650456"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
