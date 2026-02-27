'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\d*\/?$/, '').replace(/\/+$/, '');

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('auth.backToLogin')}
          </Link>
        </div>

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
            <Image src="/logo.svg" alt="Market Signals24" width={36} height={36} className="w-9 h-9" />
            <span className="gradient-text">Market Signals24</span>
          </Link>
          <p className="text-muted-foreground mt-2">{t('auth.forgotDesc')}</p>
        </div>

        <div className="signal-card p-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-profit/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-profit" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">{t('auth.forgotSuccess')}</h2>
              <p className="text-sm text-muted-foreground">{t('auth.forgotSuccessDesc')}</p>
              <Link href="/login" className="inline-block mt-4 text-primary hover:underline text-sm font-medium">
                {t('auth.backToLogin')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-loss/10 border border-loss/20 rounded-lg text-loss text-sm">{error}</div>
              )}
              <div>
                <label className="text-sm font-medium mb-1 block">{t('auth.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="vous@email.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? t('auth.loggingIn') : t('auth.forgotBtn')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
