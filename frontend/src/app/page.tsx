'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useI18n, languages as i18nLanguages } from '@/lib/i18n';

export default function Home() {
  const [theme, setTheme] = useState('light');
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { lang, setLang, t } = useI18n();

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <header className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background overflow-hidden pointer-events-none" />
        
        {/* Nav */}
        <nav className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto gap-2">
          <div className="flex items-center space-x-2 min-w-0 shrink-0">
            <Image src="/logo.svg" alt="Market Signals24" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8" priority />
            <span className="text-base sm:text-xl font-bold hidden min-[480px]:inline">Market Signals24</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-4">
            <Link href="/tarifs" className="text-xs sm:text-base text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              {t('nav.pricing')}
            </Link>
            <Link href="/login" className="text-xs sm:text-base text-muted-foreground hover:text-foreground transition-colors hidden sm:inline whitespace-nowrap">
              {t('nav.login')}
            </Link>
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-base font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              {t('nav.start')}
            </Link>

            {/* Language Selector */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1.5 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-xs sm:text-sm"
              >
                <span className="text-xs">{i18nLanguages.find(l => l.code === lang)?.flag}</span>
                <span className="text-muted-foreground hidden sm:inline">{lang}</span>
                <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-xl shadow-xl py-1 z-50">
                  {i18nLanguages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary/50 transition-colors ${
                        lang === l.code ? 'text-primary font-semibold' : 'text-foreground'
                      }`}
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
              className="p-1.5 sm:p-2 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
              title={theme === 'light' ? t('header.darkMode') : t('header.lightMode')}
            >
              {theme === 'light' ? (
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 text-center">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm mb-4 sm:mb-6">
            <span className="w-2 h-2 bg-profit rounded-full animate-pulse" />
            <span>{t('hero.badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6">
            {t('hero.title1')}
            <br />
            <span className="text-primary">{t('hero.title2')}</span>
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-10 px-2">
            {t('hero.desc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-16 px-4">
            <Link
              href="/dashboard"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors w-full sm:w-auto text-center"
            >
              {t('hero.demo')}
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto px-2">
            {[
              { label: t('stats.winRate'), value: '87.3%', icon: '🎯' },
              { label: t('stats.signalsDay'), value: '100-700', icon: '📡' },
              { label: t('stats.latency'), value: '<100ms', icon: '⚡' },
              { label: t('stats.assets'), value: '30+', icon: '📊' },
            ].map((stat) => (
              <div key={stat.label} className="stat-card text-center">
                <span className="text-2xl mb-1 block">{stat.icon}</span>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">{t('features.title')}</h2>
        <p className="text-sm sm:text-base text-muted-foreground text-center max-w-2xl mx-auto mb-8 sm:mb-16 px-2">
          {t('features.desc')}
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Level 1 */}
          <div className="signal-card p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('features.level1.title')}</h3>
            <p className="text-muted-foreground mb-4">{t('features.level1.desc')}</p>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2"><span className="text-profit">✓</span> {t('features.level1.f1')}</li>
              <li className="flex items-center gap-2"><span className="text-profit">✓</span> {t('features.level1.f2')}</li>
              <li className="flex items-center gap-2"><span className="text-profit">✓</span> {t('features.level1.f3')}</li>
            </ul>
          </div>

          {/* Level 2 */}
          <div className="signal-card p-6 border-primary/30">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">👨‍💼</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('features.level2.title')}</h3>
            <p className="text-muted-foreground mb-4">{t('features.level2.desc')}</p>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2"><span className="text-profit">✓</span> {t('features.level2.f1')}</li>
              <li className="flex items-center gap-2"><span className="text-profit">✓</span> {t('features.level2.f2')}</li>
              <li className="flex items-center gap-2"><span className="text-profit">✓</span> {t('features.level2.f3')}</li>
            </ul>
          </div>

          {/* Level 3 */}
          <div className="signal-card p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('features.level3.title')}</h3>
            <p className="text-muted-foreground mb-4">{t('features.level3.desc')}</p>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2"><span className="text-profit">✓</span> {t('features.level3.f1')}</li>
              <li className="flex items-center gap-2"><span className="text-profit">✓</span> {t('features.level3.f2')}</li>
              <li className="flex items-center gap-2"><span className="text-profit">✓</span> {t('features.level3.f3')}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="bg-secondary border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">{t('partners.label')}</span>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t('partners.title')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">

            {/* Partner 2 — imparami.com */}
            <a
              href="https://imparami.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  I
                </div>
                <div>
                  <p className="font-semibold text-card-foreground text-sm group-hover:text-primary transition-colors">imparami.com</p>
                  <p className="text-muted-foreground text-xs">{t('partners.imparami.subtitle')}</p>
                </div>
                <svg className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">{t('partners.imparami.desc')}</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {[t('partners.tag.tutors'), t('partners.tag.price'), t('partners.tag.subjects'), t('partners.tag.online')].map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20">{tag}</span>
                ))}
              </div>
            </a>

          </div>
        </div>
      </section>

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
                <li><span className="text-white/60 hover:text-white transition-colors cursor-pointer">{t('footer.services.forex')}</span></li>
                <li><span className="text-white/60 hover:text-white transition-colors cursor-pointer">{t('footer.services.crypto')}</span></li>
                <li><span className="text-white/60 hover:text-white transition-colors cursor-pointer">{t('footer.services.indices')}</span></li>
                <li><span className="text-white/60 hover:text-white transition-colors cursor-pointer">{t('footer.services.analysis')}</span></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">{t('footer.support')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@marketsignals24.com" className="text-white/60 hover:text-white transition-colors">{t('footer.support.customer')}</a></li>
                <li>
                  <a href="mailto:support@marketsignals24.com" className="text-violet-400/80 hover:text-violet-300 transition-colors text-xs font-mono">
                    support@marketsignals24.com
                  </a>
                </li>
                <li><a href="mailto:support@marketsignals24.com?subject=Become%20an%20Affiliate" className="text-white/60 hover:text-white transition-colors">{t('footer.support.affiliate')}</a></li>
                <li><span className="text-white/60 hover:text-white transition-colors cursor-pointer">{t('footer.support.faq')}</span></li>
                <li><Link href="/blog" className="text-white/60 hover:text-white transition-colors">Blog</Link></li>
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
