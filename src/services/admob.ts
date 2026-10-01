import { Capacitor } from '@capacitor/core';
import { 
  AdMob, 
  BannerAdOptions, 
  BannerAdSize, 
  BannerAdPosition, 
  BannerAdPluginEvents,
  InterstitialAdPluginEvents,
  RewardAdPluginEvents,
  AdMobRewardItem
} from '@capacitor-community/admob';

/**
 * Google's Official Android AdMob Test IDs
 */
export const ADMOB_CONFIG = {
  APP_ID: 'ca-app-pub-3940256099942544~3347511713',
  BANNER_ID: 'ca-app-pub-3940256099942544/9214589741',
  INTERSTITIAL_ID: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED_ID: 'ca-app-pub-3940256099942544/5224354917',
} as const;

export type AdStateCallback = {
  onShown?: () => void;
  onDismissed?: () => void;
  onRewardEarned?: (reward: { amount: number; type: string }) => void;
  onFailed?: (error: string) => void;
};

class AdMobService {
  private isNative: boolean = false;
  private isInitialized: boolean = false;
  private bannerRequested: boolean = false;
  private bannerLoaded: boolean = false;
  private interstitialLoaded: boolean = false;
  private rewardedLoaded: boolean = false;

  // Web listeners for React state
  private webAdModalListener: ((modalState: {
    type: 'interstitial' | 'rewarded' | null;
    onDismiss: () => void;
    onReward?: () => void;
  }) => void) | null = null;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Register Web Modal Handler for rendering interstitial/rewarded in web view
   */
  public registerWebModalHandler(
    handler: (modalState: {
      type: 'interstitial' | 'rewarded' | null;
      onDismiss: () => void;
      onReward?: () => void;
    }) => void
  ) {
    this.webAdModalListener = handler;
  }

  /**
   * Initialize Google Mobile Ads SDK
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (this.isNative) {
      try {
        await AdMob.initialize({
          initializeForTesting: true,
        });
        this.setupNativeListeners();
        this.isInitialized = true;
        // Preload interstitial and rewarded
        this.preloadInterstitial();
        this.preloadRewarded();
      } catch (err) {
        console.warn('[AdMob] Native initialization failed, falling back to web test ads:', err);
        this.isNative = false;
        this.isInitialized = true;
      }
    } else {
      this.isInitialized = true;
      // Preload web test ads
      this.preloadInterstitial();
      this.preloadRewarded();
    }
  }

  private setupNativeListeners(): void {
    // Banner events
    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      this.bannerLoaded = true;
      console.log('[AdMob] Banner loaded');
    });

    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (err) => {
      this.bannerLoaded = false;
      console.warn('[AdMob] Banner failed:', err?.message || JSON.stringify(err));
    });

    // Interstitial events
    AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
      this.interstitialLoaded = true;
      console.log('[AdMob] Interstitial loaded');
    });

    AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
      console.log('[AdMob] Interstitial shown');
    });

    AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      this.interstitialLoaded = false;
      console.log('[AdMob] Interstitial dismissed');
      this.preloadInterstitial();
    });

    AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (err) => {
      this.interstitialLoaded = false;
      console.warn('[AdMob] Interstitial failed:', err?.message || JSON.stringify(err));
    });

    // Rewarded events
    AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
      this.rewardedLoaded = true;
      console.log('[AdMob] Rewarded loaded');
    });

    AdMob.addListener(RewardAdPluginEvents.Showed, () => {
      console.log('[AdMob] Rewarded shown');
    });

    AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
      this.rewardedLoaded = false;
      console.log('[AdMob] Rewarded dismissed');
      this.preloadRewarded();
    });

    AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (err) => {
      this.rewardedLoaded = false;
      console.warn('[AdMob] Rewarded failed:', err?.message || JSON.stringify(err));
    });
  }

  /* =========================================================
     BANNER AD
     ========================================================= */

  public async showBanner(): Promise<void> {
    console.log('[AdMob] Banner requested:', ADMOB_CONFIG.BANNER_ID);
    this.bannerRequested = true;

    if (this.isNative) {
      try {
        const options: BannerAdOptions = {
          adId: ADMOB_CONFIG.BANNER_ID,
          adSize: BannerAdSize.BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: true,
        };
        await AdMob.showBanner(options);
      } catch (err: any) {
        console.warn('[AdMob] Banner failed:', err?.message || err);
      }
    } else {
      // In web, the AdMobBanner React component handles display
      console.log('[AdMob] Banner loaded');
      this.bannerLoaded = true;
    }
  }

  public async hideBanner(): Promise<void> {
    this.bannerRequested = false;
    if (this.isNative) {
      try {
        await AdMob.hideBanner();
      } catch {
        // Ignore if not currently showing
      }
    }
  }

