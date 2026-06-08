'use client';

import { useEffect, useRef } from 'react';

interface AdUnitProps {
  /** AdSense ad slot ID (data-ad-slot) */
  adSlot: string;
  /** Publisher ID (data-ad-client) */
  publisherId: string;
  /** Format: 'auto' | 'vertical' | 'horizontal' | 'rectangle' */
  adFormat?: 'auto' | 'vertical' | 'horizontal' | 'rectangle';
  /** Responsive: true (recommended) */
  responsive?: boolean;
  /** Custom className for the wrapper */
  className?: string;
  /** Optional style overrides */
  style?: React.CSSProperties;
}

/**
 * A single Google AdSense ad unit.
 * 
 * Usage:
 * <AdUnit adSlot="1234567890" publisherId="ca-pub-XXXXXXXX" adFormat="vertical" />
 */
export default function AdUnit({
  adSlot,
  publisherId,
  adFormat = 'auto',
  responsive = true,
  className = '',
  style,
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    if (!adRef.current) return;

    // Push the ad to AdSense
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        (window as any).adsbygoogle.push({});
        initializedRef.current = true;
      }
    } catch (err) {
      console.warn('AdSense push error:', err);
    }
  }, []);

  // Format dimensions
  const formatStyles: Record<string, React.CSSProperties> = {
    auto: { width: '100%', minHeight: '90px' },
    vertical: { width: '160px', minHeight: '600px' },
    horizontal: { width: '100%', minHeight: '90px' },
    rectangle: { width: '300px', minHeight: '250px' },
  };

  const computedStyle: React.CSSProperties = {
    display: 'block',
    ...formatStyles[adFormat],
    ...style,
  };

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={computedStyle}
        data-ad-client={publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat === 'vertical' ? 'vertical' : 'auto'}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}