import React from 'react';

export type CharacterClassId = 'survivor' | 'recon' | 'medic' | 'soldier' | 'hunter' | 'commander';

export interface CharacterProfile {
  id: CharacterClassId;
  name: string;
  className: string;
  requiredRank: number;
  health: number;
  armor: number;
  speed: number;
  stamina: number;
  critChance: number;
  specialAbility: string;
  description: string;
  accentColor: string;
  badge: string;
}

export const CHARACTERS_CATALOG: Record<CharacterClassId, CharacterProfile> = {
  survivor: {
    id: 'survivor',
    name: 'Jack "Exile" Vance',
    className: 'Survivor',
    requiredRank: 1,
    health: 120,
    armor: 40,
    speed: 100,
    stamina: 120,
    critChance: 12,
    specialAbility: 'Scavenger Instinct: +20% loot drop rates and +15% stamina recovery.',
    description: 'A rugged former city engineer who adapted to the infected outbreak. Highly balanced physical stamina and quick reaction time.',
    accentColor: '#f59e0b',
    badge: 'BALANCED',
  },
  recon: {
    id: 'recon',
    name: 'Kira "Wraith" Shaw',
    className: 'Recon',
    requiredRank: 2,
    health: 95,
    armor: 25,
    speed: 135,
    stamina: 140,
    critChance: 22,
    specialAbility: 'Ghost Sprint: Dash distance increased by 35% with reduced stamina drain.',
    description: 'Lightweight urban scout equipped with sensory telemetry goggles and low-drag athletic tactical gear for agile hit-and-run tactics.',
    accentColor: '#38bdf8',
    badge: 'AGILITY',
  },
  medic: {
    id: 'medic',
    name: 'Dr. Elena Rostova',
    className: 'Medic',
    requiredRank: 3,
    health: 130,
    armor: 45,
    speed: 105,
    stamina: 110,
    critChance: 10,
    specialAbility: 'Field Triage: Medkits heal 50% more health and grant 4s toxicity immunity.',
    description: 'Former CDC trauma surgeon equipped with emergency bio-nanite injectors, specialized hazard gear, and chemical resistance suits.',
    accentColor: '#10b981',
    badge: 'SUPPORT',
  },
  soldier: {
    id: 'soldier',
    name: 'Sgt. Marcus Kane',
    className: 'Soldier',
    requiredRank: 4,
    health: 150,
    armor: 85,
    speed: 92,
    stamina: 105,
    critChance: 16,
    specialAbility: 'Ballistic Juggernaut: Takes 25% less damage from melee attacks and runner swarms.',
    description: 'Hardened special forces veteran outfitted in heavy modular Kevlar-ceramic trauma plates and tactical combat armor.',
    accentColor: '#ef4444',
    badge: 'DEFENSE',
  },
  hunter: {
    id: 'hunter',
    name: 'Colt "Hawkeye" Woods',
    className: 'Hunter',
    requiredRank: 5,
    health: 110,
    armor: 35,
    speed: 115,
    stamina: 125,
    critChance: 30,
    specialAbility: 'Deadly Precision: +15% headshot critical damage multiplier on all weapons.',
    description: 'Wilderness survival tracker wearing hooded ghillie wraps and tactical concealment mesh. Master of silent ambush and distance kills.',
    accentColor: '#a855f7',
    badge: 'SNIPER',
  },
  commander: {
    id: 'commander',
    name: 'Cmdr. Sarah Briggs',
    className: 'Commander',
    requiredRank: 6,
    health: 140,
    armor: 70,
    speed: 110,
    stamina: 130,
    critChance: 20,
    specialAbility: 'Tactical Command: Airlift arrival times reduced by 15s; +20% magazine capacity.',
    description: 'High-ranking defense commander with orbital uplink communications, high-grade officer plate, and superior battlefield leadership.',
    accentColor: '#eab308',
    badge: 'COMMAND',
  },
};

