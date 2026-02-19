'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

const SIGNAL_ENGINE_URL = process.env.NEXT_PUBLIC_SIGNAL_ENGINE_URL || 'http://localhost:8000';

interface Trade {
  id: string;
  asset: string;
  action: string;
  entryPrice: number;
  tp1: number;
  sl: number;
  confidence: number;
  category: string;
  timeframe: string;
  time: string;
}

type FilterPeriod = '7d' | '30d' | '90d' | 'all';

export default function TradesPage() {
  const { t } = useI18n();
  const [period, setPeriod] = useState<FilterPeriod>('30d');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real signals across categories
  useEffect(() => {
    async function fetchTrades() {
      setLoading(true);
      const categories = ['FOREX', 'CRYPTO', 'COMMODITIES', 'INDICES'];
      const allTrades: Trade[] = [];

      await Promise.all(
        categories.map(async (cat) => {
          try {
            const res = await fetch(`${SIGNAL_ENGINE_URL}/signals/scan/${cat}/M15?min_confidence=55`);
            if (!res.ok) return;
            const data = await res.json();
            if (data.signals) {
              data.signals.forEach((s: any, i: number) => {
                allTrades.push({
                  id: `${cat}-${i}`,
                  asset: s.asset || s.symbol || 'N/A',
                  action: s.action || s.direction || 'BUY',
                  entryPrice: s.entry_price || s.price || 0,
                  tp1: s.tp1 || s.take_profit_1 || 0,
                  sl: s.sl || s.stop_loss || 0,
                  confidence: Math.round(s.confidence || 0),
                  category: cat,
                  timeframe: s.timeframe || 'M15',
                  time: 'Live',
                });
              });
            }
          } catch {
            // skip
          }
        })
      );

      allTrades.sort((a, b) => b.confidence - a.confidence);
      setTrades(allTrades);
      setLoading(false);
    }

    fetchTrades();
    const interval = setInterval(fetchTrades, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="signal-card p-4 text-center">
          <p className="text-2xl font-bold">{loading ? '...' : trades.length}</p>
          <p className="text-xs text-muted-foreground">{t('trades.totalTrades')}</p>
        </div>
        <div className="signal-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{loading ? '...' : trades.filter(t => t.confidence >= 80).length}</p>
          <p className="text-xs text-muted-foreground">High Confidence</p>
        </div>
        <div className="signal-card p-4 text-center">
          <p className="text-2xl font-bold text-signal-strong">{loading ? '...' : trades.filter(t => t.confidence >= 60 && t.confidence < 80).length}</p>
          <p className="text-xs text-muted-foreground">Medium Confidence</p>
        </div>
        <div className="signal-card p-4 text-center">
          <p className="text-2xl font-bold">
            {loading ? '...' : trades.length > 0 ? `${Math.round(trades.reduce((a, t) => a + t.confidence, 0) / trades.length)}%` : '—'}
          </p>
          <p className="text-xs text-muted-foreground">Avg. Confidence</p>
        </div>
      </div>

      {/* Filters */}
      <div className="signal-card p-4 flex flex-wrap gap-4 items-center">
        <div className="flex gap-1">
          {(['7d', '30d', '90d', 'all'] as FilterPeriod[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                period === p ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {p === 'all' ? t('trades.all') : p}
            </button>
          ))}
        </div>
      </div>

      {/* Signals Table */}
      <div className="signal-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="animate-spin text-2xl mb-2">⏳</div>
            <p className="text-sm">Loading real-time signal data...</p>
          </div>
        ) : trades.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-lg mb-1">📊</p>
            <p className="text-sm">No signals detected at this moment. The engine continuously scans all markets.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-xs text-muted-foreground font-medium">{t('trades.asset')}</th>
                <th className="text-left p-3 text-xs text-muted-foreground font-medium">{t('trades.action')}</th>
                <th className="text-left p-3 text-xs text-muted-foreground font-medium">Category</th>
                <th className="text-right p-3 text-xs text-muted-foreground font-medium">{t('trades.entry')}</th>
                <th className="text-right p-3 text-xs text-muted-foreground font-medium">TP1</th>
                <th className="text-right p-3 text-xs text-muted-foreground font-medium">SL</th>
                <th className="text-center p-3 text-xs text-muted-foreground font-medium">{t('trades.confidence')}</th>
                <th className="text-center p-3 text-xs text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-3 font-medium">{trade.asset}</td>
                  <td className="p-3">
                    <span className={cn('signal-badge text-xs', trade.action === 'BUY' ? 'signal-badge-buy' : 'signal-badge-sell')}>
                      {trade.action}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{trade.category}</td>
                  <td className="p-3 text-right font-mono text-sm">{trade.entryPrice > 0 ? trade.entryPrice : '—'}</td>
                  <td className="p-3 text-right font-mono text-sm text-profit">{trade.tp1 > 0 ? trade.tp1 : '—'}</td>
                  <td className="p-3 text-right font-mono text-sm text-loss">{trade.sl > 0 ? trade.sl : '—'}</td>
                  <td className="p-3 text-center">
                    <span className={cn(
                      'font-bold text-sm',
                      trade.confidence >= 80 ? 'text-profit' : trade.confidence >= 60 ? 'text-signal-strong' : 'text-muted-foreground'
                    )}>
                      {trade.confidence}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                      LIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
