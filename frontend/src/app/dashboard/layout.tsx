'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore, useWSStore } from '@/lib/store';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useI18n, languages as i18nLanguages } from '@/lib/i18n';

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

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: '📊' },
    { href: '/dashboard/signals-otc', label: t('nav.signalsOtc'), icon: '⚡' },
    { href: '/dashboard/bot', label: t('nav.tradingBot'), icon: '🤖' },
    { href: '/dashboard/signals', label: t('nav.signalsLive'), icon: '📡' },
    { href: '/dashboard/trades', label: t('nav.myTrades'), icon: '💼' },
    { href: '/dashboard/performance', label: t('nav.performance'), icon: '📈' },
    { href: '/dashboard/settings', label: t('nav.settings'), icon: '⚙️' },
  ];

  // Fetch user data (including subscription) on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initial = saved || 'light';
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
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
  const userMenuRef = useRef<HTMLDivElement>(null);

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
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Status + Live */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/dashboard" className="flex items-center space-x-2 shrink-0">
              <Image src="/logo.svg" alt="SignalsPro" width={32} height={32} className="w-8 h-8" priority />
              <span className="text-lg font-bold hidden sm:inline">SignalsPro</span>
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
            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-sm"
              >
                <span className="text-xs">{i18nLanguages.find(l => l.code === lang)?.flag}</span>
                <span className="font-semibold text-sm">{lang}</span>
                <svg className={cn('w-3 h-3 text-muted-foreground transition-transform', langOpen && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
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

            {/* User Menu Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setProfileSubOpen(false); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
              >
                <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <svg className={cn('w-3 h-3 text-muted-foreground transition-transform', userMenuOpen && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-xl shadow-xl py-1 z-50 animate-slide-in">
                  <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    {t('menu.home')}
                  </Link>

                  <div className="relative">
                    <button onClick={() => setProfileSubOpen(!profileSubOpen)} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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
                        <button onClick={() => { setUserMenuOpen(false); window.location.href = 'mailto:support@signalspro.com?subject=Suspend%20My%20Account'; }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-orange-400 hover:bg-secondary/50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                          {t('menu.suspendAccount')}
                        </button>
                        <button onClick={() => { setUserMenuOpen(false); window.location.href = 'mailto:support@signalspro.com?subject=Delete%20My%20Account'; }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-loss hover:bg-secondary/50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          {t('menu.deleteAccount')}
                        </button>
                      </div>
                    )}
                  </div>

                  <button onClick={() => { setUserMenuOpen(false); window.location.href = 'mailto:support@signalspro.com'; }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    {t('menu.customerService')}
                  </button>

                  <div className="border-t border-border my-1" />

                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-loss hover:bg-secondary/50 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    {t('menu.logout')}
                  </button>
                </div>
              )}
            </div>
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
                pathname === item.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
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

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#1a1a2e] via-[#2d1b69] to-[#1a1a2e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image src="/logo.svg" alt="SignalsPro" width={28} height={28} className="w-7 h-7" />
                <h3 className="font-bold text-lg">SignalsPro</h3>
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
                <li><a href="mailto:support@signalspro.com" className="text-white/60 hover:text-white transition-colors">{t('footer.support.customer')}</a></li>
                <li><a href="mailto:support@signalspro.com?subject=Become%20an%20Affiliate" className="text-white/60 hover:text-white transition-colors">{t('footer.support.affiliate')}</a></li>
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
    </div>
  );
}
