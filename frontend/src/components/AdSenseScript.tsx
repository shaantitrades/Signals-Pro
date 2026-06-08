'use client';

import { useEffect } from 'react';

interface AdSenseScriptProps {
  publisherId: string;
}

/**
 * Loads the Google AdSense script and initializes ad units.
 * Must be placed in the layout or a high-level component.
 */
export default function AdSenseScript({ publisherId }: AdSenseScriptProps) {
  useEffect(() => {
    // Only load on client side
    if (typeof window === 'undefined') return;

    // Avoid duplicate script injection
    if (document.querySelector('script[data-ad-client]')) return;

    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-ad-client', publisherId);
    document.head.appendChild(script);

    return () => {
      // Cleanup not strictly necessary but good practice
      const existing = document.querySelector('script[data-ad-client]');
      if (existing) {
        existing.remove();
      }
      // Also remove any ad-related global state
      const adscripts = document.querySelectorAll('script[src*="adsbygoogle"]');
      adscripts.forEach((s) => s.remove());
    };
  }, [publisherId]);

  return null;
}