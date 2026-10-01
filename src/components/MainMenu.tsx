import React, { useState } from 'react';
import { 
  Play, 
  Map, 
  Crosshair, 
  User, 
  Trophy, 
  HelpCircle, 
  Settings, 
  Coins, 
  Dna, 
  RotateCcw,
  Sparkles,
  Flame
} from 'lucide-react';
import { GameSaveData } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { CinematicBackground } from './CinematicBackground';
import { GameLogo } from './GameLogo';
import { SurvivorHeroVisual } from './SurvivorHeroVisual';

interface MainMenuProps {
  saveData: GameSaveData;
  onPlay: () => void;
  onNewGame?: () => void;
  onOpenWorldMap: () => void;
  onOpenArmory: () => void;
  onOpenCharacter: () => void;
  onOpenAchievements: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  saveData,
  onPlay,
  onNewGame,
  onOpenWorldMap,
  onOpenArmory,
  onOpenCharacter,
  onOpenAchievements,
  onOpenHowToPlay,
  onOpenSettings,
}) => {
  const [showNewGameModal, setShowNewGameModal] = useState(false);

  const handleButtonClick = (action: () => void) => {
    soundManager.init();
    soundManager.playClick();
    action();
  };

  const handleNewGameClick = () => {
    soundManager.init();
    soundManager.playClick();
    if (saveData.completedLocations.length > 0 || saveData.playerLevel > 1) {
      setShowNewGameModal(true);
    } else {
      if (onNewGame) onNewGame();
      else onPlay();
    }
  };

  return (
    <div className="home-screen select-none touch-none">
      {/* 1. Cinematic Background with Depth & Fog */}
      <CinematicBackground />

      {/* ========================================================= */}
      {/* TOP HUD: Level/Outbreak, Currencies, Settings Icon        */}
      {/* ========================================================= */}
      <header className="home-header home-top-hud">
        {/* Left: Survivor Rank & Status */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 border border-red-500/60 flex items-center justify-center font-heading font-black text-white text-sm sm:text-base shadow-lg shadow-red-950">
            {saveData.playerLevel}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono-tech text-red-400 font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>OUTBREAK LVL 4</span>
            </div>
            <h3 className="text-xs sm:text-sm font-heading font-bold text-white tracking-wide">
              OPERATIVE
            </h3>
          </div>
        </div>

        {/* Right: Coins, Zombie DNA, Settings Icon */}
        <div className="flex items-center gap-2 sm:gap-2.5 font-mono-tech text-xs sm:text-sm">
          {/* Coins Badge */}
          <button 
            onClick={() => handleButtonClick(onOpenArmory)}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 px-2.5 py-1 rounded-xl text-amber-400 font-bold shadow-md cursor-pointer transition active:scale-95"
            title="Coins - Click to open Armory"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{saveData.coins}</span>
          </button>

          {/* Zombie DNA Badge */}
          <button 
            onClick={() => handleButtonClick(onOpenCharacter)}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-purple-500/40 px-2.5 py-1 rounded-xl text-purple-400 font-bold shadow-md cursor-pointer transition active:scale-95"
            title="Zombie DNA - Click to open Characters"
          >
            <Dna className="w-3.5 h-3.5 text-purple-400" />
            <span>{saveData.zombieDna}</span>
          </button>

          {/* Settings Icon Button */}
          <button
            onClick={() => handleButtonClick(onOpenSettings)}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 text-slate-300 hover:text-white transition active:scale-95 shadow cursor-pointer"
            title="Game Settings"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTENT WRAPPER: home-main                           */}
      {/* ========================================================= */}
      <div className="home-main">
        {/* ========================================================= */}
        {/* HERO: LOGO & SURVIVOR VISUAL                              */}
        {/* ========================================================= */}
        <div className="home-hero">
          {/* GAME LOGO */}
          <div className="shrink-0 mb-1">
            <GameLogo size="lg" />
          </div>

          {/* HERO SURVIVOR VISUAL: Tactical human operative holding gun */}
          <div className="relative flex items-center justify-center shrink-0 my-0.5 sm:my-1">
            <div className="absolute inset-0 -m-8 bg-radial from-red-600/25 via-orange-600/10 to-transparent blur-2xl pointer-events-none" />
            
            <div className="relative z-10 filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] max-h-[165px] xs:max-h-[195px] sm:max-h-[235px] flex items-center justify-center">
              <SurvivorHeroVisual 
                saveData={saveData} 
                className="h-[155px] xs:h-[185px] sm:h-[220px] w-auto object-contain pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* START MISSION BUTTON                                      */}
        {/* ========================================================= */}
        <div className="w-full max-w-[460px] mx-auto z-20">
          <button
            onClick={() => handleButtonClick(onPlay)}
            className="start-mission group relative w-full py-3 sm:py-3.5 px-4 sm:px-5 rounded-[18px] bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-400 active:scale-98 text-white flex items-center justify-between transition-all shadow-[0_0_30px_rgba(239,68,68,0.55)] border-2 border-red-400/80 overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-red-400/30">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm sm:text-base md:text-lg font-black tracking-widest text-white drop-shadow font-heading">
                  {saveData.completedLocations.length > 0 ? 'CONTINUE MISSION' : 'START MISSION'}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono-tech text-red-200 uppercase tracking-widest font-normal">
                  DEPLOY TO ACTIVE SECTOR
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono-tech px-2.5 py-1 rounded-lg bg-black/50 text-red-100 border border-red-300/40">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-bold">DEPLOY</span>
            </div>
          </button>
        </div>

        {/* ========================================================= */}
        {/* SIX MENU CARDS: MAP, CHARACTERS, ARMORY, ACHIEVE, GUIDE, CONFIG */}
        {/* ========================================================= */}
        <div className="home-menu w-full max-w-[460px] mx-auto z-20">
          {/* 1. WORLD MAP */}
          <button
            onClick={() => handleButtonClick(onOpenWorldMap)}
            className="menu-card rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-98 text-slate-200 hover:text-white border border-slate-700/80 hover:border-red-500/60 p-2.5 flex items-center justify-between transition backdrop-blur-md shadow-md cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Map className="w-4 h-4 text-red-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs sm:text-sm font-heading font-bold truncate">WORLD MAP</span>
                <span className="text-[9px] font-mono-tech text-slate-400 truncate">SECTORS</span>
              </div>
            </div>
            <span className="text-[9px] font-mono-tech text-red-400/90 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900/50 shrink-0">
              {saveData.completedLocations.length}/8
            </span>
          </button>

          {/* 2. CHARACTERS */}
          <button
            onClick={() => handleButtonClick(onOpenCharacter)}
            className="menu-card rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-98 text-slate-200 hover:text-white border border-slate-700/80 hover:border-amber-500/60 p-2.5 flex items-center justify-between transition backdrop-blur-md shadow-md cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <User className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs sm:text-sm font-heading font-bold truncate">CHARACTERS</span>
                <span className="text-[9px] font-mono-tech text-slate-400 truncate">ROSTER & DNA</span>
              </div>
            </div>
            <span className="text-[9px] font-mono-tech text-amber-400/90 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-900/50 shrink-0">
              UPGRADE
            </span>
          </button>

          {/* 3. ARMORY */}
          <button
            onClick={() => handleButtonClick(onOpenArmory)}
            className="menu-card rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-98 text-slate-200 hover:text-white border border-slate-700/80 hover:border-sky-500/60 p-2.5 flex items-center justify-between transition backdrop-blur-md shadow-md cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Crosshair className="w-4 h-4 text-sky-400 shrink-0 group-hover:rotate-90 transition-transform" />
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs sm:text-sm font-heading font-bold truncate">ARMORY</span>
                <span className="text-[9px] font-mono-tech text-slate-400 truncate">WEAPONS</span>
              </div>
            </div>
            <span className="text-[9px] font-mono-tech text-sky-400/90 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-900/50 shrink-0">
              ARSENAL
            </span>
          </button>

          {/* 4. ACHIEVEMENTS */}
          <button
            onClick={() => handleButtonClick(onOpenAchievements)}
            className="menu-card rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-98 text-slate-200 hover:text-white border border-slate-700/80 hover:border-purple-500/60 p-2.5 flex items-center justify-between transition backdrop-blur-md shadow-md cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Trophy className="w-4 h-4 text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs sm:text-sm font-heading font-bold truncate">ACHIEVE</span>
                <span className="text-[9px] font-mono-tech text-slate-400 truncate">REWARDS</span>
              </div>
            </div>
            <span className="text-[9px] font-mono-tech text-purple-400/90 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-900/40 shrink-0">
              MEDALS
            </span>
          </button>

          {/* 5. HOW TO PLAY */}
          <button
            onClick={() => handleButtonClick(onOpenHowToPlay)}
            className="menu-card rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-98 text-slate-200 hover:text-white border border-slate-700/80 hover:border-emerald-500/60 p-2.5 flex items-center justify-between transition backdrop-blur-md shadow-md cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs sm:text-sm font-heading font-bold truncate">HOW TO PLAY</span>
                <span className="text-[9px] font-mono-tech text-slate-400 truncate">INTEL</span>
              </div>
            </div>
            <span className="text-[9px] font-mono-tech text-emerald-400/90 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900/50 shrink-0">
              GUIDE
            </span>
          </button>

          {/* 6. SETTINGS */}
          <button
            onClick={() => handleButtonClick(onOpenSettings)}
            className="menu-card rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-98 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-500 p-2.5 flex items-center justify-between transition backdrop-blur-md shadow-md cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Settings className="w-4 h-4 text-slate-400 shrink-0 group-hover:rotate-90 transition-transform" />
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs sm:text-sm font-heading font-bold truncate">SETTINGS</span>
                <span className="text-[9px] font-mono-tech text-slate-400 truncate">CONFIG</span>
              </div>
            </div>
            <span className="text-[9px] font-mono-tech text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 shrink-0">
              AUDIO
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FOOTER: Tactical Status with Campaign Reset Option        */}
      {/* ========================================================= */}
      <footer className="home-footer relative z-10 flex items-center justify-between w-full max-w-[460px] mx-auto shrink-0 pt-1 text-[9px] sm:text-[10px] font-mono-tech text-slate-500">
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-red-500" />
          <span>v2.5 SEC-DEFENSE • TACTICAL 2D</span>
        </div>

        <button
          onClick={handleNewGameClick}
          className="hover:text-slate-300 transition flex items-center gap-1 cursor-pointer"
          title="Reset Campaign Progress"
        >
          <RotateCcw className="w-3 h-3" />
          <span>NEW CAMPAIGN</span>
        </button>
      </footer>

      {/* NEW GAME CONFIRMATION MODAL */}
      {showNewGameModal && (
        <div className="modal-screen fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="modal-box bg-slate-950 border border-red-600/80 rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl">
            <h3 className="text-lg font-heading font-black text-white mb-2">
              RESET CAMPAIGN?
            </h3>
            <p className="text-xs text-slate-300 font-mono-tech mb-5">
              Starting a new game will reset your sector unlocks and weapon inventory to default.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewGameModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono-tech hover:text-white cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  setShowNewGameModal(false);
                  if (onNewGame) onNewGame();
                }}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono-tech font-bold cursor-pointer shadow-lg shadow-red-950"
              >
                CONFIRM RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
