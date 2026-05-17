import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, decimals: number = 5): string {
  return price.toFixed(decimals);
}

export function formatSmartPrice(price: number, category?: string): string {
  if (!price || isNaN(price)) return '—';
  if (category === 'CRYPTO' || !category) {
    if (price >= 10000) return price.toFixed(2);
    if (price >= 100)   return price.toFixed(3);
    return price.toFixed(5);
  }
  if (category === 'INDICES') return price.toFixed(2);
  if (category === 'COMMODITIES') return price.toFixed(3);
  return price.toFixed(5);
}

export function formatPips(pips: number): string {
  const sign = pips >= 0 ? '+' : '';
  return `${sign}${pips.toFixed(1)} pips`;
}

export function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

export function formatConfidence(score: number): string {
  return `${score.toFixed(0)}%`;
}

export function getConfidenceColor(score: number): string {
  if (score >= 90) return 'text-profit';
  if (score >= 75) return 'text-signal-medium';
  if (score >= 60) return 'text-signal-high';
  return 'text-loss';
}

export function getRiskLevelColor(risk: string): string {
  switch (risk) {
    case 'LOW': return 'text-profit bg-profit/10';
    case 'MEDIUM': return 'text-signal-medium bg-signal-medium/10';
    case 'HIGH': return 'text-signal-high bg-signal-high/10';
    case 'EXTREME': return 'text-loss bg-loss/10';
    default: return 'text-muted-foreground';
  }
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'FOREX': return '💱';
    case 'FOREX_OTC': return '🔄';
    case 'CRYPTO': return '₿';
    case 'INDICES': return '📈';
    case 'COMMODITIES': return '🪙';
    default: return '📊';
  }
}

export function isMarketOpen(category: string): boolean {
  const now = new Date();
  const paris = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  const day = paris.getDay(); // 0=Sun, 6=Sat
  const h = paris.getHours();
  const m = paris.getMinutes();
  const t = h + m / 60;
  const isWeekend = day === 0 || day === 6;
  const isFriday = day === 5;

  if (category === 'CRYPTO' || category === 'FOREX_OTC') return true;
  if (category === 'FOREX') {
    if (isWeekend && !(day === 0 && h >= 23)) return false;
    if (isFriday && h >= 23) return false;
    return true;
  }
  if (category === 'INDICES') {
    if (isWeekend) return false;
    if (t < 8 || t >= 22.5) return false;
    return true;
  }
  if (category === 'COMMODITIES') {
    if (isWeekend) return false;
    if (t < 1 || t >= 22) return false;
    return true;
  }
  return true;
}

export function getTimeframeLabel(tf: string): string {
  const labels: Record<string, string> = {
    M1: '1 Min', M5: '5 Min', M15: '15 Min', M30: '30 Min',
    H1: '1 Hour', H4: '4 Hours', D1: '1 Day', W1: '1 Week',
  };
  return labels[tf] || tf;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
    case 'EXECUTED': return 'text-profit';
    case 'TP1_HIT':
    case 'TP2_HIT':
    case 'TP3_HIT': return 'text-profit';
    case 'SL_HIT': return 'text-loss';
    case 'PENDING': return 'text-signal-high';
    case 'EXPIRED':
    case 'CANCELLED': return 'text-muted-foreground';
    default: return 'text-foreground';
  }
}
