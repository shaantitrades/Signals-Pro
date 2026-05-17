import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/tarifs', '/login', '/register'],
        disallow: ['/dashboard/', '/api/'],
      },
    ],
    sitemap: 'https://marketsignals24.com/sitemap.xml',
    host: 'https://marketsignals24.com',
  };
}
