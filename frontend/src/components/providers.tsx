'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { I18nProvider } from '@/lib/i18n';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { InstallBanner } from '@/components/InstallBanner';
import { CookieConsent } from '@/components/CookieConsent';
import { PocketOptionPopup } from '@/components/PocketOptionPopup';

export function Providers({ children }: { children: React.ReactNode }) {
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
        <I18nProvider>
          {children}
          <InstallBanner />
          <CookieConsent />
          <PocketOptionPopup />
        </I18nProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
