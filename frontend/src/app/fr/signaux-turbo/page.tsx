import type { Metadata } from 'next';
import Link from 'next/link';
import { seoClusterLanguageMap } from '@/lib/seo-clusters';

export const metadata: Metadata = {
  title: 'Signaux Trading Turbo & OTC — Alertes 1–5 Min | MarketSignals24',
  description:
    'Signaux de trading turbo et OTC générés par l\'IA pour des échéances de 1, 2 et 5 minutes. Alertes HAUT/BAS haute précision disponibles 24h/24, 7j/7.',
  keywords:
    'MarketSignals24, signaux trading turbo, signaux turbo gratuits, signaux OTC, signaux OTC gratuits, signaux trading court terme, signaux IA, alertes HAUT/BAS, signaux trading OTC, signaux forex OTC, signal turbo 1 minute, signaux actifs synthétiques',
  alternates: {
    canonical: 'https://marketsignals24.com/fr/signaux-turbo',
    languages: seoClusterLanguageMap('turbo'),
  },
  openGraph: {
    title: 'Signaux Trading Turbo & OTC | MarketSignals24',
    description: 'Alertes HAUT/BAS par IA pour échéances 1–5 min. Disponible 24h/24, week-end inclus. À partir de 6 €.',
    url: 'https://marketsignals24.com/fr/signaux-turbo',
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
      name: 'Que sont les signaux de trading turbo ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les signaux de trading turbo vous indiquent quand ouvrir un trade court terme (haut ou bas) sur un actif précis, avec une échéance exacte — généralement 1, 2 ou 5 minutes. Chaque signal précise l\'actif, la direction et la durée d\'expiration. MarketSignals24 les publie pour les paires OTC qui s\'échangent 24h/24, week-ends compris.',
      },
    },
    {
      '@type': 'Question',
      name: 'Qu\'est-ce qu\'un signal OTC ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les signaux OTC (Over-The-Counter) concernent des instruments synthétiques ou internes au courtier qui simulent les mouvements de prix du forex mais s\'échangent en continu, week-ends compris. Notre IA génère des signaux spécifiquement calibrés pour les patterns de volatilité OTC, qui diffèrent des conditions de marché en direct.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quelles échéances utilisez-vous pour vos signaux ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nos signaux ciblent principalement des échéances de 1 minute, 2 minutes et 5 minutes — les timeframes les plus populaires chez les traders court terme et OTC. Chaque signal précise la durée d\'expiration exacte et la direction à trader.',
      },
    },
    {
      '@type': 'Question',
      name: 'Puis-je utiliser ces signaux avec ma plateforme de courtage ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui. Nos signaux OTC fonctionnent avec tout courtier proposant des instruments OTC. Il vous suffit d\'ouvrir la paire OTC correspondante sur votre plateforme et d\'entrer dans la direction indiquée par le signal.',
      },
    },
    {
      '@type': 'Question',
      name: 'Combien de signaux OTC puis-je attendre par jour ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Le nombre de signaux varie selon les conditions de marché. En moyenne, notre moteur génère entre 15 et 40 signaux OTC par jour. Les signaux ne sont émis que lorsque le score de confiance de l\'IA dépasse le seuil minimum — nous privilégions la qualité à la quantité.',
      },
    },
  ],
};

