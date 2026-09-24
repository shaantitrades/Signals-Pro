import type { Metadata } from 'next';
import Link from 'next/link';
import { seoClusterLanguageMap } from '@/lib/seo-clusters';

export const metadata: Metadata = {
  title: 'Signaux Crypto — Bitcoin, Ethereum & Altcoins | MarketSignals24',
  description:
    'Signaux de trading crypto alimentés par l\'IA pour Bitcoin, Ethereum, BNB et 20+ altcoins. Alertes d\'achat et de vente en temps réel avec entrée, SL et TP. À partir de 6€.',
  keywords:
    'MarketSignals24, signaux crypto, signaux crypto gratuits, signaux bitcoin gratuits, signal crypto gratuit, alertes crypto gratuites, signaux ethereum gratuits, meilleurs signaux crypto gratuits, signaux bitcoin, signaux ethereum, alertes crypto, signaux trading cryptomonnaie, signaux BTC ETH, IA crypto trading, signaux altcoins, signaux crypto temps réel',
  alternates: {
    canonical: 'https://marketsignals24.com/fr/signaux-crypto',
    languages: seoClusterLanguageMap('crypto'),
  },
  openGraph: {
    title: 'Signaux Crypto IA — Bitcoin & Altcoins | MarketSignals24',
    description: 'Signaux crypto IA pour BTC, ETH et 20+ coins. Alertes en temps réel avec entrée, SL et TP.',
    url: 'https://marketsignals24.com/fr/signaux-crypto',
    siteName: 'MarketSignals24',
    type: 'website',
    locale: 'fr_FR',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Quels signaux crypto MarketSignals24 fournit-il ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nous fournissons des signaux d\'achat et de vente en temps réel pour Bitcoin (BTC), Ethereum (ETH), Binance Coin (BNB), Solana (SOL), Cardano (ADA), XRP et plus de 15 autres altcoins majeurs. Chaque signal comprend un prix d\'entrée, un stop-loss et un take-profit.',
      },
    },
    {
      '@type': 'Question',
      name: 'En quoi les signaux crypto diffèrent-ils des signaux forex ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les marchés crypto s\'échangent 24h/24, 7j/7, y compris les week-ends, ce qui signifie que les signaux peuvent se déclencher à tout moment. Les cryptomonnaies sont également plus volatiles que le forex, donc la gestion du risque est encore plus importante.',
      },
    },
    {
      '@type': 'Question',
      name: 'Puis-je utiliser les signaux crypto avec un petit compte ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui. La plupart des signaux peuvent être tradés avec aussi peu que 50 à 100 dollars par position sur les exchanges qui permettent le trading fractionné. Nous recommandons toujours d\'utiliser au maximum 1 à 2% de votre capital par trade.',
      },
    },
    {
      '@type': 'Question',
      name: 'Sur quels exchanges puis-je utiliser vos signaux crypto ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nos signaux sont independants de l\'exchange — ils indiquent l\'actif et le prix. Vous pouvez les exécuter sur n\'importe quel exchange majeur incluant Binance, Coinbase, Kraken, Bybit ou OKX.',
      },
    },
    {
      '@type': 'Question',
      name: 'Les signaux crypto sont-ils inclus dans tous les abonnements ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui. Les signaux crypto sont inclus dans tous les niveaux d\'abonnement à partir du Pass 24h à 6€. Le Pass Mensuel à 85€ vous donne un accès illimité à tous les types de signaux.',
      },
    },
  ],
};

