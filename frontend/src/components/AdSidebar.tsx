'use client';

import AdUnit from './AdUnit';

interface AdSidebarProps {
  publisherId: string;
  adSlot: string;
  side: 'left' | 'right';
  /** Show only on screens wider than this (default: 1280px = xl) */
  minWidth?: number;
}

/**
 * Vertical sidebar ad — visible only on desktop (≥1280px by default).
 * Displays a vertical skyscraper ad (160x600) on the left or right side.
 * 
 * Pour respecter les politiques AdSense :
 * - Masqué sur mobile/tablette
 * - Assez d'espace pour ne pas chevaucher le contenu
 * - Animations et interactions respectueuses
 */
export default function AdSidebar({ publisherId, adSlot, side, minWidth = 1280 }: AdSidebarProps) {
  return (
    <>
      {/* Inject a media-query driven style to hide on small screens */}
      <style jsx>{`
        .ad-sidebar {
          display: none;
          position: sticky;
          top: 80px;
          width: 160px;
          flex-shrink: 0;
          z-index: 0;
          align-self: flex-start;
          padding: 0;
        }

        @media (min-width: ${minWidth}px) {
          .ad-sidebar {
            display: block;
          }
        }

        .ad-sidebar-label {
          text-align: center;
          font-size: 10px;
          color: var(--muted-foreground, #9ca3af);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          opacity: 0.6;
        }

        .ad-sidebar-inside {
          min-height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <aside className={`ad-sidebar ad-sidebar-${side}`}>
        <div className="ad-sidebar-label">Publicité</div>
        <div className="ad-sidebar-inside">
          <AdUnit
            adSlot={adSlot}
            publisherId={publisherId}
            adFormat="vertical"
            responsive={false}
          />
        </div>
      </aside>
    </>
  );
}