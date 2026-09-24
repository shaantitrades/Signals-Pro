// ============================================================================
// Locale middleware
// ----------------------------------------------------------------------------
// Responsibilities:
//  1. Public pages without a locale prefix are redirected once to
//     `/{locale}{path}` (locale = cookie → Accept-Language → English).
//  2. Requests that already carry a locale prefix only get the `x-locale`
//     cookie refresher (+ the request headers read by `app/layout.tsx`).
//  3. Everything else (dashboard, SEO landing pages, blog posts, API…) passes
//     through untouched, with a sane `x-locale`.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  detectLocale,
  isLocalizedPath,
  splitLocalePath,
  withLocale,
} from '@/lib/locales';

/** Area where the visitor's own language is used even without a URL prefix. */
const APP_PREFIXES = ['/dashboard'];

/** Prefixes that never change into a locale-prefixed URL (dashboard, API…). */
const PASSTHROUGH_PREFIXES = ['/_next', '/api', '/socket.io', '/.well-known', '/_not-found'];

/**
 * Top-level routes declared in `src/app` that live OUTSIDE `[locale]`.
 * The `[locale]` dynamic segment would otherwise swallow any unknown path and
 * answer 200 (a "soft 404"), so unknown first segments are answered with a real
 * 404. Keep this list in sync when a new top-level page is added.
 */
const STATIC_TOP_LEVEL = new Set([
  'dashboard',
  'blog',
  'tarifs',
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'privacy-policy',
  'terms-conditions',
  'trading-risks',
  'legal-notice',
  'cookie-policy',
  'forex-signals',
  'crypto-signals',
  'turbo-signals',
  'ai-trading-signals',
]);

function isPassthrough(pathname: string): boolean {
  return PASSTHROUGH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function setLocaleCookie(response: NextResponse, locale: string): void {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPassthrough(pathname)) {
    return NextResponse.next();
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const { locale: urlLocale, path } = splitLocalePath(pathname);

  // 1. URL already carries a supported locale → pass through.
  if (urlLocale) {
    const headers = new Headers(request.headers);
    headers.set('x-locale', urlLocale);
    headers.set('x-pathname', pathname);

    const response = NextResponse.next({ request: { headers } });
    if (cookieLocale !== urlLocale) setLocaleCookie(response, urlLocale);
    return response;
  }

  // 2. Localizable public page without a prefix → single redirect.
  if (isLocalizedPath(path)) {
    const locale = detectLocale(request.headers.get('accept-language'), cookieLocale);

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = withLocale(path, locale);

    // 307: the target depends on the visitor, it must never be cached forever.
    const response = NextResponse.redirect(redirectUrl, 307);
    setLocaleCookie(response, locale);
    return response;
  }

  // 3. Everything else keeps its URL.
  const locale = APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
    ? detectLocale(request.headers.get('accept-language'), cookieLocale)
    : DEFAULT_LOCALE;

  // Unknown top-level path (e.g. /xx/tarifs): answer a real 404 instead of
  // letting the `[locale]` segment render the app shell with a 200 status.
  const firstSegment = path.split('/')[1] ?? '';
  if (firstSegment && !STATIC_TOP_LEVEL.has(firstSegment)) {
    const notFoundUrl = request.nextUrl.clone();
    notFoundUrl.pathname = '/_not-found';
    return NextResponse.rewrite(notFoundUrl, { status: 404 });
  }

  const headers = new Headers(request.headers);
  headers.set('x-locale', locale);
  headers.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Skip Next internals, API routes and every static file (anything with a dot).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
