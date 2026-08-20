'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

const STORAGE_KEY = 'po_popup_closed_at';
const DELAY_MS = 8000;          // show after 8s
const COOLDOWN_HOURS = 24;      // don't re-show within 24h

export function PocketOptionPopup() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check cooldown
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const closedAt = parseInt(raw, 10);
        const hoursSince = (Date.now() - closedAt) / (1000 * 60 * 60);
        if (hoursSince < COOLDOWN_HOURS) return;
      }
    } catch (_) {}

    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch (_) {}
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 animate-in fade-in duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-7 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300">

        {/* Close */}
        <button
          onClick={close}
          aria-label="Fermer"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>
          </svg>
        </button>

        {/* Urgency badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">
            {t('popup.po.urgency')}
          </span>
        </div>

        {/* Broker logo + name */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#00b27a] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-sm">PO</span>
          </div>
          <div>
            <p className="font-bold text-white text-base leading-tight">Pocket Option</p>
            <p className="text-xs text-yellow-400">★★★★★ 4.9/5 · 50 000+ traders</p>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-2xl font-extrabold text-white leading-tight mb-2">
          {t('popup.po.headline')}
        </h2>
        <p className="text-sm text-white/70 mb-4">
          {t('popup.po.sub')}
        </p>

        {/* Social proof */}
        <div className="bg-[#00b27a]/10 border border-[#00b27a]/30 rounded-xl px-4 py-3 mb-5">
          <p className="text-sm font-semibold text-[#00e699] mb-0.5">{t('popup.po.social')}</p>
          <p className="text-xs text-white/60">{t('popup.po.code')}</p>
        </div>

        {/* CTA */}
        <a
          href="https://u3.shortink.io/register?utm_campaign=41345&utm_source=affiliate&utm_medium=sr&a=nauJIysReFF6Mk&ac=promo-code-60&code=PMQ023"
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
          className="block w-full text-center py-3.5 rounded-xl bg-[#00b27a] hover:bg-[#00c98a] text-white font-bold text-base transition-colors"
        >
          {t('popup.po.cta')}
        </a>

        <p className="text-[10px] text-white/40 text-center mt-3">
          {t('popup.po.disclaimer')}
        </p>
      </div>
    </div>
  );
}
