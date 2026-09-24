// Locale-prefixed entry point: /en, /fr, /es, /de, /it, /pt, /ar, /vi
//
// The middleware sends the visitor here and the root layout reads the locale
// from the `x-locale` request header, so the shared page below is rendered in
// the right language (server-side, before any JavaScript runs).
export { default } from '../page';
