import React, { useState, useRef } from 'react';
import {
  Heart,
  Shield,
  Zap,
  Package,
  Bomb,
  RotateCcw,
  Menu,
  AlertTriangle,
  Repeat,
} from 'lucide-react';

import { GameHUDState } from '../game/engine/GameEngine';
import { XP_FOR_LEVEL } from '../game/constants';
import { soundManager } from '../audio/soundManager';

interface GameHUDProps {
  hud: GameHUDState;
  onPause: () => void;
  onReload: () => void;
  onDash: () => void;
  onUseMedkit: () => void;
  onThrowGrenade: () => void;
  onSwitchWeapon: (slot: 1 | 2) => void;
  onVirtualMove?: (x: number, y: number) => void;
  onVirtualAim?: (x: number, y: number) => void;
  onVirtualShoot?: (shooting: boolean) => void;
  showMobileControls?: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hud,
  onPause,
  onReload,
  onDash,
  onUseMedkit,
  onThrowGrenade,
  onSwitchWeapon,
  onVirtualMove,
  onVirtualAim,
  onVirtualShoot,
  showMobileControls = false,
}) => {
  /* =========================================================
     MOVEMENT JOYSTICK STATE
     ========================================================= */
  const [moveStickActive, setMoveStickActive] = useState(false);
  const [moveStickPos, setMoveStickPos] = useState({ x: 0, y: 0 });
  const moveTouchIdRef = useRef<number | null>(null);
  const moveCenterRef = useRef({ x: 0, y: 0 });

  /* =========================================================
     AIM / FIRE JOYSTICK STATE
     ========================================================= */
  const [aimStickActive, setAimStickActive] = useState(false);
  const [aimStickPos, setAimStickPos] = useState({ x: 0, y: 0 });
  const aimTouchIdRef = useRef<number | null>(null);
  const aimCenterRef = useRef({ x: 0, y: 0 });

  /* =========================================================
     MOVEMENT TOUCH HANDLERS
     ========================================================= */
  const handleMoveTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (moveTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    moveTouchIdRef.current = touch.identifier;

    const target = e.currentTarget.getBoundingClientRect();
    moveCenterRef.current = {
      x: target.left + target.width / 2,
      y: target.top + target.height / 2,
    };

    setMoveStickActive(true);
    updateMoveJoystick(touch.clientX, touch.clientY);
  };

  const handleMoveTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (moveTouchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === moveTouchIdRef.current) {
        updateMoveJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleMoveTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === moveTouchIdRef.current) {
        moveTouchIdRef.current = null;
        setMoveStickActive(false);
        setMoveStickPos({ x: 0, y: 0 });
        onVirtualMove?.(0, 0);
        break;
      }
    }
  };

  const updateMoveJoystick = (clientX: number, clientY: number) => {
    let dx = clientX - moveCenterRef.current.x;
    let dy = clientY - moveCenterRef.current.y;
    const maxRadius = 38;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setMoveStickPos({ x: dx, y: dy });
    onVirtualMove?.(dx / maxRadius, dy / maxRadius);
  };

  /* =========================================================
     AIM / FIRE TOUCH HANDLERS
     ========================================================= */
  const handleAimTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (aimTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    aimTouchIdRef.current = touch.identifier;

    const target = e.currentTarget.getBoundingClientRect();
    aimCenterRef.current = {
      x: target.left + target.width / 2,
      y: target.top + target.height / 2,
    };

    setAimStickActive(true);
    onVirtualShoot?.(true);
    updateAimJoystick(touch.clientX, touch.clientY);
  };

  const handleAimTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (aimTouchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === aimTouchIdRef.current) {
        updateAimJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleAimTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === aimTouchIdRef.current) {
        aimTouchIdRef.current = null;
        setAimStickActive(false);
        setAimStickPos({ x: 0, y: 0 });
        onVirtualShoot?.(false);
        onVirtualAim?.(0, 0);
        break;
      }
    }
  };

  const updateAimJoystick = (clientX: number, clientY: number) => {
    let dx = clientX - aimCenterRef.current.x;
    let dy = clientY - aimCenterRef.current.y;
    const maxRadius = 38;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setAimStickPos({ x: dx, y: dy });

    if (dist > 6) {
      onVirtualAim?.(dx, dy);
    } else {
      onVirtualAim?.(0, 0);
    }
  };

  /* =========================================================
     XP CALCULATIONS
     ========================================================= */
  const xpRequired = XP_FOR_LEVEL(hud.playerLevel);
  const xpPercent = Math.min(100, Math.round((hud.playerXp / xpRequired) * 100));

  return (
    <div className="game-hud pointer-events-none absolute inset-0 w-full h-full select-none overflow-hidden touch-none overscroll-none z-30">
      
      {/* =====================================================
          COMBAT TOP HUD: PLAYER STATUS | MISSION | MINIMAP & MENU
          ===================================================== */}
      <div className="combat-top-hud">
        
        {/* LEFT: PLAYER STATUS */}
        <div className="player-status flex flex-col gap-1 bg-slate-950/95 p-2 rounded-xl border border-slate-800 shadow-xl backdrop-blur-md">
          {/* Level & XP */}
          <div className="flex items-center justify-between text-[10px] font-mono-tech border-b border-slate-800/80 pb-0.5">
            <span className="text-amber-400 font-bold tracking-wider">
              RANK {hud.playerLevel}
            </span>
            <span className="text-slate-400 text-[9px]">
              {hud.playerXp}/{xpRequired}
            </span>
          </div>

          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${xpPercent}%` }}
            />
          </div>

          {/* HEALTH */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <Heart className="w-3 h-3 text-red-500 shrink-0 fill-current" />
            <div className="flex-1 bg-slate-900 h-2.5 rounded-sm overflow-hidden relative border border-red-950">
              <div
                className="bg-red-600 h-full transition-all duration-200"
                style={{ width: `${Math.max(0, (hud.health / hud.maxHealth) * 100)}%` }}
              />
              <span className="absolute inset-0 text-[8px] font-mono-tech flex items-center justify-center font-bold text-white">
                {hud.health}/{hud.maxHealth}
              </span>
            </div>
          </div>

          {/* ARMOR */}
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-cyan-400 shrink-0" />
            <div className="flex-1 bg-slate-900 h-1.5 rounded-sm overflow-hidden relative">
              <div
                className="bg-cyan-500 h-full"
                style={{ width: `${Math.max(0, (hud.armor / hud.maxArmor) * 100)}%` }}
              />
            </div>
          </div>

          {/* STAMINA */}
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
            <div className="flex-1 bg-slate-900 h-1.5 rounded-sm overflow-hidden">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${Math.max(0, (hud.stamina / hud.maxStamina) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* CENTER: MISSION OBJECTIVE & TIMER */}
        <div className="mission-objective bg-slate-950/95 border border-red-500/70 shadow-[0_0_16px_rgba(239,68,68,0.25)] rounded-2xl backdrop-blur-md flex flex-col items-center">
          <div className="flex items-center gap-1 max-w-full">
            <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse shrink-0" />
            <span className="text-[10px] font-mono-tech text-red-400 tracking-wider uppercase font-bold truncate">
              {hud.objectiveText}
            </span>
          </div>

          <span className="text-[11px] text-white font-mono-tech font-bold tracking-widest mt-0.5">
            {hud.objectiveProgress}
          </span>

          {/* Boss Bar if present */}
          {hud.bossHealthPercent !== undefined && (
            <div className="mt-1 w-full max-w-[130px] bg-slate-950/90 border border-red-600/80 p-0.5 rounded">
              <div className="flex justify-between text-[8px] font-mono-tech text-red-400 font-bold px-0.5">
                <span>TITAN</span>
                <span>{hud.bossHealthPercent}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1 rounded-sm overflow-hidden">
                <div
                  className="bg-red-600 h-full transition-all"
                  style={{ width: `${hud.bossHealthPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: MINIMAP & MENU BUTTON */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {/* MINIMAP */}
          {hud.minimap && (
            <div className="minimap rounded-xl overflow-hidden border border-red-900/80 bg-slate-950/95 shadow-xl relative">
              <svg
                className="w-full h-full block"
                viewBox={`0 0 ${hud.minimap.mapWidth} ${hud.minimap.mapHeight}`}
                preserveAspectRatio="xMidYMid meet"
              >
                <rect
                  width={hud.minimap.mapWidth}
                  height={hud.minimap.mapHeight}
                  fill="#020617"
                />

                <circle
                  cx={hud.minimap.mapWidth / 2}
                  cy={hud.minimap.mapHeight / 2}
                  r={hud.minimap.mapWidth * 0.4}
                  stroke="#1e293b"
                  strokeWidth="12"
                  fill="none"
                  opacity="0.3"
                />

                {/* Extraction zone */}
                {hud.minimap.extraction && (
                  <circle
                    cx={hud.minimap.extraction.x}
                    cy={hud.minimap.extraction.y}
                    r="60"
                    fill="#38bdf8"
                    opacity="0.8"
                  />
                )}

                {/* Defense zone */}
                {hud.minimap.defenseZone && (
                  <circle
                    cx={hud.minimap.defenseZone.x}
                    cy={hud.minimap.defenseZone.y}
                    r="80"
                    fill="#a855f7"
                    opacity="0.6"
                  />
                )}

                {/* Crates */}
                {hud.minimap.crates.map(
                  (c, i) =>
                    !c.collected && (
                      <circle
                        key={`crate-${i}`}
                        cx={c.x}
                        cy={c.y}
                        r="25"
                        fill="#eab308"
                      />
                    )
                )}

                {/* Zombies */}
                {hud.minimap.zombies.map((z, i) => (
                  <circle
                    key={`z-${i}`}
                    cx={z.x}
                    cy={z.y}
                    r={z.isBoss ? 45 : 22}
                    fill={z.isBoss ? '#ef4444' : '#dc2626'}
                  />
                ))}

                {/* Camera bounds */}
                <rect
                  x={hud.minimap.camX}
                  y={hud.minimap.camY}
                  width={hud.minimap.camW}
                  height={hud.minimap.camH}
                  stroke="#38bdf8"
                  strokeWidth="10"
                  fill="none"
                  opacity="0.4"
                />

                {/* Player marker */}
                <circle
                  cx={hud.minimap.playerX}
                  cy={hud.minimap.playerY}
                  r="35"
                  fill="#22c55e"
                />
                <line
                  x1={hud.minimap.playerX}
                  y1={hud.minimap.playerY}
                  x2={hud.minimap.playerX + Math.cos(hud.minimap.playerAngle) * 75}
                  y2={hud.minimap.playerY + Math.sin(hud.minimap.playerAngle) * 75}
                  stroke="#4ade80"
                  strokeWidth="15"
                />
              </svg>
            </div>
          )}

          {/* PAUSE / MENU BUTTON */}
          <button
            onClick={() => {
              soundManager.playClick();
              onPause();
            }}
            className="combat-menu flex items-center justify-center gap-1 h-8 px-2.5 rounded-lg bg-slate-900/95 border border-slate-700/80 text-slate-200 hover:text-white active:scale-95 shadow cursor-pointer text-xs font-mono-tech"
            title="Open Game Menu"
            aria-label="Open Game Menu"
          >
            <Menu className="w-4 h-4 text-red-400" />
            <span className="text-[10px] hidden sm:inline">MENU</span>
          </button>
        </div>

      </div>

      {/* =====================================================
          COMBAT BOTTOM CONTROLS (MOVE, WEAPON, AIM, ACTION BAR)
          ===================================================== */}
      {showMobileControls && (
        <div className="combat-controls">
          
          {/* ROW: MOVE JOYSTICK | WEAPON INFO | AIM & FIRE JOYSTICK */}
          <div className="control-row">
            
            {/* MOVE JOYSTICK */}
            <div className="move-control flex flex-col items-center select-none">
              <div
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-slate-700/80 bg-slate-950/85 backdrop-blur-md flex items-center justify-center shadow-xl touch-none"
                onTouchStart={handleMoveTouchStart}
                onTouchMove={handleMoveTouchMove}
                onTouchEnd={handleMoveTouchEnd}
                onTouchCancel={handleMoveTouchEnd}
              >
                <div className="w-6 h-6 rounded-full border border-slate-700/50 bg-slate-900/80 pointer-events-none" />
                <div
                  className={`absolute w-11 h-11 rounded-full border-2 flex items-center justify-center shadow-lg transition-colors ${
                    moveStickActive ? 'bg-red-600 border-red-300' : 'bg-slate-800 border-slate-600'
                  }`}
                  style={{
                    transform: `translate(${moveStickPos.x}px, ${moveStickPos.y}px)`,
                  }}
                >
                  <div className="w-3 h-3 rounded-full bg-white/40" />
                </div>
              </div>
              <span className="text-[9px] font-mono-tech text-slate-400 mt-1 uppercase tracking-wider font-bold">
                MOVE
              </span>
            </div>

            {/* WEAPON & RELOAD INFO */}
            <div className="weapon-info flex items-center gap-2 bg-slate-950/95 border border-slate-800 p-2 rounded-xl shadow-xl backdrop-blur-md select-none">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-heading font-bold text-white uppercase truncate max-w-[85px] sm:max-w-[120px]">
                  {hud.currentWeapon.name}
                </span>
                <div className="flex items-baseline gap-1 font-mono-tech">
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      hud.currentMag <= 3 ? 'text-red-500 animate-pulse' : 'text-amber-400'
                    }`}
                  >
                    {hud.isReloading ? 'RELOAD...' : hud.currentMag}
                  </span>
                  <span className="text-[9px] text-slate-500">/{hud.maxMag}</span>
                </div>
              </div>

              {/* Reload Button */}
              <button
                className="w-9 h-9 rounded-lg border border-amber-500/70 bg-slate-900/95 text-amber-300 flex items-center justify-center shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                onClick={() => {
                  soundManager.playClick();
                  onReload();
                }}
                disabled={hud.isReloading || hud.currentMag >= hud.maxMag}
                title="Reload [R]"
              >
                <RotateCcw className={`w-4 h-4 ${hud.isReloading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* AIM & FIRE JOYSTICK */}
            <div className="aim-control flex flex-col items-center select-none">
              <div
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-red-900/80 bg-slate-950/85 backdrop-blur-md flex items-center justify-center shadow-xl touch-none"
                onTouchStart={handleAimTouchStart}
                onTouchMove={handleAimTouchMove}
                onTouchEnd={handleAimTouchEnd}
                onTouchCancel={handleAimTouchEnd}
              >
                <div className="w-6 h-6 rounded-full border border-red-900/50 bg-red-950/40 pointer-events-none" />
                <div
                  className={`absolute w-11 h-11 rounded-full border-2 flex items-center justify-center shadow-lg transition-colors ${
                    aimStickActive ? 'bg-red-500 border-white' : 'bg-red-900/80 border-red-600'
                  }`}
                  style={{
                    transform: `translate(${aimStickPos.x}px, ${aimStickPos.y}px)`,
                  }}
                >
                  <div className="w-3 h-3 rounded-full bg-white/60" />
                </div>
              </div>
              <span className="text-[9px] font-mono-tech text-red-400 mt-1 uppercase tracking-wider font-bold">
                AIM / FIRE
              </span>
            </div>

          </div>

          {/* ACTION BAR: BOX | GRENADE | SWAP | DASH */}
          <div className="action-bar bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-md select-none">
            {/* BOX */}
            <button
              className="flex items-center justify-center gap-1 rounded-xl border bg-emerald-950/90 border-emerald-500/70 text-emerald-300 active:scale-95 cursor-pointer disabled:opacity-40"
              onClick={() => {
                soundManager.playClick();
                onUseMedkit();
              }}
              disabled={hud.medkits <= 0}
            >
              <Package className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold text-[10px] font-mono-tech">BOX x{hud.medkits}</span>
            </button>

            {/* GRENADE */}
            <button
              className="flex items-center justify-center gap-1 rounded-xl border bg-amber-950/90 border-amber-500/70 text-amber-300 active:scale-95 cursor-pointer disabled:opacity-40"
              onClick={() => {
                soundManager.playClick();
                onThrowGrenade();
              }}
              disabled={hud.grenades <= 0}
            >
              <Bomb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-bold text-[10px] font-mono-tech">NADE x{hud.grenades}</span>
            </button>

            {/* SWAP */}
            <button
              className="flex items-center justify-center gap-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 active:scale-95 cursor-pointer"
              onClick={() => {
                soundManager.playClick();
                onSwitchWeapon(hud.equippedSlot === 1 ? 2 : 1);
              }}
            >
              <Repeat className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="font-bold text-[10px] font-mono-tech">SWAP</span>
            </button>

            {/* DASH */}
            <button
              className="flex items-center justify-center gap-1 rounded-xl bg-sky-950/90 border border-sky-400/80 text-sky-300 active:scale-95 cursor-pointer"
              onClick={() => {
                soundManager.playClick();
                onDash();
              }}
            >
              <Zap className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="font-bold text-[10px] font-mono-tech">DASH</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
