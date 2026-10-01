import {
  LocationConfig,
  EnemyType,
  WeatherType,
  TimeOfDay,
} from '../types/game';
interface LevelTemplate {
  name: string;
  zoneType: string;
  description: string;
}
const SECTOR_THEMES: LevelTemplate[] = [
  {
    name: 'Abandoned Street',
    zoneType: 'Urban Sector 4',
    description:
      'Civilian evacuation route overrun by initial walker hordes. Survive the siege.',
  },
  {
    name: 'Grocery Supercenter',
    zoneType: 'Commercial Center',
    description:
      'Overrun food supplies depot. Fast runners are scouring the perimeter.',
  },
  {
    name: 'Police Precinct',
    zoneType: 'Civic Sector 12',
    description:
      'Armored precinct checkpoint under heavy mutant siege.',
  },
  {
    name: 'Quarantine Hospital',
    zoneType: 'St. Jude Emergency',
    description:
      'Contaminated clinical wing teeming with toxic bio-chemical spewers.',
  },
  {
    name: 'Subway Terminal',
    zoneType: 'Metro Line Red',
    description:
      'Pitch-black subterranean tunnels where shadow stalkers hunt.',
  },
  {
    name: 'Military Outpost',
    zoneType: 'Camp Ironclad',
    description:
      'Fortified military base overrun by reanimated armored soldiers.',
  },
  {
    name: 'Research Laboratory',
    zoneType: 'Aegis Bio-Tech',
    description:
      'Underground bio-hazard facility with lethal mutant swarms.',
  },
  {
    name: 'Ground Zero Hive',
    zoneType: 'Central Mutation Nest',
    description:
      'The colossal epicenter of the contagion. Massive mutant onslaught.',
  },
];
/**
 * Generate all 50 playable levels.
 *
 * Difficulty increases progressively:
 *
 * 1       = Tutorial / Easy
 * 2 - 5   = Easy
 * 6 - 10  = Normal
 * 11 - 20 = Hard
 * 21 - 30 = Very Hard
 * 31 - 40 = Extreme
 * 41 - 49 = Nightmare
 * 50      = Final Boss
 */
