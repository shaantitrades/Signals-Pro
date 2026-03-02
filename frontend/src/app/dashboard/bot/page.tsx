'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn, getCategoryIcon, getTimeframeLabel, getRiskLevelColor, formatPrice } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

// ============================================================================
// Asset data by category
// ============================================================================

const assetsByCategory: Record<string, string[]> = {
  FOREX_OTC: [
    'EURUSD_OTC', 'GBPUSD_OTC', 'USDJPY_OTC', 'USDCHF_OTC', 'AUDUSD_OTC', 'USDCAD_OTC', 'NZDUSD_OTC',
    'EURGBP_OTC', 'EURJPY_OTC', 'GBPJPY_OTC', 'EURAUD_OTC', 'EURCAD_OTC', 'EURCHF_OTC', 'EURNZD_OTC',
    'GBPAUD_OTC', 'GBPCAD_OTC', 'GBPCHF_OTC', 'GBPNZD_OTC', 'AUDCAD_OTC', 'AUDCHF_OTC',
    'AUDJPY_OTC', 'AUDNZD_OTC', 'CADJPY_OTC', 'CADCHF_OTC', 'CHFJPY_OTC', 'NZDJPY_OTC', 'NZDCAD_OTC',
  ],
  FOREX: [
    // Majors
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
    // Minors / Crosses
    'EURGBP', 'EURJPY', 'GBPJPY', 'EURAUD', 'EURCAD', 'EURCHF', 'EURNZD',
    'GBPAUD', 'GBPCAD', 'GBPCHF', 'GBPNZD',
    'AUDCAD', 'AUDCHF', 'AUDJPY', 'AUDNZD',
    'CADJPY', 'CADCHF', 'CHFJPY', 'NZDJPY', 'NZDCAD', 'NZDCHF',
  ],
  CRYPTO: [
    'BTCUSD', 'ETHUSD', 'BNBUSD', 'SOLUSD', 'XRPUSD', 'ADAUSD',
    'DOTUSD', 'DOGEUSD', 'AVAXUSD', 'LINKUSD', 'MATICUSD', 'UNIUSD',
    'ATOMUSD', 'LTCUSD', 'NEARUSD', 'APTUSD', 'ARBUSD', 'OPUSD',
    'FILUSD', 'AABORUSD', 'TRXUSD', 'SHIBUSD', 'XLMUSD', 'ALGOUSD',
  ],
  INDICES: [
    'US30', 'US500', 'USTEC', 'DE40', 'UK100', 'JP225',
    'FR40', 'EU50', 'AU200', 'HK50', 'CN50', 'ES35',
    'IT40', 'NL25', 'CH20', 'VIX', 'US2000', 'SG30',
  ],
  COMMODITIES: [
    'XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL', 'NATGAS', 'COPPER',
    'XPTUSD', 'XPDUSD', 'WHEAT', 'CORN', 'SOYBEAN', 'COFFEE',
    'SUGAR', 'COTTON', 'COCOA', 'LUMBER',
  ],
};

const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'];
const riskLevels = ['LOW', 'MEDIUM', 'HIGH'];

const categories = [
  { value: 'FOREX_OTC', labelKey: 'cat.forexOtc', descKey: 'cat.forexOtcDesc', icon: '🔄' },
  { value: 'FOREX', labelKey: 'cat.forex', descKey: 'cat.forexDesc', icon: '💱' },
  { value: 'CRYPTO', labelKey: 'cat.crypto', descKey: 'cat.cryptoDesc', icon: '₿' },
  { value: 'INDICES', labelKey: 'cat.indices', descKey: 'cat.indicesDesc', icon: '📈' },
  { value: 'COMMODITIES', labelKey: 'cat.commodities', descKey: 'cat.commoditiesDesc', icon: '🪙' },
];

// Active signals are fetched from the backend API (DB-backed, always available)

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\d*\/?$/, '').replace(/\/+$/, '');

async function fetchRealSignal(
  category: string,
  asset: string,
  timeframes: string[]
): Promise<any | null> {
  // Try fetching from backend API (DB-backed), which always has signals
  try {
    const res = await fetch(`${API_URL}/api/signals/recent?category=${category}&min_confidence=50&limit=10`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.signals && data.signals.length > 0) {
      // Find a signal matching the requested asset
      const match = data.signals.find((s: any) => s.asset === asset);
      if (match) {
        return {
          id: match.id || `${asset}-${Date.now()}`,
          asset: match.asset,
          action: match.action,
          entryPrice: match.entry_price,
          tp1: match.tp1,
          sl: match.sl,
          confidence: Math.round(match.confidence),
          timeframe: match.timeframe,
          time: 'now',
          category,
        };
      }
    }
  } catch {
    // Backend not available
  }
  return null;
}

