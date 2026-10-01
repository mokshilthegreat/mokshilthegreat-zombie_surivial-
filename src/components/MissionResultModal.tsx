import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Skull,
  Coins,
  Award,
  Clock,
  RotateCcw,
  ArrowRight,
  Home,
  CheckCircle2,
  Play,
} from 'lucide-react';

import { MissionResult } from '../game/engine/GameEngine';
import { soundManager } from '../audio/soundManager';

interface MissionResultModalProps {
  result: MissionResult;
  leveledUp: boolean;
  newLevel: number;
  onRetry: () => void;
  onNextMission?: () => void;
  onReturnToBase: () => void;
  onWatchAdRevive?: () => void;
}

export const MissionResultModal: React.FC<
  MissionResultModalProps
> = ({
  result,
  leveledUp,
  newLevel,
  onRetry,
  onNextMission,
  onReturnToBase,
  onWatchAdRevive,
}) => {
  useEffect(() => {
    if (result.won) {
      soundManager.playVictory();

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: [
          '#ef4444',
          '#f59e0b',
          '#10b981',
          '#3b82f6',
        ],
      });
    } else {
      soundManager.playDefeat();
    }
  }, [result.won]);

  return (
    <div className="modal-screen fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center px-3 select-none overflow-y-auto animate-in fade-in duration-300">
      <div
        className={`modal-box relative w-full max-w-md bg-slate-950 border rounded-2xl shadow-2xl p-4 sm:p-6 my-auto flex flex-col items-center text-center max-h-[92vh] overflow-y-auto ${
          result.won
            ? 'border-amber-500/60 shadow-amber-950/40'
            : 'border-red-600/60 shadow-red-950/40'
        }`}
      >
        {/* Outcome Header Icon */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 border-2 ${
            result.won
              ? 'bg-amber-500/20 border-amber-400 text-amber-400 animate-bounce'
              : 'bg-red-600/20 border-red-500 text-red-500'
          }`}
        >
          {result.won ? (
            <Trophy className="w-10 h-10" />
          ) : (
            <Skull className="w-10 h-10" />
          )}
        </div>

        {/* Title */}
        <h2
          className={`text-3xl font-heading font-black tracking-widest ${
            result.won
              ? 'text-amber-400'
              : 'text-red-500'
          }`}
        >
          {result.won
            ? 'MISSION COMPLETE'
            : 'SURVIVOR K.I.A.'}
        </h2>

        {/* Objective Status */}
        {result.won ? (
          <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-mono-tech uppercase tracking-wider text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Survival Objective:{' '}
              <strong className="text-white font-bold">
                COMPLETED
              </strong>
            </span>
          </div>
        ) : (
          <p className="text-xs font-mono-tech text-slate-400 mt-1 uppercase tracking-wider">
            {result.location.name} • {result.location.zoneType}
          </p>
        )}

        {/* Level Up */}
        {leveledUp && (
          <div className="w-full mt-4 p-3 bg-gradient-to-r from-amber-600/30 via-yellow-500/40 to-amber-600/30 border border-amber-400 rounded-xl text-amber-300 font-heading font-bold text-sm tracking-wider flex items-center justify-center gap-2 animate-pulse">
            <Award className="w-5 h-5" />
            <span>
              SURVIVOR PROMOTED TO RANK {newLevel}!
            </span>
          </div>
        )}

        {/* Rewards / Statistics */}
        <div className="w-full grid grid-cols-2 gap-3 mt-6 text-left font-mono-tech text-xs">
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              Time Survived
            </span>

            <span className="font-bold text-white text-sm">
              {result.timeElapsed}s
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Skull className="w-4 h-4 text-red-400" />
              Enemies Defeated
            </span>

            <span className="font-bold text-white text-sm">
              {result.kills}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              Coins Earned
            </span>

            <span className="font-bold text-amber-400 text-sm">
              +{result.coinsEarned}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-400" />
              XP Earned
            </span>

            <span className="font-bold text-purple-400 text-sm">
              +{result.xpEarned}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 mt-8 font-heading font-bold text-sm">
          {/* NEXT LEVEL */}
          {result.won &&
            onNextMission &&
            result.location.id < 50 && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onNextMission();
                }}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 transition active:scale-98 shadow-xl shadow-amber-950 tracking-wider cursor-pointer"
              >
                <span>NEXT LEVEL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

          {/* WATCH AD REVIVE */}
          {!result.won && onWatchAdRevive && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onWatchAdRevive();
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-slate-950 font-heading font-black text-sm tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition active:scale-98 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>WATCH AD → REVIVE</span>
            </button>
          )}

          {/* RETRY / REPLAY */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onRetry();
            }}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-98 tracking-wider cursor-pointer ${
              result.won
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-950'
            }`}
          >
            <RotateCcw className="w-4 h-4" />

            <span>
              {result.won
                ? 'REPLAY LEVEL'
                : 'RETRY MISSION'}
            </span>
          </button>

          {/* HOME / MAP */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onReturnToBase();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 transition flex items-center justify-center gap-2 text-xs font-mono-tech cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>HOME / MAP</span>
          </button>
        </div>
      </div>
    </div>
  );
};