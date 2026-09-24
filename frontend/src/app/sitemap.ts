import { MetadataRoute } from 'next';
import { LOCALES, absoluteUrl, localeAlternates, withLocale } from '@/lib/locales';
import { seoClusterLanguageMap, seoClusterPaths, type SeoClusterKey } from '@/lib/seo-clusters';

/** Pages that exist in every language (their URLs carry the locale prefix). */
const LOCALIZED_PAGES = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/tarifs', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/register', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/login', priority: 0.7, changeFrequency: 'monthly' as const },
];

/** Single-language SEO landing pages, grouped per hreflang cluster. */
const SEO_CLUSTERS: { key: SeoClusterKey; priority: number }[] = [
  { key: 'forex', priority: 0.95 },
  { key: 'crypto', priority: 0.9 },
  { key: 'turbo', priority: 0.9 },
  { key: 'ai', priority: 0.85 },
];

/** English-only legal pages. */
const LEGAL_PAGES = [
  '/privacy-policy',
  '/terms-conditions',
  '/trading-risks',
  '/legal-notice',
  '/cookie-policy',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const localizedEntries: MetadataRoute.Sitemap = LOCALIZED_PAGES.flatMap((page) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(withLocale(page.path, locale)),
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: { languages: localeAlternates(page.path) },
    })),
  );

  const seoEntries: MetadataRoute.Sitemap = SEO_CLUSTERS.flatMap((cluster) =>
    seoClusterPaths(cluster.key).map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: cluster.priority,
      alternates: { languages: seoClusterLanguageMap(cluster.key) },
    })),
  );

  const legalEntries: MetadataRoute.Sitemap = LEGAL_PAGES.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }));

  return [...localizedEntries, ...seoEntries, ...legalEntries];
}
