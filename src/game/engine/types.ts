import { EnemyType, ItemRarity, LocationConfig, LootDrop, Particle, TimeOfDay, WeaponConfig, WeaponId, WeatherType } from '../../types/game';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'wall' | 'barricade' | 'car' | 'crate' | 'tree' | 'sandbag' | 'generator' | 'building' | 'wreckage';
  health?: number;
  maxHealth?: number;
  color: string;
  variant?: string;
  rotation?: number;
  carModel?: 'sedan' | 'police' | 'taxi' | 'pickup' | 'van';
}

export interface StreetLight {
  x: number;
  y: number;
  poleX: number;
  poleY: number;
  color: string;
  radius: number;
  flickerSpeed?: number;
}

export interface UrbanProp {
  x: number;
  y: number;
  type: 'dumpster' | 'fire_hydrant' | 'barrier' | 'debris' | 'hazard_barrel' | 'body_bag';
  width: number;
  height: number;
  rotation?: number;
}

export interface SupplyCrate {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  type: 'food' | 'ammo' | 'medical' | 'dna_sample';
}

export interface SurvivorNPC {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  rescued: boolean;
  followingPlayer: boolean;
}

export interface DefenseZone {
  x: number;
  y: number;
  radius: number;
  health: number;
  maxHealth: number;
}

export interface ExtractionPoint {
  x: number;
  y: number;
  radius: number;
  activated: boolean;
  timeRemaining: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  damage: number;
  isCrit: boolean;
  rangeRemaining: number;
  penetration: number;
  hitEntities: Set<string>;
  isRocket?: boolean;
  isFlame?: boolean;
  isGrenade?: boolean;
  fuseTimer?: number;
}

export interface AcidPuddle {
  id: string;
  x: number;
  y: number;
  radius: number;
  duration: number;
}

export interface FireArea {
  id: string;
  x: number;
  y: number;
  radius: number;
  duration: number;
  damageTimer: number;
}

export interface ZombieEntity {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  health: number;
  maxHealth: number;
  speed: number;
  baseSpeed: number;
  damage: number;
  radius: number;
  attackCooldownTimer: number;
  attackCooldown: number;
  color: string;
  eyeColor: string;
  isBoss?: boolean;
  
  // Boss state machine
  bossState?: 'idle' | 'chase' | 'prepare_charge' | 'charging' | 'slamming' | 'roaring' | 'dying';
  bossStateTimer?: number;
  bossTargetPos?: Vector2D;
  bossChargeAngle?: number;
  bossPhase?: number;
  roarCooldown?: number;
  slamCooldown?: number;
  chargeCooldown?: number;

  // Status effects
  isBurning?: number;
  isFrozen?: number;
  isStunned?: number;
  cloakedAlpha?: number;
  animFrame?: number;

  // Animation and combat states
  walkAnimTimer?: number;
  attackAnimTimer?: number;
  damageAnimTimer?: number;
  deathAnimTimer?: number;
  isDying?: boolean;
  isDead?: boolean;
  spitCooldownTimer?: number;
  isSpitting?: boolean;
  cloakTimer?: number;
}

export interface Decal {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  points?: { x: number; y: number }[];
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  color: string;
  alpha: number;
}