  /* =========================================================
     INTERSTITIAL AD
     ========================================================= */

  public async preloadInterstitial(): Promise<void> {
    console.log('[AdMob] Interstitial requested:', ADMOB_CONFIG.INTERSTITIAL_ID);
    if (this.isNative) {
      try {
        await AdMob.prepareInterstitial({
          adId: ADMOB_CONFIG.INTERSTITIAL_ID,
          isTesting: true,
        });
      } catch (err: any) {
        console.warn('[AdMob] Interstitial failed:', err?.message || err);
      }
    } else {
      this.interstitialLoaded = true;
      console.log('[AdMob] Interstitial loaded');
    }
  }

  public async showInterstitialAd(onComplete?: () => void): Promise<void> {
    if (this.isNative) {
      try {
        if (!this.interstitialLoaded) {
          await this.preloadInterstitial();
        }
        console.log('[AdMob] Interstitial shown');
        await AdMob.showInterstitial();
        if (onComplete) onComplete();
      } catch (err: any) {
        console.warn('[AdMob] Interstitial failed:', err?.message || err);
        // Do not block game flow on ad failure
        if (onComplete) onComplete();
      }
    } else {
      // Web modal presentation
      console.log('[AdMob] Interstitial shown');
      if (this.webAdModalListener) {
        this.webAdModalListener({
          type: 'interstitial',
          onDismiss: () => {
            console.log('[AdMob] Interstitial dismissed');
            if (onComplete) onComplete();
          },
        });
      } else {
        console.log('[AdMob] Interstitial dismissed');
        if (onComplete) onComplete();
      }
    }
  }

  /* =========================================================
     REWARDED AD
     ========================================================= */

  public async preloadRewarded(): Promise<void> {
    console.log('[AdMob] Rewarded requested:', ADMOB_CONFIG.REWARDED_ID);
    if (this.isNative) {
      try {
        await AdMob.prepareRewardVideoAd({
          adId: ADMOB_CONFIG.REWARDED_ID,
          isTesting: true,
        });
      } catch (err: any) {
        console.warn('[AdMob] Rewarded failed:', err?.message || err);
      }
    } else {
      this.rewardedLoaded = true;
      console.log('[AdMob] Rewarded loaded');
    }
  }

  public async showRewardedAd(callbacks: {
    onRewardEarned: (reward: { amount: number; type: string }) => void;
    onDismissed?: () => void;
    onFailed?: (error: string) => void;
  }): Promise<void> {
    if (this.isNative) {
      try {
        let rewardHandled = false;
        let dismissedHandled = false;

        const rewardListener = AdMob.addListener(
          RewardAdPluginEvents.Rewarded,
          (reward: AdMobRewardItem) => {
            rewardHandled = true;
            console.log('[AdMob] Rewarded reward earned:', { amount: reward.amount, type: reward.type });
            callbacks.onRewardEarned({ amount: reward.amount, type: reward.type });
          }
        );

        const dismissListener = AdMob.addListener(
          RewardAdPluginEvents.Dismissed,
          async () => {
            if (dismissedHandled) return;
            dismissedHandled = true;
            console.log('[AdMob] Rewarded dismissed');
            try {
              (await rewardListener).remove();
              (await dismissListener).remove();
            } catch {
              // ignore
            }
            if (callbacks.onDismissed) {
              callbacks.onDismissed();
            }
          }
        );

        console.log('[AdMob] Rewarded shown');
        await AdMob.showRewardVideoAd();
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.warn('[AdMob] Rewarded failed:', msg);
        if (callbacks.onFailed) callbacks.onFailed(msg);
        if (callbacks.onDismissed) callbacks.onDismissed();
      }
    } else {
      // Web modal presentation with true reward verification
      console.log('[AdMob] Rewarded shown');
      if (this.webAdModalListener) {
        this.webAdModalListener({
          type: 'rewarded',
          onReward: () => {
            console.log('[AdMob] Rewarded reward earned:', { amount: 1, type: 'revive' });
            callbacks.onRewardEarned({ amount: 1, type: 'revive' });
          },
          onDismiss: () => {
            console.log('[AdMob] Rewarded dismissed');
            if (callbacks.onDismissed) {
              callbacks.onDismissed();
            }
          },
        });
      } else {
        console.warn('[AdMob] Rewarded failed: Modal listener not registered');
        if (callbacks.onFailed) callbacks.onFailed('Ad modal unavailable');
        if (callbacks.onDismissed) callbacks.onDismissed();
      }
    }
  }
}

export const adMobService = new AdMobService();
