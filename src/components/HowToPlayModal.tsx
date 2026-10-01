import React, { useEffect } from 'react';
import { 
  Keyboard, 
  MousePointer, 
  HelpCircle, 
  ShieldAlert, 
  Sun, 
  Moon, 
  CloudRain, 
  Flame, 
  X,
  ArrowLeft,
  Skull
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
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
              <HelpCircle className="w-5 h-5 text-sky-400" />
              <div>
                <h2 className="text-base sm:text-lg font-heading font-bold text-white tracking-wider leading-tight">
                  FIELD SURVIVAL MANUAL
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-400 font-mono-tech leading-none">
                  TACTICAL COMBAT CONTROLS, ENEMY BESTIARY & WEATHER GUIDE
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          
          {/* Controls Matrix */}
          <div>
            <h3 className="text-xs font-mono-tech text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              SURVIVOR COMBAT CONTROLS
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono-tech">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">WASD / ARROWS</span>
                <span className="text-slate-300">Tactical Stride / Movement</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">MOUSE CURSOR</span>
                <span className="text-slate-300">Aim Weapon & Flashlight</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">LEFT CLICK / TAP</span>
                <span className="text-slate-300">Fire Weapon (Hold for Auto)</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">R KEY</span>
                <span className="text-slate-300">Reload Magazine</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-sky-400 font-bold block mb-1">SPACEBAR</span>
                <span className="text-slate-300">Evasive Dash (Invulnerability)</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">E KEY</span>
                <span className="text-slate-300">Interact / Open Crate / Rescue</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">Q KEY</span>
                <span className="text-slate-300">Emergency Medkit (+60 HP)</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-red-400 font-bold block mb-1">G / RIGHT CLICK</span>
                <span className="text-slate-300">Throw High-Explosive Grenade</span>
              </div>
            </div>
          </div>

          {/* Enemy Threats Bestiary */}
          <div>
            <h3 className="text-xs font-mono-tech text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Skull className="w-4 h-4" />
              INFECTED BESTIARY & THREAT PROFILES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="font-heading font-bold text-white text-sm">WALKER (Common)</span>
                <p className="text-slate-400 font-sans mt-0.5">Slow shambler with moderate health. Lethal when clustering in tight choke corridors.</p>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="font-heading font-bold text-red-400 text-sm">RUNNER (Fast)</span>
                <p className="text-slate-400 font-sans mt-0.5">Frenzied mutant that lunges at high velocity. Use shotguns or rapid-fire SMG to counter.</p>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="font-heading font-bold text-slate-300 text-sm">BRUTE (Heavy Tank)</span>
                <p className="text-slate-400 font-sans mt-0.5">Colossal muscle mass with heavy health pool. Heavy resistance to knockback.</p>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="font-heading font-bold text-emerald-400 text-sm">TOXIC ZOMBIE (Biohazard)</span>
                <p className="text-slate-400 font-sans mt-0.5">Spits corrosive bile pools on the floor and bursts into dangerous poison mist upon death.</p>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="font-heading font-bold text-purple-400 text-sm">SHADOW ZOMBIE (Cloaked)</span>
                <p className="text-slate-400 font-sans mt-0.5">Translucent stalker invisible in the dark. Keep your tactical flashlight beam centered on it.</p>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="font-heading font-bold text-amber-400 text-sm">MUTANT SOLDIER (Armored)</span>
                <p className="text-slate-400 font-sans mt-0.5">Infected military personnel wearing ballistic Kevlar. Absorbs 30% ballistic weapon damage.</p>
              </div>
              <div className="col-span-1 md:col-span-2 bg-red-950/30 p-3.5 rounded-lg border border-red-600/50">
                <span className="font-heading font-bold text-red-400 text-base flex items-center gap-1.5">
                  <Skull className="w-4 h-4" /> BOSS: THE HULK (Ground Zero Titan)
                </span>
                <p className="text-slate-300 font-sans mt-1">
                  Massive apex mutant with 3 destructive combat phases. Stomps the earth in ground slams, lets out deafening roars summoning runner hordes, and executes lethal charging dashes. Keep moving, time evasive dashes, and target with high-ordnance explosives.
                </p>
              </div>
            </div>
          </div>

          {/* Environmental Cycle */}
          <div>
            <h3 className="text-xs font-mono-tech text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sun className="w-4 h-4" />
              DAY/NIGHT CYCLE & WEATHER ATMOSPHERE
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans text-slate-300">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="font-heading font-bold text-white block mb-1">NIGHT COMBAT</span>
                Hordes grow 60% faster and move with heightened ferocity. Your primary light source is the flashlight cone. Watch for glowing zombie eyes in the dark.
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="font-heading font-bold text-white block mb-1">STORM & FOG</span>
                Fog dampens weapon sightlines and obscures oncoming runners. Lightning strikes in severe storms periodically illuminate the entire arena.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
