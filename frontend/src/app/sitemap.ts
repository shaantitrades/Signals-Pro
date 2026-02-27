import { MetadataRoute } from 'next';

const BASE_URL = 'https://marketsignals24.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { url: BASE_URL, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/tarifs`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/login`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/register`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/privacy-policy`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${BASE_URL}/terms-conditions`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${BASE_URL}/trading-risks`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${BASE_URL}/legal-notice`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${BASE_URL}/cookie-policy`, priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  // EN SEO landing pages
  const enSeoPages = [
    { url: `${BASE_URL}/forex-signals`, priority: 0.95, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/crypto-signals`, priority: 0.95, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/binary-options-signals`, priority: 0.95, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/ai-trading-signals`, priority: 0.9, changeFrequency: 'weekly' as const },
  ];

  // FR SEO landing pages
  const frSeoPages = [
    { url: `${BASE_URL}/fr/signaux-forex`, priority: 0.95, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/fr/signaux-options-binaires`, priority: 0.95, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/fr/signaux-crypto`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/fr/signaux-ia`, priority: 0.9, changeFrequency: 'weekly' as const },
  ];

  // ES SEO landing pages
  const esSeoPages = [
    { url: `${BASE_URL}/es/senales-forex`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/es/senales-opciones-binarias`, priority: 0.9, changeFrequency: 'weekly' as const },
  ];

  // DE SEO landing pages
  const deSeoPages = [
    { url: `${BASE_URL}/de/forex-signale`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/de/binaere-optionen-signale`, priority: 0.9, changeFrequency: 'weekly' as const },
  ];

  const allPages = [...staticPages, ...enSeoPages, ...frSeoPages, ...esSeoPages, ...deSeoPages];

  return allPages.map((page) => ({
    url: page.url,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
