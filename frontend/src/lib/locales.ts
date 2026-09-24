// ============================================================================
// Locale configuration — single source of truth for URL-prefixed i18n
// ----------------------------------------------------------------------------
// The language of a page is driven by the URL prefix (/fr/tarifs, /en/tarifs…)
// instead of relying on localStorage alone. This module is intentionally free
// of React / client-only imports because it is also used by `middleware.ts`
// and by server components (`layout.tsx`, `sitemap.ts`).
// ============================================================================

/** Internal language code used by the translation dictionaries. */
export type LangCode = 'EN' | 'FR' | 'ES' | 'IT' | 'PT' | 'AR' | 'DE' | 'VI';

/** Lowercase locale code used in the URL (e.g. `/fr/tarifs`). */
export type Locale = 'en' | 'fr' | 'es' | 'it' | 'pt' | 'ar' | 'de' | 'vi';

export const SITE_URL = 'https://marketsignals24.com';

/** Locale served by default, also used as `x-default` in hreflang clusters. */
export const DEFAULT_LOCALE: Locale = 'en';

/** Every locale reachable through a URL prefix. */
export const LOCALES: Locale[] = ['en', 'fr', 'es', 'it', 'pt', 'ar', 'de', 'vi'];

/**
 * Public pages that really exist in every language (their copy comes from the
 * i18n dictionaries). Single-language pages — legal notices, blog… — are
 * intentionally excluded so they are never served with a wrong `lang`.
 */
export const LOCALIZED_PATHS: string[] = [
  '/',
  '/tarifs',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export const LOCALE_TO_LANG: Record<Locale, LangCode> = {
  en: 'EN', fr: 'FR', es: 'ES', it: 'IT', pt: 'PT', ar: 'AR', de: 'DE', vi: 'VI',
};

export const LANG_TO_LOCALE: Record<LangCode, Locale> = {
  EN: 'en', FR: 'fr', ES: 'es', IT: 'it', PT: 'pt', AR: 'ar', DE: 'de', VI: 'vi',
};

/** Value used in `<link rel="alternate" hreflang="…">`. */
export const HREFLANG: Record<Locale, string> = {
  en: 'en', fr: 'fr', es: 'es', it: 'it', pt: 'pt', ar: 'ar', de: 'de', vi: 'vi',
};

/** Open Graph `og:locale` value for each locale. */
export const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  fr: 'fr_FR',
  es: 'es_ES',
  de: 'de_DE',
  it: 'it_IT',
  pt: 'pt_BR',
  ar: 'ar_AR',
  vi: 'vi_VN',
};

/** Locales written right-to-left. */
export const RTL_LOCALES: Locale[] = ['ar'];

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as string[]).includes(value);
}

/** `/fr/tarifs/` → `/tarifs` ; `/fr/` → `/` */
export function normalizePath(path: string): string {
  if (!path || !path.startsWith('/')) return '/';
  const trimmed = path.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

export function isLocalizedPath(path: string): boolean {
  return LOCALIZED_PATHS.includes(normalizePath(path));
}

/** Language selector entries (shared by the public header and the dashboard). */
export const languages: { code: LangCode; label: string; flag: string; locale: Locale }[] = [
  { code: 'EN', label: 'English', flag: '🇺🇸', locale: 'en' },
  { code: 'FR', label: 'Français', flag: '🇫🇷', locale: 'fr' },
  { code: 'ES', label: 'Español', flag: '🇪🇸', locale: 'es' },
  { code: 'IT', label: 'Italiano', flag: '🇮🇹', locale: 'it' },
  { code: 'PT', label: 'Português', flag: '🇵🇹', locale: 'pt' },
  { code: 'AR', label: 'العربية', flag: '🇸🇦', locale: 'ar' },
  { code: 'DE', label: 'Deutsch', flag: '🇩🇪', locale: 'de' },
  { code: 'VI', label: 'Tiếng Việt', flag: '🇻🇳', locale: 'vi' },
];

/**
 * Splits a pathname into its optional locale prefix and the locale-free path.
 * `/fr/tarifs` → `{ locale: 'fr', path: '/tarifs' }`
 * `/tarifs`    → `{ locale: null, path: '/tarifs' }`
 */
export function splitLocalePath(pathname: string): { locale: Locale | null; path: string } {
  const match = /^\/([a-zA-Z]{2})(\/.*)?$/.exec(pathname);
  if (match) {
    const candidate = match[1].toLowerCase();
    if (isLocale(candidate)) {
      const rest = match[2] && match[2] !== '' ? match[2] : '/';
      return { locale: candidate, path: normalizePath(rest) };
    }
  }
  return { locale: null, path: normalizePath(pathname) };
}

/** `/tarifs` + `fr` → `/fr/tarifs` ; `/` + `fr` → `/fr` */
export function withLocale(path: string, locale: Locale): string {
  const clean = normalizePath(path);
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = normalizePath(path);
  return `${SITE_URL}${clean === '/' ? '' : clean}`;
}

/**
 * Builds the complete hreflang cluster (every locale + x-default) for a
 * locale-free path such as `/tarifs`.
 */
export function localeAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of LOCALES) {
    alternates[HREFLANG[locale]] = absoluteUrl(withLocale(path, locale));
  }
  alternates['x-default'] = absoluteUrl(withLocale(path, DEFAULT_LOCALE));
  return alternates;
}

/**
 * Picks the best locale for a visitor:
 * 1. the language previously chosen (NEXT_LOCALE cookie),
 * 2. the languages sent by the browser (Accept-Language, q-values honoured),
 * 3. English as a fallback.
 */
export function detectLocale(
  acceptLanguage: string | null | undefined,
  cookieLocale?: string | null,
): Locale {
  if (isLocale(cookieLocale)) return cookieLocale;

  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? Number.parseFloat(qParam.split('=')[1]) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 1 };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    if (isLocale(tag)) return tag;
    const base = tag.split('-')[0];
    if (isLocale(base)) return base;
  }

  return DEFAULT_LOCALE;
}

/** Browser path → localized href, used by the language selectors. */
export function localizedHref(pathname: string, locale: Locale): string {
  const { path } = splitLocalePath(pathname);
  return withLocale(path, locale);
}

/** Cookie remembering the visitor's language choice (read by `middleware.ts`). */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Persists the language choice so the next server render (and the middleware
 * redirect for a URL without a prefix) uses the same locale.
 */
export function persistLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}
