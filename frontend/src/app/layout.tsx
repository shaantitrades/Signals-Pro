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
  title: 'Market Signals24 - Professional Trading Signals Platform',
  description: 'Triple-validated trading signals for Forex, Crypto, Indices & Commodities. AI-powered signal generation with human expert validation.',
  keywords: 'MarketSignals24, Market Signals 24, trading signals, forex signals, crypto signals, binary options signals, OTC signals, trading bot, AI trading signals, copy trading',
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
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function(){});
    });
  }
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
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
