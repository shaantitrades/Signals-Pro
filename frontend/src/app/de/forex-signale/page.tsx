import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Forex Signale in Echtzeit — KI-Powered Alerts | MarketSignals24',
  description:
    'Erhalten Sie KI-gestützte Forex-Signale für EUR/USD, GBP/USD, USD/JPY und über 30 Währungspaare. Präzise Einstieg, Stop-Loss und Take-Profit. Ab 6€.',
  keywords:
    'Forex Signale, Trading Signale Forex, Forex Alerts, Live Forex Signale, beste Forex Signale, EUR/USD Signale, KI Trading Forex, genaue Forex Signale',
  alternates: {
    canonical: 'https://marketsignals24.com/de/forex-signale',
    languages: {
      'en': 'https://marketsignals24.com/forex-signals',
      'fr-FR': 'https://marketsignals24.com/fr/signaux-forex',
      'es-ES': 'https://marketsignals24.com/es/senales-forex',
    },
  },
  openGraph: {
    title: 'Forex Signale KI — Echtzeit Alerts | MarketSignals24',
    description: 'KI-Forex-Signale für 30+ Währungspaare. Gewinnrate bis zu 87%. Starten ab 6€.',
    url: 'https://marketsignals24.com/de/forex-signale',
    siteName: 'MarketSignals24',
    type: 'website',
    locale: 'de_DE',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Was sind Forex-Handelssignale?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Forex-Handelssignale sind präzise, sofort umsetzbare Handelsempfehlungen in Echtzeit. Jedes Signal gibt das Währungspaar, die Richtung (KAUFEN oder VERKAUFEN), den Einstiegspreis, einen Stop-Loss zur Verlustbegrenzung und ein oder mehrere Take-Profit-Ziele an. Bei MarketSignals24 werden die Signale von einer KI generiert, die technische Indikatoren, Preisniveaus und Marktdynamiken gleichzeitig analyisert.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wie genau sind die Forex-Signale von MarketSignals24?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Unser KI-Modell hat in Backtests auf den wichtigsten Paaren seit 2023 Gewinnraten von bis zu 87% erreicht. Vergangene Wertentwicklungen sind kein verlässlicher Indikator für zukünftige Ergebnisse. Jeder Handel birgt das Risiko von Kapitalverlust.',
      },
    },
    {
      '@type': 'Question',
      name: 'Welche Währungspaare werden abgedeckt?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Wir decken alle 8 Hauptwährungspaare (EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, NZD/USD, USD/CAD, EUR/GBP) sowie über 25 Kreuzwährungspaare ab, darunter EUR/JPY, GBP/JPY, EUR/AUD und viele weitere.',
      },
    },
    {
      '@type': 'Question',
      name: 'Benötige ich Trading-Erfahrung für Ihre Signale?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nein. Jedes Signal gibt klar die Richtung (KAUFEN oder VERKAUFEN), den Einstiegspreis, den Stop-Loss und den Take-Profit an. Anfänger können die Signale direkt befolgen, während erfahrene Trader sie zur Bestätigung ihrer eigenen Analyse verwenden können.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wie empfange ich Forex-Signale in Echtzeit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Signale erscheinen sofort in Ihrem Dashboard, sobald die KI eine gültige Konfiguration erkennt. Ein Akustikalarm ertönt im Browser, damit Sie keine Gelegenheit verpassen. Die Plattform funktioniert auch als Progressive Web App (PWA), die auf Ihrem Smartphone installierbar ist.',
      },
    },
    {
      '@type': 'Question',
      name: 'Welches Abonnement benötige ich für Forex-Signale?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Forex-Signale sind in allen Abonnements enthalten, beginnend mit dem 24h-Pass für 6€. Der Wochenpass für 25€ und der Monatspass für 85€ bieten das beste Preis-Leistungs-Verhältnis für regelmäßige Trader.',
      },
    },
  ],
};

