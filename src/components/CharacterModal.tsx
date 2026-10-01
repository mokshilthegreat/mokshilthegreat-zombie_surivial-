import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Shield, 
  Zap, 
  Wind, 
  Star, 
  Sparkles, 
  Dna, 
  Coins, 
  X, 
  ArrowLeft,
  Check,
  Lock,
  ArrowUpCircle, 
  Flame,
  Award,
  Activity
} from 'lucide-react';
import { GameSaveData, PlayerUpgrades, DnaPerks } from '../types/game';
import { XP_FOR_LEVEL } from '../game/constants';
import { saveGameData } from '../game/storage';
import { soundManager } from '../audio/soundManager';
import { 
  CharacterVisual, 
  CHARACTERS_CATALOG, 
  CharacterClassId 
} from './visuals/CharacterVisual';

interface CharacterModalProps {
  saveData: GameSaveData;
  onSaveDataUpdated: (newData: GameSaveData) => void;
  onClose: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  saveData,
  onSaveDataUpdated,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'survivor' | 'dna_lab'>('survivor');
  const [selectedCharId, setSelectedCharId] = useState<CharacterClassId>(
    (saveData.selectedCharacter as CharacterClassId) || 'survivor'
  );

  const pUp = saveData.playerUpgrades;
  const dna = saveData.dnaPerks;
  const selectedChar = CHARACTERS_CATALOG[selectedCharId] || CHARACTERS_CATALOG.survivor;
  const isEquipped = (saveData.selectedCharacter || 'survivor') === selectedCharId;
  const isUnlocked = saveData.playerLevel >= selectedChar.requiredRank;

  // ESC key to return
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

  // Attribute upgrade cost
  const getAttrCost = (level: number) => {
    return Math.round(200 * Math.pow(1.6, level));
  };

  // DNA perk cost
  const getDnaCost = (level: number) => {
    return (level + 1) * 10;
  };

  const handleSelectCharacter = (id: CharacterClassId) => {
    if (saveData.playerLevel < CHARACTERS_CATALOG[id].requiredRank) {
      soundManager.playShoot('pistol');
      return;
    }
    soundManager.playVictory();
    const updated: GameSaveData = {
      ...saveData,
      selectedCharacter: id,
    };
    saveGameData(updated);
    onSaveDataUpdated(updated);
  };

  const handleUpgradeAttribute = (attr: keyof PlayerUpgrades) => {
    const curLvl = pUp[attr];
    if (curLvl >= 5) return;
    const cost = getAttrCost(curLvl);
    if (saveData.coins < cost) return;

    const updated: GameSaveData = {
      ...saveData,
      coins: saveData.coins - cost,
      playerUpgrades: {
        ...saveData.playerUpgrades,
        [attr]: curLvl + 1,
      },
    };
    soundManager.playVictory();
    saveGameData(updated);
    onSaveDataUpdated(updated);
  };

  const handleUpgradeDnaPerk = (perk: keyof DnaPerks) => {
    const curLvl = dna[perk];
    if (curLvl >= 3) return;
    const cost = getDnaCost(curLvl);
    if (saveData.zombieDna < cost) return;

    const updated: GameSaveData = {
      ...saveData,
      zombieDna: saveData.zombieDna - cost,
      dnaPerks: {
        ...saveData.dnaPerks,
        [perk]: curLvl + 1,
      },
    };
    soundManager.playVictory();
    saveGameData(updated);
    onSaveDataUpdated(updated);
  };

  const allCharacterIds = Object.keys(CHARACTERS_CATALOG) as CharacterClassId[];

