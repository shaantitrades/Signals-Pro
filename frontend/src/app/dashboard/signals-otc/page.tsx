'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn, getRiskLevelColor } from '@/lib/utils';
import { signalsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';

// ============================================================================
// OTC Forex Assets
// ============================================================================

const otcAssets = [
  { value: 'EURUSD_OTC', label: 'EUR/USD OTC' },
  { value: 'GBPUSD_OTC', label: 'GBP/USD OTC' },
  { value: 'USDJPY_OTC', label: 'USD/JPY OTC' },
  { value: 'USDCHF_OTC', label: 'USD/CHF OTC' },
  { value: 'AUDUSD_OTC', label: 'AUD/USD OTC' },
  { value: 'USDCAD_OTC', label: 'USD/CAD OTC' },
  { value: 'NZDUSD_OTC', label: 'NZD/USD OTC' },
  { value: 'EURGBP_OTC', label: 'EUR/GBP OTC' },
  { value: 'EURJPY_OTC', label: 'EUR/JPY OTC' },
  { value: 'GBPJPY_OTC', label: 'GBP/JPY OTC' },
  { value: 'EURAUD_OTC', label: 'EUR/AUD OTC' },
  { value: 'EURCAD_OTC', label: 'EUR/CAD OTC' },
  { value: 'EURCHF_OTC', label: 'EUR/CHF OTC' },
  { value: 'EURNZD_OTC', label: 'EUR/NZD OTC' },
  { value: 'GBPAUD_OTC', label: 'GBP/AUD OTC' },
  { value: 'GBPCAD_OTC', label: 'GBP/CAD OTC' },
  { value: 'GBPCHF_OTC', label: 'GBP/CHF OTC' },
  { value: 'GBPNZD_OTC', label: 'GBP/NZD OTC' },
  { value: 'AUDCAD_OTC', label: 'AUD/CAD OTC' },
  { value: 'AUDCHF_OTC', label: 'AUD/CHF OTC' },
  { value: 'AUDJPY_OTC', label: 'AUD/JPY OTC' },
  { value: 'AUDNZD_OTC', label: 'AUD/NZD OTC' },
  { value: 'CADJPY_OTC', label: 'CAD/JPY OTC' },
  { value: 'CADCHF_OTC', label: 'CAD/CHF OTC' },
  { value: 'CHFJPY_OTC', label: 'CHF/JPY OTC' },
  { value: 'NZDJPY_OTC', label: 'NZD/JPY OTC' },
  { value: 'NZDCAD_OTC', label: 'NZD/CAD OTC' },
];

const otcTimeframes = [
  { value: 'M1', label: '1Min' },
  { value: 'M2', label: '2Min' },
  { value: 'M5', label: '5Min' },
  { value: 'M15', label: '15Min' },
  { value: 'M30', label: '30Min' },
  { value: 'H1', label: '60Min' },
  { value: 'H2', label: '2H' },
  { value: 'H4', label: '4H' },
  { value: 'H8', label: '8H' },
  { value: 'D1', label: 'Daily' },
];

interface OTCSignal {
  id: string;
  asset: string;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  takeProfit1: number;
  takeProfit2?: number | null;
  takeProfit3?: number | null;
  stopLoss: number;
  confidenceScore: number;
  riskLevel: string;
  timeframe: string;
  analysis?: string;
  createdAt?: string;
  // Extended fields from signal engine
  indicators?: { name: string; value: number; signal: string; strength: number }[];
}

// ============================================================================
// Helper: format asset label from value
// ============================================================================
function formatAssetLabel(asset: string) {
  return asset.replace('_OTC', ' OTC').replace(/([A-Z]{3})([A-Z]{3})/, '$1/$2');
}

// ============================================================================
// Toast Notification (top-right, red background)
// ============================================================================
function ToastNotification({ signal, onClose, t }: { signal: OTCSignal; onClose: () => void; t: (key: string, params?: Record<string, any>) => string }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-right duration-400 max-w-sm w-[calc(100%-2rem)] sm:w-full">
      <div className="bg-red-600 text-white rounded-lg shadow-2xl p-4 pr-10 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-white/70 hover:text-white">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>
        </button>
        <h4 className="font-bold text-sm mb-1">{t('sigOtc.signalActivated')}</h4>
        <p className="text-xs text-white/90">
          {t('sigOtc.newSignalDesc', { action: signal.action, asset: formatAssetLabel(signal.asset) })}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Bottom-right small notification
// ============================================================================
function BottomNotification({ signal, onClose, t }: { signal: OTCSignal; onClose: () => void; t: (key: string, params?: Record<string, any>) => string }) {
  useEffect(() => {
    const t = setTimeout(onClose, 7000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-[60] animate-in slide-in-from-bottom duration-400 max-w-sm w-[calc(100%-2rem)] sm:w-full">
      <div className="bg-card border border-border rounded-lg shadow-2xl p-4 pr-10 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>
        </button>
        <h4 className="font-semibold text-sm mb-0.5">{t('sigOtc.signalGenerated')}</h4>
        <p className="text-xs text-muted-foreground">
          {t('sigOtc.signalGeneratedDesc', { action: signal.action, asset: formatAssetLabel(signal.asset) })}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Countdown Timer Hook
// ============================================================================
function useCountdown(startTime: string | undefined, durationSec: number) {
  const [remaining, setRemaining] = useState(durationSec);

  useEffect(() => {
    if (!startTime) { setRemaining(durationSec); return; }
    const start = new Date(startTime).getTime();
    const update = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setRemaining(Math.max(0, durationSec - elapsed));
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [startTime, durationSec]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = (remaining / durationSec) * 100;
  return { remaining, label: `${mins}:${secs.toString().padStart(2, '0')}`, pct };
}

// ============================================================================
// Derive Market Info & Technical Overview from signal data
// ============================================================================
function deriveMarketInfo(signal: OTCSignal) {
  const rsi = signal.indicators?.find(i => i.name.includes('RSI'));
  const macd = signal.indicators?.find(i => i.name.includes('MACD'));
  const ema = signal.indicators?.find(i => i.name.includes('EMA'));

  const rsiVal = rsi?.value ?? 50;
  const volatility = signal.riskLevel === 'HIGH' || signal.riskLevel === 'EXTREME' ? 'High' : signal.riskLevel === 'MEDIUM' ? 'Medium' : 'Low';
  const trendStrength = Math.round(signal.confidenceScore * 0.87);
  const volumeFlow = rsiVal > 55 ? 'Rising' : rsiVal < 45 ? 'Falling' : 'Stable';
  const sentiment = signal.action === 'BUY' ? 'Bullish' : 'Bearish';

  const rsiLabel = rsiVal > 70 ? 'Overbought' : rsiVal < 30 ? 'Oversold' : 'Neutral';
  const macdLabel = macd ? (macd.signal === 'BUY' ? 'Bullish' : 'Bearish') : 'Neutral';
  const emaLabel = ema ? (ema.signal === 'BUY' ? 'Above' : 'Below') : 'At';
  const stochastic = rsiVal > 60 ? 'Overbought' : rsiVal < 40 ? 'Oversold' : 'Neutral';
  const parabolicSar = signal.action === 'BUY' ? 'Bullish' : signal.action === 'SELL' ? 'Bearish' : 'Neutral';
  const envelope = rsiVal > 60 ? 'Upper Band' : rsiVal < 40 ? 'Lower Band' : 'Middle Band';

  return {
    market: [
      { label: 'Volatility:', value: volatility, color: volatility === 'Low' ? '' : volatility === 'Medium' ? 'text-yellow-500' : 'text-loss' },
      { label: 'Trend Strength:', value: `${trendStrength}%`, color: 'text-primary' },
      { label: 'Volume Flow:', value: volumeFlow, color: '' },
      { label: 'Sentiment:', value: sentiment, color: sentiment === 'Bullish' ? 'text-profit' : 'text-loss' },
    ],
    technical: [
      { label: 'Moving Average:', value: emaLabel, color: '' },
      { label: 'RSI:', value: rsiLabel, color: rsiLabel === 'Neutral' ? 'text-primary' : rsiLabel === 'Overbought' ? 'text-loss' : 'text-profit' },
      { label: 'Stochastic:', value: stochastic, color: stochastic === 'Neutral' ? 'text-primary' : stochastic === 'Overbought' ? 'text-loss' : 'text-profit' },
      { label: 'Parabolic SAR:', value: parabolicSar, color: parabolicSar === 'Bullish' ? 'text-profit' : parabolicSar === 'Bearish' ? 'text-loss' : 'text-primary' },
      { label: 'Envelope Trend:', value: envelope, color: '' },
    ],
  };
}

// ============================================================================
// Signal notification sound — synthesized "tiiiiing" via Web Audio API
// ============================================================================
function playSignalSound(existingCtx?: AudioContext | null) {
  try {
    const ctx = (existingCtx && existingCtx.state !== 'closed')
      ? existingCtx
      : new (window.AudioContext || (window as any).webkitAudioContext)();
    // Resume if suspended (browser requires user-gesture unlock)
    if (ctx.state === 'suspended') void ctx.resume();
    const now = ctx.currentTime;

    // Single clean "ting" — sharp attack, long natural decay
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2637, now); // E7 — bright bell note

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.005);  // instant sharp attack
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2); // long slow fade "ting......"

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 2.1);

    if (!existingCtx) setTimeout(() => ctx.close(), 2500);
  } catch {
    // Audio not supported — fail silently
  }
}

export default function SignalsOTCPage() {
  const { isAuthenticated, hasActiveSubscription } = useAuthStore();
  const hasSubscription = hasActiveSubscription();
  const { t } = useI18n();
  const [otcAsset, setOtcAsset] = useState('EURUSD_OTC');
  const [otcTimeframe, setOtcTimeframe] = useState('M1');
  const [otcLoading, setOtcLoading] = useState(false);
  const [otcSignals, setOtcSignals] = useState<OTCSignal[]>([]);
  const [otcError, setOtcError] = useState('');
  const [otcNoSignal, setOtcNoSignal] = useState(false);
  const [signalActive, setSignalActive] = useState(false);
  const expirationTimer = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Popup states
  const [showToast, setShowToast] = useState(false);
  const [showBottomNotif, setShowBottomNotif] = useState(false);
  const [toastSignal, setToastSignal] = useState<OTCSignal | null>(null);
  const [showSubPopup, setShowSubPopup] = useState(false);

  // Custom asset dropdown
  const [assetOpen, setAssetOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const assetBtnRef = useRef<HTMLButtonElement>(null);
  const assetDropRef = useRef<HTMLDivElement>(null);
  const assetListRef = useRef<HTMLDivElement>(null);
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        assetDropRef.current && !assetDropRef.current.contains(e.target as Node) &&
        assetBtnRef.current && !assetBtnRef.current.contains(e.target as Node)
      ) {
        setAssetOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Determine direction (up or down) when opening
  const toggleAssetDropdown = () => {
    if (!assetOpen && assetBtnRef.current) {
      const rect = assetBtnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 280);
    }
    setAssetOpen(prev => !prev);
  };

  // Scroll selected item into view when dropdown opens
  useEffect(() => {
    if (assetOpen && assetListRef.current) {
      const selected = assetListRef.current.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'center' });
      }
    }
  }, [assetOpen]);

  // Arrow scroll helpers
  const startScroll = (dir: 'up' | 'down') => {
    if (!assetListRef.current) return;
    const step = dir === 'up' ? -36 : 36;
    assetListRef.current.scrollBy({ top: step, behavior: 'smooth' });
    scrollInterval.current = setInterval(() => {
      assetListRef.current?.scrollBy({ top: step, behavior: 'smooth' });
    }, 120);
  };
  const stopScroll = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };

  // Clear expiration timer on unmount
  useEffect(() => {
    return () => { if (expirationTimer.current) clearTimeout(expirationTimer.current); };
  }, []);

  const handleStartSignals = useCallback(async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (!hasSubscription) {
      setShowSubPopup(true);
      return;
    }
    setOtcLoading(true);
    // Unlock AudioContext during user gesture (before async API call)
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      void audioCtxRef.current.resume();
    } catch {}
    setOtcError('');
    setOtcNoSignal(false);
    setSignalActive(true);
    // Clear any previous expiration timer
    if (expirationTimer.current) clearTimeout(expirationTimer.current);
    try {
      const { data } = await signalsApi.generate('FOREX_OTC', otcAsset, otcTimeframe);
      if (data.success && data.data) {
        const newSignal = data.data;
        setOtcSignals(prev => [newSignal, ...prev].slice(0, 10));
        // Play notification sound
        playSignalSound(audioCtxRef.current);
        // Trigger both popup notifications
        setToastSignal(newSignal);
        setShowToast(true);
        setTimeout(() => setShowBottomNotif(true), 400);
        // Set expiration timer based on timeframe
        const durationMs = (otcTimeframe === 'M1' ? 60 : otcTimeframe === 'M2' ? 120 : otcTimeframe === 'M3' ? 180 : otcTimeframe === 'M4' ? 240 : otcTimeframe === 'M5' ? 300 : otcTimeframe === 'M15' ? 900 : 1800) * 1000;
        expirationTimer.current = setTimeout(() => {
          setSignalActive(false);
          setOtcSignals([]);
        }, durationMs);
      } else {
        // No high-confidence signal found — this is expected and normal
        setOtcNoSignal(true);
        setSignalActive(false);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Connection error';
      setOtcError(msg);
      setSignalActive(false);
    } finally {
      setOtcLoading(false);
    }
  }, [otcAsset, otcTimeframe, isAuthenticated, hasSubscription]);

  // Signal duration in seconds based on timeframe
  const signalDuration = otcTimeframe === 'M1' ? 60 : otcTimeframe === 'M2' ? 120 : otcTimeframe === 'M3' ? 180 : otcTimeframe === 'M4' ? 240 : otcTimeframe === 'M5' ? 300 : otcTimeframe === 'M15' ? 900 : 1800;

  return (
    <div className="space-y-6">
      {/* Subscription Required Popup */}
      {showSubPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowSubPopup(false)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>
              </svg>
            </button>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl">🔒</span>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('bot.subRequired')}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t('bot.subRequiredDesc')}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowSubPopup(false)}
                className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
              >
                {t('bot.close')}
              </button>
              <a
                href="/tarifs"
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                {t('bot.subRequiredCta')}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification (top-right, red) ── */}
      {showToast && toastSignal && (
        <ToastNotification signal={toastSignal} onClose={() => setShowToast(false)} t={t} />
      )}

      {/* ── Bottom-right Notification ── */}
      {showBottomNotif && toastSignal && (
        <BottomNotification signal={toastSignal} onClose={() => setShowBottomNotif(false)} t={t} />
      )}

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-xl sm:text-2xl">
          ⚡
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">{t('sigOtc.title')}</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">{t('sigOtc.desc')}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Trading Bot Settings */}
        <div className="signal-card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-1">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <h3 className="text-lg font-bold">{t('sigOtc.botSettings')}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{t('sigOtc.configureSettings')}</p>

          {/* Category — locked to Forex OTC */}
          <div className="mb-5">
            <label className="text-sm font-medium mb-1.5 block">{t('sigOtc.category')}</label>
            <div className="relative">
              <select
                value="FOREX_OTC"
                disabled
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-secondary/50 text-foreground appearance-none cursor-not-allowed pr-10"
              >
                <option value="FOREX_OTC">Forex OTC</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-primary">Open 24/7</span>
              <span className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 bg-profit rounded-full animate-pulse" />
                <span className="text-profit font-medium">Open</span>
              </span>
            </div>
          </div>

          {/* Asset — Custom Dropdown with scroll arrows */}
          <div className="mb-5">
            <label className="text-sm font-medium mb-1.5 block">{t('sigOtc.asset')}</label>
            <div className="relative">
              {/* Trigger button */}
              <button
                ref={assetBtnRef}
                type="button"
                onClick={toggleAssetDropdown}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm text-left cursor-pointer pr-10 hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {otcAssets.find(a => a.value === otcAsset)?.label || otcAsset}
              </button>
              <svg className={cn('absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none transition-transform', assetOpen && (dropUp ? 'rotate-180' : 'rotate-180'))} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>

              {/* Dropdown panel */}
              {assetOpen && (
                <div
                  ref={assetDropRef}
                  className={cn(
                    'absolute left-0 right-0 z-50 bg-card border border-border rounded-lg shadow-xl flex flex-col',
                    dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
                  )}
                  style={{ maxHeight: '260px' }}
                >
                  {/* Up arrow */}
                  <button
                    type="button"
                    onMouseDown={() => startScroll('up')}
                    onMouseUp={stopScroll}
                    onMouseLeave={stopScroll}
                    className="flex items-center justify-center py-1 hover:bg-secondary/50 transition-colors border-b border-border/50 shrink-0"
                  >
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>

                  {/* Scrollable list */}
                  <div ref={assetListRef} className="overflow-y-auto flex-1" style={{ maxHeight: '220px' }}>
                    {otcAssets.map((a) => (
                      <button
                        key={a.value}
                        type="button"
                        data-selected={a.value === otcAsset ? 'true' : undefined}
                        onClick={() => { setOtcAsset(a.value); setAssetOpen(false); }}
                        className={cn(
                          'w-full text-left px-4 py-1.5 text-sm transition-colors flex items-center gap-2',
                          a.value === otcAsset
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground hover:bg-secondary/50'
                        )}
                      >
                        {a.value === otcAsset && (
                          <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        )}
                        <span className={a.value !== otcAsset ? 'ml-5.5' : ''}>{a.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Down arrow */}
                  <button
                    type="button"
                    onMouseDown={() => startScroll('down')}
                    onMouseUp={stopScroll}
                    onMouseLeave={stopScroll}
                    className="flex items-center justify-center py-1 hover:bg-secondary/50 transition-colors border-t border-border/50 shrink-0"
                  >
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              )}
            </div>

            {/* Selected asset display */}
            <div className="mt-1.5">
              <span className="text-xs text-primary font-medium">
                {otcAssets.find(a => a.value === otcAsset)?.label || otcAsset}
              </span>
            </div>
          </div>

          {/* Timeframe */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-1.5 block">{t('sigOtc.timeframe')}</label>
            <div className="relative">
              <select
                value={otcTimeframe}
                onChange={(e) => setOtcTimeframe(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground appearance-none cursor-pointer pr-10 hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {otcTimeframes.map((tf) => (
                  <option key={tf.value} value={tf.value}>{tf.label}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Start / Signal Active / Login / Subscribe Button */}
          <button
            onClick={handleStartSignals}
            disabled={otcLoading || signalActive}
            className={cn(
              'w-full py-3 rounded-lg font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2',
              !isAuthenticated
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
                : !hasSubscription
                  ? 'bg-background border border-border text-foreground hover:border-primary/50 hover:bg-secondary/30 cursor-pointer shadow-sm'
                  : otcLoading
                    ? 'bg-primary/60 text-primary-foreground cursor-wait'
                    : signalActive
                      ? 'bg-gray-500 text-white cursor-not-allowed opacity-80'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-md'
            )}
          >
            {!isAuthenticated ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                <span>{t('sigOtc.loginToSignals')}</span>
              </>
            ) : !hasSubscription ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17h4v-6H3v6zm5 0h4V7H8v10zm5 0h4V3h-4v14z"/></svg>
                <span>{t('sigOtc.startSignals')}</span>
              </>
            ) : otcLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                <span>{t('sigOtc.searching')}</span>
              </>
            ) : signalActive ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                <span>{t('sigOtc.signalActive')}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17h4v-6H3v6zm5 0h4V7H8v10zm5 0h4V3h-4v14z"/></svg>
                <span>{t('sigOtc.startSignals')}</span>
              </>
            )}
          </button>

          {/* No-signal info (amber, not red — this is expected behavior) */}
          {otcNoSignal && !otcError && (
            <div className="mt-3 flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2.5">
              <svg className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" /></svg>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                {t('sigOtc.noSignalInfo')}
              </p>
            </div>
          )}

          {/* Technical error */}
          {otcError && (
            <p className="mt-3 text-sm text-loss text-center">{otcError}</p>
          )}

          {/* OTC disclaimer */}
          <div className="mt-4 flex items-start gap-2 bg-secondary/40 rounded-lg px-3 py-2.5">
            <svg className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t('sigOtc.dataDisclaimer')}
            </p>
          </div>
        </div>

        {/* Right: Active Signals — Redesigned like realtimetradesignals.com */}
        <div className="signal-card">
          <div className="p-4 sm:p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
              <h3 className="text-lg font-bold">{t('sigOtc.activeSignals')}</h3>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {otcSignals.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-400/20 flex items-center justify-center mb-4 animate-pulse">
                  <svg className="w-9 h-9 text-yellow-400" style={{filter:'drop-shadow(0 0 10px rgba(250,204,21,0.9))'}} fill="currentColor" viewBox="0 0 24 24"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"/></svg>
                </div>
                <p className="font-semibold text-foreground mb-2">{t('sigOtc.noActive')}</p>
                <p className="text-sm text-muted-foreground max-w-[280px]">
                  {t('sigOtc.noActiveDesc')}
                </p>
              </div>
            ) : (
              /* Signal cards */
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {otcSignals.map((signal, idx) => (
                  <ActiveSignalCard
                    key={signal.id || idx}
                    signal={signal}
                    duration={signalDuration}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Active Signal Card — matches realtimetradesignals.com layout
// ============================================================================
function ActiveSignalCard({ signal, duration, t }: { signal: OTCSignal; duration: number; t: (key: string, params?: Record<string, any>) => string }) {
  const { label: timeLabel, pct: timePct } = useCountdown(signal.createdAt, duration);
  const info = deriveMarketInfo(signal);
  const assetLabel = formatAssetLabel(signal.asset);
  const genDate = signal.createdAt ? new Date(signal.createdAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';

  return (
    <div className="border border-border rounded-xl p-3 sm:p-5 bg-card animate-slide-in">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
        <div>
          <h4 className="font-bold text-sm sm:text-base">{t('sigOtc.activeTradingSignal')}</h4>
          <p className="text-xs text-muted-foreground">{t('sigOtc.generated')}: {genDate}</p>
        </div>
        <div className="sm:text-right">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">{t('sigOtc.expiresIn')}: <span className="text-foreground font-bold">{timeLabel}</span></span>
          <div className="flex items-center gap-1 sm:justify-end mt-0.5">
            <span className="w-1.5 h-1.5 bg-profit rounded-full animate-pulse" />
            <span className="text-xs text-profit font-medium">{t('sigOtc.liveData')}</span>
          </div>
        </div>
      </div>

      {/* Asset + Action */}
      <div className="text-center my-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-xl">📈</span>
          <span className="text-xl font-bold">{assetLabel}</span>
        </div>
        <p className={cn(
          'text-lg font-bold tracking-wide',
          signal.action === 'BUY' ? 'text-profit' : 'text-loss'
        )}>
          {signal.action === 'BUY' ? '▲' : '▼'} {signal.action} SIGNAL
        </p>
      </div>

      {/* Market Info + Technical Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-5">
        {/* Market Info */}
        <div>
          <h5 className="font-bold text-sm mb-2">{t('sigOtc.marketInfo')}</h5>
          <div className="space-y-1.5">
            {info.market.map((item) => (
              <div key={item.label} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={cn('font-medium', item.color)}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Technical Overview */}
        <div>
          <h5 className="font-bold text-sm mb-2">{t('sigOtc.technicalOverview')}</h5>
          <div className="space-y-1.5">
            {info.technical.map((item) => (
              <div key={item.label} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={cn('font-medium', item.color)}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signal Strength */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-bold">{t('sigOtc.signalStrength')}</span>
          <span className="font-bold">{signal.confidenceScore}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-1000', signal.confidenceScore >= 80 ? 'bg-loss' : signal.confidenceScore >= 60 ? 'bg-yellow-500' : 'bg-profit')}
            style={{ width: `${signal.confidenceScore}%` }}
          />
        </div>
      </div>

      {/* Time Remaining */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-bold">{t('sigOtc.timeRemaining')}</span>
          <span className="font-bold">{timeLabel}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-1000', timePct > 50 ? 'bg-loss' : timePct > 20 ? 'bg-yellow-500' : 'bg-muted-foreground')}
            style={{ width: `${timePct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