export default function ForexSignalePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="min-h-screen bg-gray-950 text-white">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-black py-20 px-4">
          <div className="absolute inset-0 bg-yellow-400/5 pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="inline-block bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-sm font-medium px-4 py-1 rounded-full mb-6">
              KI · Echtzeit · 30+ Paare
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="text-yellow-400">Forex Signale</span> in Echtzeit — KI-Gestützte Handelsalerts
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Erhalten Sie Kauf- und Verkaufsalerts für EUR/USD, GBP/USD, USD/JPY und über 30 Währungspaare, sobald unsere KI eine hochwahrscheinliche Handelskonfiguration erkennt — mit Einstieg, Stop-Loss und Take-Profit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
                Kostenlos Starten
              </Link>
              <Link href="/tarifs" className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-lg">
                Tarife ab 6€
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 px-4 border-y border-white/10 bg-gray-900/50">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '87%', label: 'Gewinnrate (Backtest)' },
              { value: '30+', label: 'Währungspaare' },
              { value: '24/7', label: 'Marktüberwachung' },
              { value: '<1s', label: 'Signallieferung' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-yellow-400">{s.value}</p>
                <p className="text-gray-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <article className="max-w-4xl mx-auto px-4 py-16 space-y-12">

          <section>
            <h2 className="text-2xl font-bold mb-4">Was Sind Forex-Handelssignale?</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Forex-Handelssignale sind präzise, sofort umsetzbare Handelsempfehlungen. Jedes Signal gibt an: welches Währungspaar gehandelt wird, die Richtung (KAUFEN oder VERKAUFEN), den optimalen Einstiegspreis, wo Sie Ihren Stop-Loss setzen, und wo Sie Gewinn mitgenommen werden kann. Statt stundenlanger Chartanalyse erhalten Sie eine fertige Handelsmöglichkeit, sobald sich diese bildet.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Bei MarketSignals24 werden Signale nicht von menschlichen Analysten erstellt, die müde, emotional oder langsam sein können. Sie werden von einer proprietären KI-Engine generiert, die rund um die Uhr läuft und jeden Tick der Preisdaten über alle wichtigen und kleineren Währungspaare gleichzeitig analysiert.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Die Engine kombiniert Dutzende technische Indikatoren — RSI, MACD, Bollinger Bänder, EMA-Kreuzungen, Support-/Resistenzniveaus — mit Mustererkennungsalgorithmen, die auf Millionen historischer Trades trainiert wurden.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Forex Signale Nutzen — Schritt für Schritt</h2>
            <ol className="space-y-4">
              {[
                { step: '1', title: 'Konto erstellen', text: 'Registrieren Sie sich bei MarketSignals24 in unter 60 Sekunden — keine Kreditkarte erforderlich.' },
                { step: '2', title: 'Abonnement wählen', text: 'Beginnen Sie mit dem 24h-Pass (6€) zum Testen oder wählen Sie den Monatspass (85€) für das beste Preis-Leistungs-Verhältnis.' },
                { step: '3', title: 'Dashboard öffnen', text: 'Navigieren Sie zum Signale-Tab, um alle aktiven und aktuellen Forex-Signale mit Einstieg, SL, TP und Konfidenz-Score zu sehen.' },
                { step: '4', title: 'Soundalerts aktivieren', text: 'Klicken Sie auf "Soundalerts aktivieren", um Browser-Audio freizuschalten. Sie hören dann sofort einen Ton, wenn ein neues Signal erscheint.' },
                { step: '5', title: 'Trade ausführen', text: 'Öffnen Sie das entsprechende Paar bei Ihrem Broker, steigen Sie zum Signalpreis ein und setzen Sie Stop-Loss und Take-Profit genau wie angegeben.' },
              ].map((item) => (
                <li key={item.step} className="flex gap-4 bg-gray-900 border border-white/10 rounded-xl p-5">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-sm">{item.step}</span>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Risikohinweis</h2>
            <p className="text-amber-400 text-sm p-4 bg-amber-400/10 border border-amber-400/20 rounded-xl">
              ⚠️ CFDs sind komplexe Instrumente und beinhalten angesichts der Hebelwirkung ein hohes Risiko, schnell Geld zu verlieren. Zwischen 74 % und 89 % der Privatanlegerkonten verlieren beim CFD-Handel Geld. Sie sollten überlegen, ob Sie verstehen, wie CFDs funktionieren, und ob Sie sich das hohe Risiko, Ihr Geld zu verlieren, leisten können.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Häufig Gestellte Fragen</h2>
            <div className="space-y-4">
              {faqSchema.mainEntity.map((item) => (
                <div key={item.name} className="bg-gray-900 border border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold mb-2 text-yellow-400">{item.name}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Weitere Signal-Typen</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/forex-signals" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Forex Signals (EN) →</h3>
                <p className="text-gray-400 text-sm mt-1">30+ Paare, Live-Märkte</p>
              </Link>
              <Link href="/crypto-signals" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Krypto Signale →</h3>
                <p className="text-gray-400 text-sm mt-1">BTC, ETH und 20+ Altcoins</p>
              </Link>
              <Link href="/de/binaere-optionen-signale" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Binäre Optionen →</h3>
                <p className="text-gray-400 text-sm mt-1">OTC Signale 1–5 Min</p>
              </Link>
            </div>
          </section>

          <section className="text-center bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/20 rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-3">Bereit mit Vorteil zu Handeln?</h2>
            <p className="text-gray-300 mb-6">Tausende Trader erhalten täglich Live KI-Forex-Signale.</p>
            <Link href="/register" className="inline-block bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
              Kostenloses Konto Erstellen
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
