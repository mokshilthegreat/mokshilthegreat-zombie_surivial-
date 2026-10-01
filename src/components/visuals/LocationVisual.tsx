import React from 'react';

interface LocationVisualProps {
  locationId: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LocationVisual: React.FC<LocationVisualProps> = ({
  locationId,
  className = '',
  size = 'md',
}) => {
  const dims = {
    sm: { width: 64, height: 48 },
    md: { width: 120, height: 80 },
    lg: { width: 320, height: 180 },
  }[size];

  // Specific thematic SVG art for each sector theme
  const renderLocationArt = () => {
    const themeId = ((Math.max(1, locationId) - 1) % 8) + 1;
    switch (themeId) {
      case 1:
        // 1. Abandoned Street - Urban roadblock, broken car, hazard tape, shattered lamppost
        return (
          <g>
            {/* Asphalt & street line */}
            <rect x="0" y="55" width="200" height="45" fill="#1e293b" />
            <line x1="0" y1="75" x2="200" y2="75" stroke="#eab308" strokeWidth="2" strokeDasharray="10 8" />
            {/* Ruined City skyline */}
            <path d="M10 55 L10 20 L30 20 L30 35 L55 35 L55 15 L75 15 L75 55 Z" fill="#0f172a" />
            <path d="M85 55 L85 25 L115 25 L115 55 Z" fill="#182234" />
            <path d="M125 55 L125 10 L155 10 L155 30 L180 30 L180 55 Z" fill="#0f172a" />
            {/* Broken Abandoned Car */}
            <path d="M70 70 L80 60 L115 60 L125 70 L130 74 L65 74 Z" fill="#475569" stroke="#334155" strokeWidth="1.5" />
            <rect x="83" y="62" width="12" height="6" fill="#1e293b" />
            <rect x="100" y="62" width="12" height="6" fill="#1e293b" />
            <circle cx="78" cy="74" r="4" fill="#090d16" />
            <circle cx="118" cy="74" r="4" fill="#090d16" />
            {/* Hazard roadblock tape */}
            <line x1="30" y1="68" x2="65" y2="68" stroke="#ef4444" strokeWidth="3" strokeDasharray="6 4" />
            {/* Street lamp with flickering light cone */}
            <line x1="35" y1="55" x2="35" y2="28" stroke="#94a3b8" strokeWidth="2" />
            <line x1="35" y1="28" x2="45" y2="28" stroke="#94a3b8" strokeWidth="2" />
            <polygon points="45,28 35,55 55,55" fill="rgba(250, 204, 21, 0.15)" />
          </g>
        );

      case 2:
        // 2. Grocery Store - Supermarket facade, shopping cart, broken glass, neon sign
        return (
          <g>
            {/* Storefront building */}
            <rect x="15" y="18" width="170" height="62" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            {/* Store awning */}
            <path d="M10 32 L190 32 L185 40 L15 40 Z" fill="#b91c1c" />
            <path d="M25 32 L35 32 L32 40 L22 40 Z" fill="#ffffff" />
            <path d="M55 32 L65 32 L62 40 L52 40 Z" fill="#ffffff" />
            <path d="M85 32 L95 32 L92 40 L82 40 Z" fill="#ffffff" />
            <path d="M115 32 L125 32 L122 40 L112 40 Z" fill="#ffffff" />
            <path d="M145 32 L155 32 L152 40 L142 40 Z" fill="#ffffff" />
            <path d="M175 32 L185 32 L182 40 L172 40 Z" fill="#ffffff" />
            {/* Neon SIGN */}
            <rect x="60" y="21" width="80" height="9" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
            <text x="100" y="28" fill="#fbbf24" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">SUPERMARKET</text>
            {/* Glass windows with cracks */}
            <rect x="25" y="44" width="55" height="30" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1" />
            <line x1="30" y1="48" x2="50" y2="68" stroke="#e0f2fe" strokeWidth="0.8" opacity="0.6" />
            {/* Entrance door */}
            <rect x="90" y="44" width="35" height="36" fill="#090d16" stroke="#475569" strokeWidth="1" />
            <rect x="135" y="44" width="45" height="30" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1" />
            {/* Overturned shopping cart & crates */}
            <rect x="145" y="65" width="14" height="12" fill="#d97706" stroke="#b45309" strokeWidth="1" />
            <text x="152" y="73" fill="#ffffff" fontSize="5" fontFamily="monospace" textAnchor="middle">FOOD</text>
          </g>
        );

      case 3:
        // 3. Police Station - Fortified civic station, barricades, red/blue patrol light
        return (
          <g>
            {/* Concrete Station building */}
            <rect x="20" y="16" width="160" height="64" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            {/* Center tower/portico */}
            <rect x="65" y="10" width="70" height="24" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
            <text x="100" y="24" fill="#60a5fa" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">POLICE PRECINCT</text>
            {/* Flashing patrol strobe lights */}
            <circle cx="75" cy="8" r="3.5" fill="#ef4444" className="animate-pulse" />
            <circle cx="125" cy="8" r="3.5" fill="#3b82f6" className="animate-pulse" />
            {/* Barricaded windows */}
            <rect x="30" y="40" width="25" height="18" fill="#090d16" stroke="#64748b" strokeWidth="1" />
            <line x1="28" y1="44" x2="57" y2="44" stroke="#78350f" strokeWidth="2" />
            <line x1="28" y1="52" x2="57" y2="52" stroke="#78350f" strokeWidth="2" />
            <rect x="145" y="40" width="25" height="18" fill="#090d16" stroke="#64748b" strokeWidth="1" />
            <line x1="143" y1="44" x2="172" y2="44" stroke="#78350f" strokeWidth="2" />
            <line x1="143" y1="52" x2="172" y2="52" stroke="#78350f" strokeWidth="2" />
            {/* Armored Sandbags & razor wire */}
            <rect x="75" y="65" width="50" height="15" fill="#ca8a04" stroke="#854d0e" strokeWidth="1" />
            <line x1="20" y1="72" x2="70" y2="72" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="130" y1="72" x2="180" y2="72" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
          </g>
        );

      case 4:
        // 4. Hospital - St. Jude quarantine, red medical cross, broken ambulance, toxic gas haze
        return (
          <g>
            {/* Hospital main block */}
            <rect x="20" y="14" width="160" height="66" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            {/* Center roof trauma cross */}
            <rect x="88" y="6" width="24" height="24" fill="#0f172a" stroke="#ef4444" strokeWidth="1" />
            <path d="M96 11 H104 V15 H108 V21 H104 V25 H96 V21 H92 V15 H96 Z" fill="#ef4444" />
            {/* Biohazard / Quarantine text */}
            <rect x="35" y="24" width="45" height="8" fill="#7f1d1d" />
            <text x="57" y="30" fill="#fecaca" fontSize="5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">QUARANTINE</text>
            {/* Broken Ambulance vehicle */}
            <rect x="30" y="58" width="50" height="20" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />
            <rect x="65" y="60" width="12" height="9" fill="#0284c7" opacity="0.4" />
            <path d="M48 64 H54 V66 H57 V70 H54 V72 H48 V70 H45 V66 H48 Z" fill="#dc2626" />
            <circle cx="40" cy="78" r="4" fill="#090d16" />
            <circle cx="70" cy="78" r="4" fill="#090d16" />
            {/* Toxic green bile haze particles */}
            <circle cx="130" cy="55" r="14" fill="#22c55e" opacity="0.2" filter="blur(2px)" />
            <circle cx="155" cy="45" r="18" fill="#22c55e" opacity="0.25" filter="blur(3px)" />
          </g>
        );

      case 5:
        // 5. Subway Station - Underground tunnel arch, glowing tracks, metro sign, emergency lights
        return (
          <g>
            {/* Underground tunnel curved vault */}
            <path d="M10 80 Q100 15 190 80 Z" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            <path d="M25 80 Q100 30 175 80 Z" fill="#090d16" />
            {/* Distant subway tunnel portal */}
            <ellipse cx="100" cy="62" rx="35" ry="18" fill="#020617" stroke="#ef4444" strokeWidth="1" />
            {/* Twin railway tracks */}
            <line x1="45" y1="80" x2="85" y2="63" stroke="#94a3b8" strokeWidth="2" />
            <line x1="155" y1="80" x2="115" y2="63" stroke="#94a3b8" strokeWidth="2" />
            {/* Rail ties */}
            <line x1="60" y1="76" x2="140" y2="76" stroke="#475569" strokeWidth="2" />
            <line x1="72" y1="71" x2="128" y2="71" stroke="#475569" strokeWidth="1.8" />
            <line x1="82" y1="67" x2="118" y2="67" stroke="#475569" strokeWidth="1.5" />
            {/* Station platform & neon sign */}
            <rect x="25" y="38" width="50" height="10" fill="#1e293b" stroke="#e11d48" strokeWidth="1" />
            <text x="50" y="45" fill="#f43f5e" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">METRO RED LINE</text>
            {/* Emergency amber tunnel light */}
            <circle cx="100" cy="40" r="3" fill="#f59e0b" />
            <polygon points="100,40 70,65 130,65" fill="rgba(245, 158, 11, 0.15)" />
          </g>
        );

      case 6:
        // 6. Military Base - Watchtower, barbed wire fences, radar dish, sandbagged bunker
        return (
          <g>
            {/* Background barbed wire fence */}
            <line x1="10" y1="45" x2="190" y2="45" stroke="#64748b" strokeWidth="1" />
            <line x1="10" y1="55" x2="190" y2="55" stroke="#64748b" strokeWidth="1" />
            <line x1="20" y1="42" x2="20" y2="80" stroke="#475569" strokeWidth="2" />
            <line x1="60" y1="42" x2="60" y2="80" stroke="#475569" strokeWidth="2" />
            <line x1="140" y1="42" x2="140" y2="80" stroke="#475569" strokeWidth="2" />
            <line x1="180" y1="42" x2="180" y2="80" stroke="#475569" strokeWidth="2" />
            {/* Fortified Bunker */}
            <polygon points="65,48 135,48 145,80 55,80" fill="#365314" stroke="#1a2e05" strokeWidth="1.5" />
            {/* Vision slit */}
            <rect x="80" y="56" width="40" height="4" fill="#090d16" />
            {/* Watchtower on Left */}
            <line x1="30" y1="80" x2="38" y2="28" stroke="#475569" strokeWidth="2" />
            <line x1="50" y1="80" x2="42" y2="28" stroke="#475569" strokeWidth="2" />
            <rect x="34" y="22" width="12" height="8" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
            {/* Rotating Radar Dish on Right */}
            <line x1="160" y1="80" x2="160" y2="30" stroke="#475569" strokeWidth="2.5" />
            <path d="M150 24 Q160 14 170 24 Z" fill="#64748b" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="160" y1="20" x2="168" y2="12" stroke="#ef4444" strokeWidth="1.5" />
            {/* Searchlight cone */}
            <polygon points="40,26 80,80 120,80" fill="rgba(255, 255, 255, 0.12)" />
          </g>
        );

      case 7:
        // 7. Laboratory - Aegis bio-tech, DNA cryo-chambers, containment hazard, cleanroom grid
        return (
          <g>
            {/* Lab sterile tiles backdrop */}
            <rect x="15" y="15" width="170" height="65" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="15" y1="40" x2="185" y2="40" stroke="#1e293b" strokeWidth="1" />
            <line x1="15" y1="60" x2="185" y2="60" stroke="#1e293b" strokeWidth="1" />
            {/* Cryo Tube 1 */}
            <rect x="35" y="24" width="24" height="46" rx="6" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="47" cy="47" r="6" fill="#c084fc" opacity="0.6" />
            {/* Center DNA Helix Chamber */}
            <rect x="80" y="20" width="40" height="52" rx="8" fill="#581c87" fillOpacity="0.35" stroke="#a855f7" strokeWidth="2" />
            <path d="M92 28 Q100 36 108 44 Q100 52 92 60" stroke="#e879f9" strokeWidth="2" fill="none" />
            <path d="M108 28 Q100 36 92 44 Q100 52 108 60" stroke="#38bdf8" strokeWidth="2" fill="none" />
            {/* Cryo Tube 2 (Shattered containment) */}
            <rect x="140" y="24" width="24" height="46" rx="6" fill="#991b1b" fillOpacity="0.25" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="145" y1="35" x2="160" y2="52" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
            <text x="152" y="76" fill="#ef4444" fontSize="5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">BREACH</text>
          </g>
        );

      case 8:
      default:
        // 8. Zombie Nest - Ground Zero Hive, colossal biomass pustules, skull, dark red mist
        return (
          <g>
            {/* Dark organic hive cave */}
            <rect x="10" y="12" width="180" height="68" fill="#1c0a0a" stroke="#7f1d1d" strokeWidth="1.5" />
            {/* Organic mutated tentacles/veins */}
            <path d="M15 80 Q50 30 100 45 T185 80" stroke="#991b1b" strokeWidth="5" fill="none" opacity="0.7" />
            <path d="M25 15 Q60 55 110 35 T175 15" stroke="#581c1c" strokeWidth="4" fill="none" opacity="0.6" />
            {/* Giant Spore Pustules (Glowing) */}
            <circle cx="50" cy="55" r="16" fill="#ef4444" fillOpacity="0.6" className="animate-pulse" />
            <circle cx="50" cy="55" r="9" fill="#f97316" />
            <circle cx="150" cy="52" r="14" fill="#dc2626" fillOpacity="0.6" className="animate-pulse" />
            <circle cx="150" cy="52" r="8" fill="#facc15" />
            {/* Center Boss Skull Silhouette */}
            <circle cx="100" cy="46" r="18" fill="#450a0a" stroke="#ef4444" strokeWidth="2" />
            {/* Skull Eyes */}
            <ellipse cx="94" cy="44" rx="4" ry="5" fill="#facc15" />
            <ellipse cx="106" cy="44" rx="4" ry="5" fill="#facc15" />
            {/* Teeth */}
            <rect x="94" y="55" width="3" height="5" fill="#fecaca" />
            <rect x="99" y="55" width="3" height="5" fill="#fecaca" />
            <rect x="104" y="55" width="3" height="5" fill="#fecaca" />
            {/* Blood mist glow */}
            <circle cx="100" cy="50" r="38" fill="#ef4444" opacity="0.15" filter="blur(4px)" />
          </g>
        );
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-lg bg-slate-950 border border-slate-800 shadow-md ${className}`}
      style={{ width: dims.width, height: dims.height }}
    >
      <svg
        viewBox="0 0 200 90"
        className="w-full h-full object-cover"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`sky-grad-${locationId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#05070d" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Sky / Atmospheric Background */}
        <rect width="200" height="90" fill={`url(#sky-grad-${locationId})`} />

        {/* Thematic Illustration Elements */}
        {renderLocationArt()}

        {/* Tactical scanning lines overlay */}
        <line x1="0" y1="0" x2="200" y2="0" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <line x1="0" y1="89" x2="200" y2="89" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      </svg>
    </div>
  );
};