interface CharacterVisualProps {
  characterId: CharacterClassId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CharacterVisual: React.FC<CharacterVisualProps> = ({
  characterId,
  size = 'md',
  className = '',
}) => {
  const profile = CHARACTERS_CATALOG[characterId] || CHARACTERS_CATALOG.survivor;

  const dims = {
    sm: { width: 56, height: 68 },
    md: { width: 90, height: 110 },
    lg: { width: 240, height: 300 },
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl select-none ${className}`}
      style={{ width: dims.width, height: dims.height }}
    >
      {/* Background blueprint tactical grid & radial glow */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${profile.accentColor} 0%, transparent 75%)`,
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      />

      <svg
        viewBox="0 0 100 130"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id={`grad-${characterId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={profile.accentColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id={`glow-${characterId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Shadow under character */}
        <ellipse cx="50" cy="120" rx="36" ry="6" fill="#000000" fillOpacity="0.6" filter="blur(2px)" />

        {/* Character Base Body & Legs */}
        {/* Legs */}
        <path d="M38 88 L34 118 L44 119 L46 88 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
        <path d="M54 88 L56 118 L66 119 L62 88 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
        {/* Boots */}
        <path d="M32 114 L30 121 L45 121 L44 114 Z" fill="#090d16" stroke="#334155" strokeWidth="1" />
        <path d="M55 114 L56 121 L70 121 L68 114 Z" fill="#090d16" stroke="#334155" strokeWidth="1" />
        {/* Knee pads */}
        <rect x="33" y="98" width="11" height="8" rx="2" fill="#334155" stroke="#475569" strokeWidth="0.8" />
        <rect x="56" y="98" width="11" height="8" rx="2" fill="#334155" stroke="#475569" strokeWidth="0.8" />

        {/* Torso / Armor Body Suit */}
        <path d="M32 50 L68 50 L64 90 L36 90 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />

        {/* CLASS SPECIFIC EQUIPMENT RENDERING */}
        {characterId === 'survivor' && (
          <>
            {/* Tactical Leather/Canvas Vest */}
            <path d="M33 50 L67 50 L63 86 L37 86 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
            <rect x="39" y="55" width="22" height="28" fill="#92400e" opacity="0.6" />
            {/* Utility Pouches */}
            <rect x="36" y="74" width="7" height="9" rx="1.5" fill="#451a03" stroke="#b45309" strokeWidth="0.8" />
            <rect x="46" y="74" width="8" height="9" rx="1.5" fill="#451a03" stroke="#b45309" strokeWidth="0.8" />
            <rect x="57" y="74" width="7" height="9" rx="1.5" fill="#451a03" stroke="#b45309" strokeWidth="0.8" />
            {/* Flashlight on shoulder */}
            <rect x="65" y="47" width="5" height="11" rx="1" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
            <circle cx="67.5" cy="48" r="2" fill="#fef08a" />
          </>
        )}

        {characterId === 'recon' && (
          <>
            {/* Sleek Urban Camo Vest */}
            <path d="M34 50 L66 50 L62 86 L38 86 Z" fill="#0f172a" stroke="#0284c7" strokeWidth="1.2" />
            {/* Sensor telemetry line */}
            <path d="M42 54 L58 54 L50 78 Z" fill="#0369a1" opacity="0.4" />
            <circle cx="50" cy="62" r="3" fill="#38bdf8" />
            {/* Holster on chest */}
            <rect x="52" y="66" width="9" height="12" rx="1" fill="#0284c7" opacity="0.7" />
            {/* Scout antenna on back */}
            <line x1="31" y1="52" x2="25" y2="28" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="25" cy="27" r="1.5" fill="#38bdf8" />
          </>
        )}

        {characterId === 'medic' && (
          <>
            {/* Biohazard White/Gray Tactical Armor */}
            <path d="M33 50 L67 50 L63 86 L37 86 Z" fill="#334155" stroke="#059669" strokeWidth="1.2" />
            {/* Cross Emblem */}
            <rect x="42" y="58" width="16" height="16" rx="2" fill="#065f46" stroke="#10b981" strokeWidth="1" />
            <path d="M50 61 L50 71 M45 66 L55 66" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            {/* Trauma Canisters */}
            <circle cx="36" cy="76" r="3.5" fill="#10b981" />
            <circle cx="64" cy="76" r="3.5" fill="#10b981" />
          </>
        )}

        {characterId === 'soldier' && (
          <>
            {/* Heavy Ballistic Interceptor Armor */}
            <path d="M30 48 L70 48 L65 88 L35 88 Z" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
            {/* Ceramic trauma plate */}
            <rect x="38" y="54" width="24" height="24" rx="2" fill="#0f172a" stroke="#7f1d1d" strokeWidth="1" />
            {/* Ammo belts across chest */}
            <path d="M34 50 L66 84 M35 56 L64 88" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* Heavy Pauldrons (Shoulder Armor) */}
            <rect x="23" y="48" width="10" height="14" rx="2" fill="#0f172a" stroke="#ef4444" strokeWidth="1" />
            <rect x="67" y="48" width="10" height="14" rx="2" fill="#0f172a" stroke="#ef4444" strokeWidth="1" />
          </>
        )}

        {characterId === 'hunter' && (
          <>
            {/* Ghillie/Camo wrap and leather bracers */}
            <path d="M32 48 L68 48 L63 88 L37 88 Z" fill="#2e1065" stroke="#7e22ce" strokeWidth="1.2" />
            {/* Camo ragged fringes */}
            <path d="M28 50 Q38 60 32 75 Q42 85 36 92" stroke="#6b21a8" strokeWidth="2" fill="none" />
            <path d="M72 50 Q62 60 68 75 Q58 85 64 92" stroke="#6b21a8" strokeWidth="2" fill="none" />
            {/* Quiver on back with bolts */}
            <rect x="66" y="32" width="7" height="24" rx="1" fill="#4c1d95" stroke="#c084fc" strokeWidth="0.8" />
            <line x1="68" y1="32" x2="67" y2="22" stroke="#a855f7" strokeWidth="1.2" />
            <line x1="71" y1="32" x2="72" y2="20" stroke="#a855f7" strokeWidth="1.2" />
          </>
        )}

        {characterId === 'commander' && (
          <>
            {/* Military Greatcoat / Officer Armor */}
            <path d="M31 48 L69 48 L64 90 L36 90 Z" fill="#1c1917" stroke="#eab308" strokeWidth="1.2" />
            {/* Gold Lapels & Star Chevron */}
            <path d="M38 48 L50 68 L62 48" stroke="#ca8a04" strokeWidth="1.5" fill="none" />
            <polygon points="50,60 52,65 57,65 53,68 55,73 50,70 45,73 47,68 43,65 48,65" fill="#facc15" />
            {/* GPS battle-pad on wrist */}
            <rect x="23" y="74" width="7" height="10" rx="1.5" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.8" />
            <rect x="24.5" y="76" width="4" height="6" fill="#0284c7" />
          </>
        )}

        {/* Tactical Arms & Firearm in Hands (Low Ready / Combat Hold) */}
        {/* Left Arm (forward support grip) */}
        <path d="M25 50 L34 50 L44 72 L36 75 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
        {/* Right Arm (trigger hand) */}
        <path d="M66 50 L75 50 L64 74 L56 70 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />

        {/* TACTICAL FIREARM HELD BY SURVIVOR */}
        <g id={`weapon-${characterId}`}>
          {/* Gun Stock resting near right shoulder */}
          <rect x="58" y="65" width="10" height="6" rx="1.5" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
          {/* Main Gun Body / Receiver */}
          <rect x="36" y="66" width="26" height="7" rx="1" fill="#111827" stroke="#475569" strokeWidth="0.8" />
          {/* Curved High-Capacity Magazine */}
          <path d="M46 73 L48 83 L43 84 L42 73 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
          {/* Extended Gun Barrel & Muzzle Brake */}
          <rect x="22" y="67.5" width="15" height="4" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
          <rect x="19" y="66.5" width="4" height="6" rx="0.8" fill="#090d16" />
          {/* Holographic / Red Dot Sight on top rail */}
          <rect x="42" y="62.5" width="8" height="4" rx="1" fill="#0f172a" stroke="#64748b" strokeWidth="0.6" />
          <circle cx="46" cy="64.5" r="1.2" fill="#ef4444" />
          {/* Under-barrel Tactical Flashlight / Laser Module */}
          <rect x="26" y="71" width="7" height="3" fill="#334155" />
          <circle cx="26" cy="72.5" r="1" fill="#38bdf8" />
          {/* Tactical Flashlight Beam (Subtle Glow) */}
          <polygon points="19,68 0,60 0,76 19,71" fill="rgba(56, 189, 248, 0.25)" />
        </g>

        {/* Tactical Gloves gripping the weapon */}
        {/* Support Hand (Left Glove around barrel) */}
        <rect x="34" y="68" width="8" height="7" rx="1.5" fill="#090d16" stroke="#475569" strokeWidth="0.8" />
        {/* Trigger Hand (Right Glove around pistol grip) */}
        <rect x="54" y="67" width="8" height="7" rx="1.5" fill="#090d16" stroke="#475569" strokeWidth="0.8" />

        {/* Head and Neck */}
        <rect x="44" y="42" width="12" height="10" fill="#a16207" opacity="0.6" />

        {/* Head / Face */}
        <circle cx="50" cy="33" r="14" fill="#a16207" stroke="#451a03" strokeWidth="1" />

        {/* CLASS HEADWEAR / VISOR */}
        {characterId === 'survivor' && (
          <>
            {/* Rugged hair / Bandana */}
            <path d="M36 28 Q50 18 64 28 L64 24 Q50 16 36 24 Z" fill="#1e293b" />
            <path d="M36 29 L64 29" stroke="#b45309" strokeWidth="2.5" />
            {/* Tactical earpiece */}
            <rect x="35" y="32" width="2" height="4" fill="#64748b" />
          </>
        )}

        {characterId === 'recon' && (
          <>
            {/* Recon Tactical Goggles glowing cyan */}
            <rect x="40" y="28" width="20" height="7" rx="3" fill="#090d16" stroke="#0284c7" strokeWidth="1.2" />
            <circle cx="45" cy="31.5" r="2.5" fill="#38bdf8" />
            <circle cx="55" cy="31.5" r="2.5" fill="#38bdf8" />
            {/* Hood */}
            <path d="M34 32 Q50 12 66 32 L64 22 Q50 10 36 22 Z" fill="#0f172a" />
          </>
        )}

        {characterId === 'medic' && (
          <>
            {/* Respirator Half-Mask */}
            <path d="M42 34 L58 34 L54 44 L46 44 Z" fill="#047857" stroke="#10b981" strokeWidth="1" />
            <circle cx="50" cy="39" r="2" fill="#ffffff" />
            {/* Field Cap */}
            <path d="M35 25 Q50 14 65 25 L68 28 L32 28 Z" fill="#334155" stroke="#059669" strokeWidth="1" />
          </>
        )}

        {characterId === 'soldier' && (
          <>
            {/* Heavy Combat Helmet */}
            <path d="M34 28 Q50 12 66 28 L67 36 L33 36 Z" fill="#0f172a" stroke="#ef4444" strokeWidth="1.2" />
            {/* Dark Visor */}
            <path d="M39 31 L61 31 L58 37 L42 37 Z" fill="#7f1d1d" stroke="#ef4444" strokeWidth="0.8" />
            {/* Chin Strap */}
            <path d="M37 36 L43 45 L57 45 L63 36" stroke="#475569" strokeWidth="1.2" fill="none" />
          </>
        )}

        {characterId === 'hunter' && (
          <>
            {/* Camo Ghillie Hood */}
            <path d="M33 36 Q38 12 50 12 Q62 12 67 36 L64 38 Q50 16 36 38 Z" fill="#3b0764" stroke="#a855f7" strokeWidth="1.2" />
            {/* Eye Patch / Aim Reticle over right eye */}
            <circle cx="54" cy="32" r="3" fill="#a855f7" opacity="0.8" />
            <line x1="51" y1="32" x2="57" y2="32" stroke="#ffffff" strokeWidth="0.8" />
            <line x1="54" y1="29" x2="54" y2="35" stroke="#ffffff" strokeWidth="0.8" />
          </>
        )}

        {characterId === 'commander' && (
          <>
            {/* Military Beret with Gold Emblem */}
            <path d="M34 26 Q46 16 66 22 L68 28 L36 28 Z" fill="#78350f" stroke="#ca8a04" strokeWidth="1.2" />
            <circle cx="43" cy="22" r="2.5" fill="#facc15" />
            {/* Comms Headset with Boom Mic */}
            <rect x="34" y="30" width="3" height="7" rx="1" fill="#334155" />
            <path d="M35 37 L42 42 L48 41" stroke="#94a3b8" strokeWidth="1" fill="none" />
            <circle cx="48" cy="41" r="1" fill="#ef4444" />
          </>
        )}
      </svg>
    </div>
  );
};
