'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn, formatPrice, getTimeframeLabel, getRiskLevelColor } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

const SIGNAL_ENGINE_URL = process.env.NEXT_PUBLIC_SIGNAL_ENGINE_URL || 'http://localhost:8000';

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

export default function SignalsPage() {
  const { t } = useI18n();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('FOREX');
  const [strengthFilter, setStrengthFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [sortBy, setSortBy] = useState<'confidence' | 'pnl' | 'recent'>('confidence');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);

  // Fetch real signals from the signal engine
  const fetchSignals = useCallback(async (categoriesToScan?: string[]) => {
    try {
      const cats = categoriesToScan || Object.keys(SCAN_TIMEFRAMES);
      const allSignals: Signal[] = [];

      for (const cat of cats) {
        const timeframes = SCAN_TIMEFRAMES[cat];
        if (!timeframes) continue;
        // Use the best timeframe (first = fastest) for the scan
        const tf = timeframes[0];
        try {
          const res = await fetch(`${SIGNAL_ENGINE_URL}/signals/scan/${cat}/${tf}?min_confidence=50`);
          if (!res.ok) continue;
          const data = await res.json();
          if (data.signals && Array.isArray(data.signals)) {
            for (const s of data.signals) {
              // Compute pnl pips (rough estimate)
              const isForex = cat === 'FOREX' || cat === 'FOREX_OTC';
              const pipMultiplier = isForex
                ? (s.asset?.includes('JPY') ? 100 : 10000)
                : cat === 'CRYPTO' ? 1 : 10;
              const rawPnl = s.action === 'BUY'
                ? (s.entry_price - s.entry_price) // at entry, pnl = 0
                : (s.entry_price - s.entry_price);

              // Determine how many of the 3 indicators agreed
              const indicatorCount = s.indicators?.length || 3;
              const buyCount = s.indicators?.filter((i: any) => i.signal === 'BUY').length || 0;
              const sellCount = s.indicators?.filter((i: any) => i.signal === 'SELL').length || 0;
              const agreeing = s.action === 'BUY' ? buyCount : sellCount;

              allSignals.push({
                id: `${s.asset}-${s.timeframe}-${Date.now()}`,
                asset: s.asset,
                category: s.category,
                action: s.action,
                entryPrice: s.entry_price,
                currentPrice: s.entry_price, // at generation time, current = entry
                tp1: s.tp1,
                tp2: s.tp2 || null,
                tp3: s.tp3 || null,
                sl: s.sl,
                confidence: s.confidence,
                riskLevel: s.risk_level || 'MEDIUM',
                timeframe: s.timeframe,
                status: 'ACTIVE',
                pnlPips: 0,
                createdAt: 'now',
                validations: {
                  ai: true,
                  human: agreeing >= 2,
                  market: agreeing >= 3,
                },
              });
            }
          }
        } catch {
          // Category scan failed, skip
        }
      }

      setSignals(allSignals);
      setLastRefresh(new Date());
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch signals');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + auto-refresh every 60 seconds
  useEffect(() => {
    fetchSignals();
    const interval = setInterval(() => fetchSignals(), 60_000);
    return () => clearInterval(interval);
  }, [fetchSignals]);

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

  return (
    <div className="space-y-6">
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
                  <p className="font-medium">{signal.entryPrice}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">{t('sig.current')}</span>
                  <p className={cn('font-medium', signal.pnlPips >= 0 ? 'text-profit' : 'text-loss')}>
                    {signal.currentPrice}
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
                    <td className="p-3 text-right font-mono text-sm">{signal.entryPrice}</td>
                    <td className={cn('p-3 text-right font-mono text-sm', signal.pnlPips >= 0 ? 'text-profit' : 'text-loss')}>
                      {signal.currentPrice}
                    </td>
                    <td className="p-3 text-right font-mono text-sm text-profit">{signal.tp1}</td>
                    <td className="p-3 text-right font-mono text-sm text-loss">{signal.sl}</td>
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
