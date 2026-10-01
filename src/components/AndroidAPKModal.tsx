import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle, 
  ExternalLink, 
  ShieldCheck, 
  X, 
  Copy, 
  Check,
  Sparkles
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { soundManager } from '../audio/soundManager';

interface AndroidAPKModalProps {
  onClose: () => void;
}

export const AndroidAPKModal: React.FC<AndroidAPKModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  // The live app URL
  const appUrl = window.location.origin;
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`;

  const handleInstallClick = async () => {
    soundManager.playClick();
    if (isInstallable) {
      const success = await install();
      if (success) {
        soundManager.playVictory();
      }
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-screen fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center px-3 select-none overflow-y-auto animate-in fade-in duration-200">
      <div className="modal-box relative w-full max-w-lg bg-slate-950 border border-red-700/60 rounded-2xl shadow-2xl p-4 sm:p-6 my-auto flex flex-col text-left max-h-[92vh] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-heading font-black text-white tracking-wider">
                ANDROID APP & APK INSTALLATION
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono-tech">
                STANDALONE MOBILE PACKAGING
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          
          {/* Method 1: Instant Native Android WebAPK (Recommended) */}
          <div className="bg-gradient-to-br from-red-950/40 to-slate-900/90 border border-red-800/60 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-heading font-bold text-white text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>METHOD 1: INSTANT ANDROID APP (WEBAPK)</span>
              </div>
              <span className="text-[9px] font-mono-tech px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                RECOMMENDED
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Google Chrome on Android generates and installs an official <strong className="text-white">WebAPK</strong> package directly on your phone. It installs to your phone's app drawer, home screen, settings, and runs in 100% fullscreen native mode without browser bars.
            </p>

            {isInstalled ? (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-2 rounded-lg font-mono-tech font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>APP ALREADY INSTALLED ON THIS DEVICE</span>
              </div>
            ) : isInstallable ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-heading font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>INSTALL APP ON THIS ANDROID PHONE</span>
              </button>
            ) : (
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1 font-mono-tech">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>HOW TO INSTALL ON YOUR ANDROID PHONE:</span>
                </div>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-400 pl-1">
                  <li>Open this game in <strong className="text-slate-200">Chrome</strong> on your Android phone.</li>
                  <li>Tap the browser menu <strong className="text-slate-200">(three dots ⋮)</strong> in the top right.</li>
                  <li>Select <strong className="text-red-400">"Install app"</strong> or <strong className="text-red-400">"Add to Home screen"</strong>.</li>
                  <li>Android will build and install the APK automatically!</li>
                </ol>
              </div>
            )}
          </div>

          {/* Method 2: Download Standalone .APK File via PWABuilder */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-heading font-bold text-white text-sm">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>METHOD 2: DOWNLOAD STANDALONE .APK FILE</span>
              </div>
              <span className="text-[9px] font-mono-tech px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                SIDELOAD / STORE
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed">
              If you need a signed <strong className="text-white">.apk file</strong> to sideload, share with friends, or publish to the Google Play Store, you can generate it in 1 click using <strong className="text-white">PWABuilder</strong> (created by Microsoft for Android packaging).
            </p>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
              <span className="font-mono-tech text-[10px] text-slate-400 truncate">
                {appUrl}
              </span>
              <button
                onClick={copyUrl}
                className="shrink-0 flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono-tech transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY URL'}</span>
              </button>
            </div>

            <a
              href={pwaBuilderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-600/50 text-white font-heading font-bold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow transition"
            >
              <span>GENERATE & DOWNLOAD .APK ON PWABUILDER</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>
          </div>

          {/* Quick Technical Summary */}
          <div className="text-[10px] font-mono-tech text-slate-500 border-t border-slate-900 pt-2 flex items-center justify-between">
            <span>PACKAGE: COM.ZOMBIESURVIVAL.LASTSTAND</span>
            <span>TARGET: ANDROID 8.0+ (API 26+)</span>
          </div>

        </div>

      </div>
    </div>
  );
};