export default function SignauxTurboPage() {
  const pairs = [
    'EUR/USD OTC', 'GBP/USD OTC', 'USD/JPY OTC', 'AUD/USD OTC',
    'EUR/JPY OTC', 'GBP/JPY OTC', 'USD/CHF OTC', 'NZD/USD OTC',
    'EUR/GBP OTC', 'USD/CAD OTC', 'AUD/JPY OTC', 'EUR/AUD OTC',
  ];

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
              OTC · 1–5 Min · 24h/24 · Compatible toutes plateformes
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="text-yellow-400">Signaux Trading Turbo &amp; OTC</span> — Alertes HAUT/BAS par IA
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Obtenez des signaux de trading ultra-courts pour les paires OTC et les actifs synthétiques. Notre IA envoie des alertes HAUT ou BAS pour des échéances d&apos;1, 2 et 5 minutes — disponibles 24h/24, même le week-end.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
                Démarrer Gratuitement
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
              { value: '82%', label: 'Taux de réussite moyen OTC' },
              { value: '12+', label: 'Paires OTC couvertes' },
              { value: '24/7', label: 'Week-ends inclus' },
              { value: '1–5m', label: 'Durées d\'expiration' },
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
            <h2 className="text-2xl font-bold mb-4">Comment Fonctionnent les Signaux OTC ?</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Le trading turbo est une forme simplifiée de trading court terme : vous anticipez si le prix d&apos;un actif sera plus haut ou plus bas à une échéance très courte — 1, 2 ou 5 minutes. Chaque signal publié indique l&apos;actif, la direction (HAUT ou BAS), l&apos;échéance exacte et le score de confiance de l&apos;IA.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Les instruments OTC (Over-The-Counter) sont des actifs synthétiques qui reflètent les paires forex réelles mais fonctionnent indépendamment des horaires de marché en direct. Cela signifie que vous pouvez trader EUR/USD OTC un samedi soir quand le marché forex réel est fermé.
            </p>
            <p className="text-gray-300 leading-relaxed">
              L&apos;IA de MarketSignals24 a été spécifiquement entraînée sur des données de prix OTC pour reconnaître ces patterns et générer des signaux à haute précision pour des échéances de 1, 2 et 5 minutes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Paires OTC Disponibles</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {pairs.map((pair) => (
                <div key={pair} className="bg-gray-900 border border-white/10 rounded-lg px-4 py-2 text-center font-mono text-yellow-400 text-sm">
                  {pair}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Utiliser les Signaux OTC — Mode d&apos;Emploi</h2>
            <ol className="space-y-4">
              {[
                { step: '1', title: 'Connectez-vous à votre tableau de bord', text: 'Rendez-vous dans la section Signaux OTC. C\'est l\'onglet dédié aux signaux OTC, séparé des signaux forex/crypto standards.' },
                { step: '2', title: 'Activez les alertes sonores', text: 'Cliquez sur "Activer le Son" avant qu\'un signal n\'arrive. Votre navigateur exige une action de l\'utilisateur avant d\'autoriser l\'audio — ce clic active le signal sonore.' },
                { step: '3', title: 'Attendez un signal', text: 'Quand l\'IA émet un signal, vous verrez : le nom de l\'actif, la direction (HAUT/BAS), la durée d\'expiration et le score de confiance. Une sonnerie se déclenche simultanément.' },
                { step: '4', title: 'Ouvrez votre plateforme de courtage', text: 'Rendez-vous sur votre plateforme de trading et sélectionnez la même paire OTC. Réglez la durée d\'expiration pour qu\'elle corresponde au signal.' },
                { step: '5', title: 'Placez le trade', text: 'Sélectionnez HAUT ou BAS selon la direction indiquée par le signal. Saisissez votre mise. Ne misez jamais plus de 2–3% de votre solde de compte sur un seul trade.' },
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
            <h2 className="text-2xl font-bold mb-4">Avertissement Réglementaire</h2>
            <div className="bg-red-900/20 border border-red-400/30 rounded-xl p-5 text-sm text-gray-300 space-y-2">
              <p>Le trading court terme comporte un risque substantiel de perte et ne convient pas à tous les investisseurs. La majorité des traders particuliers perdent de l&apos;argent.</p>
              <p>MarketSignals24 fournit des signaux à titre informatif et éducatif uniquement. Nous ne fournissons pas de conseils en investissement.</p>
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
                <p className="text-gray-400 text-sm mt-1">30+ paires de devises, marchés en direct</p>
              </Link>
              <Link href="/fr/signaux-crypto" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Signaux Crypto →</h3>
                <p className="text-gray-400 text-sm mt-1">BTC, ETH et 20+ altcoins</p>
              </Link>
              <Link href="/fr/signaux-ia" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Technologie IA →</h3>
                <p className="text-gray-400 text-sm mt-1">Comment notre moteur génère les signaux</p>
              </Link>
            </div>
          </section>

          <section className="text-center bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/20 rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-3">Prêt à Trader les OTC avec Confiance ?</h2>
            <p className="text-gray-300 mb-6">Signaux HAUT/BAS par IA. Disponibles 24h/24. À partir de 6 €.</p>
            <Link href="/register" className="inline-block bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
              Créer un Compte Gratuit
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
