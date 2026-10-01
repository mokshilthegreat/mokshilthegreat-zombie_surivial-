import React, { useEffect, useRef } from 'react';
import { GameSaveData, WeaponId } from '../types/game';
import { WEAPONS_CATALOG } from '../game/constants';

interface SurvivorHeroVisualProps {
  saveData: GameSaveData;
  className?: string;
}

export const SurvivorHeroVisual: React.FC<SurvivorHeroVisualProps> = ({ saveData, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const weaponId: WeaponId = saveData?.equippedWeaponId || 'pistol';
  const weapon = WEAPONS_CATALOG[weaponId] || WEAPONS_CATALOG.pistol;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
        time += 0.035;
        const w = (canvas.width = 380);
        const h = (canvas.height = 440);

        ctx.clearRect(0, 0, w, h);

        // Center coords for survivor character
        const cx = w / 2;
        const cy = h / 2 + 35;

        // Idle breathing and weapon sway calculations
        const breathY = Math.sin(time * 1.8) * 3.5;
        const breathScale = 1 + Math.sin(time * 1.8) * 0.012;
        const weaponSway = Math.sin(time * 1.2) * 0.04;
        const eyeLookX = Math.sin(time * 0.8) * 2;

        ctx.save();

        // 1. Shadow beneath character
        ctx.beginPath();
        ctx.ellipse(cx, cy + 145, 75 + Math.sin(time * 1.8) * 3, 18, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fill();

        // 2. Tactical Flashlight Beam radiating from weapon barrel
        ctx.save();
        const muzzleX = cx + 80;
        const muzzleY = cy - 22 + breathY;
        
        const lightGrad = ctx.createRadialGradient(muzzleX, muzzleY, 10, muzzleX + 220, muzzleY - 40, 260);
        lightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        lightGrad.addColorStop(0.4, 'rgba(254, 240, 138, 0.12)');
        lightGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.moveTo(muzzleX, muzzleY);
        ctx.lineTo(muzzleX + 260, muzzleY - 90);
        ctx.lineTo(muzzleX + 260, muzzleY + 45);
        ctx.closePath();
        ctx.fill();
        ctx.restore();


      // 3. Tactical Backpack (Behind back)
      ctx.save();
      ctx.translate(cx - 38, cy - 25 + breathY);
      ctx.fillStyle = '#1e293b'; // Charcoal military canvas
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      // Main pack
      ctx.beginPath();
      ctx.roundRect(-15, -40, 32, 60, 8);
      ctx.fill();
      ctx.stroke();
      // Bedroll / radio on top of pack
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(-12, -50, 26, 12, 4);
      ctx.fill();
      ctx.stroke();
      // Antenna with blinking green status LED
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, -50);
      ctx.lineTo(14, -75);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(14, -75, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = Math.sin(time * 4) > 0 ? '#22c55e' : '#14532d';
      ctx.fill();
      ctx.restore();

      // 4. Legs and Combat Boots
      // Left leg (back)
      ctx.fillStyle = '#334155'; // Dark slate cargo pants
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(cx - 32, cy + 40, 22, 65, 5);
      ctx.fill();
      ctx.stroke();
      // Left combat boot
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(cx - 38, cy + 105, 28, 22, 4);
      ctx.fill();
      ctx.stroke();

      // Right leg (forward stance)
      ctx.fillStyle = '#3f4e65'; // Front cargo pants
      ctx.beginPath();
      ctx.roundRect(cx + 8, cy + 40, 24, 68, 5);
      ctx.fill();
      ctx.stroke();
      // Cargo pocket on right thigh
      ctx.fillStyle = '#2d3748';
      ctx.beginPath();
      ctx.roundRect(cx + 18, cy + 55, 16, 22, 3);
      ctx.fill();
      ctx.stroke();
      // Right combat boot
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(cx + 6, cy + 108, 30, 24, 4);
      ctx.fill();
      ctx.stroke();

      // 5. Survivor Torso & Tactical Armor Vest
      ctx.save();
      ctx.translate(cx, cy + breathY);
      ctx.scale(breathScale, breathScale);

      // Inner flannel / combat shirt
      ctx.fillStyle = '#7f1d1d'; // Crimson dark tactical shirt
      ctx.beginPath();
      ctx.roundRect(-28, -42, 56, 85, 8);
      ctx.fill();
      ctx.stroke();

      // Heavy Kevlar Plate Carrier Vest
      ctx.fillStyle = '#1e293b'; // Heavy Kevlar
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-24, -38, 48, 65, 6);
      ctx.fill();
      ctx.stroke();

      // Molle webbing pouches on chest
      ctx.fillStyle = '#334155';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.roundRect(-18 + i * 14, -15, 10, 22, 2);
        ctx.fill();
        ctx.stroke();
      }

      // Tactical belt with knife holster & radio
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-26, 28, 52, 10);
      // Buckle
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-6, 27, 12, 12);
      // Combat knife on left hip
      ctx.fillStyle = '#475569';
      ctx.fillRect(-28, 22, 6, 26);
      ctx.fillStyle = '#dc2626'; // Red paracord wrap
      ctx.fillRect(-28, 16, 6, 8);

      // 6. Survivor Head & Face
      // Neck
      ctx.fillStyle = '#d97706'; // Tanned skin tone
      ctx.fillRect(-10, -52, 20, 16);

      // Head / Face
      ctx.beginPath();
      ctx.ellipse(0, -68, 19, 22, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b'; // Survivor skin
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Tactical Scarf / Shemagh / Bandana across lower face
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-18, -65);
      ctx.quadraticCurveTo(0, -50, 18, -65);
      ctx.lineTo(16, -50);
      ctx.quadraticCurveTo(0, -42, -16, -50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Eyes & Forehead scar
      ctx.fillStyle = '#ffffff';
      // Left eye
      ctx.fillRect(-11 + eyeLookX, -74, 6, 4);
      // Right eye
      ctx.fillRect(4 + eyeLookX, -74, 6, 4);
      // Pupils
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-9 + eyeLookX, -74, 3, 4);
      ctx.fillRect(6 + eyeLookX, -74, 3, 4);

      // Battle scar over right eye
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(8, -80);
      ctx.lineTo(5, -68);
      ctx.stroke();

      // Tactical Beanie / Comm Headset
      ctx.fillStyle = '#0f172a'; // Black beanie
      ctx.beginPath();
      ctx.arc(0, -74, 20, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      // Headset microphone
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(18, -72);
      ctx.lineTo(24, -65);
      ctx.lineTo(14, -58);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(14, -58, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // restore torso

      // 7. Arms and Equipped Weapon
      ctx.save();
      ctx.translate(cx, cy + breathY);
      ctx.rotate(weaponSway);

      // Left arm holding foregrip
      ctx.fillStyle = '#7f1d1d'; // Sleeve
      ctx.beginPath();
      ctx.roundRect(-24, -28, 14, 38, 5);
      ctx.fill();
      ctx.stroke();
      // Tactical glove
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(15, -12, 14, 14, 3);
      ctx.fill();

      // The Weapon (Rendered based on currently equipped weapon!)
      ctx.save();
      ctx.translate(0, -18);

      // Gun receiver & barrel
      ctx.fillStyle = '#1e293b'; // Gunmetal
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.5;

      if (weaponId === 'shotgun') {
        // Shotgun body
        ctx.fillRect(-15, -4, 90, 10);
        ctx.fillStyle = '#78350f'; // Wood stock / grip
        ctx.fillRect(-28, 0, 22, 12);
        // Pump
        ctx.fillStyle = '#451a03';
        ctx.fillRect(25, 6, 24, 6);
      } else if (weaponId === 'flamethrower' || weaponId === 'smg') {
        // Heavy fuel tank or compact submachine gun barrel
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-20, -10, 85, 18);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(20, -12, 35, 20);
        // Fuel / ammo feed
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-10, 8, 20, 14);
      } else if (weaponId === 'sniper') {
        // Long sniper rifle barrel & scope
        ctx.fillRect(-25, -5, 125, 9);
        // Scope
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, -14, 35, 8);
        ctx.fillStyle = '#38bdf8'; // Lens reflection
        ctx.fillRect(32, -13, 3, 6);
      } else if (weaponId === 'grenade_launcher' || weaponId === 'rocket_launcher') {
        // Bulky launcher barrel
        ctx.fillStyle = '#334155';
        ctx.fillRect(-18, -12, 95, 22);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(40, -10, 8, 18);
      } else if (weaponId === 'pistol') {
        // Handgun
        ctx.fillRect(5, -6, 45, 9);
        ctx.fillRect(10, 3, 10, 14);
      } else {
        // Assault Rifle (M4 / AK)
        ctx.fillRect(-20, -5, 95, 10);
        // Curved Magazine
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(15, 5, 12, 22);
        // Tactical Sight
        ctx.fillRect(10, -12, 18, 7);
        // Red dot sight dot
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(26, -9, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore(); // restore gun

      // Right arm holding pistol grip & trigger
      ctx.fillStyle = '#7f1d1d'; // Sleeve
      ctx.beginPath();
      ctx.roundRect(-8, -25, 16, 32, 5);
      ctx.fill();
      ctx.stroke();
      // Right tactical glove
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-2, -6, 14, 14, 3);
      ctx.fill();

      ctx.restore(); // restore arm/weapon

      ctx.restore(); // restore main

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [weaponId, saveData.playerLevel]);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Dynamic Aura Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />
      
      {/* Canvas Drawing */}
      <canvas 
        ref={canvasRef} 
        className="w-[230px] h-[270px] sm:w-[320px] sm:h-[370px] drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)]" 
      />

      {/* Survivor Equipment Tag */}
      <div className="absolute bottom-2 bg-slate-950/90 border border-slate-700/80 px-3 py-1 rounded-full text-[11px] font-mono-tech text-slate-300 flex items-center gap-2 shadow-xl backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-bold text-white uppercase">{weapon.name}</span>
        <span className="text-slate-500">•</span>
        <span className="text-amber-400">LVL {saveData.playerLevel} SURVIVOR</span>
      </div>
    </div>
  );
};
