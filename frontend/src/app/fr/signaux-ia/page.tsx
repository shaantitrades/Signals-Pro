import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Signaux Trading IA — Comment Notre Technologie Fonctionne | MarketSignals24',
  description:
    'Découvrez comment MarketSignals24 utilise l\'intelligence artificielle et le machine learning pour générer des signaux de trading en temps réel pour le forex, les cryptos et les options binaires.',
  keywords:
    'MarketSignals24, signaux trading IA, signaux trading automatisés, machine learning trading, intelligence artificielle trading, signaux algorithmiques, IA signaux forex',
  alternates: {
    canonical: 'https://marketsignals24.com/fr/signaux-ia',
    languages: {
      'en': 'https://marketsignals24.com/ai-trading-signals',
    },
  },
  openGraph: {
    title: 'Signaux Trading IA — Notre Technologie | MarketSignals24',
    description: 'Machine learning + analyse technique = signaux de trading en temps réel. Sans émotion. Sans fatigue. 24/7.',
    url: 'https://marketsignals24.com/fr/signaux-ia',
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
      name: 'Quelle technologie alimente les signaux MarketSignals24 ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Notre moteur de signaux utilise une combinaison d\'analyse technique classique (40+ indicateurs), de reconnaissance de patterns par machine learning (entraîné sur des millions de chandeliers historiques), et de filtrage de volatilité pour générer des idées de trade à haute probabilité. Le moteur est construit en Python avec FastAPI et fonctionne en continu sur infrastructure cloud.',
      },
    },
    {
      '@type': 'Question',
      name: 'La génération de signaux est-elle entièrement automatisée ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, le pipeline de génération de signaux est entièrement automatisé — aucun analyste humain ne vérifie ou n\'approuve les signaux avant leur publication. Cela élimine les biais émotionnels et garantit une qualité de signal constante.',
      },
    },
    {
      '@type': 'Question',
      name: 'À quelle fréquence le modèle IA est-il ré-entraîné ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Le modèle est ré-entraîné sur une fenêtre glissante de 90 jours de données de marché en direct toutes les deux semaines. Cela permet au modèle de s\'adapter aux conditions de marché actuelles sans surapprentissage sur des données à court terme.',
      },
    },
    {
      '@type': 'Question',
      name: 'En quoi les signaux IA sont-ils meilleurs que l\'analyse manuelle ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La génération de signaux par IA offre plusieurs avantages : disponibilité 24/7 sans fatigue, traitement de dizaines d\'indicateurs et de périodes simultanément en millisecondes, application de règles cohérentes sans biais émotionnel, et détection de patterns statistiques subtils invisibles à l\'œil humain.',
      },
    },
  ],
};

export default function SignauxIaPage() {
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
              Machine Learning · Sans Émotion · Surveillance 24/7
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="text-yellow-400">Signaux Trading IA</span> — La Technologie MarketSignals24
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Notre moteur IA propriétaire analyse l&apos;action des prix, plus de 40 indicateurs techniques et les patterns de volatilité simultanément pour générer des signaux de trading plus rapidement et de manière plus cohérente que n&apos;importe quel analyste humain — disponible dès 6€ par jour.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
                Essayer les Signaux IA
              </Link>
              <Link href="/tarifs" className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-lg">
                Voir les Tarifs
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 px-4 border-y border-white/10 bg-gray-900/50">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '40+', label: 'Indicateurs techniques' },
              { value: '5', label: 'Périodes analysées' },
              { value: '<500ms', label: 'Latence du signal' },
              { value: '90j', label: 'Fenêtre d\'entraînement' },
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
            <h2 className="text-2xl font-bold mb-4">Pourquoi l&apos;IA pour les Signaux de Trading ?</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Les marchés financiers génèrent des milliards de points de données chaque jour. La quantité d&apos;informations disponible est impossible à traiter complètement en temps réel pour n&apos;importe quel trader individuel. L&apos;intelligence artificielle, et plus précisément le machine learning, a été conçue précisément pour ce problème.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Un modèle IA peut ingérer des milliers de variables par seconde, identifier les patterns qui corrèlent avec des trades rentables, et émettre une recommandation actionnable en millisecondes — de manière cohérente, 24 heures sur 24, sans jamais se fatiguer, être émotif ou distrait.
            </p>
            <p className="text-gray-300 leading-relaxed">
              MarketSignals24 a été construit dès le départ comme un service de signaux IA-first. Nous n&apos;utilisons pas de systèmes à base de règles avec des seuils codés en dur. Notre modèle apprend continuellement à partir des données de marché les plus récentes, s&apos;adaptant aux conditions changeantes toutes les deux semaines.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Pipeline du Moteur de Signaux</h2>
            <div className="space-y-4">
              {[
                { phase: 'Phase 1 — Ingestion des Données', text: 'Les données de prix tick-by-tick sont streamées depuis plusieurs fournisseurs de liquidité et agrégées en chandeliers OHLCV pour les périodes M1, M5, M15, H1 et H4.' },
                { phase: 'Phase 2 — Extraction des Features', text: 'Pour chaque chandelier fermé, le moteur calcule 40+ indicateurs techniques. Le résultat est un vecteur de features multidimensionnel qui représente l\'état du marché à cet instant.' },
                { phase: 'Phase 3 — Détection de Patterns', text: 'Un modèle à gradient boosting scanne le vecteur de features pour trouver des patterns qui ont historiquement précédé de forts mouvements directionnels. Il attribue un score de probabilité directionnelle à chaque candidat potentiel.' },
                { phase: 'Phase 4 — Filtre de Risque', text: 'Les candidats sous le seuil de confiance minimum sont écartés. Le filtre vérifie également le spread actuel, la proximité du calendrier économique, et si le ratio risque/rendement atteint le minimum requis de 1:1,5.' },
                { phase: 'Phase 5 — Publication du Signal', text: 'Les signaux approuvés sont publiés sur un canal Redis Pub/Sub et transmis à toutes les sessions abonnées actives via WebSocket. Tout le pipeline de l\'ingestion du tick à la notification utilisateur se complète en moins de 500ms.' },
              ].map((item) => (
                <div key={item.phase} className="bg-gray-900 border border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-yellow-400 mb-2">{item.phase}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.text}</p>
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
            <h2 className="text-2xl font-bold mb-4">Explorer les Signaux IA par Classe d&apos;Actifs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/fr/signaux-forex" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Signaux Forex →</h3>
                <p className="text-gray-400 text-sm mt-1">30+ paires majeurs et croisées</p>
              </Link>
              <Link href="/fr/signaux-crypto" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Signaux Crypto →</h3>
                <p className="text-gray-400 text-sm mt-1">BTC, ETH et 20+ altcoins</p>
              </Link>
              <Link href="/fr/signaux-options-binaires" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Options Binaires →</h3>
                <p className="text-gray-400 text-sm mt-1">Signaux OTC 1–5 min</p>
              </Link>
            </div>
          </section>

          <section className="text-center bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/20 rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-3">Expérimentez la Puissance des Signaux IA</h2>
            <p className="text-gray-300 mb-6">Rapides, cohérents, sans émotion — sur forex, crypto et marchés OTC.</p>
            <Link href="/register" className="inline-block bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
              Démarrer Aujourd&apos;hui
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
