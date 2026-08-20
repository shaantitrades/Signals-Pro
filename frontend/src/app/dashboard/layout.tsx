'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore, useWSStore } from '@/lib/store';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useI18n, languages as i18nLanguages } from '@/lib/i18n';
import { authApi, api } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, initAuth } = useAuthStore();
  const { isConnected, latency, connect } = useWSStore();
  const { lang, setLang, t } = useI18n();

  // Modern SVG nav icons (Heroicons outline style)
  const navIcons: Record<string, React.ReactNode> = {
    '/dashboard': <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
    '/dashboard/signals-otc': <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>,
    '/dashboard/tradingbot': <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" /></svg>,
    '/dashboard/livesignals': <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
    '/dashboard/trades': <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>,
    '/dashboard/performance': <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
    '/dashboard/admin': <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    '/dashboard/settings': <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  };

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard') },
    { href: '/dashboard/signals-otc', label: t('nav.signalsOtc') },
    { href: '/dashboard/tradingbot', label: t('nav.tradingBot') },
    { href: '/dashboard/livesignals', label: t('nav.signalsLive') },
    { href: '/dashboard/settings', label: t('nav.settings') },
    ...(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
      ? [{ href: '/dashboard/admin', label: '⚙️ Admin' }]
      : []),
  ];

  // 40-second popup for unauthenticated visitors
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('authPopupDismissed')) return;
    const timer = setTimeout(() => {
      if (!useAuthStore.getState().isAuthenticated) {
        setShowAuthPopup(true);
      }
    }, 40000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch user data (including subscription) on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Re-check subscription whenever the user comes back to the tab or window
  // — handles the case where a user renews days later via Stripe portal
  useEffect(() => {
    let lastVisibilityCheck = Date.now();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Only re-fetch if tab was hidden for more than 30 seconds
        if (Date.now() - lastVisibilityCheck > 30000) {
          initAuth();
        }
        lastVisibilityCheck = Date.now();
      } else {
        lastVisibilityCheck = Date.now();
      }
    };
    const handleFocus = () => {
      if (Date.now() - lastVisibilityCheck > 30000) {
        initAuth();
        lastVisibilityCheck = Date.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, [initAuth]);

  // Periodic subscription refresh every 5 minutes + precise timer at expiry
  useEffect(() => {
    // Poll every 5 min to detect expiry
    const interval = setInterval(() => {
      initAuth();
    }, 5 * 60 * 1000);

    // Precise timer: fire exactly when subscription expires
    const sub = useAuthStore.getState().user?.subscription;
    if (sub?.currentPeriodEnd && (sub.status === 'ACTIVE' || sub.status === 'TRIAL')) {
      const msUntilExpiry = new Date(sub.currentPeriodEnd).getTime() - Date.now();
      if (msUntilExpiry > 0) {
        let renewalPollInterval: ReturnType<typeof setInterval> | null = null;
        const expiryTimeout = setTimeout(async () => {
          await initAuth();
          // After expiry, poll every 30s for up to 10min to detect renewal
          let pollCount = 0;
          renewalPollInterval = setInterval(async () => {
            pollCount++;
            await initAuth();
            const { hasActiveSubscription } = useAuthStore.getState();
            if (hasActiveSubscription() || pollCount >= 20) {
              if (renewalPollInterval) clearInterval(renewalPollInterval);
            }
          }, 30000);
        }, msUntilExpiry + 2000); // +2s buffer for server propagation
        return () => {
          clearInterval(interval);
          clearTimeout(expiryTimeout);
          if (renewalPollInterval) clearInterval(renewalPollInterval);
        };
      }
    }

    return () => clearInterval(interval);
  }, [initAuth]);

  // After Stripe/crypto payment redirect, poll initAuth until subscription is active
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') !== 'success') return;
    // Only show once per session (prevents re-showing on navigation/remount)
    if (sessionStorage.getItem('paymentPopupShown')) {
      // Clean URL silently without showing popup again
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      url.searchParams.delete('plan');
      window.history.replaceState({}, '', url.pathname);
      return;
    }

    setPaymentActivating(true);
    let attempts = 0;
    const maxAttempts = 36; // poll for up to ~3 minutes (crypto can be slow)
    const pollInterval = setInterval(async () => {
      attempts++;
      // Refresh auth state first (handles token refresh on 401)
      await initAuth();
      
      // Check if already active after auth refresh
      const stateAfterAuth = useAuthStore.getState();
      if (stateAfterAuth.hasActiveSubscription()) {
        clearInterval(pollInterval);
        setPaymentActivating(false);
        setShowPaymentSuccess(true);
        sessionStorage.setItem('paymentPopupShown', '1');
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        url.searchParams.delete('plan');
        window.history.replaceState({}, '', url.pathname);
        setTimeout(() => setShowPaymentSuccess(false), 8000);
        return;
      }

      // Try NowPayments sync (proactively check with NowPayments API)
      try {
        await api.post('/nowpayments/sync', {});
        // Re-fetch user state after sync
        await initAuth();
      } catch { /* ignore */ }

      const { hasActiveSubscription } = useAuthStore.getState();
      if (hasActiveSubscription()) {
        clearInterval(pollInterval);
        setPaymentActivating(false);
        setShowPaymentSuccess(true);
        sessionStorage.setItem('paymentPopupShown', '1');
        // Clean URL params after activation
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        url.searchParams.delete('plan');
        window.history.replaceState({}, '', url.pathname);
        // Auto-dismiss after 8 seconds
        setTimeout(() => setShowPaymentSuccess(false), 8000);
      } else if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        setPaymentActivating(false);
        // Still show success — webhook might just be slow, page refresh will fix
        setShowPaymentSuccess(true);
        sessionStorage.setItem('paymentPopupShown', '1');
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        url.searchParams.delete('plan');
        window.history.replaceState({}, '', url.pathname);
        setTimeout(() => setShowPaymentSuccess(false), 8000);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [initAuth]);

  // Theme state — sync with the script in root layout that already set the class
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read the class that was already set by the inline script in <head>
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }, [theme]);

  // Language state
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // User menu state
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileSubOpen, setProfileSubOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentActivating, setPaymentActivating] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Profile form state for user menu
  const [menuProfile, setMenuProfile] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [menuProfileSaving, setMenuProfileSaving] = useState(false);
  const [menuProfileMsg, setMenuProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync profile form with user data
  useEffect(() => {
    if (user) {
      setMenuProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: (user as any).phone || '',
      });
    }
  }, [user]);

  const handleMenuSaveProfile = async () => {
    setMenuProfileSaving(true);
    setMenuProfileMsg(null);
    try {
      await authApi.updateProfile({
        firstName: menuProfile.firstName,
        lastName: menuProfile.lastName,
        phone: menuProfile.phone,
      });
      await initAuth();
      setMenuProfileMsg({ type: 'success', text: t('settings.saveSuccess') });
    } catch (err: any) {
      setMenuProfileMsg({ type: 'error', text: err?.response?.data?.message || t('settings.saveError') });
    } finally {
      setMenuProfileSaving(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      connect(token);
    }
  }, [connect]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
        setProfileSubOpen(false);
        setProfileEditOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    router.push('/login');
  };

  // Show a styled skeleton loader until client JS has hydrated
  // This prevents users from seeing raw unstyled text
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Skeleton top bar */}
        <header className="sticky top-0 z-40 bg-background border-b border-border px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-muted animate-pulse" />
              <div className="w-32 h-5 rounded bg-muted animate-pulse hidden sm:block" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-6 rounded-full bg-muted animate-pulse" />
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            </div>
          </div>
        </header>
        {/* Skeleton nav */}
        <nav className="border-b border-border px-3 sm:px-6 py-2">
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-24 rounded-lg bg-muted animate-pulse shrink-0" />
            ))}
          </div>
        </nav>
        {/* Skeleton content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Status + Live */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/dashboard" className="flex items-center space-x-2 shrink-0">
              <Image src="/logo.svg" alt="Market Signals24" width={32} height={32} className="w-8 h-8" priority />
              <span className="hidden xs:inline text-sm sm:text-lg font-bold">Market Signals24</span>
            </Link>

            <div className="h-6 w-px bg-border hidden md:block" />

            {/* Connection Status */}
            <div className="hidden md:flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-profit animate-pulse' : 'bg-loss'
              )} />
              <span className="text-xs text-muted-foreground">
                {isConnected ? t('header.connected') : t('header.disconnected')}
              </span>
              {isConnected && (
                <span className="text-xs text-muted-foreground">{latency}ms</span>
              )}
            </div>

            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-profit/10 rounded-full">
              <span className="w-1.5 h-1.5 bg-profit rounded-full animate-pulse" />
              <span className="text-xs text-profit font-medium">LIVE</span>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
              title={theme === 'light' ? t('header.darkMode') : t('header.lightMode')}
            >
              {theme === 'light' ? (
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-sm"
              >
                <span className="text-xs">{i18nLanguages.find(l => l.code === lang)?.flag}</span>
                <span className="hidden sm:inline font-semibold text-sm">{lang}</span>
                <svg className={cn('w-3 h-3 text-muted-foreground transition-transform hidden sm:block', langOpen && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-xl shadow-xl py-1 z-50 animate-slide-in">
                  {i18nLanguages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary/50 transition-colors',
                        lang === l.code ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'
                      )}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Menu — Login/Register if not authenticated */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <Link href="/login" className="hidden sm:inline-flex px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors whitespace-nowrap">
                  {t('auth.loginBtn')}
                </Link>
                <Link href="/register" className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap">
                  {t('auth.register')}
                </Link>
              </div>
            ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setProfileSubOpen(false); setProfileEditOpen(false); setMenuProfileMsg(null); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
              >
                <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <svg className={cn('w-3 h-3 text-muted-foreground transition-transform', userMenuOpen && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {userMenuOpen && (
                <div className={cn('absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl py-1 z-50 animate-slide-in', profileEditOpen ? 'w-80' : 'w-56')}>
                  {/* Profile Edit Form View */}
                  {profileEditOpen ? (
                    <div className="px-4 py-3">
                      <button onClick={() => { setProfileEditOpen(false); setMenuProfileMsg(null); }} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-3">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        {t('menu.back')}
                      </button>
                      <h4 className="text-sm font-semibold mb-3">{t('settings.profileInfo')}</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium mb-1 block text-muted-foreground">{t('settings.firstName')}</label>
                            <input
                              value={menuProfile.firstName}
                              onChange={e => setMenuProfile(prev => ({ ...prev, firstName: e.target.value }))}
                              className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1 block text-muted-foreground">{t('settings.lastName')}</label>
                            <input
                              value={menuProfile.lastName}
                              onChange={e => setMenuProfile(prev => ({ ...prev, lastName: e.target.value }))}
                              className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block text-muted-foreground">{t('settings.email')}</label>
                          <input
                            value={menuProfile.email}
                            disabled
                            className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                          />
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t('settings.emailReadonly')}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block text-muted-foreground">{t('settings.phone')}</label>
                          <input
                            value={menuProfile.phone}
                            onChange={e => setMenuProfile(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="+33 6 00 00 00 00"
                          />
                        </div>
                        {menuProfileMsg && (
                          <p className={cn('text-xs font-medium', menuProfileMsg.type === 'success' ? 'text-profit' : 'text-loss')}>
                            {menuProfileMsg.text}
                          </p>
                        )}
                        <button
                          onClick={handleMenuSaveProfile}
                          disabled={menuProfileSaving}
                          className="w-full px-4 py-2 text-sm bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {menuProfileSaving ? '...' : t('settings.save')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal Menu View */
                    <>
                  <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    {t('menu.home')}
                  </Link>

                  <div className="relative">
                    <button onClick={() => setProfileSubOpen(!profileSubOpen)} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573-1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {t('menu.profileSettings')}
                      </div>
                      <svg className={cn('w-3 h-3 text-muted-foreground transition-transform', profileSubOpen && 'rotate-90')} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    {profileSubOpen && (
                      <div className="mx-2 mb-1 bg-secondary/30 rounded-lg border border-border/50 py-1">
                        <button onClick={() => setProfileSubOpen(false)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-primary hover:bg-secondary/50 transition-colors border-b border-border/50 mb-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                          {t('menu.back')}
                        </button>
                        <button onClick={() => { setProfileSubOpen(false); setProfileEditOpen(true); setMenuProfileMsg(null); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary/50 transition-colors">
                          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          {t('menu.editProfile')}
                        </button>
                        <button onClick={() => { setUserMenuOpen(false); router.push('/dashboard/settings?tab=subscription'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary/50 transition-colors">
                          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          {t('menu.cancelSub')}
                        </button>
                        <button onClick={() => { setUserMenuOpen(false); router.push('/tarifs'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary/50 transition-colors">
                          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573-1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {t('menu.manageSub')}
                        </button>
                        <button onClick={() => { setUserMenuOpen(false); router.push('/dashboard/settings?tab=security'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary/50 transition-colors">
                          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          {t('menu.changePassword')}
                        </button>
                        <button onClick={() => { setUserMenuOpen(false); window.location.href = 'mailto:support@Market Signals24.com?subject=Suspend%20My%20Account'; }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-orange-400 hover:bg-secondary/50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                          {t('menu.suspendAccount')}
                        </button>
                        <button onClick={() => { setUserMenuOpen(false); window.location.href = 'mailto:support@Market Signals24.com?subject=Delete%20My%20Account'; }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-loss hover:bg-secondary/50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          {t('menu.deleteAccount')}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border my-1" />

                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-loss hover:bg-secondary/50 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    {t('menu.logout')}
                  </button>
                    </>
                  )}
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </header>

      {/* Horizontal Navigation Bar */}
      <nav className="sticky top-[49px] sm:top-[57px] z-30 bg-card border-b border-border px-2 sm:px-6">
        <div className="flex items-center justify-center gap-0.5 sm:gap-1 flex-wrap py-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors',
                item.href === '/dashboard/signals-otc'
                  ? pathname === item.href
                    ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/30'
                    : 'bg-yellow-400/15 text-yellow-500 border border-yellow-400/40 hover:bg-yellow-400 hover:text-black font-semibold'
                  : pathname === item.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              {navIcons[item.href]}
              {item.label}
              {item.href === '/dashboard/signals-otc' && pathname !== item.href && (
                <span className="ml-0.5 inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <div className="p-3 sm:p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* Partners */}
      <DashboardPartners t={t} />

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#1a1a2e] via-[#2d1b69] to-[#1a1a2e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image src="/logo.svg" alt="Market Signals24" width={28} height={28} className="w-7 h-7" />
                <h3 className="font-bold text-lg">Market Signals24</h3>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">{t('footer.brand.desc')}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">{t('footer.services')}</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="text-white/60">{t('footer.services.forex')}</span></li>
                <li><span className="text-white/60">{t('footer.services.crypto')}</span></li>
                <li><span className="text-white/60">{t('footer.services.indices')}</span></li>
                <li><span className="text-white/60">{t('footer.services.analysis')}</span></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">{t('footer.support')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@Market Signals24.com" className="text-white/60 hover:text-white transition-colors">{t('footer.support.customer')}</a></li>
                <li><a href="mailto:support@Market Signals24.com?subject=Become%20an%20Affiliate" className="text-white/60 hover:text-white transition-colors">{t('footer.support.affiliate')}</a></li>
                <li><span className="text-white/60 hover:text-white transition-colors cursor-pointer">{t('footer.support.faq')}</span></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">{t('footer.legal')}</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms-conditions" className="text-white/60 hover:text-white transition-colors">{t('footer.legal.terms')}</Link></li>
                <li><Link href="/privacy-policy" className="text-white/60 hover:text-white transition-colors">{t('footer.legal.privacy')}</Link></li>
                <li><Link href="/trading-risks" className="text-white/60 hover:text-white transition-colors">{t('footer.legal.risks')}</Link></li>
                <li><Link href="/legal-notice" className="text-white/60 hover:text-white transition-colors">{t('footer.legal.notice')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/10 text-center">
            <p className="text-white/50 text-sm">{t('footer.copyright')}</p>
            <p className="text-primary text-xs mt-1">Version 2.0 - Real-Time Precision Edition</p>
          </div>
        </div>
      </footer>

      {/* Payment Activating Banner */}
      {paymentActivating && (
        <div className="fixed top-0 left-0 right-0 z-[110] bg-primary/95 text-primary-foreground py-3 px-4 text-center animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            <span className="text-sm font-medium">{t('payment.activating')}</span>
          </div>
        </div>
      )}

      {/* Payment Success Premium Popup */}
      {showPaymentSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowPaymentSuccess(false)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>
              </svg>
            </button>

            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl">👑</span>
              <h2 className="text-xl font-bold text-green-500">{t('welcome.title')}</h2>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              {t('welcome.desc')}
            </p>

            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {t('welcome.bottom')}
            </p>

            <button
              onClick={() => setShowPaymentSuccess(false)}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t('payment.startTrading')}
            </button>
          </div>
        </div>
      )}

      {/* Auth Popup — shown after 40s for non-logged users */}
      {showAuthPopup && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 w-full sm:max-w-md mx-0 sm:mx-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
            <button
              onClick={() => { setShowAuthPopup(false); sessionStorage.setItem('authPopupDismissed', '1'); }}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>
              </svg>
            </button>
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M12 12h.008v.007H12V12z" /></svg>
              </div>
              <h2 className="text-xl font-bold mb-2">{t('popup.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('popup.desc')}</p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href="/login"
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-center text-sm"
              >
                {t('popup.login')}
              </a>
              <a
                href="/register"
                className="w-full py-3 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors text-center text-sm"
              >
                {t('popup.register')}
              </a>
              <button
                onClick={() => { setShowAuthPopup(false); sessionStorage.setItem('authPopupDismissed', '1'); }}
                className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('popup.dismiss')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-loss/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-loss" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-base">{t('menu.logoutConfirmTitle')}</h3>
                <p className="text-sm text-muted-foreground">{t('menu.logoutConfirmDesc')}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary/50 transition-colors"
              >
                {t('menu.cancel')}
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 rounded-lg bg-loss text-white text-sm font-medium hover:bg-loss/90 transition-colors"
              >
                {t('menu.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Partners section shown above the dashboard footer ──────────────────────
interface CustomPartner {
  id: string;
  name: string;
  url: string;
  subtitle: string;
  desc: string;
  score?: string;
  tags: string[];
  color: string;
  initial: string;
  active: boolean;
}

function DashboardPartners({ t }: { t: (k: string) => string }) {
  const [customPartners, setCustomPartners] = useState<CustomPartner[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('custom_partners') || '[]') as CustomPartner[];
      setCustomPartners(saved.filter((p) => p.active));
    } catch { setCustomPartners([]); }
  }, []);

  const staticPartners = [
    {
      id: 'pocketoption',
      href: 'https://u3.shortink.io/register?utm_campaign=41345&utm_source=affiliate&utm_medium=sr&a=nauJIysReFF6Mk&ac=promo-code-60&code=PMQ023',
      initial: 'PO',
      color: 'bg-gradient-to-br from-[#00b27a] to-[#00c98a]',
      name: 'Pocket Option',
      subtitle: t('partners.pocketoption.subtitle'),
      desc: t('partners.pocketoption.desc'),
      score: '4.9',
      tags: ['Bonus 60–100%', t('partners.tag.promopmq'), t('partners.tag.binary')],
      tagColor: 'bg-[#00b27a]/10 text-[#00e699] border-[#00b27a]/20',
    },
  ];

  const extArrow = (
    <svg className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );

  return (
    <section className="bg-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">{t('partners.label')}</span>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">{t('partners.title')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {staticPartners.map((p) => (
            <a
              key={p.id}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${p.color} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                  {p.initial}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-card-foreground text-sm group-hover:text-primary transition-colors truncate">{p.name}</p>
                    {p.score && <span className="text-[10px] text-yellow-500 font-bold shrink-0">★ {p.score}</span>}
                  </div>
                  <p className="text-muted-foreground text-[11px] truncate">{p.subtitle}</p>
                </div>
                {extArrow}
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-3">{p.desc}</p>
              <div className="flex flex-wrap gap-1 mt-auto">
                {p.tags.map((tag) => (
                  <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full border ${p.tagColor}`}>{tag}</span>
                ))}
              </div>
            </a>
          ))}
          {customPartners.map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${p.color || 'bg-gradient-to-br from-primary to-primary/70'} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                  {p.initial || p.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-card-foreground text-sm group-hover:text-primary transition-colors truncate">{p.name}</p>
                    {p.score && <span className="text-[10px] text-yellow-500 font-bold shrink-0">★ {p.score}</span>}
                  </div>
                  <p className="text-muted-foreground text-[11px] truncate">{p.subtitle}</p>
                </div>
                {extArrow}
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-3">{p.desc}</p>
              {p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-auto">
                  {p.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{tag}</span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
