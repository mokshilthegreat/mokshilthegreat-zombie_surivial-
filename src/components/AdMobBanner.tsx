import React, { useEffect, useRef } from 'react';
import { Screen } from '../App';
import { ADMOB_CONFIG, adMobService } from '../services/admob';

interface AdMobBannerProps {
  currentScreen: Screen;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({ currentScreen }) => {
  const gptSlotRef = useRef<HTMLDivElement | null>(null);

  // Preferred screens: Home, World Map, Character, Armory, Achievements, How To Play, Settings.
  // NEVER show over active gameplay ('game')!
  const isAllowedScreen = currentScreen !== 'game';

  useEffect(() => {
    if (isAllowedScreen) {
      adMobService.showBanner();
    } else {
      adMobService.hideBanner();
    }
  }, [isAllowedScreen, currentScreen]);

  // Attempt to load Google Publisher Tag if available on window
  useEffect(() => {
    if (!isAllowedScreen) return;

    try {
      const win = window as any;
      if (win.googletag && win.googletag.cmd) {
        win.googletag.cmd.push(() => {
          try {
            // Google's official test ad slot for web
            const slot = win.googletag.defineSlot('/6355419/Travel', [320, 50], 'gpt-admob-test-banner');
            if (slot) {
              slot.addService(win.googletag.pubads());
              win.googletag.pubads().enableSingleRequest();
              win.googletag.enableServices();
              win.googletag.display('gpt-admob-test-banner');
            }
          } catch {
            // Ignore if already defined
          }
        });
      }
    } catch (e) {
      console.warn('[AdMob] GPT web load note:', e);
    }
  }, [isAllowedScreen]);

  if (!isAllowedScreen) return null;

  // On Home screen ('menu'), position right above the footer so it never overlaps NEW CAMPAIGN or 6 cards.
  // On sub-screens, position safely at the bottom respecting safe-area-inset-bottom.
  const isHome = currentScreen === 'menu';

  return (
    <aside
      id="admob-banner-container"
      aria-label="Google AdMob Test Advertisement Layer"
      className={`fixed left-0 right-0 z-40 flex flex-col items-center justify-center pointer-events-auto select-none transition-all duration-200 ${
        isHome 
          ? 'bottom-[calc(30px+env(safe-area-inset-bottom,0px))]' 
          : 'bottom-[calc(4px+env(safe-area-inset-bottom,0px))]'
      }`}
      style={{
        margin: '0 auto',
        maxWidth: '100vw',
      }}
    >
      {/* 4. SMALL TEST AD LABEL (Developer Indicator - Immediately Above Banner) */}
      <div 
        className="admob-test-label flex items-center justify-between px-2 py-0.5 bg-slate-900/95 border border-b-0 border-slate-700/80 rounded-t shadow-md text-slate-400 font-mono-tech text-[9px] font-bold tracking-widest uppercase"
        style={{ width: '320px', boxSizing: 'border-box' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400">TEST AD</span>
        </div>
        <span className="text-[8px] text-slate-500 tracking-normal font-sans">
          Google AdMob • 320x50
        </span>
      </div>

      {/* 2 & 3. 320x50 TEST BANNER AD CONTAINER (Horizontally centered, clipped to 320x50, respects safe areas) */}
      <div
        id="admob-test-banner-slot"
        ref={gptSlotRef}
        className="relative w-[320px] h-[50px] bg-slate-950 border border-slate-700/80 rounded-b shadow-2xl flex items-center justify-center overflow-hidden"
        style={{
          width: '320px',
          height: '50px',
          minWidth: '320px',
          minHeight: '50px',
          maxWidth: '320px',
          maxHeight: '50px',
          boxSizing: 'border-box',
        }}
      >
        {/* Dynamic GPT container if loaded */}
        <div id="gpt-admob-test-banner" className="absolute inset-0 z-10 flex items-center justify-center" />

        {/* Google's Official AdMob Android Test Banner Creative */}
        <div className="absolute inset-0 z-0 flex flex-col justify-between p-1 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-left pointer-events-none select-none">
          {/* Top Yellow Warning Hazard Stripe matching official Google Test Ad style */}
          <div className="h-1.5 w-full rounded-sm overflow-hidden bg-amber-400/90 flex opacity-90">
            <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#000,#000_6px,#eab308_6px,#eab308_12px)]" />
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col min-w-0 pr-1">
              <div className="flex items-center gap-1">
                <span className="px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-heading font-black text-[9px] leading-tight">
                  TEST AD
                </span>
                <span className="text-[10px] font-heading font-bold text-slate-200 truncate">
                  Google AdMob Android
                </span>
              </div>
              <span className="text-[8px] font-mono-tech text-slate-400 truncate">
                {ADMOB_CONFIG.BANNER_ID}
              </span>
            </div>

            {/* Official Google Test Badge */}
            <div className="shrink-0 flex items-center gap-1 bg-slate-800/90 border border-slate-700 px-1.5 py-0.5 rounded text-[8px] font-mono-tech text-amber-300">
              <svg className="w-2.5 h-2.5 fill-current text-amber-400" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>320x50</span>
            </div>
          </div>

          <div className="text-[7.5px] font-mono-tech text-slate-500 px-1 truncate flex items-center justify-between">
            <span>Nice job declaring test unit!</span>
            <span className="text-slate-600">ca-app-pub-3940256099942544</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
