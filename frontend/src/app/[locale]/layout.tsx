// Locale validation for every `/{locale}/…` route.
//
// `[locale]` is a dynamic segment, so Next.js would happily serve
// `/xx/tarifs`. This layout rejects unknown locales with a real 404 instead,
// which prevents search engines from indexing duplicated "soft 404" pages.
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/locales';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return children;
}
