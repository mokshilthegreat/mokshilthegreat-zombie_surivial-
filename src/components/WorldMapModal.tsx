import React, { useEffect } from 'react';
import { 
  MapPin, 
  Lock, 
  CheckCircle2, 
  Skull, 
  Sun, 
  Moon, 
  CloudRain, 
  CloudFog, 
  CloudLightning, 
  Award, 
  Coins, 
  Dna, 
  X, 
  ArrowLeft,
  Play,
  ShieldAlert,
  Clock,
  Compass,
  Star
} from 'lucide-react';
import { LocationConfig, WeatherType, TimeOfDay } from '../types/game';
import { LOCATIONS_CATALOG } from '../game/constants';
import { soundManager } from '../audio/soundManager';
import { LocationVisual } from './visuals/LocationVisual';

interface WorldMapModalProps {
  unlockedLocationIds: number[];
  completedLocationIds: number[];
  playerLevel: number;
  onSelectLocation: (location: LocationConfig) => void;
  onClose: () => void;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  unlockedLocationIds,
  completedLocationIds,
  playerLevel,
  onSelectLocation,
  onClose,
}) => {
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

  const [selectedLoc, setSelectedLoc] = React.useState<LocationConfig>(
    LOCATIONS_CATALOG[0]
  );

  const getWeatherIcon = (weather: WeatherType) => {
    switch (weather) {
      case 'rain': return <CloudRain className="w-3.5 h-3.5 text-sky-400" />;
      case 'fog': return <CloudFog className="w-3.5 h-3.5 text-slate-300" />;
      case 'storm': return <CloudLightning className="w-3.5 h-3.5 text-amber-400" />;
      default: return <Sun className="w-3.5 h-3.5 text-yellow-400" />;
    }
  };

  const getTimeIcon = (time: TimeOfDay) => {
    switch (time) {
      case 'night': return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      default: return <Sun className="w-3.5 h-3.5 text-yellow-300" />;
    }
  };

  const isUnlocked = (loc: LocationConfig) => {
    return unlockedLocationIds.includes(loc.id) || playerLevel >= loc.unlockRequirementLevel;
  };

  const isCompleted = (loc: LocationConfig) => {
    return completedLocationIds.includes(loc.id);
  };

  const selectedUnlocked = isUnlocked(selectedLoc);

  return (
    <div className="page-screen world-map-screen fixed inset-0 z-50 flex flex-col select-none overflow-y-auto">
      <div className="page-content relative w-full flex-1 flex flex-col min-h-0">
        
        {/* ========================================================= */}
        {/* TOP BAR: BACK BUTTON, WORLD MAP, SELECT LOCATION */}
        {/* ========================================================= */}
        <div className="modal-header page-header shrink-0 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md z-20 rounded-xl">
          
          {/* BACK Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white transition font-heading font-bold text-xs sm:text-sm tracking-wider shadow-md group cursor-pointer"
            title="Return to Previous Screen [ESC]"
          >
            <ArrowLeft className="w-4 h-4 text-red-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>BACK</span>
          </button>

          {/* Center Title */}
          <div className="flex flex-col items-center text-center">
            <h2 className="text-base sm:text-xl font-heading font-black text-white tracking-widest uppercase">
              WORLD MAP
            </h2>
            <p className="text-[10px] sm:text-xs font-mono-tech text-red-500 tracking-wider font-bold">
              SELECT COMBAT SECTOR
            </p>
          </div>

          {/* Right: Progress & Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden xs:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono-tech text-slate-300">
              <span>SECURED:</span>
              <span className="text-emerald-400 font-bold">
                {completedLocationIds.length} / {LOCATIONS_CATALOG.length}
              </span>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900/80 hover:bg-red-600 active:scale-95 border border-slate-800 hover:border-red-500 transition shadow cursor-pointer"
              title="Close [ESC]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN BODY: 8 SECTOR CARDS (LEFT) + DOSSIER BRIEFING (RIGHT) */}
        {/* ========================================================= */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Column (Cols 7): 8 Location Cards with Visual Thumbnails */}
          <div className="md:col-span-7 overflow-y-auto p-3 sm:p-5 space-y-2.5 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/70">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-[11px] font-mono-tech text-slate-400 uppercase tracking-wider font-bold">
                QUARANTINE SECTORS ({LOCATIONS_CATALOG.length})
              </span>
              <span className="text-[10px] font-mono-tech text-amber-400 font-bold">
                OPERATOR RANK {playerLevel}
              </span>
            </div>

            {LOCATIONS_CATALOG.map((loc) => {
              const unlocked = isUnlocked(loc);
              const completed = isCompleted(loc);
              const isCurrent = selectedLoc.id === loc.id;

              return (
                <div
                  key={loc.id}
                  onClick={() => {
                    soundManager.playHover();
                    setSelectedLoc(loc);
                  }}
                  className={`sector-card p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-red-950/40 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)] ring-1 ring-red-500/50'
                      : completed
                      ? 'bg-slate-900/70 border-emerald-900/50 hover:border-emerald-700'
                      : unlocked
                      ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                      : 'bg-slate-950/60 border-slate-900 opacity-55'
                  }`}
                >
                  {/* Left: Thumbnail Preview & Location Info */}
                  <div className="flex items-center gap-3">
                    {/* Visual Thumbnail */}
                    <div className="relative shrink-0 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                      <LocationVisual locationId={loc.id} size="sm" />
                      {!unlocked && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                      )}
                      {loc.isBossStage && (
                        <div className="absolute top-1 left-1 bg-red-600/90 text-white p-0.5 rounded text-[8px] font-bold">
                          <Skull className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono-tech font-bold text-slate-500">
                          {loc.id < 10 ? `0${loc.id}` : loc.id}
                        </span>
                        <h4 className="font-heading font-bold text-sm sm:text-base text-white leading-tight">
                          {loc.name}
                        </h4>
                        {loc.isBossStage && (
                          <span className="px-1.5 py-0.2 text-[9px] font-mono-tech bg-red-600/80 text-white rounded font-bold">
                            BOSS
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono-tech">
                        <span>{loc.zoneType}</span>
                        <span>•</span>
                        <span className="text-amber-400 flex items-center">
                          {Array(Math.min(5, Math.max(1, loc.difficulty))).fill(0).map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-current text-amber-400" />
                          ))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Atmosphere & Status */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[11px] font-mono-tech">
                      {getTimeIcon(loc.timeOfDay)}
                      {getWeatherIcon(loc.weather)}
                    </div>

                    {completed ? (
                      <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-mono-tech font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" /> SECURED
                      </span>
                    ) : unlocked ? (
                      <span className="text-sky-400 text-[11px] font-mono-tech font-bold px-2 py-0.5 rounded bg-sky-950/60 border border-sky-500/40">
                        READY
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-red-400 text-[11px] font-mono-tech font-bold">
                        <Lock className="w-3 h-3" />
                        <span>LVL {loc.unlockRequirementLevel}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (Cols 5): Selected Sector Dossier Briefing Panel */}
          <div className="md:col-span-5 p-4 sm:p-6 bg-slate-950/90 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              
              {/* Large Visual Header */}
              <div className="w-full">
                <LocationVisual locationId={selectedLoc.id} size="lg" className="w-full h-36 sm:h-44 object-cover border border-slate-800 rounded-xl" />
              </div>

              {/* Sector Title & Type */}
              <div>
                <span className="text-xs font-mono-tech text-red-500 uppercase tracking-widest font-bold">
                  SECTOR DOSSIER #{selectedLoc.id}
                </span>
                <h3 className="text-2xl font-heading font-black text-white mt-0.5">
                  {selectedLoc.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono-tech mt-0.5">
                  {selectedLoc.zoneType} • DIFFICULTY {Array(selectedLoc.difficulty).fill('★').join('')}
                </p>
              </div>

              {/* Tactical Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 font-sans">
                {selectedLoc.description}
              </p>

              {/* Environmental Intel */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1 text-[10px]">TIME OF DAY</span>
                  <div className="flex items-center gap-1.5 font-bold text-white uppercase">
                    {getTimeIcon(selectedLoc.timeOfDay)}
                    <span>{selectedLoc.timeOfDay}</span>
                  </div>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1 text-[10px]">WEATHER HAZARD</span>
                  <div className="flex items-center gap-1.5 font-bold text-white uppercase">
                    {getWeatherIcon(selectedLoc.weather)}
                    <span>{selectedLoc.weather}</span>
                  </div>
                </div>
              </div>

              {/* Mission Objectives & Intelligence */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono-tech">
                <span className="text-amber-400 font-bold block text-[10px] uppercase">
                  PRIMARY COMBAT DIRECTIVE
                </span>
                <div className="text-white font-heading font-bold text-sm">
                  {selectedLoc.missionType === 'survive_time' && `SURVIVE AIRLIFT EXTRACTION (${selectedLoc.targetCount} SECONDS)`}
                  {selectedLoc.missionType === 'kill_count' && `ERADICATE ${selectedLoc.targetCount} INFECTED TARGETS`}
                  {selectedLoc.missionType === 'collect_supplies' && `RECOVER ${selectedLoc.targetCount} SUPPLY CACHES`}
                  {selectedLoc.missionType === 'rescue_survivors' && `EXTRACT ${selectedLoc.targetCount} ALLIED SURVIVORS`}
                  {selectedLoc.missionType === 'defeat_boss' && `ELIMINATE MUTANT BIO-HULK TITAN`}
                </div>
              </div>

              {/* Mission Clearance Rewards */}
              <div className="flex items-center justify-between bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80 text-xs font-mono-tech">
                <span className="text-slate-400">CLEARANCE REWARDS:</span>
                <div className="flex items-center gap-3 font-bold">
                  <span className="text-amber-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> +{selectedLoc.rewardCoins}
                  </span>
                  <span className="text-purple-400 flex items-center gap-1">
                    <Dna className="w-3.5 h-3.5" /> +{selectedLoc.rewardDna}
                  </span>
                  <span className="text-sky-400 flex items-center gap-1">
                    +{selectedLoc.rewardXp} XP
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom Action: Deploy Button */}
            <div className="pt-4">
              {selectedUnlocked ? (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onSelectLocation(selectedLoc);
                  }}
                  className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-98 text-white font-heading font-black text-sm sm:text-base tracking-widest flex items-center justify-center gap-2.5 shadow-xl shadow-red-950/70 transition cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>DEPLOY TO SECTOR</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-heading font-bold text-sm tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Lock className="w-4 h-4" />
                  <span>SECTOR LOCKED (REQUIRES RANK {selectedLoc.unlockRequirementLevel})</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
