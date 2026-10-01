import React from 'react';
import { 
  Play, 
  MapPin, 
  User, 
  Crosshair, 
  Award, 
  Settings, 
  Home, 
  RotateCcw,
  X
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenWorldMap: () => void;
  onOpenCharacters: () => void;
  onOpenArmory: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  onQuitToMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenWorldMap,
  onOpenCharacters,
  onOpenArmory,
  onOpenAchievements,
  onOpenSettings,
  onQuitToMenu,
}) => {
  return (
    <div className="modal-screen fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center px-4 select-none animate-in fade-in duration-150">
      <div className="modal-box relative w-full max-w-sm bg-slate-950 border border-red-900/60 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col items-center text-center">
        
        {/* Top close button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onResume();
          }}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition"
          title="Resume Game [ESC]"
        >
          <X className="w-4 h-4" />
        </button>

        <span className="text-[11px] font-mono-tech text-red-500 uppercase tracking-widest mb-1 font-bold">
          COMBAT SUSPENDED
        </span>
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-wider mb-5">
          GAME MENU
        </h2>

        <div className="w-full flex flex-col gap-2 font-heading font-bold text-sm tracking-wider">
          
          {/* 1. RESUME */}
          <button
            onClick={() => {
              soundManager.playClick();
              onResume();
            }}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 active:scale-98 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 font-black cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME MISSION</span>
          </button>

          {/* 2. WORLD MAP */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenWorldMap();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-600 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-red-400" />
            <span>WORLD MAP</span>
          </button>

          {/* 3. CHARACTERS */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenCharacters();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-600 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <User className="w-4 h-4 text-amber-400" />
            <span>CHARACTERS</span>
          </button>

          {/* 4. ARMORY */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenArmory();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-600 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Crosshair className="w-4 h-4 text-sky-400" />
            <span>ARMORY</span>
          </button>

          {/* 5. ACHIEVEMENTS */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAchievements();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-600 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Award className="w-4 h-4 text-purple-400" />
            <span>ACHIEVEMENTS</span>
          </button>

          {/* 6. SETTINGS */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenSettings();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-600 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>SETTINGS & AUDIO</span>
          </button>

          {/* RESTART SECTOR */}
          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800/80 transition flex items-center justify-center gap-2 text-xs font-mono-tech mt-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESTART SECTOR</span>
          </button>

          {/* 7. MAIN MENU */}
          <button
            onClick={() => {
              soundManager.playClick();
              onQuitToMenu();
            }}
            className="w-full py-2 rounded-xl bg-slate-950 hover:bg-red-950/30 text-slate-400 hover:text-red-400 border border-slate-800 transition flex items-center justify-center gap-2 text-xs font-mono-tech cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>RETURN TO MAIN MENU</span>
          </button>
        </div>

      </div>
    </div>
  );
};