function generate50Levels(): LocationConfig[] {
  const levels: LocationConfig[] = [];
  const weatherList: WeatherType[] = [
    'clear',
    'fog',
    'rain',
    'storm',
  ];
  for (let id = 1; id <= 50; id++) {
    const theme =
      SECTOR_THEMES[(id - 1) % SECTOR_THEMES.length];
    /*
     * Boss every 10 levels.
     *
     * Level 10
     * Level 20
     * Level 30
     * Level 40
     * Level 50
     */
    const isBossStage = id % 10 === 0;
    let survivalTime: number;
    let enemyCount: number;
    let enemySpawnRate: number;
    let enemySpeedMult: number;
    let enemyHealthMult: number;
    let enemyDamageMult: number;
    let allowedTypes: EnemyType[];
    let difficulty: number;
    // ============================================================
    // LEVEL 1
    // ============================================================
    if (id === 1) {
      survivalTime = 45;
      enemyCount = 14;
      enemySpawnRate = 2.4;
      enemySpeedMult = 1.0;
      enemyHealthMult = 1.0;
      enemyDamageMult = 1.0;
      allowedTypes = ['walker'];
      difficulty = 1;
    }
    // ============================================================
    // LEVELS 2 - 5
    // EASY
    // ============================================================
    else if (id <= 5) {
      const progress = (id - 2) / 3;
      survivalTime = Math.round(
        48 + progress * 12
      );
      enemyCount = Math.round(
        16 + progress * 6
      );
      enemySpawnRate = Number(
        (2.2 - progress * 0.4).toFixed(2)
      );
      enemySpeedMult = Number(
        (1.02 + progress * 0.05).toFixed(2)
      );
      enemyHealthMult = Number(
        (1.02 + progress * 0.08).toFixed(2)
      );
      enemyDamageMult = Number(
        (1.02 + progress * 0.08).toFixed(2)
      );
      allowedTypes = [
        'walker',
        'runner',
      ];
      difficulty = 2;
    }
    // ============================================================
    // LEVELS 6 - 10
    // NORMAL
    // ============================================================
    else if (id <= 10) {
      const progress = (id - 6) / 4;
      survivalTime = Math.round(
        60 + progress * 15
      );
      enemyCount = Math.round(
        24 + progress * 8
      );
      enemySpawnRate = Number(
        (1.75 - progress * 0.35).toFixed(2)
      );
      enemySpeedMult = Number(
        (1.06 + progress * 0.08).toFixed(2)
      );
      enemyHealthMult = Number(
        (1.12 + progress * 0.15).toFixed(2)
      );
      enemyDamageMult = Number(
        (1.10 + progress * 0.12).toFixed(2)
      );
      allowedTypes = [
        'walker',
        'runner',
        'brute',
      ];
      difficulty = 3;
    }
    // ============================================================
    // LEVELS 11 - 20
    // HARD
    // ============================================================
    else if (id <= 20) {
      const progress = (id - 11) / 9;
      survivalTime = Math.round(
        70 + progress * 15
      );
      enemyCount = Math.round(
        30 + progress * 10
      );
      enemySpawnRate = Number(
        (1.35 - progress * 0.30).toFixed(2)
      );
      enemySpeedMult = Number(
        (1.12 + progress * 0.10).toFixed(2)
      );
      enemyHealthMult = Number(
        (1.28 + progress * 0.20).toFixed(2)
      );
      enemyDamageMult = Number(
        (1.22 + progress * 0.16).toFixed(2)
      );
      allowedTypes = [
        'walker',
        'runner',
        'brute',
        'toxic',
      ];
      difficulty = 4;
    }
    // ============================================================
    // LEVELS 21 - 30
    // VERY HARD
    // ============================================================
    else if (id <= 30) {
      const progress = (id - 21) / 9;
      survivalTime = Math.round(
        80 + progress * 15
      );
      enemyCount = Math.round(
        38 + progress * 10
      );
      enemySpawnRate = Number(
        (1.05 - progress * 0.20).toFixed(2)
      );
      enemySpeedMult = Number(
        (1.20 + progress * 0.08).toFixed(2)
      );
      enemyHealthMult = Number(
        (1.48 + progress * 0.22).toFixed(2)
      );
      enemyDamageMult = Number(
        (1.38 + progress * 0.18).toFixed(2)
      );
      allowedTypes = [
        'walker',
        'runner',
        'brute',
        'toxic',
        'shadow',
      ];
      difficulty = 5;
    }
    // ============================================================
    // LEVELS 31 - 40
    // EXTREME
    // ============================================================
    else if (id <= 40) {
      const progress = (id - 31) / 9;
      survivalTime = Math.round(
        90 + progress * 15
      );
      enemyCount = Math.round(
        44 + progress * 10
      );
      enemySpawnRate = Number(
        (0.85 - progress * 0.15).toFixed(2)
      );
      enemySpeedMult = Number(
        (1.26 + progress * 0.08).toFixed(2)
      );
      enemyHealthMult = Number(
        (1.70 + progress * 0.20).toFixed(2)
      );
      enemyDamageMult = Number(
        (1.56 + progress * 0.16).toFixed(2)
      );
      allowedTypes = [
        'walker',
        'runner',
        'brute',
        'toxic',
        'shadow',
        'soldier',
      ];
      difficulty = 6;
    }
    // ============================================================
    // LEVELS 41 - 49
    // NIGHTMARE
    // ============================================================
    else if (id < 50) {
      const progress = (id - 41) / 8;
      survivalTime = Math.round(
        100 + progress * 15
      );
      enemyCount = Math.round(
        50 + progress * 8
      );
      enemySpawnRate = Number(
        (0.70 - progress * 0.10).toFixed(2)
      );
      enemySpeedMult = Number(
        (1.30 + progress * 0.05).toFixed(2)
      );
      enemyHealthMult = Number(
        (1.90 + progress * 0.18).toFixed(2)
      );
      enemyDamageMult = Number(
        (1.72 + progress * 0.14).toFixed(2)
      );
      allowedTypes = [
        'walker',
        'runner',
        'brute',
        'toxic',
        'shadow',
        'soldier',
      ];
      difficulty = 7;
    }
    // ============================================================
    // LEVEL 50
    // FINAL BOSS
    // ============================================================
    else {
      survivalTime = 120;
      enemyCount = 60;
      enemySpawnRate = 0.50;
      enemySpeedMult = 1.35;
      enemyHealthMult = 2.20;
      enemyDamageMult = 2.00;
      allowedTypes = [
        'walker',
        'runner',
        'brute',
        'toxic',
        'shadow',
        'soldier',
      ];
      difficulty = 8;
    }
    // ============================================================
    // WEATHER
    // ============================================================
    const weather =
      weatherList[(id - 1) % weatherList.length];
    // Alternate day/night.
    const timeOfDay: TimeOfDay =
      id % 2 === 0
        ? 'night'
        : 'day';
    // ============================================================
    // REWARDS
    // ============================================================
    const rewardCoins = Math.round(
      250 + (id - 1) * 95
    );
    const rewardXp = Math.round(
      350 + (id - 1) * 115
    );
    const rewardDna = Math.round(
      5 + (id - 1) * 2.5
    );
    // ============================================================
    // LEVEL NAME
    // ============================================================
    const levelName =
      id <= 8
        ? `Level ${id}: ${theme.name}`
        : `Level ${id}: Sector ${id}`;
    // ============================================================
    // LEVEL OBJECT
    // ============================================================
    levels.push({
      id,
      name: levelName,
      zoneType: theme.zoneType,
      description: theme.description,
      difficulty,
      missionType: 'survive_time',
      targetCount: survivalTime,
      survivalTime,
      weather,
      timeOfDay,
      rewardCoins,
      rewardXp,
      rewardDna,
      /*
       * Sequential unlocking:
       *
       * Level 1 = unlocked
       * Level 2 = after completing Level 1
       * Level 3 = after completing Level 2
       * ...
       * Level 50 = after completing Level 49
       */
      unlockRequirementLevel: 1,
      requiredPrevLocationId:
        id > 1
          ? id - 1
          : undefined,
      isBossStage,
      enemyCount,
      enemySpawnRate,
      enemySpeedMultiplier:
        enemySpeedMult,
      enemyHealthMultiplier:
        enemyHealthMult,
      enemyDamageMultiplier:
        enemyDamageMult,
      allowedEnemyTypes:
        allowedTypes,
    });
  }
  return levels;
}
/**
 * Complete 50-level catalog.
 */
export const LEVELS_CATALOG: LocationConfig[] =
  generate50Levels();
