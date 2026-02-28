import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Signaux Forex en Temps Réel — IA Professionnelle | MarketSignals24',
  description:
    'Recevez des signaux forex alimentés par l\'IA pour EUR/USD, GBP/USD, USD/JPY et 30+ paires. Entrée, stop-loss et take-profit précis. À partir de 6 €.',
  keywords:
    'MarketSignals24, signaux forex, signaux trading forex, alertes forex, signaux forex en direct, meilleurs signaux forex, signaux EUR/USD, IA trading forex, signaux forex fiables',
  alternates: {
    canonical: 'https://marketsignals24.com/fr/signaux-forex',
    languages: {
      'en': 'https://marketsignals24.com/forex-signals',
      'es-ES': 'https://marketsignals24.com/es/senales-forex',
      'de-DE': 'https://marketsignals24.com/de/forex-signale',
    },
  },
  openGraph: {
    title: 'Signaux Forex IA — Alertes en Temps Réel | MarketSignals24',
    description: 'Signaux forex IA pour 30+ paires devises. Taux de réussite jusqu\'à 87%. Démarrez dès 6€.',
    url: 'https://marketsignals24.com/fr/signaux-forex',
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
      name: 'Qu\'est-ce qu\'un signal forex ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un signal forex est une recommandation de trading en temps réel qui vous indique quand acheter ou vendre une paire de devises, à quel prix entrer en position, où placer votre stop-loss pour limiter les pertes, et où prendre vos bénéfices. Chez MarketSignals24, les signaux sont générés par une IA qui analyse simultanément les indicateurs techniques, les niveaux de prix et la dynamique du marché.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quelle est la précision des signaux forex de MarketSignals24 ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Notre modèle d\'IA a atteint des taux de réussite allant jusqu\'à 87% lors de backtests sur les principales paires depuis 2023. Les performances passées ne garantissent pas les résultats futurs. Tout trading comporte des risques de perte en capital.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quelles paires de devises couvrez-vous ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nous couvrons toutes les paires majeures (EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, NZD/USD, USD/CAD, EUR/GBP) ainsi que plus de 25 paires croisées incluant EUR/JPY, GBP/JPY, EUR/AUD, et plus encore.',
      },
    },
    {
      '@type': 'Question',
      name: 'Est-il nécessaire d\'avoir de l\'expérience en trading pour utiliser vos signaux ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Non. Chaque signal vous indique clairement la direction (ACHAT ou VENTE), le prix d\'entrée, le stop-loss et le take-profit. Les débutants peuvent suivre les signaux directement, tandis que les traders expérimentés peuvent les utiliser pour confirmer leur propre analyse.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quel abonnement est nécessaire pour recevoir les signaux forex ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les signaux forex sont inclus dans tous les abonnements à partir du Pass 24h à 6€. Le Pass Hebdomadaire à 25€ et le Pass Mensuel à 85€ offrent le meilleur rapport qualité-prix pour les traders réguliers.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment recevoir les signaux forex en temps réel ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les signaux apparaissent instantanément dans votre tableau de bord dès que l\'IA détecte une configuration valide. Une alerte sonore se déclenche dans le navigateur pour ne manquer aucune opportunité. La plateforme fonctionne également comme une PWA (Progressive Web App) installable sur votre téléphone.',
      },
    },
  ],
};

