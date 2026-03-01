'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn, formatPrice, getTimeframeLabel, getRiskLevelColor } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\d*\/?$/, '').replace(/\/+$/, '');

// ============================================================================
// Market Hours Detection
// ============================================================================

interface MarketStatus {
  isOpen: boolean;
  message: string;
  icon: string;
  opensAt: string;
}

/**
 * Check if a market category is currently open (Paris time).
 * - FOREX: Mon 00:00 → Fri 23:00 — closed weekends
 * - CRYPTO: 24/7/365
 * - INDICES: Mon-Fri ~08:00 → 22:30 — closed nights & weekends
 * - COMMODITIES: Mon-Fri ~01:00 → 22:00 — closed weekends
 * - FOREX_OTC: 24/7
 */
function getMarketStatus(category: string): MarketStatus {
  const now = new Date();
  const parisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  const day = parisTime.getDay(); // 0=Sun, 6=Sat
  const hour = parisTime.getHours();
  const minutes = parisTime.getMinutes();
  const timeDecimal = hour + minutes / 60;

  const isWeekend = day === 0 || day === 6;
  const isFriday = day === 5;

  switch (category) {
    case 'CRYPTO':
    case 'FOREX_OTC':
      return { isOpen: true, message: '', icon: '', opensAt: '' };

    case 'FOREX': {
      if (isWeekend && !(day === 0 && hour >= 23)) {
        return { isOpen: false, message: 'sig.marketClosedForex', icon: '💱', opensAt: 'sig.opensMonday' };
      }
      if (isFriday && hour >= 23) {
        return { isOpen: false, message: 'sig.marketClosedForex', icon: '💱', opensAt: 'sig.opensMonday' };
      }
      return { isOpen: true, message: '', icon: '', opensAt: '' };
    }

    case 'INDICES': {
      if (isWeekend) {
        return { isOpen: false, message: 'sig.marketClosedIndices', icon: '📈', opensAt: 'sig.opensMonday' };
      }
      if (timeDecimal < 8 || timeDecimal >= 22.5) {
        return { isOpen: false, message: 'sig.marketClosedIndicesNight', icon: '📈', opensAt: 'sig.opens8am' };
      }
      return { isOpen: true, message: '', icon: '', opensAt: '' };
    }

    case 'COMMODITIES': {
      if (isWeekend) {
        return { isOpen: false, message: 'sig.marketClosedCommodities', icon: '🪙', opensAt: 'sig.opensMonday' };
      }
      if (timeDecimal < 1 || timeDecimal >= 22) {
        return { isOpen: false, message: 'sig.marketClosedCommoditiesNight', icon: '🪙', opensAt: 'sig.opens1am' };
      }
      return { isOpen: true, message: '', icon: '', opensAt: '' };
    }

    default:
      return { isOpen: true, message: '', icon: '', opensAt: '' };
  }
}

// ============================================================================
// Types
// ============================================================================

interface Signal {
  id: string;
  asset: string;
  category: string;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  tp1: number;
  tp2: number | null;
  tp3: number | null;
  sl: number;
  confidence: number;
  riskLevel: string;
  timeframe: string;
  status: string;
  pnlPips: number;
  createdAt: string;
  validations: { ai: boolean; human: boolean; market: boolean };
}

// Scan config: which category → which timeframes
const SCAN_TIMEFRAMES: Record<string, string[]> = {
  FOREX_OTC: ['M5', 'M15', 'H1'],
  FOREX: ['M15', 'H1', 'H4'],
  CRYPTO: ['M15', 'H1', 'H4'],
  INDICES: ['H1', 'D1'],
  COMMODITIES: ['H1', 'H4'],
};

const categoryFilters = [
  { value: '', labelKey: 'sig.all', icon: '📊' },
  { value: 'FOREX', labelKey: 'cat.forex', icon: '💱' },
  { value: 'CRYPTO', labelKey: 'cat.crypto', icon: '₿' },
  { value: 'INDICES', labelKey: 'cat.indices', icon: '📈' },
  { value: 'COMMODITIES', labelKey: 'sig.commodities', icon: '🪙' },
];