export default function SignauxCryptoPage() {
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
              BTC · ETH · 20+ Altcoins · 24/7
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="text-yellow-400">Signaux Crypto</span> — Alertes IA pour Bitcoin &amp; Altcoins
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Notre IA analyse les données on-chain, les indicateurs techniques et la structure du marché pour délivrer des signaux d&apos;achat et de vente précis pour BTC, ETH et 20+ altcoins — 24h/24, 7j/7, week-ends inclus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
                Commencer Gratuitement
              </Link>
              <Link href="/tarifs" className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-lg">
                Tarifs dès 6€
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 px-4 border-y border-white/10 bg-gray-900/50">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '20+', label: 'Cryptomonnaies couvertes' },
              { value: '24/7', label: 'Surveillance continue' },
              { value: '85%', label: 'Taux de réussite (backtest)' },
              { value: '<2s', label: 'Livraison du signal' },
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
            <h2 className="text-2xl font-bold mb-4">Pourquoi Trader les Cryptos avec des Signaux IA ?</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Les marchés des cryptomonnaies bougent plus vite et de manière plus imprévisible que toute autre classe d&apos;actifs. Un seul tweet, une annonce réglementaire ou une transaction de « whale » peut déplacer Bitcoin de 5 à 10% en quelques minutes. Les traders humains ne peuvent tout simplement pas traiter ce volume d&apos;informations assez rapidement pour réagir de manière rentable.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              MarketSignals24 résout ce problème avec un modèle d&apos;IA qui ingère des données tick-by-tick, la profondeur du carnet d&apos;ordres, des scores de sentiment social et des métriques on-chain simultanément. Le moteur n&apos;a pas d&apos;émotions, pas de fatigue et pas de biais cognitifs — il évalue chaque trade potentiel objectivement, à toute heure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Coins Couverts</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT',
                'ADA/USDT', 'XRP/USDT', 'DOT/USDT', 'MATIC/USDT',
                'AVAX/USDT', 'LINK/USDT', 'LTC/USDT', 'DOGE/USDT',
                'ATOM/USDT', 'UNI/USDT', 'TRX/USDT', 'NEAR/USDT',
                'ETC/USDT', 'FIL/USDT', 'APT/USDT', 'ARB/USDT',
              ].map((coin) => (
                <div key={coin} className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-center font-mono text-yellow-400 text-sm">
                  {coin}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contenu de Chaque Signal Crypto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: '📈', title: 'Direction', text: 'ACHAT (long) ou VENTE (short) — sans ambiguïté.' },
                { icon: '🎯', title: 'Prix d\'Entrée', text: 'Le prix exact auquel ouvrir la position pour un ratio risque/rendement optimal.' },
                { icon: '🛡️', title: 'Stop-Loss', text: 'Où placer votre stop pour limiter les pertes si le trade va à l\'encontre de vous.' },
                { icon: '💰', title: 'Take-Profit', text: 'Un ou deux niveaux TP pour fermer partiellement et sécuriser les bénéfices.' },
                { icon: '⏱️', title: 'Durée du Signal', text: 'Durée de détention estimée de quelques minutes à plusieurs heures.' },
                { icon: '📊', title: 'Score de Confiance', text: 'Une note de 0 à 100 reflétant l\'alignement des indicateurs pour ce signal.' },
              ].map((item) => (
                <div key={item.title} className="bg-gray-900 border border-white/10 rounded-xl p-5 flex gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Questions Fréquentes</h2>
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
            <h2 className="text-2xl font-bold mb-4">Autres Types de Signaux</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/fr/signaux-forex" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Signaux Forex →</h3>
                <p className="text-gray-400 text-sm mt-1">30+ paires de devises</p>
              </Link>
              <Link href="/fr/signaux-turbo" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Trading Turbo →</h3>
                <p className="text-gray-400 text-sm mt-1">Signaux OTC 1–5 min</p>
              </Link>
              <Link href="/fr/signaux-ia" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Technologie IA →</h3>
                <p className="text-gray-400 text-sm mt-1">Comment notre IA fonctionne</p>
              </Link>
            </div>
          </section>

          <section className="text-center bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/20 rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-3">Tradez les Cryptos Plus Intelligemment</h2>
            <p className="text-gray-300 mb-6">Signaux IA. Alertes en temps réel. Entrées et sorties précises.</p>
            <Link href="/register" className="inline-block bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
              Démarrer — Gratuit
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
