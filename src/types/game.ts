/**
 * Game Types & Interfaces for Zombie Survival: Last Stand
 */

export type WeaponId = 
  | 'pistol' 
  | 'shotgun' 
  | 'smg' 
  | 'assault_rifle' 
  | 'sniper' 
  | 'crossbow' 
  | 'flamethrower' 
  | 'grenade_launcher' 
  | 'rocket_launcher';

export type EnemyType = 
  | 'walker' 
  | 'runner' 
  | 'brute' 
  | 'toxic' 
  | 'shadow' 
  | 'soldier' 
  | 'hulk_boss';

export type WeatherType = 'clear' | 'rain' | 'fog' | 'storm';
export type TimeOfDay = 'day' | 'night';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type MissionType = 
  | 'survive_time' 
  | 'kill_count' 
  | 'collect_supplies' 
  | 'rescue_survivors' 
  | 'protect_area' 
  | 'reach_extraction' 
  | 'defeat_boss';

export interface WeaponUpgradeLevels {
  damage: number;
  fireRate: number;
  magazine: number;
  reloadSpeed: number;
  critChance: number;
}

export interface WeaponConfig {
  id: WeaponId;
  name: string;
  category: string;
  description: string;
  rarity: ItemRarity;
  baseDamage: number;
  baseFireRate: number;
  baseMagazine: number;
  baseReloadTime: number;
  baseRange: number;
  baseCritChance: number;
  pellets?: number;
  spread?: number;
  bulletSpeed: number;
  bulletColor: string;
  bulletRadius: number;
  cost: number;
  unlockedByDefault: boolean;
  unlockedAtLevel: number;
  icon: string;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  stamina: number;
  maxStamina: number;
  moveSpeed: number;
  critChance: number;
  dashCooldown: number;
}

export interface PlayerUpgrades {
  healthLevel: number;
  armorLevel: number;
  speedLevel: number;
  staminaLevel: number;
  critLevel: number;
}

export interface DnaPerks {
  vampirism: number;
  bulletScavenger: number;
  ironSkin: number;
  adrenaline: number;
  toxicResistance: number;
}

export interface Inventory {
  medkits: number;
  grenades: number;
  scrapMaterials: number;
  rareParts: number;
}

export interface LocationConfig {
  id: number;
  name: string;
  zoneType: string;
  description: string;
  difficulty: number;
  missionType: MissionType;
  targetCount: number;
  weather: WeatherType;
  timeOfDay: TimeOfDay;
  rewardCoins: number;
  rewardXp: number;
  rewardDna: number;
  unlockRequirementLevel: number;
  requiredPrevLocationId?: number;
  isBossStage?: boolean;
  survivalTime?: number;
  enemyCount?: number;
  enemySpawnRate?: number;
  enemySpeedMultiplier?: number;
  enemyHealthMultiplier?: number;
  enemyDamageMultiplier?: number;
  allowedEnemyTypes?: EnemyType[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardCoins: number;
  rewardDna: number;
  claimed: boolean;
}

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  screenShake: boolean;
  bloodDetail: 'normal' | 'high' | 'extreme';
  showDamageNumbers: boolean;
  virtualControls: 'auto' | 'always' | 'never';
}

export interface GameSaveData {
  version: number;
  playerLevel: number;
  playerXp: number;
  coins: number;
  zombieDna: number;
  unlockedLocations: number[];
  completedLocations: number[];
  unlockedWeapons: WeaponId[];
  equippedWeaponId: WeaponId;
  secondaryWeaponId: WeaponId;
  weaponUpgrades: Record<WeaponId, WeaponUpgradeLevels>;
  playerUpgrades: PlayerUpgrades;
  dnaPerks: DnaPerks;
  inventory: Inventory;
  achievements: Record<string, { progress: number; unlocked: boolean; claimed: boolean }>;
  totalKills: number;
  totalBossKills: number;
  selectedCharacter?: 'survivor' | 'recon' | 'medic' | 'soldier' | 'hunter' | 'commander';
  settings: GameSettings;
}

export interface LootDrop {
  id: string;
  x: number;
  y: number;
  type: 'coin' | 'ammo' | 'medkit' | 'scrap' | 'rare_part' | 'dna';
  rarity: ItemRarity;
  amount: number;
  lifeTime: number;
  bounceOffset: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  type?: 'blood' | 'spark' | 'smoke' | 'fire' | 'shell' | 'weather' | 'ground_blood';
  rotation?: number;
  vRot?: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  alpha: number;
  vy: number;
}
