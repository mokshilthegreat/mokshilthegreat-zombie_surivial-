import React from 'react';
import { WeaponId } from '../../types/game';

interface WeaponVisualProps {
  weaponId: WeaponId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WeaponVisual: React.FC<WeaponVisualProps> = ({
  weaponId,
  size = 'md',
  className = '',
}) => {
  const dims = {
    sm: { width: 72, height: 42 },
    md: { width: 140, height: 75 },
    lg: { width: 340, height: 160 },
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl select-none ${className}`}
      style={{ width: dims.width, height: dims.height }}
    >
      {/* Background blueprint grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '10px 10px',
        }}
      />

      <svg
        viewBox="0 0 200 100"
        className="w-full h-full drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gun-metal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="steel-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="tactical-tan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <linearGradient id="flame-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
        </defs>

        {/* 1. M9 GUARDIAN (Semi-Auto Tactical Pistol) */}
        {weaponId === 'pistol' && (
          <g transform="translate(30, 20)">
            {/* Grip */}
            <path d="M45 42 L32 78 L46 80 L56 46 Z" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
            {/* Grip checkering */}
            <line x1="36" y1="52" x2="48" y2="74" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="42" y1="50" x2="52" y2="70" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
            {/* Magazine baseplate */}
            <rect x="30" y="78" width="16" height="4" rx="1" fill="#475569" />
            {/* Trigger guard & trigger */}
            <path d="M54 50 Q66 50 64 62 L54 62" stroke="#475569" strokeWidth="1.5" fill="none" />
            <path d="M57 53 Q59 58 57 60" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
            {/* Lower receiver */}
            <rect x="42" y="38" width="58" height="12" rx="1.5" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            {/* Slide */}
            <rect x="40" y="24" width="75" height="16" rx="2" fill="url(#gun-metal)" stroke="#64748b" strokeWidth="1.5" />
            {/* Slide serrations */}
            <line x1="44" y1="26" x2="44" y2="38" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="48" y1="26" x2="48" y2="38" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="52" y1="26" x2="52" y2="38" stroke="#0f172a" strokeWidth="1.5" />
            {/* Ejection port */}
            <rect x="68" y="26" width="16" height="6" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            {/* Barrel tip */}
            <rect x="114" y="27" width="8" height="10" rx="1" fill="#0f172a" stroke="#475569" strokeWidth="1" />
            {/* Front & rear tactical sights */}
            <rect x="42" y="20" width="3" height="4" fill="#94a3b8" />
            <rect x="112" y="20" width="3" height="4" fill="#ef4444" />
            {/* Under-barrel rail tactical light */}
            <rect x="75" y="44" width="22" height="7" rx="1" fill="#0f172a" stroke="#0284c7" strokeWidth="1" />
            <circle cx="95" cy="47.5" r="2" fill="#38bdf8" />
          </g>
        )}

        {/* 2. BREACHER 12G (Tactical Pump Shotgun) */}
        {weaponId === 'shotgun' && (
          <g transform="translate(10, 20)">
            {/* Stock */}
            <path d="M15 48 L42 45 L45 62 L20 66 Z" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
            <rect x="12" y="48" width="6" height="18" rx="1" fill="#475569" />
            {/* Grip & Trigger */}
            <path d="M45 48 L40 68 L50 69 L53 52 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            <path d="M53 53 Q62 53 60 62 L52 62" stroke="#475569" strokeWidth="1.5" fill="none" />
            <path d="M55 55 Q56 59 54 61" stroke="#f97316" strokeWidth="1.5" fill="none" />
            {/* Receiver with shell side-saddle */}
            <rect x="52" y="40" width="45" height="16" rx="2" fill="url(#gun-metal)" stroke="#475569" strokeWidth="1.5" />
            {/* Red 12-gauge shells in side-saddle */}
            <rect x="58" y="43" width="5" height="10" rx="1" fill="#dc2626" stroke="#facc15" strokeWidth="0.8" />
            <rect x="66" y="43" width="5" height="10" rx="1" fill="#dc2626" stroke="#facc15" strokeWidth="0.8" />
            <rect x="74" y="43" width="5" height="10" rx="1" fill="#dc2626" stroke="#facc15" strokeWidth="0.8" />
            <rect x="82" y="43" width="5" height="10" rx="1" fill="#dc2626" stroke="#facc15" strokeWidth="0.8" />
            {/* Magazine Tube */}
            <rect x="97" y="48" width="65" height="7" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="1.2" />
            {/* Ribbed Pump Forend */}
            <rect x="105" y="46" width="30" height="11" rx="2" fill="#090d16" stroke="#64748b" strokeWidth="1.2" />
            <line x1="112" y1="47" x2="112" y2="56" stroke="#475569" strokeWidth="1" />
            <line x1="118" y1="47" x2="118" y2="56" stroke="#475569" strokeWidth="1" />
            <line x1="124" y1="47" x2="124" y2="56" stroke="#475569" strokeWidth="1" />
            {/* Heavy Barrel */}
            <rect x="97" y="39" width="75" height="8" rx="1" fill="url(#gun-metal)" stroke="#64748b" strokeWidth="1.5" />
            {/* Barrel Clamp / Muzzle Brake */}
            <rect x="160" y="38" width="8" height="18" rx="1" fill="#0f172a" stroke="#f97316" strokeWidth="1" />
            <circle cx="170" cy="43" r="2" fill="#f97316" />
          </g>
        )}

        {/* 3. VECTOR TALON (High-Tech Submachine Gun) */}
        {weaponId === 'smg' && (
          <g transform="translate(18, 15)">
            {/* Folding stock wire */}
            <path d="M20 38 L48 38 L48 52" stroke="#475569" strokeWidth="2" fill="none" strokeDasharray="4 2" />
            {/* Angled recoil housing body */}
            <polygon points="46,32 105,32 105,48 85,62 55,62 46,46" fill="url(#gun-metal)" stroke="#0284c7" strokeWidth="1.5" />
            {/* Top Picatinny Rail */}
            <rect x="50" y="27" width="55" height="5" fill="#0f172a" stroke="#475569" strokeWidth="1" />
            {/* Reflex Sight */}
            <path d="M68 27 L68 18 L82 18 L85 27 Z" fill="#090d16" stroke="#38bdf8" strokeWidth="1" />
            <circle cx="75" cy="22" r="1.5" fill="#38bdf8" />
            {/* Grip & Trigger */}
            <path d="M52 50 L44 76 L54 78 L62 55 Z" fill="#090d16" stroke="#334155" strokeWidth="1.2" />
            <path d="M62 55 Q70 55 69 64 L62 64" stroke="#475569" strokeWidth="1.2" fill="none" />
            {/* Extended Stick Magazine */}
            <path d="M72 58 L66 90 L76 91 L82 58 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Angled foregrip */}
            <path d="M102 48 L108 64 L114 62 L106 48 Z" fill="#090d16" stroke="#475569" strokeWidth="1" />
            {/* Barrel & Shroud */}
            <rect x="105" y="36" width="28" height="9" rx="1.5" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
            {/* Muzzle Compensator */}
            <rect x="131" y="34" width="8" height="13" rx="1" fill="#090d16" stroke="#38bdf8" strokeWidth="1" />
          </g>
        )}

        {/* 4. ARX-7 ASSAULT RIFLE (Military Combat Rifle) */}
        {weaponId === 'assault_rifle' && (
          <g transform="translate(10, 18)">
            {/* Adjustable Stock */}
            <path d="M15 42 L42 40 L44 56 L15 58 Z" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            <rect x="12" y="42" width="5" height="17" rx="1" fill="#090d16" />
            {/* Buffer tube */}
            <rect x="42" y="43" width="18" height="6" fill="#334155" />
            {/* Grip & Trigger */}
            <path d="M52 48 L46 72 L56 74 L62 52 Z" fill="#090d16" stroke="#334155" strokeWidth="1.2" />
            <path d="M62 52 Q72 52 70 60 L62 60" stroke="#475569" strokeWidth="1.2" fill="none" />
            {/* Lower & Upper Receiver */}
            <rect x="60" y="36" width="46" height="17" rx="2" fill="url(#gun-metal)" stroke="#64748b" strokeWidth="1.5" />
            {/* Curved Banana Magazine */}
            <path d="M78 52 Q82 78 95 82 L103 78 Q92 72 88 52 Z" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
            {/* Quad-Rail Handguard */}
            <rect x="106" y="38" width="48" height="13" rx="1" fill="#1e293b" stroke="#475569" strokeWidth="1.2" />
            <line x1="112" y1="44" x2="148" y2="44" stroke="#0f172a" strokeWidth="2" strokeDasharray="3 2" />
            {/* Holographic Sight on rail */}
            <rect x="74" y="25" width="22" height="11" rx="2" fill="#090d16" stroke="#c084fc" strokeWidth="1.2" />
            <circle cx="85" cy="30" r="2.5" fill="#a855f7" />
            {/* Rifle Barrel */}
            <rect x="154" y="42" width="26" height="5" fill="#334155" stroke="#475569" strokeWidth="1" />
            {/* Flash Hider */}
            <rect x="178" y="40" width="8" height="9" rx="1" fill="#090d16" stroke="#a855f7" strokeWidth="1" />
          </g>
        )}

        {/* 5. R-98 SNIPER (Precision Anti-Materiel Rifle) */}
        {weaponId === 'sniper' && (
          <g transform="translate(6, 16)">
            {/* Precision Skeletonized Stock */}
            <path d="M12 44 L38 42 L42 60 L24 62 L15 56 Z" fill="#090d16" stroke="#ec4899" strokeWidth="1.5" />
            <rect x="22" y="38" width="12" height="4" rx="1" fill="#ec4899" opacity="0.8" /> {/* Cheek rest */}
            {/* Ergonomic sniper grip */}
            <path d="M45 48 L40 70 L50 72 L55 52 Z" fill="#1e293b" stroke="#475569" strokeWidth="1.2" />
            {/* Heavy Receiver */}
            <rect x="52" y="38" width="46" height="16" rx="2" fill="url(#gun-metal)" stroke="#64748b" strokeWidth="1.5" />
            {/* Bolt handle */}
            <path d="M64 42 L64 34 L68 34" stroke="#ec4899" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Magazine */}
            <rect x="72" y="54" width="16" height="16" rx="1" fill="#090d16" stroke="#475569" strokeWidth="1.2" />
            {/* Large Variable Telescopic Scope */}
            <path d="M48 24 L56 26 L88 26 L96 22 L100 30 L94 30 L54 30 L48 30 Z" fill="#0f172a" stroke="#ec4899" strokeWidth="1.5" />
            <circle cx="51" cy="27" r="2.5" fill="#f43f5e" />
            <circle cx="97" cy="26" r="2.5" fill="#38bdf8" />
            <rect x="62" y="30" width="4" height="8" fill="#475569" />
            <rect x="80" y="30" width="4" height="8" fill="#475569" />
            {/* Long Fluted Heavy Barrel */}
            <rect x="98" y="42" width="80" height="7" rx="1" fill="url(#steel-highlight)" stroke="#475569" strokeWidth="1.2" />
            {/* Muzzle Brake */}
            <rect x="176" y="39" width="12" height="13" rx="1.5" fill="#090d16" stroke="#ec4899" strokeWidth="1.2" />
            <line x1="180" y1="41" x2="180" y2="50" stroke="#f43f5e" strokeWidth="1.5" />
            <line x1="184" y1="41" x2="184" y2="50" stroke="#f43f5e" strokeWidth="1.5" />
            {/* Folded Bipod */}
            <line x1="140" y1="49" x2="132" y2="68" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
            <line x1="142" y1="49" x2="148" y2="68" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* 6. NIGHTFALL CROSSBOW (Tactical Compound Crossbow) */}
        {weaponId === 'crossbow' && (
          <g transform="translate(15, 14)">
            {/* Stock and Rail Body */}
            <path d="M18 48 L46 44 L54 62 L28 64 Z" fill="#090d16" stroke="#10b981" strokeWidth="1.5" />
            <rect x="46" y="42" width="75" height="10" rx="1.5" fill="url(#gun-metal)" stroke="#334155" strokeWidth="1.2" />
            {/* Pistol Grip */}
            <path d="M52 48 L46 72 L56 73 L62 52 Z" fill="#1e293b" stroke="#10b981" strokeWidth="1.2" />
            {/* Red Dot Optic */}
            <rect x="70" y="32" width="22" height="10" rx="2" fill="#0f172a" stroke="#10b981" strokeWidth="1.2" />
            <circle cx="81" cy="37" r="2" fill="#34d399" />
            {/* Twin Compound Limbs curving outward */}
            <path d="M115 47 Q125 15 140 18 Q144 26 136 34 L115 47" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
            <path d="M115 47 Q125 79 140 76 Q144 68 136 60 L115 47" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
            {/* Pulley Cams */}
            <circle cx="138" cy="20" r="4.5" fill="#090d16" stroke="#34d399" strokeWidth="1.2" />
            <circle cx="138" cy="74" r="4.5" fill="#090d16" stroke="#34d399" strokeWidth="1.2" />
            {/* High-tension Bowstring */}
            <line x1="138" y1="20" x2="85" y2="47" stroke="#6ee7b7" strokeWidth="1.5" />
            <line x1="138" y1="74" x2="85" y2="47" stroke="#6ee7b7" strokeWidth="1.5" />
            {/* Loaded Carbon Bolt */}
            <line x1="80" y1="47" x2="148" y2="47" stroke="#a7f3d0" strokeWidth="2.5" />
            <polygon points="148,44 156,47 148,50" fill="#10b981" />
          </g>
        )}

        {/* 7. INFERNO FLAMETHROWER (Heavy Tactical Incinerator) */}
        {weaponId === 'flamethrower' && (
          <g transform="translate(10, 16)">
            {/* Dual Pressurized Fuel Canisters */}
            <rect x="22" y="34" width="36" height="15" rx="4" fill="url(#flame-grad)" stroke="#ea580c" strokeWidth="1.5" />
            <rect x="22" y="52" width="36" height="15" rx="4" fill="url(#flame-grad)" stroke="#ea580c" strokeWidth="1.5" />
            {/* Pressure Gauges */}
            <circle cx="48" cy="41" r="3.5" fill="#0f172a" stroke="#ffffff" strokeWidth="0.8" />
            <line x1="48" y1="41" x2="50" y2="39" stroke="#ef4444" strokeWidth="1" />
            {/* Braided Brass Fuel Tube */}
            <path d="M58 42 Q75 52 82 46" stroke="#f59e0b" strokeWidth="3" fill="none" />
            {/* Heavy Chassis Frame */}
            <rect x="75" y="38" width="55" height="16" rx="2" fill="url(#gun-metal)" stroke="#c2410c" strokeWidth="1.5" />
            {/* Grips */}
            <path d="M78 54 L72 74 L82 76 L88 54 Z" fill="#090d16" stroke="#475569" strokeWidth="1.2" />
            <path d="M112 54 L118 72 L128 70 L122 54 Z" fill="#090d16" stroke="#475569" strokeWidth="1.2" />
            {/* Heavy Projector Shroud & Barrel */}
            <rect x="130" y="40" width="35" height="12" rx="1.5" fill="#1e293b" stroke="#78350f" strokeWidth="1.5" />
            {/* Pilot Flame Igniter Module */}
            <rect x="156" y="34" width="12" height="6" fill="#090d16" stroke="#f97316" strokeWidth="1" />
            {/* Pilot Flame spark */}
            <polygon points="168,37 176,35 171,38 178,38 168,41" fill="#facc15" />
            {/* Heat vents */}
            <circle cx="140" cy="46" r="1.5" fill="#f97316" />
            <circle cx="146" cy="46" r="1.5" fill="#f97316" />
            <circle cx="152" cy="46" r="1.5" fill="#f97316" />
          </g>
        )}

        {/* 8. THUNDER ROCKET LAUNCHER (Heavy Anti-Tank Ordinance) */}
        {(weaponId === 'rocket_launcher' || weaponId === 'grenade_launcher') && (
          <g transform="translate(8, 16)">
            {/* Shoulder Rest Pad */}
            <path d="M45 56 Q55 64 68 56 L68 46 L45 46 Z" fill="#090d16" stroke="#ef4444" strokeWidth="1.5" />
            {/* Heavy Reinforced Launch Tube */}
            <rect x="25" y="34" width="145" height="20" rx="3" fill="url(#gun-metal)" stroke="#ef4444" strokeWidth="2" />
            {/* Reinforcing Bands / Rings */}
            <rect x="42" y="32" width="6" height="24" rx="1" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
            <rect x="85" y="32" width="6" height="24" rx="1" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
            <rect x="135" y="32" width="6" height="24" rx="1" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
            {/* Hazard Stripes on Tube */}
            <path d="M96 34 L104 54 M104 34 L112 54 M112 34 L120 54" stroke="#f59e0b" strokeWidth="2.5" strokeOpacity="0.8" />
            {/* Dual Pistol Grips & Firing Trigger */}
            <path d="M86 54 L80 76 L90 77 L96 54 Z" fill="#090d16" stroke="#475569" strokeWidth="1.2" />
            <path d="M125 54 L132 74 L142 72 L135 54 Z" fill="#090d16" stroke="#475569" strokeWidth="1.2" />
            {/* Digital Laser Targeting Optic */}
            <rect x="92" y="20" width="30" height="14" rx="2" fill="#090d16" stroke="#ef4444" strokeWidth="1.5" />
            <circle cx="116" cy="27" r="3" fill="#ef4444" />
            <circle cx="98" cy="27" r="2.5" fill="#38bdf8" />
            {/* Rear Exhaust Funnel */}
            <polygon points="25,32 12,26 12,62 25,56" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
            {/* Visible Heavy Warhead Tip in Muzzle */}
            <polygon points="170,38 186,44 170,50" fill="#dc2626" stroke="#facc15" strokeWidth="1.5" />
          </g>
        )}
      </svg>
    </div>
  );
};
