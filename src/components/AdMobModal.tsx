import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Award, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { ADMOB_CONFIG } from '../services/admob';
import { soundManager } from '../audio/soundManager';

interface AdMobModalProps {
  modalState: {
    type: 'interstitial' | 'rewarded' | null;
    onDismiss: () => void;
    onReward?: () => void;
  } | null;
  onClose: () => void;
}

export const AdMobModal: React.FC<AdMobModalProps> = ({ modalState, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [canClose, setCanClose] = useState(false);
  const [rewardGranted, setRewardGranted] = useState(false);
  const [showForfeitPrompt, setShowForfeitPrompt] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!modalState || !modalState.type) return;

    if (modalState.type === 'interstitial') {
      setSecondsLeft(3);
      setCanClose(false);
      setRewardGranted(false);
      setShowForfeitPrompt(false);

      const timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }

    if (modalState.type === 'rewarded') {
      setSecondsLeft(5);
      setCanClose(false);
      setRewardGranted(false);
      setShowForfeitPrompt(false);

      const timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            setRewardGranted(true);
            if (modalState.onReward) {
              modalState.onReward();
            }
            try {
              soundManager.playPickup('dna');
            } catch {
              // ignore
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [modalState]);

  if (!modalState || !modalState.type) return null;

  const isRewarded = modalState.type === 'rewarded';

  const handleCloseAttempt = () => {
    soundManager.playClick();
    if (isRewarded && !rewardGranted) {
      // User trying to quit before reward is earned
      setShowForfeitPrompt(true);
      if (videoRef.current) videoRef.current.pause();
    } else {
      modalState.onDismiss();
      onClose();
    }
  };

  const handleConfirmForfeit = () => {
    setShowForfeitPrompt(false);
    modalState.onDismiss();
    onClose();
  };

  const handleResumeVideo = () => {
    setShowForfeitPrompt(false);
    if (videoRef.current) videoRef.current.play().catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg flex flex-col items-center justify-between p-3 sm:p-6 select-none animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* ADMOB TEST TOP HEADER BAR                                 */}
      {/* ========================================================= */}
      <div className="w-full max-w-xl flex items-center justify-between py-2 px-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-mono-tech shadow-lg">
        {/* Left: Test Ad Warning Badge */}
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-heading font-black text-xs uppercase flex items-center gap-1 shadow-sm">
            <span>TEST AD</span>
          </div>
          <span className="text-slate-300 font-bold hidden xs:inline">
            Google AdMob {isRewarded ? 'Rewarded Video' : 'Interstitial'}
          </span>
        </div>

        {/* Center / Right: Countdown & Close Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isRewarded ? (
            rewardGranted ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>REWARD EARNED!</span>
              </span>
            ) : (
              <span className="text-amber-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Reward in {secondsLeft}s
              </span>
            )
          ) : (
            !canClose && (
              <span className="text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Skip in {secondsLeft}s
              </span>
            )
          )}

          {/* Close Button */}
          <button
            onClick={handleCloseAttempt}
            className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
              canClose
                ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-md active:scale-95'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
            }`}
            title="Close Ad"
          >
            <X className="w-4 h-4" />
            <span className="text-[11px] font-heading font-bold pr-1">
              {canClose ? 'CLOSE' : 'SKIP'}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* AD CREATIVE CANVAS                                        */}
      {/* ========================================================= */}
      <div className="relative w-full max-w-xl flex-1 my-3 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-2xl">
        {isRewarded ? (
          /* REWARDED VIDEO PLAYER */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain pointer-events-none"
              onEnded={() => {
                setRewardGranted(true);
                setCanClose(true);
                if (modalState.onReward) modalState.onReward();
              }}
            />

            {/* Official Overlay Badge */}
            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono-tech">
              <Award className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400">TEST REWARDED AD UNIT</div>
                <div className="text-amber-400 font-bold text-[11px]">{ADMOB_CONFIG.REWARDED_ID}</div>
              </div>
            </div>

            {/* Reward Earned Full Splash Overlay */}
            {rewardGranted && (
              <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-3 text-emerald-400">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-heading font-black text-white tracking-widest uppercase">
                  REWARD CONFIRMED
                </h3>
                <p className="text-xs font-mono-tech text-emerald-300 mt-1 max-w-xs">
                  Google AdMob callback verified. Revive protocol ready. Click CLOSE to return to battle!
                </p>
                <button
                  onClick={handleCloseAttempt}
                  className="mt-5 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-black text-sm tracking-wider shadow-lg active:scale-95 transition cursor-pointer"
                >
                  CLAIM & CONTINUE MISSION
                </button>
              </div>
            )}
          </div>
        ) : (
          /* INTERSTITIAL AD CREATIVE */
          <div className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-center">
            <div className="w-full flex items-center justify-between text-xs font-mono-tech text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Play className="w-3.5 h-3.5 fill-current" /> GOOGLE ADMOB TEST INTERSTITIAL
              </span>
              <span>{ADMOB_CONFIG.INTERSTITIAL_ID}</span>
            </div>

            <div className="my-auto flex flex-col items-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white mb-4 shadow-xl border border-red-500/50">
                <Award className="w-10 h-10" />
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-black text-white tracking-wide uppercase">
                TACTICAL GEAR SHOWCASE
              </h3>
              <p className="text-xs text-slate-300 font-sans mt-2 leading-relaxed">
                Official Google AdMob Interstitial test creative rendered during level transition.
                No gameplay was interrupted.
              </p>
              <div className="mt-4 px-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-[11px] font-mono-tech text-slate-400">
                Unit: {ADMOB_CONFIG.INTERSTITIAL_ID}
              </div>
            </div>

            <div className="w-full pt-3 border-t border-slate-800 flex items-center justify-center">
              {canClose ? (
                <button
                  onClick={handleCloseAttempt}
                  className="w-full max-w-xs py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-sm tracking-widest shadow-xl transition active:scale-95 cursor-pointer"
                >
                  CONTINUE TO NEXT SECTOR
                </button>
              ) : (
                <div className="text-xs font-mono-tech text-slate-500 animate-pulse">
                  Ad ready to close in {secondsLeft} seconds...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* EARLY CLOSE FORFEIT PROMPT (REWARDED AD ONLY)             */}
      {/* ========================================================= */}
      {showForfeitPrompt && (
        <div className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-950 border border-red-600/80 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-500 border border-red-500/50 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-heading font-bold text-white tracking-wide">
              FORFEIT REVIVE REWARD?
            </h4>
            <p className="text-xs text-slate-300 font-sans mt-2 leading-relaxed">
              If you close this advertisement before it completes, your survivor will NOT be revived in the current sector.
            </p>
            <div className="w-full grid grid-cols-2 gap-2 mt-5">
              <button
                onClick={handleResumeVideo}
                className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold text-xs tracking-wider transition active:scale-95 cursor-pointer"
              >
                KEEP WATCHING
              </button>
              <button
                onClick={handleConfirmForfeit}
                className="py-2.5 rounded-xl bg-slate-900 hover:bg-red-950 text-red-400 border border-red-900/60 font-heading font-bold text-xs tracking-wider transition active:scale-95 cursor-pointer"
              >
                FORFEIT & CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-[10px] font-mono-tech text-slate-500 text-center">
        Google Mobile Ads SDK • Official Test Mode ca-app-pub-3940256099942544
      </div>
    </div>
  );
};
