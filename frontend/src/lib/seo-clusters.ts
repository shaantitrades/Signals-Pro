// ============================================================================
// hreflang clusters of the SEO landing pages
// ----------------------------------------------------------------------------
// Their slugs differ per language (`/forex-signals` vs `/fr/signaux-forex`…) so
// every cluster is declared once here and reused by the pages and the sitemap.
// Each cluster is complete and symmetric (self-references + x-default).
// ============================================================================

import { absoluteUrl } from '@/lib/locales';

/** hreflang value → locale-free path */
const CLUSTERS: Record<string, Record<string, string>> = {
  forex: {
    en: '/forex-signals',
    'fr-FR': '/fr/signaux-forex',
    'es-ES': '/es/senales-forex',
    'de-DE': '/de/forex-signale',
  },
  crypto: {
    en: '/crypto-signals',
    'fr-FR': '/fr/signaux-crypto',
  },
  turbo: {
    en: '/turbo-signals',
    'fr-FR': '/fr/signaux-turbo',
  },
  ai: {
    en: '/ai-trading-signals',
    'fr-FR': '/fr/signaux-ia',
  },
};

export type SeoClusterKey = keyof typeof CLUSTERS;

/** Absolute hreflang map for `<link rel="alternate">` / the sitemap. */
export function seoClusterLanguageMap(key: SeoClusterKey): Record<string, string> {
  const cluster = CLUSTERS[key];
  const map: Record<string, string> = {};
  for (const [hreflang, path] of Object.entries(cluster)) {
    map[hreflang] = absoluteUrl(path);
  }
  map['x-default'] = absoluteUrl(cluster.en);
  return map;
}

/** All URLs of a cluster (used by the sitemap). */
export function seoClusterPaths(key: SeoClusterKey): string[] {
  return Object.values(CLUSTERS[key]);
}