const strengthFilters = [
  { value: '', labelKey: 'sig.all', min: 0 },
  { value: 'strong', labelKey: '', label: '90%+', min: 90 },
  { value: 'good', labelKey: '', label: '80-89%', min: 80 },
  { value: 'moderate', labelKey: '', label: '70-79%', min: 70 },
];

// ============================================================================
// localStorage helpers — persist seen signal IDs and trigger times
// ============================================================================
const SEEN_IDS_KEY = 'ms24_live_seenIds';
const TRIGGER_TIMES_KEY = 'ms24_live_triggerTimes';

function getSeenIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_IDS_KEY) || '[]')); }
  catch { return new Set(); }
}
function persistSeenIds(ids: Set<string>) {
  try {
    const arr = Array.from(ids);
    if (arr.length > 500) arr.splice(0, arr.length - 500);
    localStorage.setItem(SEEN_IDS_KEY, JSON.stringify(arr));
  } catch {}
}
function getTriggerTime(id: string): string {
  try { return (JSON.parse(localStorage.getItem(TRIGGER_TIMES_KEY) || '{}') as Record<string, string>)[id] || ''; }
  catch { return ''; }
}
function saveTriggerTime(id: string, time: string) {
  try {
    const times = JSON.parse(localStorage.getItem(TRIGGER_TIMES_KEY) || '{}') as Record<string, string>;
    const keys = Object.keys(times);
    if (keys.length > 300) delete times[keys[0]];
    times[id] = time;
    localStorage.setItem(TRIGGER_TIMES_KEY, JSON.stringify(times));
  } catch {}
}

function matchesFilters(s: Signal, catFilter: string, strFilter: string, riskFilter: string): boolean {
  if (catFilter && s.category !== catFilter) return false;
  if (strFilter) {
    const f = strengthFilters.find(sf => sf.value === strFilter);
    if (f && s.confidence < f.min) return false;
  }
  if (riskFilter && s.riskLevel !== riskFilter) return false;
  return true;
}

