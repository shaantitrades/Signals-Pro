'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { I18nProvider, type LangCode } from '@/lib/i18n';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { InstallBanner } from '@/components/InstallBanner';
import { CookieConsent } from '@/components/CookieConsent';

export function Providers({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang?: LangCode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  }));

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <I18nProvider initialLang={initialLang}>
          {children}
          <InstallBanner />
          <CookieConsent />
        </I18nProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
