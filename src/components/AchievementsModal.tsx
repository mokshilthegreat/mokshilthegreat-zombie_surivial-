import React, { useEffect } from 'react';
import {
  Award,
  Trophy,
  Coins,
  Dna,
  Check,
  X,
  ArrowLeft,
} from 'lucide-react';

import { GameSaveData } from '../types/game';
import { ACHIEVEMENTS_CATALOG } from '../game/constants';
import { saveGameData } from '../game/storage';
import { soundManager } from '../audio/soundManager';

interface AchievementsModalProps {
  saveData: GameSaveData;
  onSaveDataUpdated: (newData: GameSaveData) => void;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
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

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Calculate achievement progress
  const getAchievementStatus = (
    achId: string,
    maxProgress: number
  ) => {
    let current = 0;

    switch (achId) {
      case 'first_blood':
        current = Math.min(1, saveData.totalKills);
        break;

      case 'survivor':
        current = Math.min(
          3,
          saveData.completedLocations.length
        );
        break;

      case 'zombie_hunter':
        current = Math.min(
          250,
          saveData.totalKills
        );
        break;

      case 'nightmare':
        current = saveData.completedLocations.includes(6)
          ? 1
          : 0;
        break;

      case 'boss_slayer':
        current = Math.min(
          1,
          saveData.totalBossKills
        );
        break;

      case 'legend':
        current = Math.min(
          10,
          saveData.playerLevel
        );
        break;

      default:
        current = 0;
    }

    const isUnlocked = current >= maxProgress;

    const isClaimed =
      saveData.achievements?.[achId]?.claimed || false;

    return {
      current,
      isUnlocked,
      isClaimed,
    };
  };

  // Claim reward
  const handleClaimReward = (
    achId: string,
    coinsReward: number,
    dnaReward: number
  ) => {
    soundManager.playVictory();

    const updated: GameSaveData = {
      ...saveData,

      coins:
        saveData.coins + coinsReward,

      zombieDna:
        saveData.zombieDna + dnaReward,

      achievements: {
        ...saveData.achievements,

        [achId]: {
          progress: 100,
          unlocked: true,
          claimed: true,
        },
      },
    };

    saveGameData(updated);
    onSaveDataUpdated(updated);
  };

  return (
    <div className="page-screen fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-start px-2 sm:px-3 select-none overflow-y-auto animate-in fade-in duration-200">

      <div className="page-content relative w-full max-w-[520px] bg-slate-950 border border-slate-800 rounded-xl shadow-2xl flex flex-col my-auto overflow-hidden">

        {/* HEADER */}
        <div className="modal-header page-header sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">

          <div className="flex items-center gap-3">

            {/* BACK BUTTON */}
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white transition font-heading font-bold text-sm tracking-wider shadow-md group"
              title="Return to Main Menu [ESC]"
            >
              <ArrowLeft className="w-4 h-4 text-red-400 group-hover:-translate-x-0.5 transition-transform" />

              <span>
                BACK
              </span>
            </button>

            {/* TITLE */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">

              <Trophy className="w-5 h-5 text-amber-400" />

              <div>
                <h2 className="text-base sm:text-lg font-heading font-bold text-white tracking-wider leading-tight">
                  SURVIVOR MERIT ACCOLADES
                </h2>

                <p className="text-[10px] sm:text-xs text-slate-400 font-mono-tech leading-none">
                  COMPLETE CRITICAL OBJECTIVES TO CLAIM VALUABLE COIN & DNA REWARDS
                </p>
              </div>

            </div>
          </div>

          {/* CLOSE BUTTON */}
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

        {/* ACHIEVEMENTS LIST */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">

          {ACHIEVEMENTS_CATALOG.map((ach) => {

            const {
              current,
              isUnlocked,
              isClaimed,
            } = getAchievementStatus(
              ach.id,
              ach.maxProgress
            );

            const percent = Math.min(
              100,
              Math.round(
                (current / ach.maxProgress) * 100
              )
            );

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 ${
                  isClaimed
                    ? 'bg-slate-950/70 border-slate-800/80 opacity-70'
                    : isUnlocked
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-lg shadow-amber-950/30'
                    : 'bg-slate-900/40 border-slate-800'
                }`}
              >

                {/* LEFT CONTENT */}
                <div className="flex items-center gap-4 min-w-0">

                  {/* ICON */}
                  <div
                    className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${
                      isUnlocked
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Award className="w-6 h-6" />
                  </div>

                  {/* INFO */}
                  <div className="min-w-0">

                    <h3 className="font-heading font-bold text-base text-white truncate">
                      {ach.title}
                    </h3>

                    <p className="text-xs text-slate-400 font-sans">
                      {ach.description}
                    </p>

                    {/* PROGRESS */}
                    <div className="flex items-center gap-2 mt-2 w-48 md:w-64">

                      <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">

                        <div
                          className="bg-amber-500 h-full transition-all duration-300"
                          style={{
                            width: `${percent}%`,
                          }}
                        />

                      </div>

                      <span className="text-[10px] font-mono-tech text-slate-400 whitespace-nowrap">
                        {current}/{ach.maxProgress}
                      </span>

                    </div>

                  </div>

                </div>

                {/* REWARD + BUTTON */}
                <div className="flex items-center gap-3 flex-shrink-0">

                  {/* REWARDS */}
                  <div className="flex flex-col items-end text-xs font-mono-tech">

                    <span className="text-amber-400 font-bold flex items-center gap-1 whitespace-nowrap">
                      <Coins className="w-3 h-3" />
                      +{ach.rewardCoins}
                    </span>

                    <span className="text-purple-400 font-bold flex items-center gap-1 whitespace-nowrap">
                      <Dna className="w-3 h-3" />
                      +{ach.rewardDna}
                    </span>

                  </div>

                  {/* STATUS */}
                  {isClaimed ? (

                    <span className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono-tech flex items-center gap-1 whitespace-nowrap">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      CLAIMED
                    </span>

                  ) : isUnlocked ? (

                    <button
                      onClick={() =>
                        handleClaimReward(
                          ach.id,
                          ach.rewardCoins,
                          ach.rewardDna
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold text-xs tracking-wider transition shadow-lg shadow-amber-950 active:scale-95 whitespace-nowrap"
                    >
                      CLAIM REWARD
                    </button>

                  ) : (

                    <span className="px-3 py-1.5 rounded bg-slate-900/60 border border-slate-800 text-slate-500 text-xs font-mono-tech whitespace-nowrap">
                      IN PROGRESS
                    </span>

                  )}

                </div>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
};