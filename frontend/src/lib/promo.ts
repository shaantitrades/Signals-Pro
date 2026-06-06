/**
 * Returns the next 26th of the month as a Date object.
 *
 * - If today is before the 26th of the current month → return 26th of current month
 * - If today is on or after the 26th of the current month → return 26th of next month
 */
export function getNextPromoEndDate(): Date {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed (January = 0)

  const thisMonth26 = new Date(year, month, 26);

  if (today < thisMonth26) {
    return thisMonth26;
  }

  // Past the 26th → next month
  return new Date(year, month + 1, 26);
}

/**
 * Formats the next promo end date for the given locale string
 * (e.g. "en-US", "fr-FR", "de-DE", "es-ES").
 */
export function getFormattedPromoEndDate(locale: string): string {
  const date = getNextPromoEndDate();
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Maps internal LangCode to a BCP 47 locale tag suitable for Intl.DateTimeFormat.
 */
export function langToLocale(lang: string): string {
  const map: Record<string, string> = {
    EN: 'en-US',
    FR: 'fr-FR',
    ES: 'es-ES',
    DE: 'de-DE',
    IT: 'it-IT',
    PT: 'pt-PT',
    AR: 'ar-SA',
    VI: 'vi-VN',
  };
  return map[lang] || 'en-US';
}