export default function SignauxForexPage() {
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
              IA · Temps Réel · 30+ Paires
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="text-yellow-400">Signaux Forex</span> en Temps Réel Propulsés par l&apos;IA
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Recevez des alertes d&apos;achat et de vente pour EUR/USD, GBP/USD, USD/JPY et plus de 30 paires de devises dès que notre IA détecte une configuration à haute probabilité — avec entrée, stop-loss et take-profit inclus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
                Commencer Gratuitement
              </Link>
              <Link href="/tarifs" className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-lg">
                Voir les Tarifs dès 6€
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 px-4 border-y border-white/10 bg-gray-900/50">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '87%', label: 'Taux de réussite (backtest)' },
              { value: '30+', label: 'Paires de devises' },
              { value: '24/7', label: 'Surveillance des marchés' },
              { value: '<1s', label: 'Livraison du signal' },
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
            <h2 className="text-2xl font-bold mb-4">Qu&apos;est-ce qu&apos;un Signal Forex ?</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Un signal forex est une recommandation de trading précise et immédiatement exploitable. Chaque signal spécifie la paire de devises concernée, la direction (ACHAT ou VENTE), le prix d&apos;entrée optimal, le niveau de stop-loss pour limiter les pertes, et un ou plusieurs objectifs de prise de bénéfices. Vous n&apos;avez plus besoin de passer des heures à analyser les graphiques : la configuration est identifiée par l&apos;IA dès qu&apos;elle se forme.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Chez MarketSignals24, les signaux ne sont pas produits par des analystes humains susceptibles d&apos;être fatigués, émotifs, ou lents. Ils sont générés par un moteur d&apos;IA propriétaire qui fonctionne 24h/24, 7j/7, analysant chaque tick de données de prix sur toutes les paires de devises principales et secondaires simultanément.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Le moteur combine des dizaines d&apos;indicateurs techniques — RSI, MACD, bandes de Bollinger, croisements de moyennes mobiles, niveaux de support/résistance — avec des algorithmes de reconnaissance de modèles entraînés sur des millions de trades historiques.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Comment Notre IA Génère les Signaux Forex</h2>
            <div className="space-y-4">
              {[
                {
                  title: '1. Analyse Technique Multi-Période',
                  text: 'Le moteur calcule plus de 40 indicateurs sur plusieurs périodes simultanément (M5, M15, H1, H4, D1). Les signaux ne sont émis que lorsque les indicateurs s\'alignent sur au moins deux périodes, réduisant considérablement les faux positifs.',
                },
                {
                  title: '2. Reconnaissance de Modèles',
                  text: 'Un modèle convolutif entraîné sur des données historiques identifie les configurations à haute probabilité : doubles sommets/creux, épaule-tête-épaule, englobantes haussières/baissières, pin bars, et structures de cassure.',
                },
                {
                  title: '3. Filtrage de la Volatilité',
                  text: 'Avant d\'émettre un signal, le moteur vérifie l\'ATR (Average True Range) pour s\'assurer que le marché présente suffisamment de volatilité pour atteindre l\'objectif. Les conditions de "marché mort" à faible volatilité sont filtrées.',
                },
                {
                  title: '4. Calcul Risque/Rendement',
                  text: 'Chaque signal n\'est publié que si le ratio risque/rendement est d\'au moins 1:1,5. La plupart des signaux ciblent un ratio de 1:2 ou 1:2,5.',
                },
              ].map((item) => (
                <div key={item.title} className="bg-gray-900 border border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-yellow-400 mb-2">{item.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Comment Utiliser les Signaux Forex — Étape par Étape</h2>
            <ol className="space-y-4">
              {[
                { step: '1', title: 'Créez votre compte', text: 'Inscrivez-vous sur MarketSignals24 en moins de 60 secondes — aucune carte bancaire requise à l\'inscription.' },
                { step: '2', title: 'Choisissez un abonnement', text: 'Commencez avec le Pass 24h (6€) pour tester le service, ou optez pour le Pass Mensuel (85€) pour le meilleur rapport qualité-prix.' },
                { step: '3', title: 'Ouvrez votre tableau de bord', text: 'Rendez-vous dans l\'onglet Signaux pour voir tous les signaux forex actifs et récents. Chaque carte affiche la paire, la direction, l\'entrée, le SL, le TP et le score de confiance.' },
                { step: '4', title: 'Activez les alertes sonores', text: 'Cliquez sur "Activer les alertes sonores" pour débloquer l\'audio du navigateur. Vous entendrez un signal sonore dès qu\'un nouveau signal apparaît.' },
                { step: '5', title: 'Exécutez le trade', text: 'Ouvrez la paire concernée sur votre courtier, entrez au prix indiqué et définissez le stop-loss et le take-profit exactement comme indiqué dans le signal.' },
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
            <h2 className="text-2xl font-bold mb-4">Avertissement sur les Risques</h2>
            <p className="text-amber-400 text-sm p-4 bg-amber-400/10 border border-amber-400/20 rounded-xl">
              ⚠️ Les CFD sont des instruments complexes et présentent un risque élevé de perte rapide en capital en raison de l&apos;effet de levier. Entre 74 et 89% des comptes d&apos;investisseurs particuliers perdent de l&apos;argent lors de la négociation de CFD. Vous devez vous assurer que vous comprenez le fonctionnement des CFD et que vous pouvez vous permettre de prendre le risque élevé de perdre votre argent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Questions Fréquemment Posées</h2>
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
              <Link href="/fr/signaux-options-binaires" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Options Binaires →</h3>
                <p className="text-gray-400 text-sm mt-1">Signaux OTC 1–5 min, 24h/24</p>
              </Link>
              <Link href="/fr/signaux-crypto" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Signaux Crypto →</h3>
                <p className="text-gray-400 text-sm mt-1">BTC, ETH et 20+ altcoins</p>
              </Link>
              <Link href="/fr/signaux-ia" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Technologie IA →</h3>
                <p className="text-gray-400 text-sm mt-1">Comment notre IA génère les signaux</p>
              </Link>
            </div>
          </section>

          <section className="text-center bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/20 rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-3">Prêt à Trader avec un Avantage ?</h2>
            <p className="text-gray-300 mb-6">Rejoignez des milliers de traders qui reçoivent chaque jour des signaux forex IA en direct.</p>
            <Link href="/register" className="inline-block bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
              Créer un Compte Gratuit
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
