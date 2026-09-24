import type { Metadata } from 'next';
import Link from 'next/link';
import { seoClusterLanguageMap } from '@/lib/seo-clusters';

export const metadata: Metadata = {
  title: 'Señales Forex en Tiempo Real — IA Profesional | MarketSignals24',
  description:
    'Reciba señales forex impulsadas por IA para EUR/USD, GBP/USD, USD/JPY y más de 30 pares. Entrada, stop-loss y take-profit precisos. Desde 6€.',
  keywords:
    'MarketSignals24, señales forex, señales forex gratis, señales trading gratis, señales forex gratuitas, mejores señales forex gratis, señales forex en vivo gratis, señales trading forex, alertas forex, señales forex en vivo, mejores señales forex, señales EUR/USD, IA trading forex, señales forex precisas, señales forex tiempo real, proveedor señales forex',
  alternates: {
    canonical: 'https://marketsignals24.com/es/senales-forex',
    languages: seoClusterLanguageMap('forex'),
  },
  openGraph: {
    title: 'Señales Forex IA — Alertas en Tiempo Real | MarketSignals24',
    description: 'Señales forex IA para 30+ pares de divisas. Tasa de éxito hasta 87%. Empiece desde 6€.',
    url: 'https://marketsignals24.com/es/senales-forex',
    siteName: 'MarketSignals24',
    type: 'website',
    locale: 'es_ES',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son las señales forex?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las señales forex son recomendaciones de trading en tiempo real que le indican cuándo comprar o vender un par de divisas, a qué precio entrar, dónde colocar su stop-loss para limitar pérdidas y dónde tomar beneficios. En MarketSignals24, las señales son generadas por una IA que analiza indicadores técnicos, niveles de precio y dinámica del mercado simultáneamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué precisión tienen las señales de MarketSignals24?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nuestro modelo de IA ha alcanzado tasas de acierto de hasta el 87% en backtests sobre los principales pares desde 2023. Los rendimientos pasados no garantizan resultados futuros. Todo el trading conlleva riesgo de pérdida de capital.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pares de divisas cubren?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cubrimos todos los pares mayores (EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, NZD/USD, USD/CAD, EUR/GBP) más de 25 pares cruzados incluyendo EUR/JPY, GBP/JPY, EUR/AUD y muchos más.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito experiencia en trading para usar sus señales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Cada señal incluye claramente la dirección (COMPRA o VENTA), el precio de entrada, el stop-loss y el take-profit. Los principiantes pueden seguir las señales directamente, mientras que los traders experimentados pueden usarlas para confirmar su propio análisis.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo recibo las señales forex en tiempo real?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las señales aparecen instantáneamente en su panel cuando la IA detecta una configuración válida. Una alerta de audio suena en el navegador para no perder ninguna operación. La plataforma también funciona como PWA (Progressive Web App) instalable en su teléfono.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué suscripción necesito para las señales forex?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las señales forex están incluidas en todos los planes desde el Pase 24h por 6€. El Pase Semanal por 25€ y el Pase Mensual por 85€ ofrecen el mejor valor para traders regulares.',
      },
    },
  ],
};

export default function SenalesForexPage() {
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
              IA · Tiempo Real · 30+ Pares
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="text-yellow-400">Señales Forex</span> en Tiempo Real Impulsadas por IA
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Reciba alertas de compra y venta para EUR/USD, GBP/USD, USD/JPY y más de 30 pares de divisas en el momento en que nuestra IA detecta una configuración de alta probabilidad — con entrada, stop-loss y take-profit incluidos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
                Empezar Gratis
              </Link>
              <Link href="/tarifs" className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-lg">
                Planes desde 6€
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 px-4 border-y border-white/10 bg-gray-900/50">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '87%', label: 'Tasa de éxito (backtest)' },
              { value: '30+', label: 'Pares de divisas' },
              { value: '24/7', label: 'Monitoreo de mercados' },
              { value: '<1s', label: 'Entrega de señal' },
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
            <h2 className="text-2xl font-bold mb-4">¿Por Qué Usar Señales Forex con IA?</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Los mercados financieros generan miles de millones de puntos de datos cada día. La cantidad de información disponible es imposible de procesar completamente en tiempo real para cualquier trader individual. La inteligencia artificial fue diseñada precisamente para este problema.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              El motor de señales de MarketSignals24 ingiere datos de precios tick a tick de múltiples proveedores de liquidez y los procesa a través de un pipeline de análisis multicapa. El resultado es una señal de trading precisa emitida en menos de 500 milisegundos desde el momento en que se forma una configuración válida.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Sin emociones, sin fatiga, sin sesgos cognitivos — solo análisis de mercado objetivo, las 24 horas, los 7 días de la semana.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Cómo Usar las Señales Forex — Paso a Paso</h2>
            <ol className="space-y-4">
              {[
                { step: '1', title: 'Cree su cuenta', text: 'Regístrese en MarketSignals24 en menos de 60 segundos — sin tarjeta de crédito requerida.' },
                { step: '2', title: 'Elija un plan', text: 'Comience con el Pase 24h (6€) para probar el servicio, o elija el Pase Mensual (85€) para el mejor valor.' },
                { step: '3', title: 'Abra su panel', text: 'Vaya a la pestaña Señales para ver todas las señales forex activas y recientes con entrada, SL, TP y puntuación de confianza.' },
                { step: '4', title: 'Active las alertas de sonido', text: 'Haga clic en "Activar alertas de sonido" para desbloquear el audio del navegador. Escuchará un aviso sonoro cada vez que aparezca una nueva señal.' },
                { step: '5', title: 'Ejecute la operación', text: 'Abra el par correspondiente en su bróker, entre al precio indicado y establezca el stop-loss y take-profit exactamente como se muestra. Ajuste el tamaño de lote según su tolerancia al riesgo.' },
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
            <h2 className="text-2xl font-bold mb-4">Advertencia de Riesgo</h2>
            <p className="text-amber-400 text-sm p-4 bg-amber-400/10 border border-amber-400/20 rounded-xl">
              ⚠️ Los CFD son instrumentos complejos y conllevan un alto riesgo de perder dinero rápidamente debido al apalancamiento. Entre el 74% y el 89% de las cuentas de inversores minoristas pierden dinero al operar CFD. Debe considerar si comprende cómo funcionan los CFD y si puede permitirse asumir el alto riesgo de perder su dinero.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Preguntas Frecuentes</h2>
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
            <h2 className="text-2xl font-bold mb-4">Otros Tipos de Señales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/forex-signals" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Señales Forex (EN) →</h3>
                <p className="text-gray-400 text-sm mt-1">30+ pares, mercados en vivo</p>
              </Link>
              <Link href="/crypto-signals" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Señales Cripto →</h3>
                <p className="text-gray-400 text-sm mt-1">BTC, ETH y 20+ altcoins</p>
              </Link>            </div>
          </section>

          <section className="text-center bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/20 rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-3">¿Listo para Operar con Ventaja?</h2>
            <p className="text-gray-300 mb-6">Miles de traders reciben señales forex IA en tiempo real todos los días.</p>
            <Link href="/register" className="inline-block bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
              Crear Cuenta Gratis
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