  return (
    <div className="page-screen characters-screen fixed inset-0 z-50 flex flex-col select-none overflow-y-auto">
      <div className="page-content relative w-full flex-1 flex flex-col min-h-0">
        
        {/* ========================================================= */}
        {/* TOP BAR: BACK BUTTON, CHARACTERS, SELECT SURVIVOR, CURRENCIES */}
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

          {/* Title in Center */}
          <div className="flex flex-col items-center text-center">
            <h2 className="text-base sm:text-xl font-heading font-black text-white tracking-widest uppercase">
              CHARACTERS
            </h2>
            <p className="text-[10px] sm:text-xs font-mono-tech text-red-500 tracking-wider font-bold">
              SELECT SURVIVOR
            </p>
          </div>

          {/* Right: Currencies & Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-800 text-amber-400 font-mono-tech text-xs sm:text-sm font-bold shadow-inner">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{saveData.coins}</span>
            </div>
            <div className="hidden xs:flex items-center gap-1.5 bg-slate-900 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-800 text-purple-400 font-mono-tech text-xs sm:text-sm font-bold shadow-inner">
              <Dna className="w-3.5 h-3.5 text-purple-400" />
              <span>{saveData.zombieDna}</span>
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

        {/* Sub Navigation Bar: Survivor Roster vs DNA Lab */}
        <div className="shrink-0 flex items-center justify-between px-3 sm:px-6 py-2 bg-slate-900/60 border-b border-slate-800/80 text-xs font-mono-tech">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('survivor');
              }}
              className={`px-3 py-1 rounded-md font-bold uppercase transition cursor-pointer ${
                activeTab === 'survivor'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SURVIVORS
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('dna_lab');
              }}
              className={`px-3 py-1 rounded-md font-bold uppercase transition cursor-pointer ${
                activeTab === 'dna_lab'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              DNA & STAT LAB
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>OPERATOR LEVEL:</span>
            <span className="text-amber-400 font-bold">LVL {saveData.playerLevel}</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: SURVIVOR SHOWCASE (CENTER AREA) */}
        {/* ========================================================= */}
        {activeTab === 'survivor' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            
            {/* CENTER SHOWCASE: LARGE CHARACTER IMAGE & STATS */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-3 sm:p-6 overflow-y-auto items-center">
              
              {/* Left Column (Desktop Cols 5): Large Character Visual */}
              <div className="md:col-span-5 flex flex-col items-center justify-center py-2">
                <div className="relative w-full max-w-[260px] sm:max-w-[300px] aspect-[4/5] bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-4 shadow-2xl overflow-hidden group">
                  
                  {/* Class Aura Glow */}
                  <div 
                    className="absolute inset-0 opacity-25 pointer-events-none transition-all duration-300"
                    style={{
                      background: `radial-gradient(circle at 50% 45%, ${selectedChar.accentColor} 0%, transparent 70%)`
                    }}
                  />

                  {/* Character Class Tag */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                    <span 
                      className="text-[10px] font-mono-tech px-2 py-0.5 rounded border font-bold uppercase tracking-wider"
                      style={{
                        color: selectedChar.accentColor,
                        borderColor: `${selectedChar.accentColor}60`,
                        backgroundColor: `${selectedChar.accentColor}20`
                      }}
                    >
                      {selectedChar.badge}
                    </span>
                  </div>

                  {/* Equipped Status Indicator */}
                  {isEquipped && (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold bg-emerald-950 border border-emerald-500/80 text-emerald-300 shadow">
                      <Check className="w-3 h-3 text-emerald-400" />
                      ACTIVE
                    </div>
                  )}

                  {/* Large Character Visual */}
                  <div className="my-auto transform transition-transform duration-300 group-hover:scale-105">
                    <CharacterVisual characterId={selectedCharId} size="lg" />
                  </div>

                  {/* Lock Overlay if not unlocked */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-20">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-red-500/60 flex items-center justify-center text-red-400 mb-2 shadow-lg">
                        <Lock className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                        SURVIVOR CLASSIFIED
                      </span>
                      <span className="text-xs font-mono-tech text-red-400 mt-1">
                        REACH RANK {selectedChar.requiredRank} TO RECRUIT
                      </span>
                    </div>
                  )}

                  {/* Under Character Name & Level */}
                  <div className="w-full text-center mt-2 z-10">
                    <div className="text-lg sm:text-xl font-heading font-black text-white tracking-wider">
                      {selectedChar.className.toUpperCase()}
                    </div>
                    <div className="text-xs font-mono-tech text-amber-400">
                      RANK {selectedChar.requiredRank} • LEVEL {saveData.playerLevel}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Desktop Cols 7): Character Stats & Special Ability */}
              <div className="md:col-span-7 flex flex-col justify-center space-y-4">
                
                {/* Header Profile Title */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-heading font-black text-white tracking-wide">
                      {selectedChar.name}
                    </h3>
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase"
                      style={{
                        color: selectedChar.accentColor,
                        backgroundColor: `${selectedChar.accentColor}15`,
                        border: `1px solid ${selectedChar.accentColor}40`
                      }}
                    >
                      {selectedChar.className}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">
                    {selectedChar.description}
                  </p>
                </div>

                {/* STAT PROGRESS BARS */}
                <div className="bg-slate-900/80 p-3.5 sm:p-4 rounded-xl border border-slate-800/80 space-y-2.5">
                  <div className="text-[11px] font-mono-tech text-slate-400 uppercase tracking-widest font-bold">
                    OPERATOR COMBAT METRICS
                  </div>

                  {/* 1. HEALTH */}
                  <div>
                    <div className="flex justify-between text-xs font-mono-tech mb-1">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-red-500" />
                        <span>HEALTH</span>
                      </span>
                      <span className="text-red-400 font-bold">{selectedChar.health} HP</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (selectedChar.health / 180) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* 2. ARMOR */}
                  <div>
                    <div className="flex justify-between text-xs font-mono-tech mb-1">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-sky-400" />
                        <span>ARMOR</span>
                      </span>
                      <span className="text-sky-400 font-bold">{selectedChar.armor} DEF</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-sky-600 to-cyan-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (selectedChar.armor / 100) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* 3. SPEED */}
                  <div>
                    <div className="flex justify-between text-xs font-mono-tech mb-1">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>SPEED</span>
                      </span>
                      <span className="text-amber-400 font-bold">{selectedChar.speed}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (selectedChar.speed / 150) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* 4. STAMINA */}
                  <div>
                    <div className="flex justify-between text-xs font-mono-tech mb-1">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Wind className="w-3.5 h-3.5 text-emerald-400" />
                        <span>STAMINA</span>
                      </span>
                      <span className="text-emerald-400 font-bold">{selectedChar.stamina} STA</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (selectedChar.stamina / 160) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* 5. CRITICAL */}
                  <div>
                    <div className="flex justify-between text-xs font-mono-tech mb-1">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-purple-400" />
                        <span>CRITICAL CHANCE</span>
                      </span>
                      <span className="text-purple-400 font-bold">{selectedChar.critChance}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (selectedChar.critChance / 40) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* SPECIAL ABILITY SECTION */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-mono-tech text-amber-400 font-bold mb-1">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>SPECIAL ABILITY</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {selectedChar.specialAbility}
                  </p>
                </div>

                {/* ACTION BUTTON */}
                <div>
                  {isEquipped ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 font-heading font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30"
                    >
                      <Check className="w-5 h-5 text-emerald-400" />
                      <span>SURVIVOR ACTIVE & EQUIPPED</span>
                    </button>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleSelectCharacter(selectedCharId)}
                      className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 active:scale-98 text-white font-heading font-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 transition cursor-pointer"
                    >
                      <Check className="w-5 h-5" />
                      <span>SELECT SURVIVOR</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-heading font-bold text-sm tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4" />
                      <span>LOCKED (REQUIRES RANK {selectedChar.requiredRank})</span>
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* ========================================================= */}
            {/* BOTTOM: HORIZONTAL CHARACTER SELECTION CARDS */}
            {/* ========================================================= */}
            <div className="shrink-0 bg-slate-950/95 border-t border-slate-800 px-3 sm:px-6 py-3">
              <div className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider mb-2 font-bold">
                OPERATOR ROSTER — SELECT TO VIEW
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
                {allCharacterIds.map((charId) => {
                  const char = CHARACTERS_CATALOG[charId];
                  const isSelected = selectedCharId === charId;
                  const equipped = (saveData.selectedCharacter || 'survivor') === charId;
                  const unlocked = saveData.playerLevel >= char.requiredRank;

                  return (
                    <button
                      key={charId}
                      onClick={() => {
                        soundManager.playHover();
                        setSelectedCharId(charId);
                      }}
                      className={`relative shrink-0 flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer min-w-[100px] sm:min-w-[120px] ${
                        isSelected
                          ? 'bg-red-950/50 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] ring-2 ring-red-500/60 scale-102'
                          : equipped
                          ? 'bg-slate-900/90 border-amber-500/60 hover:border-amber-400'
                          : unlocked
                          ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                          : 'bg-slate-950 border-slate-900 opacity-60'
                      }`}
                    >
                      {/* Character image preview */}
                      <div className="relative border border-slate-800/80 rounded-lg overflow-hidden bg-slate-950 mb-1.5">
                        <CharacterVisual characterId={charId} size="sm" />
                        {!unlocked && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                            <Lock className="w-4 h-4 text-slate-300" />
                          </div>
                        )}
                      </div>

                      {/* Character name */}
                      <span className="text-xs font-heading font-bold text-white tracking-wide text-center truncate w-full">
                        {char.className.toUpperCase()}
                      </span>
                      
                      {/* Badge / status */}
                      <span className="text-[9px] font-mono-tech text-slate-400 mt-0.5">
                        {equipped ? (
                          <span className="text-emerald-400 font-bold">EQUIPPED</span>
                        ) : unlocked ? (
                          <span>RANK {char.requiredRank}</span>
                        ) : (
                          <span className="text-red-400">LOCK</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: DNA LAB & ATTRIBUTE UPGRADES */}
        {/* ========================================================= */}
        {activeTab === 'dna_lab' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            
            {/* 1. Base Combat Attributes (Coins) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-500" />
                  <h3 className="text-base sm:text-lg font-heading font-bold text-white tracking-wider">
                    COMBAT ATTRIBUTE UPGRADES
                  </h3>
                </div>
                <span className="text-xs font-mono-tech text-amber-400 font-bold">
                  COST: COINS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { key: 'healthLevel', label: 'Max Health', desc: '+20 Max HP per rank', icon: Heart, color: 'text-red-400' },
                  { key: 'armorLevel', label: 'Armor Plating', desc: '+15 Max Armor per rank', icon: Shield, color: 'text-sky-400' },
                  { key: 'speedLevel', label: 'Agility Conditioning', desc: '+8% Movement speed per rank', icon: Zap, color: 'text-amber-400' },
                  { key: 'staminaLevel', label: 'Endurance Cardio', desc: '+20 Max Stamina per rank', icon: Wind, color: 'text-emerald-400' },
                  { key: 'critLevel', label: 'Targeting Optics', desc: '+4% Critical strike rate', icon: Star, color: 'text-purple-400' },
                ].map(({ key, label, desc, icon: Icon, color }) => {
                  const curLvl = pUp[key as keyof PlayerUpgrades];
                  const cost = getAttrCost(curLvl);
                  const isMax = curLvl >= 5;
                  const canAfford = saveData.coins >= cost;

                  return (
                    <div key={key} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-heading font-bold ${color} flex items-center gap-1.5`}>
                            <Icon className="w-4 h-4" />
                            {label}
                          </span>
                          <span className="text-xs font-mono-tech text-slate-400">
                            {curLvl} / 5
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-3 font-sans">
                          {desc}
                        </p>
                      </div>

                      {isMax ? (
                        <div className="py-2 text-center text-xs font-mono-tech text-emerald-400 font-bold bg-slate-950 rounded-lg border border-slate-800">
                          MAX RANK
                        </div>
                      ) : (
                        <button
                          onClick={() => handleUpgradeAttribute(key as keyof PlayerUpgrades)}
                          disabled={!canAfford}
                          className={`w-full py-2 rounded-lg font-mono-tech text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            canAfford 
                              ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer active:scale-95 shadow'
                              : 'bg-slate-950 text-slate-500 border border-slate-800 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>UPGRADE ({cost} COINS)</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Mutant DNA Genetic Perks (Zombie DNA) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Dna className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base sm:text-lg font-heading font-bold text-white tracking-wider">
                    MUTAGENIC GENETIC PERKS
                  </h3>
                </div>
                <span className="text-xs font-mono-tech text-purple-400 font-bold">
                  COST: ZOMBIE DNA
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { key: 'vampirism', label: 'Hematophagy', desc: 'Regain +1 HP per infected eliminated in close combat', icon: Flame },
                  { key: 'bulletScavenger', label: 'Ammo Scavenger', desc: 'Ammo crates and defeated zombies drop +30% more bullets', icon: Award },
                  { key: 'ironSkin', label: 'Subdermal Chitin', desc: 'Flat 10% ballistic and melee damage reduction', icon: Shield },
                  { key: 'adrenaline', label: 'Adrenaline Surge', desc: '+30% movement sprint speed when below 35% health', icon: Zap },
                  { key: 'toxicResistance', label: 'Toxic Immunity', desc: 'Acid pools deal 50% less damage and slow duration is cut', icon: Activity },
                ].map(({ key, label, desc, icon: Icon }) => {
                  const curLvl = dna[key as keyof DnaPerks];
                  const cost = getDnaCost(curLvl);
                  const isMax = curLvl >= 3;
                  const canAfford = saveData.zombieDna >= cost;

                  return (
                    <div key={key} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-heading font-bold text-purple-300 flex items-center gap-1.5">
                            <Icon className="w-4 h-4 text-purple-400" />
                            {label}
                          </span>
                          <span className="text-xs font-mono-tech text-slate-400">
                            {curLvl} / 3
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-3 font-sans">
                          {desc}
                        </p>
                      </div>

                      {isMax ? (
                        <div className="py-2 text-center text-xs font-mono-tech text-purple-400 font-bold bg-slate-950 rounded-lg border border-slate-800">
                          PERK EVOLVED
                        </div>
                      ) : (
                        <button
                          onClick={() => handleUpgradeDnaPerk(key as keyof DnaPerks)}
                          disabled={!canAfford}
                          className={`w-full py-2 rounded-lg font-mono-tech text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            canAfford 
                              ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer active:scale-95 shadow'
                              : 'bg-slate-950 text-slate-500 border border-slate-800 cursor-not-allowed'
                          }`}
                        >
                          <Dna className="w-3.5 h-3.5" />
                          <span>EVOLVE ({cost} DNA)</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
