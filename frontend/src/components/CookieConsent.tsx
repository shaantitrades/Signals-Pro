'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Small delay so it doesn't flash immediately on page load
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (all: boolean) => {
    const consent = {
      necessary: true,
      analytics: all,
      preferences: all,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9998] animate-slide-up">
      <div className="bg-card/95 backdrop-blur-lg border-t border-border shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Icon + Text */}
            <div className="flex items-start gap-3 flex-1">
              <span className="text-2xl shrink-0 mt-0.5">🍪</span>
              <div>
                <p className="text-sm font-medium">{t('cookies.title')}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {t('cookies.desc')}{' '}
                  <Link href="/cookie-policy" className="text-primary hover:underline">
                    {t('cookies.learnMore')}
                  </Link>
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => handleAccept(false)}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium bg-secondary text-foreground rounded-lg border border-border hover:bg-secondary/80 transition-colors"
              >
                {t('cookies.necessary')}
              </button>
              <button
                onClick={() => handleAccept(true)}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                {t('cookies.acceptAll')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