// ============================================================================
// SignalPopup — popup 15 secondes pour tout nouveau signal correspondant aux filtres
// ============================================================================
function SignalPopup({ signal, onClose, t }: {
  signal: Signal;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const [remaining, setRemaining] = useState(15);
  const isBuy = signal.action === 'BUY';

  // Joue le son à l'ouverture
  useEffect(() => {
    playSignalSound();
  }, []);

  useEffect(() => {
    if (remaining <= 0) { onClose(); return; }
    const timer = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onClose]);

  const pct = (remaining / 15) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
        {/* Countdown bar */}
        <div className="h-1.5 rounded-t-2xl overflow-hidden bg-secondary">
          <div
            className={cn('h-full transition-all duration-1000 ease-linear', isBuy ? 'bg-profit' : 'bg-loss')}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Nouveau Signal Live</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{signal.asset}</span>
                <span className={cn(
                  'px-2.5 py-0.5 rounded font-bold text-sm',
                  isBuy ? 'bg-profit/20 text-profit' : 'bg-loss/20 text-loss'
                )}>
                  {signal.action}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
              >
                ✕
              </button>
              <span className="text-xs font-bold tabular-nums" style={{ color: remaining <= 5 ? 'var(--color-loss)' : undefined }}>
                {remaining}s
              </span>
            </div>
          </div>

          {/* Confidence */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{t('sig.confidence')}</span>
              <span className={cn('font-bold', signal.confidence >= 90 ? 'text-profit' : 'text-signal-strong')}>
                {signal.confidence}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full', signal.confidence >= 90 ? 'bg-profit' : 'bg-signal-strong')}
                style={{ width: `${signal.confidence}%` }}
              />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-secondary/50 rounded-lg p-2 text-center">
              <span className="text-[10px] text-muted-foreground block">{t('sig.entry')}</span>
              <span className="text-xs font-bold font-mono">{formatPrice(signal.entryPrice)}</span>
            </div>
            <div className="bg-profit/10 rounded-lg p-2 text-center">
              <span className="text-[10px] text-muted-foreground block">TP1</span>
              <span className="text-xs font-bold font-mono text-profit">{formatPrice(signal.tp1)}</span>
            </div>
            <div className="bg-loss/10 rounded-lg p-2 text-center">
              <span className="text-[10px] text-muted-foreground block">SL</span>
              <span className="text-xs font-bold font-mono text-loss">{formatPrice(signal.sl)}</span>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', getRiskLevelColor(signal.riskLevel))}>
                {signal.riskLevel}
              </span>
              <span className="text-xs text-muted-foreground">{signal.timeframe} • {signal.category}</span>
            </div>
            <span className="text-xs text-muted-foreground">{signal.createdAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Signal notification sound — synthesized "tiiiiing" via Web Audio API
function playSignalSound(existingCtx?: AudioContext | null) {
  try {
    const ctx = existingCtx && existingCtx.state !== 'closed'
      ? existingCtx
      : new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    const now = ctx.currentTime;
    // Ting-ting-ting-tiiiing pattern
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(880, now + 0.12);
    osc.frequency.setValueAtTime(1046, now + 0.24);
    osc.frequency.setValueAtTime(1318, now + 0.36);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.7);
    osc.start(now);
    osc.stop(now + 0.7);
  } catch (_e) {
    // Audio not supported — fail silently
  }
}

export default function SignalsPage() {
  const { t } = useI18n();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [strengthFilter, setStrengthFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [sortBy, setSortBy] = useState<'confidence' | 'pnl' | 'recent'>('confidence');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const prevSignalCountRef = useRef(0);
  // New-signal detection
  const seenSignalIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);
  const categoryFilterRef = useRef('');
  const strengthFilterRef = useRef('');
  const riskFilterRef = useRef('');
  const [newSignalPopup, setNewSignalPopup] = useState<Signal | null>(null);

  // Fetch real signals from the backend API (DB-backed, always available)
  const fetchSignals = useCallback(async () => {
    try {
      setLoading(true);
      const allSignals: Signal[] = [];

      const res = await fetch(`${API_URL}/api/signals/recent?min_confidence=50&limit=100`);
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();

      if (data.signals && Array.isArray(data.signals)) {
        for (const s of data.signals) {
          const indicatorCount = s.indicators?.length || 3;
          const buyCount = s.indicators?.filter((i: any) => i.signal === 'BUY').length || 0;
          const sellCount = s.indicators?.filter((i: any) => i.signal === 'SELL').length || 0;
          const agreeing = s.action === 'BUY' ? buyCount : sellCount;

          allSignals.push({
            id: s.id || `${s.asset}-${s.timeframe}-${Date.now()}`,
            asset: s.asset,
            category: s.category,
            action: s.action,
            entryPrice: s.entry_price,
            currentPrice: s.entry_price,
            tp1: s.tp1,
            tp2: s.tp2 || null,
            tp3: s.tp3 || null,
            sl: s.sl,
            confidence: Math.round(s.confidence),
            riskLevel: s.risk_level || 'MEDIUM',
            timeframe: s.timeframe,
            status: s.status || 'ACTIVE',
            pnlPips: s.pnl_pips || 0,
            createdAt: s.created_at ? new Date(s.created_at).toLocaleTimeString() : 'now',
            validations: {
              ai: true,
              human: agreeing >= 2,
              market: agreeing >= 3,
            },
          });
        }
      }

      // ── Detect truly new signals & match against active filters ──
      const currentSeen = seenSignalIdsRef.current;
      const newMatchingSignals: Signal[] = [];

      for (const s of allSignals) {
        const isNew = !currentSeen.has(s.id);
        if (isNew) {
          currentSeen.add(s.id);
          // Save trigger time only on first detection
          if (!getTriggerTime(s.id)) saveTriggerTime(s.id, s.createdAt);
        }
        if (isNew && isInitializedRef.current &&
            matchesFilters(s, categoryFilterRef.current, strengthFilterRef.current, riskFilterRef.current)) {
          newMatchingSignals.push(s);
        }
      }

      // Persist updated seen IDs
      persistSeenIds(currentSeen);

      // Trigger popup for the highest-confidence new matching signal
      if (newMatchingSignals.length > 0) {
        const best = newMatchingSignals.sort((a, b) => b.confidence - a.confidence)[0];
        setNewSignalPopup(best);
      }

      // Mark as initialized after first successful fetch
      isInitializedRef.current = true;

      setSignals(allSignals);
      prevSignalCountRef.current = allSignals.length;
      setLastRefresh(new Date());
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch signals');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch live prices from signal-engine (via backend proxy) and update signals
  const fetchLivePrices = useCallback(async () => {
    try {
      const currentSignals = signals;
      if (currentSignals.length === 0) return;
      const assets = Array.from(new Set(currentSignals.map(s => s.asset))).join(',');
      const res = await fetch(`${API_URL}/api/signals/prices?assets=${assets}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.prices) return;

      setSignals(prev => prev.map(s => {
        const livePrice = data.prices[s.asset];
        if (livePrice == null) return s;

        // Calculate PnL in pips
        const pipSize = s.asset.includes('JPY') ? 0.01 : s.asset.match(/USD$|^USD/) && !s.asset.includes('XAU') && !s.asset.includes('XAG') ? 0.0001 : 0.01;
        const diff = s.action === 'BUY' ? livePrice - s.entryPrice : s.entryPrice - livePrice;
        const pnlPips = Math.round(diff / pipSize);

        return { ...s, currentPrice: livePrice, pnlPips };
      }));
    } catch (_e) {
      // Silent fail — prices will just stay at entry price
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signals.length]);

  // Init seen IDs from localStorage (must be before fetchSignals runs)
  useEffect(() => {
    seenSignalIdsRef.current = getSeenIds();
  }, []);

  // Keep filter refs in sync so fetchSignals always sees latest values
  useEffect(() => { categoryFilterRef.current = categoryFilter; }, [categoryFilter]);
  useEffect(() => { strengthFilterRef.current = strengthFilter; }, [strengthFilter]);
  useEffect(() => { riskFilterRef.current = riskFilter; }, [riskFilter]);

  // Initial load + auto-refresh every 60 seconds
  useEffect(() => {
    fetchSignals();
    const interval = setInterval(() => fetchSignals(), 60_000);
    return () => clearInterval(interval);
  }, [fetchSignals]);

  // Live prices: fetch immediately when signals change, then every 30s
  useEffect(() => {
    if (signals.length === 0) return;
    fetchLivePrices();
    const priceInterval = setInterval(() => fetchLivePrices(), 30_000);
    return () => clearInterval(priceInterval);
  }, [signals.length, fetchLivePrices]);

  // Filter and sort signals
  const filteredSignals = signals
    .filter(s => !categoryFilter || s.category === categoryFilter)
    .filter(s => {
      if (!strengthFilter) return true;
      const f = strengthFilters.find(sf => sf.value === strengthFilter);
      return f ? s.confidence >= f.min : true;
    })
    .filter(s => !riskFilter || s.riskLevel === riskFilter)
    .sort((a, b) => {
      if (sortBy === 'confidence') return b.confidence - a.confidence;
      if (sortBy === 'pnl') return b.pnlPips - a.pnlPips;
      return 0; // recent - use default order
    });

  const totalPnl = filteredSignals.reduce((acc, s) => acc + s.pnlPips, 0);
  const marketStatus = getMarketStatus(categoryFilter);

  return (
    <div className="space-y-6">
      {/* New signal popup — Option B: only when matching active filters */}
      {newSignalPopup && (
        <SignalPopup
          signal={newSignalPopup}
          onClose={() => setNewSignalPopup(null)}
          t={t}
        />
      )}

      {/* Market Closed Banner */}
      {!marketStatus.isOpen && (
        <div className="signal-card p-4 border-yellow-500/40 bg-yellow-500/5">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <span className="text-xl">{marketStatus.icon}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-yellow-500 text-sm">
                🕐 {t(marketStatus.message)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t(marketStatus.opensAt)} — {t('sig.marketClosedNote')}
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 font-medium">
                {t('sig.marketClosed')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="signal-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{filteredSignals.length}</p>
          <p className="text-xs text-muted-foreground">{t('sig.activeSignals')}</p>
        </div>
        <div className="signal-card p-4 text-center">
          <p className={cn('text-2xl font-bold', totalPnl >= 0 ? 'text-profit' : 'text-loss')}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl} pips
          </p>
          <p className="text-xs text-muted-foreground">{t('sig.totalPnl')}</p>
        </div>
        <div className="signal-card p-4 text-center">
          <p className="text-2xl font-bold text-signal-strong">
            {Math.round(filteredSignals.reduce((a, s) => a + s.confidence, 0) / (filteredSignals.length || 1))}%
          </p>
          <p className="text-xs text-muted-foreground">{t('sig.avgConfidence')}</p>
        </div>
        <div className="signal-card p-4 text-center cursor-pointer hover:border-primary/30 transition-colors" onClick={() => { setLoading(true); fetchSignals(); }}>
          <div className="flex items-center justify-center gap-1">
            <span className={cn('w-2 h-2 rounded-full', error ? 'bg-loss' : 'bg-profit', !error && 'animate-pulse')} />
            <p className="text-2xl font-bold">{loading ? '...' : 'LIVE'}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {error ? '⚠ Reconnect' : `${t('sig.realTime')} • ${lastRefresh ? lastRefresh.toLocaleTimeString() : '--:--:--'}`}
          </p>
        </div>
      </div>

      {/* Sound Toggle */}
      <div className="flex justify-end -mt-2">
        <button
          onClick={() => {
            if (!soundEnabled) {
              // Unlock AudioContext on user gesture
              if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
              }
              void audioCtxRef.current.resume();
              playSignalSound(audioCtxRef.current);
            }
            setSoundEnabled(!soundEnabled);
          }}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            soundEnabled
              ? 'bg-profit/15 text-profit border border-profit/30'
              : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
          )}
        >
          {soundEnabled ? '🔔' : '🔕'} {soundEnabled ? t('sig.soundOn') : t('sig.soundOff')}
        </button>
      </div>

      {/* Loading State */}
      {loading && signals.length === 0 && (
        <div className="signal-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Scanning markets...</p>
        </div>
      )}

      {/* Error State */}
      {error && signals.length === 0 && (
        <div className="signal-card p-12 text-center border-loss/30">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-lg font-medium text-loss mb-2">Signal Engine Offline</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => { setLoading(true); fetchSignals(); }}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Filters Bar */}
      <div className="signal-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">{t('sig.category')}</label>
            <div className="flex flex-wrap gap-1">
              {categoryFilters.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                    categoryFilter === cat.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {cat.icon} {t(cat.labelKey)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Strength Filter */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t('sig.confidence')}</label>
            <div className="flex gap-1">
              {strengthFilters.map((sf) => (
                <button
                  key={sf.value}
                  onClick={() => setStrengthFilter(sf.value)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                    strengthFilter === sf.value
                      ? 'bg-signal-strong/20 text-signal-strong'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {sf.labelKey ? t(sf.labelKey) : sf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Filter */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t('sig.risk')}</label>
            <div className="flex gap-1">
              {['', 'LOW', 'MEDIUM', 'HIGH'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                    riskFilter === r
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {r || t('sig.all')}
                </button>
              ))}
            </div>
          </div>

          {/* Sort & View */}
          <div className="flex gap-2 items-end">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t('sig.sortBy')}</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-secondary text-foreground text-xs rounded-lg px-3 py-1.5 border border-border"
              >
                <option value="confidence">{t('sig.sortConfidence')}</option>
                <option value="pnl">P&L</option>
                <option value="recent">{t('sig.sortRecent')}</option>
              </select>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('cards')}
                className={cn('p-1.5 rounded-lg', viewMode === 'cards' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}
              >
                ▦
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn('p-1.5 rounded-lg', viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}
              >
                ▤
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Signal Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSignals.map((signal) => (
            <div
              key={signal.id}
              onClick={() => setExpandedSignal(expandedSignal === signal.id ? null : signal.id)}
              className={cn(
                'signal-card p-4 cursor-pointer transition-all duration-200 hover:border-primary/30',
                expandedSignal === signal.id && 'border-primary/50 ring-1 ring-primary/20'
              )}
            >
              {/* Signal Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{signal.asset}</span>
                  <span className={cn(
                    'signal-badge text-xs',
                    signal.action === 'BUY' ? 'signal-badge-buy' : 'signal-badge-sell'
                  )}>
                    {signal.action}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs px-2 py-0.5 rounded', getRiskLevelColor(signal.riskLevel))}>
                    {signal.riskLevel}
                  </span>
                  <span className="text-xs text-muted-foreground">{signal.createdAt}</span>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{t('sig.confidence')}</span>
                  <span className={cn(
                    'font-bold',
                    signal.confidence >= 90 ? 'text-profit' : signal.confidence >= 80 ? 'text-signal-strong' : 'text-signal-medium'
                  )}>
                    {signal.confidence}%
                  </span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      signal.confidence >= 90 ? 'bg-profit' : signal.confidence >= 80 ? 'bg-signal-strong' : 'bg-signal-medium'
                    )}
                    style={{ width: `${signal.confidence}%` }}
                  />
                </div>
              </div>

              {/* Triple Validation Icons */}
              <div className="flex gap-2 mb-3">
                <div className={cn(
                  'flex items-center gap-1 text-xs px-2 py-0.5 rounded',
                  signal.validations.ai ? 'bg-profit/10 text-profit' : 'bg-secondary text-muted-foreground'
                )}>
                  🤖 AI {signal.validations.ai ? '✓' : '⏳'}
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-xs px-2 py-0.5 rounded',
                  signal.validations.human ? 'bg-profit/10 text-profit' : 'bg-secondary text-muted-foreground'
                )}>
                  👤 Expert {signal.validations.human ? '✓' : '⏳'}
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-xs px-2 py-0.5 rounded',
                  signal.validations.market ? 'bg-profit/10 text-profit' : 'bg-secondary text-muted-foreground'
                )}>
                  📊 {t('sig.market')} {signal.validations.market ? '✓' : '⏳'}
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-xs text-muted-foreground">{t('sig.entry')}</span>
                  <p className="font-medium font-mono">{formatPrice(signal.entryPrice)}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">{t('sig.current')}</span>
                  <p className={cn('font-medium font-mono', signal.pnlPips >= 0 ? 'text-profit' : 'text-loss')}>
                    {formatPrice(signal.currentPrice)}
                  </p>
                </div>
              </div>

              {/* P&L */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{getTimeframeLabel(signal.timeframe)}</span>
                  <span>•</span>
                  <span>{signal.category}</span>
                </div>
                <span className={cn(
                  'font-bold',
                  signal.pnlPips >= 0 ? 'text-profit' : 'text-loss'
                )}>
                  {signal.pnlPips >= 0 ? '+' : ''}{signal.pnlPips} pips
                </span>
              </div>

              {/* Tap hint */}
              {expandedSignal !== signal.id && (
                <div className="flex items-center justify-center gap-1 mt-2 text-[11px] text-primary/70 animate-pulse">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  {t('sig.tapToExpand')}
                </div>
              )}

              {/* Expanded Details */}
              {expandedSignal === signal.id && (
                <div className="mt-4 pt-4 border-t border-border animate-slide-in">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center p-2 bg-profit/5 rounded-lg">
                      <span className="text-xs text-muted-foreground block">TP1</span>
                      <span className="font-medium text-profit">{signal.tp1}</span>
                    </div>
                    {signal.tp2 && (
                      <div className="text-center p-2 bg-profit/5 rounded-lg">
                        <span className="text-xs text-muted-foreground block">TP2</span>
                        <span className="font-medium text-profit">{signal.tp2}</span>
                      </div>
                    )}
                    {signal.tp3 && (
                      <div className="text-center p-2 bg-profit/5 rounded-lg">
                        <span className="text-xs text-muted-foreground block">TP3</span>
                        <span className="font-medium text-profit">{signal.tp3}</span>
                      </div>
                    )}
                    <div className="text-center p-2 bg-loss/5 rounded-lg">
                      <span className="text-xs text-muted-foreground block">SL</span>
                      <span className="font-medium text-loss">{signal.sl}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 py-2 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                      {t('sig.copySignal')}
                    </button>
                    <button className="py-2 px-3 text-xs font-medium bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                      {t('sig.alerts')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="signal-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium">{t('sig.asset')}</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium">{t('sig.action')}</th>
                  <th className="text-right p-3 text-xs text-muted-foreground font-medium">{t('sig.entry')}</th>
                  <th className="text-right p-3 text-xs text-muted-foreground font-medium">{t('sig.current')}</th>
                  <th className="text-right p-3 text-xs text-muted-foreground font-medium">TP1</th>
                  <th className="text-right p-3 text-xs text-muted-foreground font-medium">SL</th>
                  <th className="text-center p-3 text-xs text-muted-foreground font-medium">{t('sig.confidence')}</th>
                  <th className="text-center p-3 text-xs text-muted-foreground font-medium">{t('sig.validation')}</th>
                  <th className="text-right p-3 text-xs text-muted-foreground font-medium">P&L</th>
                </tr>
              </thead>
              <tbody>
                {filteredSignals.map((signal) => (
                  <tr key={signal.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="p-3">
                      <span className="font-medium">{signal.asset}</span>
                      <span className="text-xs text-muted-foreground block">{signal.category}</span>
                    </td>
                    <td className="p-3">
                      <span className={cn(
                        'signal-badge text-xs',
                        signal.action === 'BUY' ? 'signal-badge-buy' : 'signal-badge-sell'
                      )}>
                        {signal.action}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-sm">{formatPrice(signal.entryPrice)}</td>
                    <td className={cn('p-3 text-right font-mono text-sm', signal.pnlPips >= 0 ? 'text-profit' : 'text-loss')}>
                      {formatPrice(signal.currentPrice)}
                    </td>
                    <td className="p-3 text-right font-mono text-sm text-profit">{formatPrice(signal.tp1)}</td>
                    <td className="p-3 text-right font-mono text-sm text-loss">{formatPrice(signal.sl)}</td>
                    <td className="p-3 text-center">
                      <span className={cn(
                        'text-xs font-bold',
                        signal.confidence >= 90 ? 'text-profit' : signal.confidence >= 80 ? 'text-signal-strong' : 'text-signal-medium'
                      )}>
                        {signal.confidence}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-0.5 justify-center">
                        <span className={signal.validations.ai ? 'text-profit' : 'text-muted-foreground'}>●</span>
                        <span className={signal.validations.human ? 'text-profit' : 'text-muted-foreground'}>●</span>
                        <span className={signal.validations.market ? 'text-profit' : 'text-muted-foreground'}>●</span>
                      </div>
                    </td>
                    <td className={cn('p-3 text-right font-bold', signal.pnlPips >= 0 ? 'text-profit' : 'text-loss')}>
                      {signal.pnlPips >= 0 ? '+' : ''}{signal.pnlPips}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredSignals.length === 0 && (
        <div className="signal-card p-12 text-center">
          <p className="text-4xl mb-4">📡</p>
          <p className="text-lg font-medium">{t('sig.noSignals')}</p>
          <p className="text-muted-foreground">{t('sig.adjustFilters')}</p>
        </div>
      )}
    </div>
  );
}
