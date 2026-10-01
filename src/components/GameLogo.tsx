import React from 'react';
import { Skull, Flame } from 'lucide-react';

interface GameLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GameLogo: React.FC<GameLogoProps> = ({ size = 'lg', className = '' }) => {
  const isLarge = size === 'lg';
  const isMedium = size === 'md';

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Biohazard / Apocalyptic Crown Icon */}
      <div className="relative flex items-center justify-center mb-1">
        <div className="absolute w-20 h-20 rounded-full bg-red-600/20 blur-xl pointer-events-none animate-pulse" />
        <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-red-950/80 border border-red-800/80 shadow-lg text-[10px] sm:text-xs font-mono-tech tracking-[0.25em] text-red-400 uppercase font-bold">
          <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
          <span>OUTBREAK PROTOCOL • LEVEL 5</span>
          <Skull className="w-3.5 h-3.5 text-red-500" />
        </div>
      </div>

      {/* Main Title: ZOMBIE SURVIVAL */}
      <div className="relative text-center w-full px-2">
        {/* Shadow layer for depth & crack illusion */}
        <h1 
          className={`home-title font-heading font-black tracking-[0.15em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-slate-100 via-slate-300 to-slate-500 filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] ${
            isLarge 
              ? 'text-3xl sm:text-5xl md:text-6xl' 
              : isMedium 
              ? 'text-2xl sm:text-4xl' 
              : 'text-xl sm:text-2xl'
          }`}
          style={{
            lineHeight: 0.95,
            textShadow: '0 2px 0 #000, 0 4px 10px rgba(220, 38, 38, 0.4), 0 0 30px rgba(185, 28, 28, 0.3)',
          }}
        >
          <span className="relative inline-block text-white">
            ZOMBIE
            {/* Distress scratch mark overlay */}
            <span 
              className="absolute -inset-x-2 top-1/2 h-[2px] bg-red-600/40 -rotate-2 pointer-events-none" 
              style={{ clipPath: 'polygon(0% 0%, 30% 100%, 70% 0%, 100% 100%)' }}
            />
          </span>{' '}
          <span className="relative inline-block text-red-500">
            SURVIVAL
            {/* Weathering claw mark */}
            <span 
              className="absolute -inset-x-2 top-2/3 h-[2px] bg-amber-500/30 rotate-1 pointer-events-none"
              style={{ clipPath: 'polygon(10% 100%, 50% 0%, 90% 100%)' }}
            />
          </span>
        </h1>

        {/* Subtitle: LAST STAND Plate */}
        <div className="relative mt-1 sm:mt-1.5 inline-flex items-center justify-center">
          {/* Metal plate background with distressed border */}
          <div className="relative px-4 sm:px-7 py-1 bg-gradient-to-r from-slate-950 via-red-950/90 to-slate-950 border-y border-red-600/70 shadow-lg flex items-center gap-2.5 sm:gap-3">
            {/* Left Chevron Accent */}
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rotate-45 bg-red-600 shadow-[0_0_8px_#ef4444]" />
            
            <h2 
              className={`home-subtitle font-heading font-black tracking-[0.3em] text-amber-400 uppercase drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)] ${
                isLarge ? 'text-sm sm:text-xl' : isMedium ? 'text-xs sm:text-sm' : 'text-[11px]'
              }`}
            >
              LAST STAND
            </h2>

            {/* Right Chevron Accent */}
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rotate-45 bg-red-600 shadow-[0_0_8px_#ef4444]" />
          </div>

          {/* Underline distress blood drop */}
          <div className="absolute -bottom-1 w-20 sm:w-24 h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        </div>
      </div>
    </div>
  );
};
