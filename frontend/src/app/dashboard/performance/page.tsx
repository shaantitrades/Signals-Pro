'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

const SIGNAL_ENGINE_URL = process.env.NEXT_PUBLIC_SIGNAL_ENGINE_URL || 'http://localhost:8000';

interface CategoryStats {
  category: string;
  icon: string;
  signalsFound: number;
  avgConfidence: number;
}

interface AssetLeader {
  asset: string;
  confidence: number;
  category: string;
}

export default function PerformancePage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<'overview' | 'category' | 'leaderboard'>('overview');
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [topAssets, setTopAssets] = useState<AssetLeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSignals, setTotalSignals] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);

  useEffect(() => {
    async function fetchPerformance() {
      setLoading(true);
      const categories = [
        { key: 'FOREX', icon: '💱', label: 'Forex' },
        { key: 'CRYPTO', icon: '₿', label: 'Crypto' },
        { key: 'COMMODITIES', icon: '🪙', label: t('sig.commodities') },
        { key: 'INDICES', icon: '📈', label: 'Indices' },
      ];

      const stats: CategoryStats[] = [];
      const allAssets: AssetLeader[] = [];
      let total = 0;
      let confSum = 0;

      await Promise.all(
        categories.map(async (cat) => {
          try {
            const res = await fetch(`${SIGNAL_ENGINE_URL}/signals/scan/${cat.key}/M15?min_confidence=55`);
            if (!res.ok) return;
            const data = await res.json();
            const signals = data.signals || [];
            const count = signals.length;
            const avg = count > 0 ? signals.reduce((a: number, s: any) => a + (s.confidence || 0), 0) / count : 0;
            
            stats.push({
              category: cat.label,
              icon: cat.icon,
              signalsFound: count,
              avgConfidence: Math.round(avg),
            });

            total += count;
            confSum += avg * count;

            signals.forEach((s: any) => {
              allAssets.push({
                asset: s.asset || s.symbol || 'N/A',
                confidence: Math.round(s.confidence || 0),
                category: cat.label,
              });
            });
          } catch {
            stats.push({ category: cat.label, icon: cat.icon, signalsFound: 0, avgConfidence: 0 });
          }
        })
      );

      allAssets.sort((a, b) => b.confidence - a.confidence);
      setCategoryStats(stats);
      setTopAssets(allAssets.slice(0, 10));
      setTotalSignals(total);
      setAvgConfidence(total > 0 ? Math.round(confSum / total) : 0);
      setLoading(false);
    }

    fetchPerformance();
    const interval = setInterval(fetchPerformance, 60000);
    return () => clearInterval(interval);
  }, [t]);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="signal-card p-4 text-center">
          <p className="text-3xl font-bold text-primary">{loading ? '...' : totalSignals}</p>
          <p className="text-xs text-muted-foreground">Active Signals</p>
        </div>
        <div className="signal-card p-4 text-center">
          <p className="text-3xl font-bold text-profit">{loading ? '...' : `${avgConfidence}%`}</p>
          <p className="text-xs text-muted-foreground">{t('perf.avgConfidence')}</p>
        </div>
        <div className="signal-card p-4 text-center">
          <p className="text-3xl font-bold">{loading ? '...' : categoryStats.filter(c => c.signalsFound > 0).length}</p>
          <p className="text-xs text-muted-foreground">Active Categories</p>
        </div>
        <div className="signal-card p-4 text-center">
          <p className="text-3xl font-bold text-signal-strong">{loading ? '...' : topAssets.length}</p>
          <p className="text-xs text-muted-foreground">{t('perf.topAssets')}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="signal-card p-1 inline-flex gap-1">
        {([
          { value: 'overview', label: t('perf.overview') },
          { value: 'category', label: t('perf.byCategory') },
          { value: 'leaderboard', label: t('perf.topAssets') },
        ] as const).map(item => (
          <button
            key={item.value}
            onClick={() => setTab(item.value)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === item.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="signal-card p-8 text-center text-muted-foreground">
          <div className="animate-spin text-2xl mb-2">⏳</div>
          <p className="text-sm">Loading real-time performance data...</p>
        </div>
      ) : (
      <>
      {tab === 'overview' && (
        <div className="signal-card p-6">
          <h3 className="font-semibold mb-4">Signals by Category</h3>
          {categoryStats.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">No data available</p>
          ) : (
          <div className="h-64 flex items-end gap-2">
            {categoryStats.map((cat) => (
              <div key={cat.category} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-primary font-medium">{cat.signalsFound}</span>
                <div
                  className="w-full bg-gradient-to-t from-primary to-profit rounded-t min-h-[4px]"
                  style={{ height: `${Math.max(4, (cat.signalsFound / Math.max(1, totalSignals)) * 200)}px` }}
                />
                <span className="text-lg">{cat.icon}</span>
                <span className="text-xs text-muted-foreground">{cat.category}</span>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {tab === 'category' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categoryStats.map(cat => (
            <div key={cat.category} className="signal-card p-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <p className="font-semibold">{cat.category}</p>
                  <p className="text-xs text-muted-foreground">{cat.signalsFound} signals</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Signals</p>
                  <p className="text-lg font-bold text-primary">{cat.signalsFound}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('perf.confidence')}</p>
                  <p className={cn('text-lg font-bold', cat.avgConfidence >= 80 ? 'text-profit' : 'text-signal-strong')}>{cat.avgConfidence}%</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-profit rounded-full" style={{ width: `${cat.avgConfidence}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="signal-card overflow-hidden">
          {topAssets.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">No signals detected at this moment.</p>
            </div>
          ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-xs text-muted-foreground">#</th>
                <th className="text-left p-3 text-xs text-muted-foreground">{t('perf.asset')}</th>
                <th className="text-left p-3 text-xs text-muted-foreground">Category</th>
                <th className="text-right p-3 text-xs text-muted-foreground">{t('perf.confidence')}</th>
                <th className="text-center p-3 text-xs text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {topAssets.map((a, i) => (
                <tr key={`${a.asset}-${i}`} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="p-3">
                    <span className="text-lg">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                  </td>
                  <td className="p-3 font-bold">{a.asset}</td>
                  <td className="p-3 text-sm text-muted-foreground">{a.category}</td>
                  <td className={cn('p-3 text-right font-bold', a.confidence >= 80 ? 'text-profit' : 'text-signal-strong')}>{a.confidence}%</td>
                  <td className="p-3 text-center">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">LIVE</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
}
