'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn, formatPips, formatPercent, getConfidenceColor, getCategoryIcon } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { useAuthStore } from '@/lib/store';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\d*\/?$/, '').replace(/\/+$/, '');

interface RecentSignal {
  id: string;
  asset: string;
  category: string;
  action: 'BUY' | 'SELL';
  confidence: number;
  status: string;
  time: string;
}

export default function DashboardPage() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuthStore();
  const [recentSignals, setRecentSignals] = useState<RecentSignal[]>([]);
  const [stats, setStats] = useState({ activeSignals: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch real signals from the backend API (DB-backed, always available)
  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      const allSignals: RecentSignal[] = [];
      let categoriesWithSignals = 0;

      try {
        const res = await fetch(`${API_URL}/api/signals/recent?min_confidence=50&limit=50`);
        if (res.ok) {
          const data = await res.json();
          if (data.signals && data.signals.length > 0) {
            // Track unique categories
            const cats = new Set<string>();
            data.signals.forEach((s: any, i: number) => {
              cats.add(s.category);
              allSignals.push({
                id: s.id || `sig-${i}`,
                asset: s.asset || 'N/A',
                category: s.category,
                action: s.action || 'BUY',
                confidence: Math.round(s.confidence || 0),
                status: s.status || 'ACTIVE',
                time: s.created_at ? new Date(s.created_at).toLocaleTimeString() : 'Live',
              });
            });
            categoriesWithSignals = cats.size;
          }
        }
      } catch {
        // Backend not available, signals will be empty
      }

      // Sort by confidence and take top 5
      allSignals.sort((a, b) => b.confidence - a.confidence);
      setRecentSignals(allSignals.slice(0, 5));
      setStats({ activeSignals: allSignals.length, categories: categoriesWithSignals });
      setLoading(false);
    }

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/signals-otc" className="signal-card p-6 flex items-center gap-4 group">
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <span className="text-3xl">⚡</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{t('dash.otcCenter')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('dash.otcDesc')}
            </p>
          </div>
          <span className="ml-auto text-muted-foreground group-hover:text-primary transition-colors">→</span>
        </Link>

        <Link href="/dashboard/bot" className="signal-card p-6 flex items-center gap-4 group">
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <span className="text-3xl">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{t('dash.botCenter')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('dash.botDesc')}
            </p>
          </div>
          <span className="ml-auto text-muted-foreground group-hover:text-primary transition-colors">→</span>
        </Link>

        <Link href="/dashboard/signals" className="signal-card p-6 flex items-center gap-4 group">
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <span className="text-3xl">📡</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{t('dash.liveSignals')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('dash.liveDesc')}
            </p>
          </div>
          <span className="ml-auto text-muted-foreground group-hover:text-primary transition-colors">→</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dash.activeSignals')}
          value={loading ? '...' : stats.activeSignals.toString()}
          change={`${stats.categories} ${t('dash.today')}`}
          changeType="positive"
          icon="📡"
        />
        <StatCard
          title={t('dash.liveSignals')}
          value={loading ? '...' : recentSignals.length > 0 ? `${recentSignals.length}` : '0'}
          change="Top 5"
          changeType="positive"
          icon="🎯"
        />
        <StatCard
          title={t('dash.totalPips')}
          value={loading ? '...' : stats.categories > 0 ? `${stats.categories} cat.` : '—'}
          change={t('dash.thisWeek')}
          changeType="positive"
          icon="💰"
        />
        <StatCard
          title={t('dash.activeBots')}
          value="—"
          change="Forex + Crypto"
          changeType="neutral"
          icon="🤖"
        />
      </div>

      {/* Recent Signals */}
      <div className="signal-card">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">{t('dash.recentSignals')}</h2>
          <Link href="/dashboard/signals" className="text-sm text-primary hover:underline">
            {t('dash.seeAll')}
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="animate-spin text-2xl mb-2">⏳</div>
            <p className="text-sm">Loading real-time signals...</p>
          </div>
        ) : recentSignals.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-lg mb-1">📡</p>
            <p className="text-sm">No active signals right now. The engine scans markets continuously.</p>
          </div>
        ) : (
        <div className="divide-y divide-border">
          {recentSignals.map((signal) => (
            <div key={signal.id} className="p-3 sm:p-4 flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 hover:bg-secondary/30 transition-colors">
              {/* Asset */}
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-40">
                <span className="text-lg">{getCategoryIcon(signal.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{signal.asset}</p>
                  <p className="text-xs text-muted-foreground">{signal.category}</p>
                </div>

                {/* Mobile: Action inline */}
                <div className="flex items-center gap-2 sm:hidden">
                  <span className={cn(
                    'signal-badge justify-center',
                    signal.action === 'BUY' ? 'signal-badge-buy' : 'signal-badge-sell'
                  )}>
                    {signal.action}
                  </span>
                </div>
              </div>

              {/* Desktop: Action */}
              <span className={cn(
                'signal-badge w-16 justify-center hidden sm:inline-flex',
                signal.action === 'BUY' ? 'signal-badge-buy' : 'signal-badge-sell'
              )}>
                {signal.action}
              </span>

              {/* Confidence */}
              <div className="hidden md:block w-20 text-center">
                <span className={cn('font-semibold text-sm', getConfidenceColor(signal.confidence))}>
                  {signal.confidence}%
                </span>
                <p className="text-xs text-muted-foreground">{t('dash.confidence')}</p>
              </div>

              {/* Status */}
              <div className="hidden sm:block w-24">
                <StatusBadge status={signal.status} />
              </div>

              {/* Time */}
              <div className="hidden sm:block text-xs text-muted-foreground ml-auto">
                {signal.time}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Performance Summary - links to real performance page */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/signals" className="stat-card hover:border-primary/30 transition-colors">
          <h3 className="text-sm text-muted-foreground mb-2">{t('dash.perfForex')}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">💱</span>
            <span className="text-sm text-muted-foreground">View live signals →</span>
          </div>
        </Link>

        <Link href="/dashboard/signals" className="stat-card hover:border-primary/30 transition-colors">
          <h3 className="text-sm text-muted-foreground mb-2">{t('dash.perfCrypto')}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">₿</span>
            <span className="text-sm text-muted-foreground">View live signals →</span>
          </div>
        </Link>

        <Link href="/dashboard/signals" className="stat-card hover:border-primary/30 transition-colors">
          <h3 className="text-sm text-muted-foreground mb-2">{t('dash.perfIndices')}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">📈</span>
            <span className="text-sm text-muted-foreground">View live signals →</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <p className={cn(
        'text-xs',
        changeType === 'positive' ? 'text-profit' :
        changeType === 'negative' ? 'text-loss' :
        'text-muted-foreground'
      )}>
        {change}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: 'Actif', className: 'bg-primary/10 text-primary' },
    EXECUTED: { label: 'Exécuté', className: 'bg-signal-medium/10 text-signal-medium' },
    TP1_HIT: { label: 'TP1 ✓', className: 'bg-profit/10 text-profit' },
    TP2_HIT: { label: 'TP2 ✓', className: 'bg-profit/10 text-profit' },
    TP3_HIT: { label: 'TP3 ✓', className: 'bg-profit/10 text-profit' },
    SL_HIT: { label: 'SL ✗', className: 'bg-loss/10 text-loss' },
    PENDING: { label: 'En attente', className: 'bg-signal-high/10 text-signal-high' },
    EXPIRED: { label: 'Expiré', className: 'bg-secondary text-muted-foreground' },
    CANCELLED: { label: 'Annulé', className: 'bg-secondary text-muted-foreground' },
  };

  const { label, className } = config[status] || { label: status, className: 'bg-secondary text-muted-foreground' };

  return (
    <span className={cn('signal-badge', className)}>
      {label}
    </span>
  );
}
