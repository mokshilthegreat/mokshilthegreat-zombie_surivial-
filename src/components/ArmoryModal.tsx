import React, { useState, useEffect } from 'react';
import { 
  Crosshair, 
  Flame, 
  Zap, 
  Target, 
  Coins, 
  Check, 
  Lock, 
  X,
  ArrowLeft,
  ArrowUpCircle,
  Sparkles,
  Shield,
  Gauge,
  RotateCcw,
  Layers
} from 'lucide-react';
import { GameSaveData, WeaponId, WeaponConfig } from '../types/game';
import { WEAPONS_CATALOG } from '../game/constants';
import { upgradeWeaponStat } from '../game/storage';
import { soundManager } from '../audio/soundManager';
import { WeaponVisual } from './visuals/WeaponVisual';

interface ArmoryModalProps {
  saveData: GameSaveData;
  onSaveDataUpdated: (newData: GameSaveData) => void;
  onClose: () => void;
}

export const ArmoryModal: React.FC<ArmoryModalProps> = ({
  saveData,
  onSaveDataUpdated,
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

  const [selectedWeaponId, setSelectedWeaponId] = useState<WeaponId>(
    saveData.equippedWeaponId || 'pistol'
  );

  const selectedWeapon = WEAPONS_CATALOG[selectedWeaponId] || WEAPONS_CATALOG.pistol;
  const upgrades = saveData.weaponUpgrades[selectedWeaponId] || {
    damage: 0, fireRate: 0, magazine: 0, reloadSpeed: 0, critChance: 0
  };

  const isUnlocked = saveData.unlockedWeapons.includes(selectedWeaponId);
  const isEquippedPrimary = saveData.equippedWeaponId === selectedWeaponId;
  const isEquippedSecondary = saveData.secondaryWeaponId === selectedWeaponId;

  // Upgrade cost formula
  const getUpgradeCost = (level: number) => {
    return Math.round(150 * Math.pow(1.5, level));
  };

  const handleUpgrade = (stat: 'damage' | 'fireRate' | 'magazine' | 'reloadSpeed' | 'critChance') => {
    const currentLevel = upgrades[stat] || 0;
    if (currentLevel >= 5) return;
    const cost = getUpgradeCost(currentLevel);

    const updated = upgradeWeaponStat(saveData, selectedWeaponId, stat, cost);
    if (updated) {
      soundManager.playVictory();
      onSaveDataUpdated(updated);
    } else {
      soundManager.playShoot('pistol');
    }
  };

  const handlePurchase = () => {
    if (saveData.coins < selectedWeapon.cost) {
      soundManager.playShoot('pistol');
      return;
    }

    const updated: GameSaveData = {
      ...saveData,
      coins: saveData.coins - selectedWeapon.cost,
      unlockedWeapons: [...saveData.unlockedWeapons, selectedWeaponId],
    };
    soundManager.playVictory();
    onSaveDataUpdated(updated);
  };

  const handleEquipPrimary = () => {
    if (!isUnlocked) return;
    soundManager.playClick();
    const updated: GameSaveData = {
      ...saveData,
      equippedWeaponId: selectedWeaponId,
      // Prevent duplicate weapon in secondary
      secondaryWeaponId: saveData.secondaryWeaponId === selectedWeaponId ? 'pistol' : saveData.secondaryWeaponId,
    };
    onSaveDataUpdated(updated);
  };

  const handleEquipSecondary = () => {
    if (!isUnlocked) return;
    soundManager.playClick();
    const updated: GameSaveData = {
      ...saveData,
      secondaryWeaponId: selectedWeaponId,
      // Prevent duplicate weapon in primary
      equippedWeaponId: saveData.equippedWeaponId === selectedWeaponId ? 'pistol' : saveData.equippedWeaponId,
    };
    onSaveDataUpdated(updated);
  };

  // Upgraded stats
  const damageValue = Math.round(selectedWeapon.baseDamage * (1 + upgrades.damage * 0.18));
  const fireRateValue = +(selectedWeapon.baseFireRate * (1 + upgrades.fireRate * 0.15)).toFixed(1);
  const magValue = Math.round(selectedWeapon.baseMagazine * (1 + upgrades.magazine * 0.25));
  const reloadValue = +(selectedWeapon.baseReloadTime * Math.max(0.4, 1 - upgrades.reloadSpeed * 0.12)).toFixed(2);
  const critValue = +(selectedWeapon.baseCritChance + upgrades.critChance * 0.05).toFixed(2);

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/50">LEGENDARY</span>;
      case 'epic':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/50">EPIC</span>;
      case 'rare':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase bg-sky-500/20 text-sky-300 border border-sky-500/50">RARE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase bg-slate-700/40 text-slate-300 border border-slate-600/50">COMMON</span>;
    }
  };

  const allWeapons = Object.values(WEAPONS_CATALOG);

  return (
    <div className="page-screen armory-screen fixed inset-0 z-50 flex flex-col select-none overflow-y-auto">
      <div className="page-content relative w-full flex-1 flex flex-col min-h-0">
        
        {/* ========================================================= */}
        {/* TOP BAR: BACK BUTTON, ARMORY, WEAPON SELECT, COINS */}
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
              ARMORY
            </h2>
            <p className="text-[10px] sm:text-xs font-mono-tech text-red-500 tracking-wider font-bold">
              WEAPON SELECT & CALIBRATION
            </p>
          </div>

          {/* Right: Coins & Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-800 text-amber-400 font-mono-tech text-xs sm:text-sm font-bold shadow-inner">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{saveData.coins}</span>
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
        {/* CENTER SHOWCASE: LARGE WEAPON IMAGE & FULL STATS */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-3 sm:p-6 overflow-y-auto items-center">
            
            {/* Left Column (Cols 5): Large Weapon Visual */}
            <div className="md:col-span-5 flex flex-col items-center justify-center py-2">
              <div className="weapon-card relative w-full max-w-[420px] aspect-[16/10] bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-4 shadow-2xl overflow-hidden group">
                
                {/* Radial Glow */}
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none transition-all"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, #38bdf8 0%, transparent 70%)`
                  }}
                />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 z-10">
                  {getRarityBadge(selectedWeapon.rarity)}
                </div>

                {/* Equipped Badges */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
                  {isEquippedPrimary && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold bg-red-950 border border-red-500/80 text-red-300 shadow">
                      PRIMARY
                    </span>
                  )}
                  {isEquippedSecondary && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold bg-sky-950 border border-sky-500/80 text-sky-300 shadow">
                      SECONDARY
                    </span>
                  )}
                </div>

                {/* Large Weapon Visual */}
                <div className="my-auto transform transition-transform duration-300 group-hover:scale-105">
                  <WeaponVisual weaponId={selectedWeaponId} size="lg" />
                </div>

                {/* Lock Overlay if locked */}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-20">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-red-500/60 flex items-center justify-center text-red-400 mb-2 shadow-lg">
                      <Lock className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                      WEAPON LOCKED
                    </span>
                    <span className="text-xs font-mono-tech text-amber-400 mt-1">
                      PURCHASE PRICE: {selectedWeapon.cost} COINS
                    </span>
                  </div>
                )}

                {/* Weapon Name & Class Underneath */}
                <div className="w-full text-center mt-2 z-10">
                  <div className="text-lg sm:text-xl font-heading font-black text-white tracking-wider">
                    {selectedWeapon.name.toUpperCase()}
                  </div>
                  <div className="text-xs font-mono-tech text-slate-400 uppercase">
                    {selectedWeapon.category}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Equip Primary / Secondary or Purchase */}
              <div className="w-full max-w-[280px] sm:max-w-[340px] mt-3 space-y-2">
                {isUnlocked ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleEquipPrimary}
                      disabled={isEquippedPrimary}
                      className={`py-2.5 px-2 rounded-xl font-heading font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 transition ${
                        isEquippedPrimary
                          ? 'bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 cursor-default'
                          : 'bg-red-600 hover:bg-red-500 text-white cursor-pointer active:scale-95 shadow'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isEquippedPrimary ? 'PRI EQUIPPED' : 'EQUIP PRIMARY'}</span>
                    </button>

                    <button
                      onClick={handleEquipSecondary}
                      disabled={isEquippedSecondary}
                      className={`py-2.5 px-2 rounded-xl font-heading font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 transition ${
                        isEquippedSecondary
                          ? 'bg-sky-950/90 border border-sky-500/80 text-sky-300 cursor-default'
                          : 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer active:scale-95 shadow border border-slate-700'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{isEquippedSecondary ? 'SEC EQUIPPED' : 'EQUIP SECONDARY'}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handlePurchase}
                    disabled={saveData.coins < selectedWeapon.cost}
                    className={`w-full py-3 rounded-xl font-heading font-black text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg transition ${
                      saveData.coins >= selectedWeapon.cost
                        ? 'bg-amber-600 hover:bg-amber-500 active:scale-95 text-white shadow-amber-950/60 cursor-pointer'
                        : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Coins className="w-4 h-4 text-amber-300" />
                    <span>UNLOCK WEAPON ({selectedWeapon.cost} COINS)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column (Cols 7): Stats Progress Bars & Upgrades */}
            <div className="md:col-span-7 flex flex-col justify-center space-y-4">
              
              {/* Header Description */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-heading font-black text-white tracking-wide">
                    {selectedWeapon.name}
                  </h3>
                  {getRarityBadge(selectedWeapon.rarity)}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">
                  {selectedWeapon.description}
                </p>
              </div>

              {/* STATS PROGRESS BARS */}
              <div className="bg-slate-900/80 p-3.5 sm:p-4 rounded-xl border border-slate-800/80 space-y-2.5">
                <div className="text-[11px] font-mono-tech text-slate-400 uppercase tracking-widest font-bold">
                  BALLISTIC PERFORMANCE
                </div>

                {/* 1. DAMAGE */}
                <div>
                  <div className="flex justify-between text-xs font-mono-tech mb-1">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-red-500" />
                      <span>DAMAGE</span>
                    </span>
                    <span className="text-red-400 font-bold">
                      {damageValue} DMG {upgrades.damage > 0 && <span className="text-emerald-400">(+{Math.round(upgrades.damage * 18)}%)</span>}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (damageValue / 220) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* 2. FIRE RATE */}
                <div>
                  <div className="flex justify-between text-xs font-mono-tech mb-1">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>FIRE RATE</span>
                    </span>
                    <span className="text-amber-400 font-bold">{fireRateValue} rps</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (fireRateValue / 16) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* 3. RANGE */}
                <div>
                  <div className="flex justify-between text-xs font-mono-tech mb-1">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-sky-400" />
                      <span>EFFECTIVE RANGE</span>
                    </span>
                    <span className="text-sky-400 font-bold">{selectedWeapon.baseRange}m</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-sky-600 to-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (selectedWeapon.baseRange / 600) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* 4. MAGAZINE */}
                <div>
                  <div className="flex justify-between text-xs font-mono-tech mb-1">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                      <span>MAGAZINE CAPACITY</span>
                    </span>
                    <span className="text-emerald-400 font-bold">{magValue} rounds</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (magValue / 60) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* 5. RELOAD SPEED */}
                <div>
                  <div className="flex justify-between text-xs font-mono-tech mb-1">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                      <span>RELOAD TIME</span>
                    </span>
                    <span className="text-purple-400 font-bold">{reloadValue}s</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(10, Math.min(100, (1 - (reloadValue - 0.4) / 3) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* 6. CRITICAL CHANCE */}
                <div>
                  <div className="flex justify-between text-xs font-mono-tech mb-1">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      <span>CRITICAL CHANCE</span>
                    </span>
                    <span className="text-pink-400 font-bold">{Math.round(critValue * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-600 to-rose-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (critValue / 0.5) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* UPGRADE MODULES */}
              <div className="bg-slate-900/60 p-3 sm:p-3.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono-tech text-amber-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <ArrowUpCircle className="w-3.5 h-3.5" />
                    CALIBRATION UPGRADE MODULES (MAX 5)
                  </span>
                  <span className="text-[10px] font-mono-tech text-slate-400">
                    COIN MODS
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { key: 'damage', label: 'DMG' },
                    { key: 'fireRate', label: 'RATE' },
                    { key: 'magazine', label: 'MAG' },
                    { key: 'reloadSpeed', label: 'SPEED' },
                    { key: 'critChance', label: 'CRIT' },
                  ].map(({ key, label }) => {
                    const curLvl = upgrades[key as keyof typeof upgrades] || 0;
                    const cost = getUpgradeCost(curLvl);
                    const isMax = curLvl >= 5;
                    const canAfford = saveData.coins >= cost;

                    return (
                      <div key={key} className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 text-center flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-heading font-bold text-slate-300 uppercase">
                            {label}
                          </div>
                          {/* Level pips */}
                          <div className="flex justify-center gap-0.5 my-1">
                            {[1, 2, 3, 4, 5].map((pip) => (
                              <div
                                key={pip}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  pip <= curLvl ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : 'bg-slate-800'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {isMax ? (
                          <span className="text-[9px] font-mono-tech text-emerald-400 font-bold py-1">
                            MAX
                          </span>
                        ) : (
                          <button
                            onClick={() => handleUpgrade(key as any)}
                            disabled={!canAfford || !isUnlocked}
                            className={`w-full py-1 px-1 rounded font-mono-tech text-[9px] font-bold transition ${
                              canAfford && isUnlocked
                                ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer active:scale-95'
                                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                            }`}
                          >
                            +{cost}¢
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* BOTTOM: HORIZONTAL WEAPON CARDS */}
          {/* ========================================================= */}
          <div className="shrink-0 bg-slate-950/95 border-t border-slate-800 px-3 sm:px-6 py-3">
            <div className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider mb-2 font-bold">
              ARMORY ARSENAL ({allWeapons.length}) — SELECT WEAPON
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
              {allWeapons.map((wep) => {
                const isSelected = selectedWeaponId === wep.id;
                const isPri = saveData.equippedWeaponId === wep.id;
                const isSec = saveData.secondaryWeaponId === wep.id;
                const wepUnlocked = saveData.unlockedWeapons.includes(wep.id);

                return (
                  <button
                    key={wep.id}
                    onClick={() => {
                      soundManager.playHover();
                      setSelectedWeaponId(wep.id);
                    }}
                    className={`relative shrink-0 flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer min-w-[105px] sm:min-w-[125px] ${
                      isSelected
                        ? 'bg-red-950/50 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] ring-2 ring-red-500/60 scale-102'
                        : isPri
                        ? 'bg-slate-900/90 border-red-500/60 hover:border-red-400'
                        : isSec
                        ? 'bg-slate-900/90 border-sky-500/60 hover:border-sky-400'
                        : wepUnlocked
                        ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                        : 'bg-slate-950 border-slate-900 opacity-60'
                    }`}
                  >
                    {/* Weapon image preview */}
                    <div className="relative border border-slate-800/80 rounded-lg overflow-hidden bg-slate-950 mb-1.5 p-1 flex items-center justify-center">
                      <WeaponVisual weaponId={wep.id} size="sm" />
                      {!wepUnlocked && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                          <Lock className="w-4 h-4 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Weapon name */}
                    <span className="text-xs font-heading font-bold text-white tracking-wide text-center truncate w-full">
                      {wep.name.toUpperCase()}
                    </span>
                    
                    {/* Status badge */}
                    <span className="text-[9px] font-mono-tech text-slate-400 mt-0.5">
                      {isPri ? (
                        <span className="text-red-400 font-bold">PRIMARY</span>
                      ) : isSec ? (
                        <span className="text-sky-400 font-bold">SECONDARY</span>
                      ) : wepUnlocked ? (
                        <span>READY</span>
                      ) : (
                        <span className="text-amber-400">{wep.cost}¢</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
