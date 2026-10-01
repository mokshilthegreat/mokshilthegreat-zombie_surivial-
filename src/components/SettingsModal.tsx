import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Volume2, 
  Sliders, 
  Smartphone, 
  RotateCcw, 
  AlertTriangle, 
  X, 
  ArrowLeft,
  Check,
  Download
} from 'lucide-react';
import { GameSaveData, GameSettings } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { resetGameData, saveGameData } from '../game/storage';
import { AndroidAPKModal } from './AndroidAPKModal';

interface SettingsModalProps {
  saveData: GameSaveData;
  onSaveDataUpdated: (newData: GameSaveData) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  saveData,
  onSaveDataUpdated,
  onClose,
}) => {
  const [settings, setSettings] = useState<GameSettings>(saveData.settings);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showAPKModal, setShowAPKModal] = useState(false);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundManager.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    const fullSave: GameSaveData = {
      ...saveData,
      settings: updated,
    };
    saveGameData(fullSave);
    onSaveDataUpdated(fullSave);

    if (key === 'masterVolume' || key === 'sfxVolume' || key === 'ambientVolume') {
      soundManager.setVolumes(
        key === 'masterVolume' ? (value as number) : updated.masterVolume,
        key === 'sfxVolume' ? (value as number) : updated.sfxVolume,
        key === 'ambientVolume' ? (value as number) : updated.ambientVolume
      );
      if (key === 'sfxVolume') soundManager.playShoot('pistol');
    }
  };

  const handleResetData = () => {
    const fresh = resetGameData();
    onSaveDataUpdated(fresh);
    setConfirmReset(false);
    soundManager.playVictory();
    onClose();
  };

  return (
    <div className="page-screen fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-start px-2 sm:px-3 select-none overflow-y-auto animate-in fade-in duration-200">
      <div className="page-content relative w-full max-w-[520px] bg-slate-950 border border-slate-800 rounded-xl shadow-2xl flex flex-col my-auto overflow-hidden">
        
        {/* Sticky Header with BACK and X navigation buttons */}
        <div className="modal-header page-header sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white transition font-heading font-bold text-sm tracking-wider shadow-md group"
              title="Return to Main Menu [ESC]"
            >
              <ArrowLeft className="w-4 h-4 text-red-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>BACK</span>
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <Settings className="w-5 h-5 text-slate-400" />
              <div>
                <h2 className="text-base sm:text-lg font-heading font-bold text-white tracking-wider leading-tight">
                  TACTICAL CONFIGURATION
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-400 font-mono-tech leading-none">
                  AUDIO SYNTHESIZER, GRAPHICS DETAIL & CONTROL PREFERENCES
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 sm:p-2.5 text-slate-300 hover:text-white rounded-lg bg-slate-900/90 hover:bg-red-600/80 active:scale-95 border border-slate-700 hover:border-red-500 transition shadow-lg flex items-center justify-center group"
            title="Close Menu [ESC]"
          >
            <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 font-mono-tech">
          
          {/* Audio Section */}
          <div className="space-y-4">
            <h3 className="text-xs text-red-400 uppercase tracking-widest flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              PROCEDURAL AUDIO SYNTHESIZER
            </h3>
            
            {/* Master Volume */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-4">
              <div className="w-40">
                <span className="text-xs text-slate-300 block font-bold">MASTER VOLUME</span>
                <span className="text-xs text-slate-500">{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => updateSetting('masterVolume', parseFloat(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>

            {/* SFX Volume */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-4">
              <div className="w-40">
                <span className="text-xs text-slate-300 block font-bold">SFX WEAPONS & COMBAT</span>
                <span className="text-xs text-slate-500">{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => updateSetting('sfxVolume', parseFloat(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>

            {/* Ambient Volume */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-4">
              <div className="w-40">
                <span className="text-xs text-slate-300 block font-bold">AMBIENT ATMOSPHERE</span>
                <span className="text-xs text-slate-500">{Math.round(settings.ambientVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.ambientVolume}
                onChange={(e) => updateSetting('ambientVolume', parseFloat(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
          </div>

          {/* Graphics & Effects */}
          <div className="space-y-4">
            <h3 className="text-xs text-red-400 uppercase tracking-widest flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              VISUAL RENDERING & CINEMATICS
            </h3>

            {/* Screen Shake */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300 block font-bold">DYNAMIC SCREEN SHAKE</span>
                <span className="text-[11px] text-slate-500">Camera tremors on heavy recoil and detonations</span>
              </div>
              <button
                onClick={() => updateSetting('screenShake', !settings.screenShake)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                  settings.screenShake ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.screenShake ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Blood Detail */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300 block font-bold">BLOOD & GORE PARTICLES</span>
                <span className="text-[11px] text-slate-500">Persistent ground decals and splatter intensity</span>
              </div>
              <div className="flex gap-1.5">
                {(['normal', 'high', 'extreme'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => updateSetting('bloodDetail', lvl)}
                    className={`px-2.5 py-1 rounded text-xs uppercase font-bold transition ${
                      settings.bloodDetail === lvl ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Android APK & App Installation */}
            <div className="bg-gradient-to-r from-red-950/40 to-slate-900/80 p-3 rounded-lg border border-red-800/60 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-white block font-bold flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-red-400" />
                  ANDROID APP & APK INSTALLATION
                </span>
                <span className="text-[11px] text-slate-400">Install native WebAPK on phone or download standalone .apk file</span>
              </div>
              <button
                onClick={() => setShowAPKModal(true)}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-bold font-heading tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-950 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>INSTALL / APK</span>
              </button>
            </div>
          </div>

          {/* Danger Zone: Reset Save Data */}
          <div className="pt-4 border-t border-slate-800">
            {confirmReset ? (
              <div className="bg-red-950/50 border border-red-600 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  CONFIRM LOCAL PROGRESS RESET?
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  This will erase all unlocked weapons, attributes, and completed sectors in browser localStorage.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetData}
                    className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
                  >
                    YES, WIPE ALL DATA
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-2.5 rounded bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900 transition text-xs font-bold flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                RESET SAVE DATA (START FRESH)
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ANDROID APK & PWA INSTALLATION MODAL */}
      {showAPKModal && (
        <AndroidAPKModal onClose={() => setShowAPKModal(false)} />
      )}
    </div>
  );
};