export default function BotPage() {
  const { t } = useI18n();
  const { hasActiveSubscription } = useAuthStore();
  const hasSubscription = hasActiveSubscription();
  const [showSubPopup, setShowSubPopup] = useState(false);
  // ── Trading Bot State ──
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedTimeframes, setSelectedTimeframes] = useState<string[]>(['H1']);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<string[]>(['LOW', 'MEDIUM']);
  const [minConfidence, setMinConfidence] = useState(85);
  const [maxConcurrent, setMaxConcurrent] = useState(3);
  const [riskPerTrade, setRiskPerTrade] = useState(2);
  const [isBotRunning, setIsBotRunning] = useState(false);

  // ── Active Signals State (real-time from signal engine) ──
  const [activeSignals, setActiveSignals] = useState<any[]>([]);
  const [loadingActive, setLoadingActive] = useState(true);

  // Fetch active signals from backend API (DB-backed)
  useEffect(() => {
    async function fetchActiveSignals() {
      setLoadingActive(true);
      const signals: any[] = [];

      try {
        const res = await fetch(`${API_URL}/api/signals/recent?min_confidence=75&limit=20`);
        if (res.ok) {
          const data = await res.json();
          if (data.signals) {
            data.signals.slice(0, 6).forEach((s: any, i: number) => {
              signals.push({
                id: s.id || `${s.category}-${i}`,
                asset: s.asset || 'N/A',
                action: s.action || 'BUY',
                entryPrice: s.entry_price || 0,
                currentPrice: s.entry_price || 0,
                tp1: s.tp1 || 0,
                sl: s.sl || 0,
                confidence: Math.round(s.confidence || 0),
                time: s.created_at ? new Date(s.created_at).toLocaleTimeString() : 'Live',
                status: s.status || 'ACTIVE',
              });
            });
          }
        }
      } catch {
        // Backend not available
      }

      signals.sort((a, b) => b.confidence - a.confidence);
      setActiveSignals(signals.slice(0, 4));
      setLoadingActive(false);
    }

    fetchActiveSignals();
    const interval = setInterval(fetchActiveSignals, 60000);
    return () => clearInterval(interval);
  }, []);

  // ── Signal Popup State ──
  const [signalPopup, setSignalPopup] = useState<any>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const signalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastSignalPerAssetRef = useRef<Record<string, number>>({}); // asset -> timestamp
  const ASSET_COOLDOWN_MS = 120_000; // 2 min cooldown per asset

  // Play notification sound (ting ting ting tiing)
  const playSignalSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const playTing = (time: number, freq: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.start(time);
        osc.stop(time + duration);
      };

      // ting ting ting tiiiing
      playTing(now, 1200, 0.15);
      playTing(now + 0.2, 1200, 0.15);
      playTing(now + 0.4, 1200, 0.15);
      playTing(now + 0.65, 1600, 0.4); // higher, longer final note
    } catch (e) {
      console.log('Audio not available');
    }
  }, []);

  // Schedule real signal fetching when bot is running
  useEffect(() => {
    if (isBotRunning && selectedAssets.length > 0) {
      let cancelled = false;
      const scheduleNext = () => {
        const delay = 15000 + Math.random() * 15000; // 15-30 seconds
        signalTimerRef.current = setTimeout(async () => {
          if (cancelled) return;

          // Pick a random asset that isn't in cooldown
          const now = Date.now();
          const availableAssets = selectedAssets.filter((a) => {
            const last = lastSignalPerAssetRef.current[a];
            return !last || now - last >= ASSET_COOLDOWN_MS;
          });

          if (availableAssets.length === 0) {
            scheduleNext(); // All in cooldown, try again later
            return;
          }

          const asset = availableAssets[Math.floor(Math.random() * availableAssets.length)];

          const signal = await fetchRealSignal(
            selectedCategory,
            asset,
            selectedTimeframes
          );

          if (signal && !cancelled) {
            // Check confidence meets user's minimum
            if (signal.confidence >= minConfidence) {
              lastSignalPerAssetRef.current[asset] = Date.now();
              setSignalPopup(signal);
              setPopupVisible(true);
              playSignalSound();

              // Auto-hide popup after 15 seconds
              setTimeout(() => setPopupVisible(false), 15000);
            }
          }

          if (!cancelled) scheduleNext();
        }, delay);
      };
      scheduleNext();

      return () => {
        cancelled = true;
        if (signalTimerRef.current) {
          clearTimeout(signalTimerRef.current);
          signalTimerRef.current = null;
        }
      };
    }

    return () => {
      if (signalTimerRef.current) {
        clearTimeout(signalTimerRef.current);
        signalTimerRef.current = null;
      }
    };
  }, [isBotRunning, selectedCategory, selectedAssets, selectedTimeframes, minConfidence, playSignalSound]);

  const handleStartStop = () => {
    // Gate: non-subscribers can use Bot for Crypto + Indices freely
    // Only OTC and Forex require a subscription
    const premiumOnlyCategories = ['FOREX_OTC', 'FOREX', 'COMMODITIES'];
    if (!isBotRunning && !hasSubscription && premiumOnlyCategories.includes(selectedCategory || '')) {
      setShowSubPopup(true);
      return;
    }
    if (isBotRunning) {
      setPopupVisible(false);
      setSignalPopup(null);
    }
    setIsBotRunning(!isBotRunning);
  };

  const toggleAsset = (asset: string) => {
    setSelectedAssets(prev =>
      prev.includes(asset) ? prev.filter(a => a !== asset) : [...prev, asset]
    );
  };

  const toggleTimeframe = (tf: string) => {
    setSelectedTimeframes(prev =>
      prev.includes(tf) ? prev.filter(t => t !== tf) : [...prev, tf]
    );
  };

  const toggleRiskLevel = (level: string) => {
    setSelectedRiskLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  return (
    <div className="space-y-8">

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

            {/* Header */}
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <span className="text-3xl">👑</span>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-1">Fonctionnalité Premium</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Forex, OTC et Matières Premières sont réservés aux membres Premium.
            </p>

            {/* Price highlight */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-5">
              <p className="text-xs text-muted-foreground mb-0.5">Accès complet dès</p>
              <p className="text-3xl font-extrabold text-primary">6€<span className="text-base font-medium text-muted-foreground">/mois</span></p>
            </div>

            {/* Features list */}
            <ul className="text-sm text-left space-y-2 mb-6">
              {[
                '✅ Signaux Forex, OTC, Commodities',
                '✅ Trading Bot sur tous les marchés',
                '✅ Signaux Live illimités',
                '✅ Alertes en temps réel',
                '✅ Accès prioritaire aux nouveaux signaux',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="flex-1">{f}</span>
                </li>
              ))}
            </ul>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowSubPopup(false)}
                className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
              >
                Plus tard
              </button>
              <a
                href="/tarifs"
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                Passer Premium →
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Category Selection */}
          <div className="signal-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">1</span>
              {t('bot.category')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {categories.map((cat) => {
                const isPremiumCat = ['FOREX_OTC', 'FOREX', 'COMMODITIES'].includes(cat.value);
                const isLocked = isPremiumCat && !hasSubscription;
                return (
                  <button
                    key={cat.value}
                    onClick={() => {
                      if (isLocked) {
                        setShowSubPopup(true);
                        return;
                      }
                      setSelectedCategory(cat.value);
                      setSelectedAssets([]);
                    }}
                    className={cn(
                      'relative p-4 rounded-xl border text-center transition-all duration-200',
                      selectedCategory === cat.value
                        ? 'border-primary bg-primary/10 ring-1 ring-primary'
                        : isLocked
                          ? 'border-border opacity-75 hover:border-yellow-500/50 hover:bg-yellow-500/5'
                          : 'border-border hover:border-primary/30 hover:bg-secondary/50'
                    )}
                  >
                    {isLocked && (
                      <span className="absolute top-1.5 right-1.5 text-xs">🔒</span>
                    )}
                    <span className="text-2xl block mb-1">{cat.icon}</span>
                    <span className="font-medium text-sm block">{t(cat.labelKey)}</span>
                    <span className="text-xs text-muted-foreground">{t(cat.descKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Asset Selection */}
          {selectedCategory && (
            <div className="signal-card p-6 animate-slide-in">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">2</span>
                {t('bot.assets')} ({selectedAssets.length} {t('bot.selected')})
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const all = assetsByCategory[selectedCategory] || [];
                    setSelectedAssets(selectedAssets.length === all.length ? [] : all);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                    selectedAssets.length === (assetsByCategory[selectedCategory]?.length || 0)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/30'
                  )}
                >
                  Tous
                </button>
                {(assetsByCategory[selectedCategory] || []).map((asset) => (
                  <button
                    key={asset}
                    onClick={() => toggleAsset(asset)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                      selectedAssets.includes(asset)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    )}
                  >
                    {asset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Timeframe */}
          {selectedAssets.length > 0 && (
            <div className="signal-card p-6 animate-slide-in">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">3</span>
                Timeframes
              </h3>
              <div className="flex flex-wrap gap-2">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => toggleTimeframe(tf)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                      selectedTimeframes.includes(tf)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/30'
                    )}
                  >
                    {getTimeframeLabel(tf)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Risk Management */}
          {selectedTimeframes.length > 0 && selectedAssets.length > 0 && (
            <div className="signal-card p-6 animate-slide-in">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">4</span>
                {t('bot.riskManagement')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Min Confidence */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    {t('bot.minConfidence')} : <span className="text-primary font-medium">{minConfidence}%</span>
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Max Concurrent */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    {t('bot.maxSignals')} : <span className="text-primary font-medium">{maxConcurrent}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={maxConcurrent}
                    onChange={(e) => setMaxConcurrent(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>

                {/* Risk per trade */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    {t('bot.riskPerTrade')} : <span className="text-primary font-medium">{riskPerTrade}%</span>
                  </label>
                  <input
                    type="range"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={riskPerTrade}
                    onChange={(e) => setRiskPerTrade(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.5%</span>
                    <span>10%</span>
                  </div>
                </div>

                {/* Risk Levels */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">{t('bot.riskLevels')}</label>
                  <div className="flex gap-2">
                    {riskLevels.map((level) => (
                      <button
                        key={level}
                        onClick={() => toggleRiskLevel(level)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                          selectedRiskLevels.includes(level)
                            ? getRiskLevelColor(level) + ' border-current'
                            : 'border-border text-muted-foreground'
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bot Status Header - START/STOP */}
          <div className={cn(
            'signal-card p-4 sm:p-6 transition-all duration-300',
            isBotRunning ? 'border-profit/50 glow-green' : 'border-border'
          )}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl',
                  isBotRunning ? 'bg-profit/10' : 'bg-secondary'
                )}>
                  🤖
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">{t('bot.title')}</h2>
                  <p className="text-sm text-muted-foreground">
                    {isBotRunning 
                      ? t('bot.running', { count: selectedAssets.length })
                      : t('bot.stopped')
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isBotRunning && (
                  <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-profit/10 rounded-lg">
                    <span className="w-2 h-2 bg-profit rounded-full animate-pulse" />
                    <span className="text-profit font-medium text-sm sm:text-base">{t('bot.inProgress')}</span>
                  </div>
                )}
                <button
                  onClick={handleStartStop}
                  disabled={!selectedCategory || selectedAssets.length === 0}
                  className={cn(
                    'px-5 py-2.5 sm:px-8 sm:py-3 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap relative',
                    isBotRunning
                      ? 'bg-loss text-white hover:bg-loss/90 shadow-lg shadow-loss/20'
                      : (!hasSubscription && ['FOREX_OTC', 'FOREX', 'COMMODITIES'].includes(selectedCategory || ''))
                        ? 'bg-profit/60 text-white cursor-pointer shadow-lg shadow-profit/10'
                        : 'bg-profit text-white hover:bg-profit/90 shadow-lg shadow-profit/20'
                  )}
                >
                  {!hasSubscription && !isBotRunning && ['FOREX_OTC', 'FOREX', 'COMMODITIES'].includes(selectedCategory || '') && <span className="mr-1">🔒</span>}
                  {isBotRunning ? t('bot.stop') : t('bot.start')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Signals Panel (Right col) */}
        <div className="space-y-4">
          <div className="signal-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">{t('bot.activeSignals')}</h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {loadingActive ? '...' : activeSignals.length} {t('bot.active')}
              </span>
            </div>
            {loadingActive ? (
              <div className="p-6 text-center text-muted-foreground">
                <div className="animate-spin text-xl mb-1">⏳</div>
                <p className="text-xs">Loading...</p>
              </div>
            ) : activeSignals.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <p className="text-sm">📡</p>
                <p className="text-xs">No active signals right now</p>
              </div>
            ) : (
            <div className="divide-y divide-border">
              {activeSignals.map((signal) => (
                <div key={signal.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{signal.asset}</span>
                      <span className={cn(
                        'signal-badge text-xs',
                        signal.action === 'BUY' ? 'signal-badge-buy' : 'signal-badge-sell'
                      )}>
                        {signal.action}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{signal.time}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-muted-foreground">{t('bot.entry')} : </span>
                      <span className="font-medium">{signal.entryPrice > 0 ? signal.entryPrice : '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">TP1 : </span>
                      <span className="font-medium text-profit">{signal.tp1 > 0 ? signal.tp1 : '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">SL : </span>
                      <span className="font-medium text-loss">{signal.sl > 0 ? signal.sl : '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('bot.confidence')} : </span>
                      <span className="font-medium">{signal.confidence}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {signal.confidence}%
                    </span>
                    <div className="flex items-center gap-1.5">
                      {signal.timeframe && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded font-mono">
                          {signal.timeframe}
                        </span>
                      )}
                      <span className="text-xs bg-profit/10 text-profit px-2 py-0.5 rounded">
                        LIVE
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Bot Summary */}
          <div className="signal-card p-4">
            <h3 className="font-semibold mb-3">{t('bot.configSummary')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('bot.category')}</span>
                <span className="font-medium">{selectedCategory || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('bot.assets')}</span>
                <span className="font-medium">{selectedAssets.length || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timeframes</span>
                <span className="font-medium">{selectedTimeframes.join(', ') || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('bot.minConfidence')}</span>
                <span className="font-medium">{minConfidence}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('bot.maxSignals')}</span>
                <span className="font-medium">{maxConcurrent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('bot.riskPerTrade')}</span>
                <span className="font-medium">{riskPerTrade}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signal Found Popup */}
      {signalPopup && popupVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setPopupVisible(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
          
          {/* Popup */}
          <div 
            className="relative bg-card border-2 border-profit rounded-2xl shadow-2xl shadow-profit/20 w-full max-w-md animate-signal-popup"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-profit/20 via-primary/20 to-profit/20 rounded-2xl blur-lg" />
            
            <div className="relative bg-card rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-profit/10 to-primary/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-profit/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">🔔</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{t('bot.newSignal')}</h3>
                    <p className="text-xs text-muted-foreground">Trading Bot • {signalPopup.category}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPopupVisible(false)}
                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Signal content */}
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">{signalPopup.asset}</span>
                    <span className={cn(
                      'px-3 py-1 rounded-lg text-sm font-bold text-white',
                      signalPopup.action === 'BUY' ? 'bg-profit' : 'bg-loss'
                    )}>
                      {signalPopup.action}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground">{t('dash.confidence')}</span>
                    <div className="text-xl font-bold text-primary">{signalPopup.confidence}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{t('bot.entry')}</p>
                    <p className="font-bold text-sm">{signalPopup.entryPrice}</p>
                  </div>
                  <div className="bg-profit/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Take Profit</p>
                    <p className="font-bold text-sm text-profit">{signalPopup.tp1}</p>
                  </div>
                  <div className="bg-loss/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Stop Loss</p>
                    <p className="font-bold text-sm text-loss">{signalPopup.sl}</p>
                  </div>
                </div>

                {/* Pulsing indicator */}
                <div className="flex items-center justify-center gap-2 py-2 bg-profit/5 rounded-lg">
                  <span className="w-2 h-2 bg-profit rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-profit">{t('bot.signalActiveNow')}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-5 flex gap-3">
                <button
                  onClick={() => setPopupVisible(false)}
                  className="flex-1 px-4 py-2.5 bg-secondary rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  {t('bot.close')}
                </button>
                <button
                  onClick={() => setPopupVisible(false)}
                  className="flex-1 px-4 py-2.5 bg-profit text-white rounded-xl text-sm font-bold hover:bg-profit/90 transition-colors"
                >
                  {t('bot.viewSignal')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
