// ============================================================================
// Localized page metadata (titles & descriptions per URL locale)
// ----------------------------------------------------------------------------
// Server-safe module: used by `app/layout.tsx#generateMetadata` so that Google
// receives a French title/description on /fr, a Spanish one on /es, etc.
// ============================================================================

import type { Locale } from '@/lib/locales';

export interface PageMeta {
  title: string;
  description: string;
}

/** Home page (`/`, `/fr`, `/es`, …) */
export const HOME_META: Record<Locale, PageMeta> = {
  en: {
    title: 'Market Signals24 — Live Trading Signals | Forex, Crypto & Turbo Trading',
    description:
      'Get real-time AI-powered trading signals for Forex, Crypto, Indices & Turbo Trading. Free live trading signals validated by AI. Start trading smarter today.',
  },
  fr: {
    title: 'Market Signals24 — Signaux de Trading en Direct | Forex, Crypto & Trading Turbo',
    description:
      "Recevez des signaux de trading en temps réel validés par l'IA pour le Forex, les cryptos, les indices et le trading turbo. Signaux en direct gratuits, disponibles dès 6 €.",
  },
  es: {
    title: 'Market Signals24 — Señales de Trading en Vivo | Forex, Cripto y Trading Turbo',
    description:
      'Recibe señales de trading en tiempo real impulsadas por IA para Forex, Cripto, Índices y Trading Turbo. Señales en vivo gratuitas validadas por IA. Empieza hoy.',
  },
  de: {
    title: 'Market Signals24 — Live Trading Signale | Forex, Krypto & Turbo-Trading',
    description:
      'Erhalte KI-gestützte Trading-Signale in Echtzeit für Forex, Krypto, Indizes und Turbo-Trading. Kostenlose Live-Signale, von der KI validiert. Ab 6 €.',
  },
  it: {
    title: 'Market Signals24 — Segnali di Trading in Diretta | Forex, Crypto e Trading Turbo',
    description:
      "Ricevi segnali di trading in tempo reale convalidati dall'IA per Forex, Crypto, Indici e Trading Turbo. Segnali in diretta gratuiti, a partire da 6 €.",
  },
  pt: {
    title: 'Market Signals24 — Sinais de Trading ao Vivo | Forex, Cripto e Trading Turbo',
    description:
      'Receba sinais de trading em tempo real validados por IA para Forex, Cripto, Índices e Trading Turbo. Sinais ao vivo gratuitos, a partir de 6 €.',
  },
  ar: {
    title: 'Market Signals24 — إشارات تداول مباشرة | فوركس، عملات رقمية وتداول توربو',
    description:
      'احصل على إشارات تداول فورية مدعومة بالذكاء الاصطناعي للفوركس والعملات الرقمية والمؤشرات والتداول التوربو. إشارات مباشرة مجانية تبدأ من 6 يورو.',
  },
  vi: {
    title: 'Market Signals24 — Tín hiệu giao dịch trực tiếp | Forex, Crypto & Giao dịch Turbo',
    description:
      'Nhận tín hiệu giao dịch theo thời gian thực được AI xác thực cho Forex, Crypto, Chỉ số và Giao dịch Turbo. Tín hiệu trực tiếp miễn phí, chỉ từ 6 €.',
  },
};

/** Pricing / tarifs page (`/tarifs`, `/fr/tarifs`, …) */
export const PRICING_META: Record<Locale, PageMeta> = {
  en: {
    title: 'Pricing — Trading Signal Plans from €6 | MarketSignals24',
    description:
      'Compare MarketSignals24 plans: 24h pass €6, weekly €25, monthly €85. Full access to AI-validated Forex, Crypto and OTC signals plus the trading bot.',
  },
  fr: {
    title: 'Tarifs — Abonnements Signaux de Trading dès 6 € | MarketSignals24',
    description:
      'Comparez les offres MarketSignals24 : Pass 24h à 6 €, Pass Hebdomadaire à 25 €, Pass Mensuel à 85 €. Accès complet aux signaux Forex, Crypto et OTC validés par IA.',
  },
  es: {
    title: 'Precios — Planes de Señales de Trading desde 6 € | MarketSignals24',
    description:
      'Compara los planes de MarketSignals24: Pase 24h por 6 €, semanal 25 €, mensual 85 €. Acceso completo a señales Forex, Cripto y OTC validadas por IA.',
  },
  de: {
    title: 'Preise — Trading-Signal-Abos ab 6 € | MarketSignals24',
    description:
      'Vergleiche die MarketSignals24-Tarife: 24h-Pass 6 €, Wochenpass 25 €, Monatspass 85 €. Vollzugriff auf KI-validierte Forex-, Krypto- und OTC-Signale.',
  },
  it: {
    title: 'Prezzi — Abbonamenti ai Segnali di Trading da 6 € | MarketSignals24',
    description:
      "Confronta i piani MarketSignals24: Pass 24h a 6 €, settimanale 25 €, mensile 85 €. Accesso completo ai segnali Forex, Crypto e OTC convalidati dall'IA.",
  },
  pt: {
    title: 'Preços — Planos de Sinais de Trading desde 6 € | MarketSignals24',
    description:
      'Compare os planos MarketSignals24: Passe 24h por 6 €, semanal 25 €, mensal 85 €. Acesso completo a sinais Forex, Cripto e OTC validados por IA.',
  },
  ar: {
    title: 'الأسعار — خطط إشارات التداول من 6 يورو | MarketSignals24',
    description:
      'قارن بين خطط MarketSignals24: بطاقة 24 ساعة بـ 6 يورو، أسبوعية 25 يورو، شهرية 85 يورو. وصول كامل إلى إشارات الفوركس والعملات الرقمية والتداول التوربو.',
  },
  vi: {
    title: 'Bảng giá — Gói tín hiệu giao dịch từ 6 € | MarketSignals24',
    description:
      'So sánh các gói MarketSignals24: Gói 24h 6 €, hàng tuần 25 €, hàng tháng 85 €. Truy cập đầy đủ tín hiệu Forex, Crypto và OTC được AI xác thực.',
  },
};

/** Locale-free path → localized metadata map. */
const PAGE_META: Record<string, Record<Locale, PageMeta>> = {
  '/': HOME_META,
  '/tarifs': PRICING_META,
};

/** Returns the localized metadata for a known path, or null when not mapped. */
export function localizedPageMeta(path: string, locale: Locale): PageMeta | null {
  const entry = PAGE_META[path];
  if (!entry) return null;
  return entry[locale] ?? entry.en;
}
