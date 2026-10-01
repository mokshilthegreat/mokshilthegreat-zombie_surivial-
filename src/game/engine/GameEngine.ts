import { 
  GameSaveData, 
  ItemRarity, 
  LocationConfig, 
  LootDrop, 
  Particle, 
  FloatingText, 
  WeaponConfig, 
  WeaponId, 
  EnemyType, 
  WeatherType, 
  TimeOfDay 
} from '../../types/game';
import { WEAPONS_CATALOG, ENEMY_CONFIGS } from '../constants';
import { soundManager } from '../../audio/soundManager';
import { generateMapForLocation, GeneratedMap } from './mapGenerator';
import { renderPlayerCharacter } from './renderer/playerRenderer';
import { renderZombie } from './renderer/zombieRenderer';
import { renderDetailedCityEnvironment } from './renderer/environmentRenderer';
import { 
  AcidPuddle, 
  Bullet, 
  Decal, 
  FireArea, 
  Obstacle, 
  Shockwave, 
  SupplyCrate, 
  SurvivorNPC, 
  Vector2D, 
  ZombieEntity 
} from './types';

export interface GameHUDState {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  stamina: number;
  maxStamina: number;
  currentWeapon: WeaponConfig;
  equippedSlot: 1 | 2;
  currentMag: number;
  maxMag: number;
  isReloading: boolean;
  reloadProgress: number; // 0 to 1
  coins: number;
  zombieDna: number;
  medkits: number;
  grenades: number;
  playerLevel: number;
  playerXp: number;
  kills: number;
  objectiveText: string;
  objectiveProgress: string;
  isObjectiveDone: boolean;
  bossHealthPercent?: number;
  bossName?: string;
  weather: WeatherType;
  timeOfDay: TimeOfDay;
  minimap?: {
    playerX: number;
    playerY: number;
    playerAngle: number;
    mapWidth: number;
    mapHeight: number;
    camX: number;
    camY: number;
    camW: number;
    camH: number;
    zombies: { x: number; y: number; isBoss?: boolean }[];
    crates: { x: number; y: number; collected: boolean }[];
    survivors: { x: number; y: number; rescued: boolean }[];
    extraction?: { x: number; y: number };
    defenseZone?: { x: number; y: number };
  };
}

export interface MissionResult {
  won: boolean;
  location: LocationConfig;
  kills: number;
  coinsEarned: number;
  dnaEarned: number;
  xpEarned: number;
  rarePartsEarned: number;
  timeElapsed: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private backgroundCanvas: HTMLCanvasElement;
  private bgCtx: CanvasRenderingContext2D;
  private lightCanvas: HTMLCanvasElement;
  private lightCtx: CanvasRenderingContext2D;

  private isRunning: boolean = false;
  private lastTime: number = 0;
  private animationFrameId: number = 0;

  // Configuration & Save
  public location: LocationConfig;
  public saveData: GameSaveData;
  public map: GeneratedMap;

  // Player state
  public player = {
    x: 1100,
    y: 1100,
    vx: 0,
    vy: 0,
    angle: 0,
    radius: 18,
    health: 100,
    maxHealth: 100,
    armor: 25,
    maxArmor: 50,
    stamina: 100,
    maxStamina: 100,
    speed: 210,
    critChance: 0.1,
    isDashing: false,
    dashDuration: 0.22,
    dashTimer: 0,
    dashCooldown: 0.8,
    dashCooldownTimer: 0,
    dashVx: 0,
    dashVy: 0,
    equippedSlot: 1 as 1 | 2,
    magAmmo: 12,
    isReloading: false,
    reloadTimer: 0,
    reloadTotal: 1.2,
    fireTimer: 0,
    invincibleTimer: 0,
    hurtFlashTimer: 0,
    walkAnimTimer: 0,
    moveAngle: 0,
    isMoving: false,
    recoilOffset: 0,
    muzzleFlashTimer: 0,
    isDead: false,
    deathAnimTimer: 0,
  };

  // Scrolling Camera System (Top-left position in World Coordinates)
  // Formula: screenX = worldX - cameraX, screenY = worldY - cameraY
  public camera = {
    x: 0, // cameraX in world coordinates
    y: 0, // cameraY in world coordinates
    targetX: 0,
    targetY: 0,
    shake: 0,
    shakeX: 0,
    shakeY: 0,
    lerpSpeed: 8.5, // smooth follow speed
  };

  /**
   * Converts world coordinates (worldX, worldY) to screen viewport coordinates (screenX, screenY)
   * Formula: screenX = worldX - cameraX
   *          screenY = worldY - cameraY
   */
  public worldToScreen(worldX: number, worldY: number): { screenX: number; screenY: number } {
    const camX = Number.isFinite(this.camera.x) ? this.camera.x : 0;
    const camY = Number.isFinite(this.camera.y) ? this.camera.y : 0;
    const sX = Number.isFinite(this.camera.shakeX) ? this.camera.shakeX : 0;
    const sY = Number.isFinite(this.camera.shakeY) ? this.camera.shakeY : 0;
    const cameraX = Math.round(camX + sX);
    const cameraY = Math.round(camY + sY);
    const safeWorldX = Number.isFinite(worldX) ? worldX : 0;
    const safeWorldY = Number.isFinite(worldY) ? worldY : 0;
    return {
      screenX: safeWorldX - cameraX,
      screenY: safeWorldY - cameraY,
    };
  }

  /**
   * Converts screen viewport coordinates (screenX, screenY) to world coordinates (worldX, worldY)
   * Formula: worldX = screenX + cameraX
   *          worldY = screenY + cameraY
   */
  public screenToWorld(screenX: number, screenY: number): { worldX: number; worldY: number } {
    const camX = Number.isFinite(this.camera.x) ? this.camera.x : 0;
    const camY = Number.isFinite(this.camera.y) ? this.camera.y : 0;
    const sX = Number.isFinite(this.camera.shakeX) ? this.camera.shakeX : 0;
    const sY = Number.isFinite(this.camera.shakeY) ? this.camera.shakeY : 0;
    const cameraX = Math.round(camX + sX);
    const cameraY = Math.round(camY + sY);
    const safeScreenX = Number.isFinite(screenX) ? screenX : 0;
    const safeScreenY = Number.isFinite(screenY) ? screenY : 0;
    return {
      worldX: safeScreenX + cameraX,
      worldY: safeScreenY + cameraY,
    };
  }

  // Controls input
  public keys: Record<string, boolean> = {};
  public mouse = { x: 0, y: 0, isDown: false, worldX: 0, worldY: 0 };
  public virtualMovement: Vector2D = { x: 0, y: 0 };
  public virtualAiming: Vector2D | null = null;
  public isVirtualShooting: boolean = false;

  // Entities
  public zombies: ZombieEntity[] = [];
  public bullets: Bullet[] = [];
  public particles: Particle[] = [];
  public weatherParticles: Particle[] = [];
  public lootDrops: LootDrop[] = [];
  public floatingTexts: FloatingText[] = [];
  public acidPuddles: AcidPuddle[] = [];
  public fireAreas: FireArea[] = [];
  public shockwaves: Shockwave[] = [];

  // Objective state
  public missionTimeElapsed: number = 0;
  public killsCount: number = 0;
  public suppliesCollected: number = 0;
  public survivorsRescued: number = 0;
  public areaDefendTimer: number = 0;
  public isObjectiveDone: boolean = false;
  public extractionTimer: number = 0;
  public isGameOver: boolean = false;
  public isWon: boolean = false;
  public isAdPaused: boolean = false;
  public inputDisabled: boolean = false;

  // Spawner
  private spawnTimer: number = 0;
  private spawnInterval: number = 2.2;
  private maxZombies: number = 35;
  private lightningTimer: number = 0;
  private lightningAlpha: number = 0;
  private hudBroadcastTimer: number = 0;

  // Callbacks
  public onHUDUpdate?: (hud: GameHUDState) => void;
  public onMissionComplete?: (result: MissionResult) => void;
  public onGameOver?: (result: MissionResult) => void;

  constructor(
    canvas: HTMLCanvasElement, 
    location: LocationConfig, 
    saveData: GameSaveData,
    onHUDUpdate?: (hud: GameHUDState) => void,
    onGameOver?: (result: MissionResult) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.location = location;
    this.saveData = saveData;
    this.onHUDUpdate = onHUDUpdate;
    this.onGameOver = onGameOver;

    // Background permanent decals canvas
    this.backgroundCanvas = document.createElement('canvas');
    this.bgCtx = this.backgroundCanvas.getContext('2d')!;

    // Dynamic light canvas
    this.lightCanvas = document.createElement('canvas');
    this.lightCtx = this.lightCanvas.getContext('2d')!;

    this.map = generateMapForLocation(location);

    this.resize();
    this.initPlayer();
    this.initMapCanvases();
    this.initWeather();
    this.bindInputs();
  }

  private initPlayer() {
    this.player.x = this.map.playerSpawn.x;
    this.player.y = this.map.playerSpawn.y;

    // Center camera on player initially within world boundaries
    const vw = this.canvas.width || 1280;
    const vh = this.canvas.height || 720;
    const maxCamX = Math.max(0, this.map.width - vw);
    const maxCamY = Math.max(0, this.map.height - vh);
    this.camera.x = Math.max(0, Math.min(maxCamX, this.player.x - vw / 2));
    this.camera.y = Math.max(0, Math.min(maxCamY, this.player.y - vh / 2));
    this.camera.targetX = this.camera.x;
    this.camera.targetY = this.camera.y;

    // Initialize initial mouse coordinates at center-right of screen
    this.mouse.x = vw / 2 + 100;
    this.mouse.y = vh / 2;
    const initialWorld = this.screenToWorld(this.mouse.x, this.mouse.y);
    this.mouse.worldX = initialWorld.worldX;
    this.mouse.worldY = initialWorld.worldY;
    this.player.angle = Math.atan2(this.mouse.worldY - this.player.y, this.mouse.worldX - this.player.x);

    // Compute stats with upgrades
    const pUp = this.saveData.playerUpgrades;
    this.player.maxHealth = 100 + pUp.healthLevel * 20;
    this.player.health = this.player.maxHealth;

    this.player.maxArmor = 25 + pUp.armorLevel * 15;
    this.player.armor = this.player.maxArmor;

    this.player.speed = 215 * (1 + pUp.speedLevel * 0.08);
    this.player.maxStamina = 100 + pUp.staminaLevel * 20;
    this.player.stamina = this.player.maxStamina;
    this.player.critChance = 0.08 + pUp.critLevel * 0.04;

    const curWep = this.getCurrentWeapon();
    this.player.magAmmo = this.getUpgradedWeaponStats(curWep.id).magazine;

    // Set max concurrent zombies from location configuration
    if (this.location.enemyCount && this.location.enemyCount > 0) {
      this.maxZombies = Math.min(60, this.location.enemyCount);
    }

    // Boss spawn if boss mission
    if (this.location.isBossStage) {
      this.spawnBoss();
    }
  }

  private initMapCanvases() {
    this.backgroundCanvas.width = this.map.width;
    this.backgroundCanvas.height = this.map.height;

    // Render floor base
    this.renderFloorBase();
  }

  private renderFloorBase() {
    renderDetailedCityEnvironment(this.bgCtx, this.map);
  }

  private initWeather() {
    this.weatherParticles = [];
    if (this.location.weather === 'rain' || this.location.weather === 'storm') {
      const count = this.location.weather === 'storm' ? 250 : 140;
      for (let i = 0; i < count; i++) {
        this.weatherParticles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: -150 - Math.random() * 50,
          vy: 600 + Math.random() * 200,
          color: 'rgba(186, 230, 253, 0.5)',
          size: 1.5,
          alpha: 0.6,
          decay: 0,
          type: 'weather',
        });
      }
    } else if (this.location.weather === 'fog') {
      for (let i = 0; i < 40; i++) {
        this.weatherParticles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: -20 - Math.random() * 15,
          vy: 5 - Math.random() * 10,
          color: 'rgba(203, 213, 225, 0.12)',
          size: 60 + Math.random() * 80,
          alpha: 0.15,
          decay: 0,
          type: 'weather',
        });
      }
    }
  }

  // --- WEAPON HELPER METHODS ---
  public getCurrentWeapon(): WeaponConfig {
    const id = this.player.equippedSlot === 1 
      ? this.saveData.equippedWeaponId 
      : this.saveData.secondaryWeaponId;
    return WEAPONS_CATALOG[id] || WEAPONS_CATALOG.pistol;
  }

  public getUpgradedWeaponStats(weaponId: WeaponId) {
    const base = WEAPONS_CATALOG[weaponId];
    const up = this.saveData.weaponUpgrades[weaponId] || {
      damage: 0, fireRate: 0, magazine: 0, reloadSpeed: 0, critChance: 0
    };

    return {
      damage: Math.round(base.baseDamage * (1 + up.damage * 0.18)),
      fireRate: +(base.baseFireRate * (1 + up.fireRate * 0.15)).toFixed(1),
      magazine: Math.round(base.baseMagazine * (1 + up.magazine * 0.25)),
      reloadTime: +(base.baseReloadTime * Math.max(0.4, 1 - up.reloadSpeed * 0.12)).toFixed(2),
      critChance: +(base.baseCritChance + up.critChance * 0.05).toFixed(2),
      range: base.baseRange,
      bulletSpeed: base.bulletSpeed,
      pellets: base.pellets || 1,
      spread: base.spread || 0,
    };
  }

  public updateSaveData(newSave: GameSaveData) {
    this.saveData = newSave;
    const pUp = this.saveData.playerUpgrades;
    this.player.maxHealth = 100 + pUp.healthLevel * 20;
    this.player.maxArmor = 25 + pUp.armorLevel * 15;
    this.player.speed = 215 * (1 + pUp.speedLevel * 0.08);
    this.player.maxStamina = 100 + pUp.staminaLevel * 20;
    this.player.critChance = 0.08 + pUp.critLevel * 0.04;
  }

  public switchWeapon(slot: 1 | 2) {
    if (this.player.isReloading) return;
    this.player.equippedSlot = slot;
    const curWep = this.getCurrentWeapon();
    const stats = this.getUpgradedWeaponStats(curWep.id);
    this.player.magAmmo = Math.min(this.player.magAmmo, stats.magazine);
    soundManager.playClick();
  }

  public reload() {
    const curWep = this.getCurrentWeapon();
    const stats = this.getUpgradedWeaponStats(curWep.id);
    if (this.player.magAmmo >= stats.magazine || this.player.isReloading) return;

    this.player.isReloading = true;
    this.player.reloadTotal = stats.reloadTime;
    this.player.reloadTimer = stats.reloadTime;
    soundManager.playReload();
  }

  public useMedkit() {
    if (this.saveData.inventory.medkits <= 0) return;
    if (this.player.health >= this.player.maxHealth) return;

    this.saveData.inventory.medkits--;
    const heal = 60;
    this.player.health = Math.min(this.player.maxHealth, this.player.health + heal);
    soundManager.playPickup('medkit');
    this.addFloatingText(`+${heal} HP`, this.player.x, this.player.y - 30, '#4ade80', 22);

    // Green healing burst particles
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16;
      this.particles.push({
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(angle) * 70,
        vy: Math.sin(angle) * 70,
        color: '#4ade80',
        size: 3.5,
        alpha: 1,
        decay: 2.2,
      });
    }
  }

  public throwGrenade() {
    if (this.saveData.inventory.grenades <= 0) return;
    this.saveData.inventory.grenades--;

    const angle = this.player.angle;
    const speed = 480;
    this.bullets.push({
      id: 'grenade_' + Math.random(),
      x: this.player.x + Math.cos(angle) * 25,
      y: this.player.y + Math.sin(angle) * 25,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 6,
      color: '#eab308',
      damage: 180,
      isCrit: false,
      rangeRemaining: 420,
      penetration: 1,
      hitEntities: new Set(),
      isGrenade: true,
      fuseTimer: 0.9,
    });
    soundManager.playShoot('grenade_launcher');
  }

  // --- INPUT BINDINGS & SIZING ---
  public resize = () => {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.floor(rect.width > 50 ? rect.width : (window.innerWidth || 1280));
    const h = Math.floor(rect.height > 50 ? rect.height : (window.innerHeight || 720));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    if (this.lightCanvas.width !== w || this.lightCanvas.height !== h) {
      this.lightCanvas.width = w;
      this.lightCanvas.height = h;
    }
  };

  private handleResize = () => {
    this.resize();
  };

  private handleBlur = () => {
    // Clear stuck inputs on window blur to prevent perpetual running or firing
    this.keys = {};
    if (this.mouse) this.mouse.isDown = false;
    this.virtualMovement = { x: 0, y: 0 };
    this.isVirtualShooting = false;
  };

  private bindInputs() {
    window.addEventListener('blur', this.handleBlur);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this.handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.handleResize);
    }
    window.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd);
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.throwGrenade();
    });
  }

  private handleTouchStart = (e: TouchEvent) => {
    if (this.inputDisabled || this.isAdPaused) return;
    soundManager.ensureInitialized();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = rect.width ? this.canvas.width / rect.width : 1;
      const scaleY = rect.height ? this.canvas.height / rect.height : 1;
      this.mouse.x = (touch.clientX - rect.left) * scaleX;
      this.mouse.y = (touch.clientY - rect.top) * scaleY;
    }
  };

  private handleTouchMove = (e: TouchEvent) => {
    if (this.inputDisabled || this.isAdPaused) return;
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = rect.width ? this.canvas.width / rect.width : 1;
      const scaleY = rect.height ? this.canvas.height / rect.height : 1;
      this.mouse.x = (touch.clientX - rect.left) * scaleX;
      this.mouse.y = (touch.clientY - rect.top) * scaleY;
    }
  };

  private handleTouchEnd = () => {
    // End touch on canvas
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.inputDisabled || this.isAdPaused) return;
    this.keys[e.code] = true;
    soundManager.ensureInitialized();

    if (e.code === 'KeyR') {
      this.reload();
    } else if (e.code === 'Space') {
      this.triggerDash();
    } else if (e.code === 'KeyQ') {
      this.useMedkit();
    } else if (e.code === 'KeyG') {
      this.throwGrenade();
    } else if (e.code === 'Digit1') {
      this.switchWeapon(1);
    } else if (e.code === 'Digit2') {
      this.switchWeapon(2);
    } else if (e.code === 'KeyE') {
      this.interactNearby();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (this.inputDisabled || this.isAdPaused) return;
    this.keys[e.code] = false;
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (this.inputDisabled || this.isAdPaused) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = rect.width ? this.canvas.width / rect.width : 1;
    const scaleY = rect.height ? this.canvas.height / rect.height : 1;
    this.mouse.x = (e.clientX - rect.left) * scaleX;
    this.mouse.y = (e.clientY - rect.top) * scaleY;
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (this.inputDisabled || this.isAdPaused) return;
    soundManager.ensureInitialized();
    if (e.button === 0) {
      this.mouse.isDown = true;
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (e.button === 0) {
      this.mouse.isDown = false;
    }
  };

  public triggerDash() {
    if (this.player.isDashing || this.player.dashCooldownTimer > 0) return;
    if (this.player.stamina < 30) return;

    this.player.stamina -= 30;
    this.player.isDashing = true;
    this.player.dashTimer = this.player.dashDuration;
    this.player.dashCooldownTimer = this.player.dashCooldown;
    this.player.invincibleTimer = this.player.dashDuration + 0.05;

    // Dash vector
    let dx = 0;
    let dy = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

    if (this.virtualMovement.x !== 0 || this.virtualMovement.y !== 0) {
      dx = this.virtualMovement.x;
      dy = this.virtualMovement.y;
    }

    if (dx === 0 && dy === 0) {
      dx = Math.cos(this.player.angle);
      dy = Math.sin(this.player.angle);
    } else {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
    }

    const dashSpeed = this.player.speed * 2.8;
    this.player.dashVx = dx * dashSpeed;
    this.player.dashVy = dy * dashSpeed;

    soundManager.playDash();
  }

  public interactNearby() {
    // Collect supply crates
    for (const crate of this.map.crates) {
      if (!crate.collected && Math.hypot(crate.x - this.player.x, crate.y - this.player.y) < 70) {
        crate.collected = true;
        this.suppliesCollected++;
        soundManager.playPickup('ammo');
        this.addFloatingText('SUPPLY COLLECTED!', crate.x, crate.y - 20, '#38bdf8', 20);

        // Spawn bonus loot
        this.spawnLoot(crate.x, crate.y, 'coin', 50, 'rare');
        this.spawnLoot(crate.x + 15, crate.y, 'ammo', 30, 'common');
        this.spawnLoot(crate.x - 15, crate.y, 'medkit', 1, 'rare');
        break;
      }
    }

    // Rescue survivors
    for (const survivor of this.map.survivors) {
      if (!survivor.rescued && Math.hypot(survivor.x - this.player.x, survivor.y - this.player.y) < 80) {
        survivor.followingPlayer = true;
        soundManager.playPickup('dna');
        this.addFloatingText('SURVIVOR RESCUED!', survivor.x, survivor.y - 20, '#4ade80', 20);
      }
    }
  }

  // --- SPAWNING LOGIC ---
  private spawnBoss() {
    const bossConfig = ENEMY_CONFIGS.hulk_boss;
    const hulk: ZombieEntity = {
      id: 'hulk_boss',
      type: 'hulk_boss',
      x: 1100,
      y: 500,
      vx: 0,
      vy: 0,
      angle: 0,
      health: bossConfig.maxHealth,
      maxHealth: bossConfig.maxHealth,
      speed: bossConfig.speed,
      baseSpeed: bossConfig.speed,
      damage: bossConfig.damage,
      radius: bossConfig.radius,
      attackCooldownTimer: 0,
      attackCooldown: bossConfig.attackCooldown,
      color: bossConfig.color,
      eyeColor: bossConfig.eyeColor,
      isBoss: true,
      bossState: 'chase',
      bossStateTimer: 3,
      bossPhase: 1,
      roarCooldown: 8,
      slamCooldown: 5,
      chargeCooldown: 7,
    };
    this.zombies.push(hulk);
    soundManager.playBossRoar();
    this.addCameraShake(15);
  }

  private spawnWaveZombie() {
    if (this.zombies.length >= this.maxZombies) return;

    // Pick spawn position outside camera view
    const angle = Math.random() * Math.PI * 2;
    const dist = 750 + Math.random() * 200;
    let spawnX = this.player.x + Math.cos(angle) * dist;
    let spawnY = this.player.y + Math.sin(angle) * dist;

    // Clamp inside map walls
    spawnX = Math.max(90, Math.min(this.map.width - 90, spawnX));
    spawnY = Math.max(90, Math.min(this.map.height - 90, spawnY));

    // Determine zombie type based on location difficulty & allowed types
    let pool: EnemyType[] = ['walker'];
    if (this.location.allowedEnemyTypes && this.location.allowedEnemyTypes.length > 0) {
      pool = this.location.allowedEnemyTypes;
    } else {
      const diff = this.location.difficulty;
      if (diff >= 2) pool.push('runner');
      if (diff >= 3) pool.push('runner', 'brute');
      if (diff >= 4) pool.push('toxic', 'brute');
      if (diff >= 5) pool.push('shadow', 'runner');
      if (diff >= 6) pool.push('soldier', 'toxic', 'brute');
      if (diff >= 7) pool.push('shadow', 'soldier', 'brute');
    }

    const chosenType = pool[Math.floor(Math.random() * pool.length)] || 'walker';
    const config = ENEMY_CONFIGS[chosenType] || ENEMY_CONFIGS.walker;

    // Configurable level multipliers
    const lvlSpeedMult = this.location.enemySpeedMultiplier || 1.0;
    const lvlHpMult = this.location.enemyHealthMultiplier || 1.0;
    const lvlDmgMult = this.location.enemyDamageMultiplier || 1.0;

    // Night multiplier
    const speedMult = (this.location.timeOfDay === 'night' ? 1.15 : 1.0) * lvlSpeedMult;
    const hpMult = (this.location.timeOfDay === 'night' ? 1.2 : 1.0) * lvlHpMult;
    const finalDamage = Math.round(config.damage * lvlDmgMult);

    const zombie: ZombieEntity = {
      id: 'z_' + Math.random(),
      type: chosenType,
      x: spawnX,
      y: spawnY,
      vx: 0,
      vy: 0,
      angle: 0,
      health: config.maxHealth * hpMult,
      maxHealth: config.maxHealth * hpMult,
      speed: config.speed * speedMult,
      baseSpeed: config.speed * speedMult,
      damage: finalDamage,
      radius: config.radius,
      attackCooldownTimer: 0,
      attackCooldown: config.attackCooldown,
      color: config.color,
      eyeColor: config.eyeColor,
      cloakedAlpha: chosenType === 'shadow' ? 0.15 : 1.0,
      animFrame: Math.random() * 10,
    };

    this.zombies.push(zombie);
  }

  // --- MAIN LOOP ---
  public start() {
    if (this.isRunning) return;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }

  public pause() {
    this.stop();
  }

  public resume() {
    if (!this.isRunning && !this.isGameOver && !this.isWon && !this.isAdPaused) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = 0;
      }
      this.isRunning = true;
      this.lastTime = performance.now();
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  }

  /**
   * Temporarily pause gameplay & disable input while advertisement is showing
   */
  public pauseForAd() {
    this.isAdPaused = true;
    this.inputDisabled = true;
    this.keys = {};
    this.mouse.isDown = false;
    this.virtualMovement = { x: 0, y: 0 };
    this.virtualAiming = null;
    this.isVirtualShooting = false;
    this.stop();
  }

  /**
   * Restore game state, inputs, and resume loop after advertisement completes or closes
   */
  public resumeFromAd(revive: boolean) {
    this.isAdPaused = false;
    this.inputDisabled = false;
    this.keys = {};
    this.mouse.isDown = false;
    this.virtualMovement = { x: 0, y: 0 };
    this.virtualAiming = null;
    this.isVirtualShooting = false;

    if (revive) {
      this.revivePlayer();
    } else {
      this.lastTime = performance.now();
      if (!this.isRunning && !this.isGameOver && !this.isWon) {
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = 0;
        }
        this.isRunning = true;
        this.animationFrameId = requestAnimationFrame(this.loop);
      }
      this.broadcastHUD();
    }
  }

  public dash() {
    if (this.inputDisabled || this.isAdPaused) return;
    this.triggerDash();
  }

  public switchWeaponSlot(slot: 1 | 2) {
    if (this.inputDisabled || this.isAdPaused) return;
    this.switchWeapon(slot);
  }

  public setVirtualMove(x: number, y: number) {
    if (this.inputDisabled || this.isAdPaused) {
      this.virtualMovement = { x: 0, y: 0 };
      return;
    }
    this.virtualMovement.x = x;
    this.virtualMovement.y = y;
  }

  public setVirtualAim(x: number, y: number) {
    if (this.inputDisabled || this.isAdPaused) {
      this.virtualAiming = null;
      return;
    }
    if (x === 0 && y === 0) {
      this.virtualAiming = null;
    } else {
      this.virtualAiming = { x, y };
    }
  }

  public setVirtualShoot(shooting: boolean) {
    if (this.inputDisabled || this.isAdPaused) {
      this.isVirtualShooting = false;
      return;
    }
    this.isVirtualShooting = shooting;
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;

    try {
      let dt = (currentTime - this.lastTime) / 1000;
      if (!Number.isFinite(dt) || dt <= 0) {
        dt = 1 / 60;
      } else if (dt > 0.1) {
        dt = 0.1;
      }
      this.lastTime = currentTime;

      // Keep buffer strictly synced with display size
      const clientW = Math.floor(window.innerWidth || 1280);
      const clientH = Math.floor(window.innerHeight || 720);
      if (this.canvas.width !== clientW || this.canvas.height !== clientH) {
        this.resize();
      }

      this.update(dt);
      this.render();
    } catch (err) {
      console.error('[GameEngine] Recovered from loop update/render error:', err);
    } finally {
      if (this.isRunning) {
        this.animationFrameId = requestAnimationFrame(this.loop);
      }
    }
  };

  // --- UPDATE ---
  private update(dt: number) {
    if (this.isGameOver || this.isWon || this.isAdPaused) return;

    this.missionTimeElapsed += dt;

    // 1. Move player in the 2D world
    this.updatePlayerMovement(dt);

    // 2. Camera smoothly tracks player inside world boundaries
    this.updateCamera(dt);

    // 3. Aiming: convert screen mouse coordinates to world coordinates & compute angle
    this.updatePlayerAiming();

    // 4. Update player status timers & reload
    this.updatePlayerTimers(dt);

    // 5. Fire weapons from player position towards aim angle
    this.updateShooting(dt);

    // 6. Update bullets, zombies, environment, objective
    this.updateBullets(dt);
    this.updateZombies(dt);
    this.updateBoss(dt);
    this.updatePuddles(dt);
    this.updateShockwaves(dt);
    this.updateLoot(dt);
    this.updateParticles(dt);
    this.updateWeather(dt);
    this.updateFloatingTexts(dt);
    this.updateSpawns(dt);
    this.updateObjective(dt);
    this.updateSurvivors(dt);
    this.updateDefenseZone(dt);

    // Throttle HUD broadcasting to ~20 fps (every 0.05s) to avoid React re-render lag
    this.hudBroadcastTimer += dt;
    if (this.hudBroadcastTimer >= 0.05) {
      this.hudBroadcastTimer = 0;
      this.broadcastHUD();
    }
  }

  private updateCamera(dt: number) {
    const vw = this.canvas.width || 1280;
    const vh = this.canvas.height || 720;

    const px = Number.isFinite(this.player.x) ? this.player.x : 1100;
    const py = Number.isFinite(this.player.y) ? this.player.y : 1100;

    // Center camera on player in world coordinates:
    let targetX = px - vw / 2;
    let targetY = py - vh / 2;

    // CAMERA BOUNDARIES:
    const maxCamX = Math.max(0, this.map.width - vw);
    const maxCamY = Math.max(0, this.map.height - vh);

    targetX = Math.max(0, Math.min(maxCamX, targetX));
    targetY = Math.max(0, Math.min(maxCamY, targetY));

    if (!Number.isFinite(targetX)) targetX = 0;
    if (!Number.isFinite(targetY)) targetY = 0;

    this.camera.targetX = targetX;
    this.camera.targetY = targetY;

    if (!Number.isFinite(this.camera.x)) this.camera.x = targetX;
    if (!Number.isFinite(this.camera.y)) this.camera.y = targetY;

    // Smooth lerping interpolation
    const lerpFactor = 1 - Math.exp(-this.camera.lerpSpeed * Math.max(0.001, dt));
    this.camera.x += (targetX - this.camera.x) * lerpFactor;
    this.camera.y += (targetY - this.camera.y) * lerpFactor;

    // Snap if very close to target to prevent micro-jitter
    if (Math.abs(targetX - this.camera.x) < 0.05) this.camera.x = targetX;
    if (Math.abs(targetY - this.camera.y) < 0.05) this.camera.y = targetY;

    // Hard boundary clamping
    this.camera.x = Math.max(0, Math.min(maxCamX, this.camera.x));
    this.camera.y = Math.max(0, Math.min(maxCamY, this.camera.y));

    // Screen shake decay
    if (this.camera.shake > 0) {
      this.camera.shake = Math.max(0, this.camera.shake - dt * 25);
      const shakeAmt = Number.isFinite(this.camera.shake) ? this.camera.shake : 0;
      this.camera.shakeX = (Math.random() - 0.5) * shakeAmt * 2;
      this.camera.shakeY = (Math.random() - 0.5) * shakeAmt * 2;
    } else {
      this.camera.shakeX = 0;
      this.camera.shakeY = 0;
    }
  }

  private updatePlayerMovement(dt: number) {
    const p = this.player;

    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) {
      p.x = this.map.playerSpawn?.x || 1100;
      p.y = this.map.playerSpawn?.y || 1100;
      p.vx = 0;
      p.vy = 0;
    }

    // Dash motion
    if (p.isDashing) {
      p.dashTimer -= dt;
      p.x += (Number.isFinite(p.dashVx) ? p.dashVx : 0) * dt;
      p.y += (Number.isFinite(p.dashVy) ? p.dashVy : 0) * dt;
      p.isMoving = true;
      p.walkAnimTimer += dt * 3.0;

      // Dash ghost particle
      this.particles.push({
        x: p.x,
        y: p.y,
        vx: 0,
        vy: 0,
        color: 'rgba(56, 189, 248, 0.45)',
        size: p.radius,
        alpha: 0.6,
        decay: 3.5,
      });

      if (p.dashTimer <= 0) {
        p.isDashing = false;
      }
    } else {
      // Normal movement - independent from aiming direction
      // W -> up, S -> down, A -> left, D -> right + diagonal combinations
      let moveX = 0;
      let moveY = 0;
      if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

      if (this.virtualMovement.x !== 0 || this.virtualMovement.y !== 0) {
        moveX = this.virtualMovement.x;
        moveY = this.virtualMovement.y;
      }

      if (moveX !== 0 || moveY !== 0) {
        const len = Math.hypot(moveX, moveY);
        if (len > 0.001) {
          moveX /= len;
          moveY /= len;
        }

        p.isMoving = true;
        p.moveAngle = Math.atan2(moveY, moveX);
        p.walkAnimTimer += dt * 1.2;

        // Adrenaline DNA perk: speed boost when low HP
        let spd = p.speed;
        if (this.saveData.dnaPerks.adrenaline > 0 && p.health < p.maxHealth * 0.35) {
          spd *= 1.3;
        }

        p.vx = moveX * spd;
        p.vy = moveY * spd;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        soundManager.playFootstep();
      } else {
        p.isMoving = false;
        p.walkAnimTimer += dt * 0.4; // Idle breathing
        p.vx = 0;
        p.vy = 0;
      }
    }

    // Resolve wall collisions and clamp to the 3200x3200 world boundaries
    this.resolveObstacleCollisions(p, p.radius);
  }

  private updatePlayerAiming() {
    const p = this.player;

    // Aim angle - Full 360-degree aiming (with mobile auto-target assist)
    if (this.virtualAiming) {
      p.angle = Math.atan2(this.virtualAiming.y, this.virtualAiming.x);
    } else if (this.isVirtualShooting) {
      // Auto-target closest alive zombie within range
      let closestZombie: ZombieEntity | null = null;
      let closestDistSq = 600 * 600;
      for (const z of this.zombies) {
        if (z.isDead) continue;
        const dSq = (z.x - p.x) ** 2 + (z.y - p.y) ** 2;
        if (dSq < closestDistSq) {
          closestDistSq = dSq;
          closestZombie = z;
        }
      }
      if (closestZombie) {
        p.angle = Math.atan2(closestZombie.y - p.y, closestZombie.x - p.x);
      } else if (p.isMoving) {
        p.angle = p.moveAngle;
      }
    } else {
      // Map screen mouse position to world coordinates using the current camera position:
      const worldMouse = this.screenToWorld(this.mouse.x, this.mouse.y);
      this.mouse.worldX = worldMouse.worldX;
      this.mouse.worldY = worldMouse.worldY;

      // Only aim at mouse if mouse coordinates have been set, otherwise face movement direction
      if (this.mouse.x !== 0 || this.mouse.y !== 0) {
        p.angle = Math.atan2(this.mouse.worldY - p.y, this.mouse.worldX - p.x);
      } else if (p.isMoving) {
        p.angle = p.moveAngle;
      }
    }

    if (!Number.isFinite(p.angle)) {
      p.angle = Number.isFinite(p.moveAngle) ? p.moveAngle : 0;
    }
  }

  private updatePlayerTimers(dt: number) {
    const p = this.player;

    // Timers
    if (p.invincibleTimer > 0) p.invincibleTimer -= dt;
    if (p.hurtFlashTimer > 0) p.hurtFlashTimer -= dt;
    if (p.dashCooldownTimer > 0) p.dashCooldownTimer -= dt;
    if (p.recoilOffset > 0) p.recoilOffset = Math.max(0, p.recoilOffset - dt * 45);
    if (p.muzzleFlashTimer > 0) p.muzzleFlashTimer = Math.max(0, p.muzzleFlashTimer - dt);
    if (p.isDead) p.deathAnimTimer = Math.min(1, p.deathAnimTimer + dt * 1.5);

    // Stamina regen
    if (!p.isDashing && p.stamina < p.maxStamina) {
      p.stamina = Math.min(p.maxStamina, p.stamina + 25 * dt);
    }

    // Reloading
    if (p.isReloading) {
      p.reloadTimer -= dt;
      if (p.reloadTimer <= 0) {
        p.isReloading = false;
        const curWep = this.getCurrentWeapon();
        const stats = this.getUpgradedWeaponStats(curWep.id);
        p.magAmmo = stats.magazine;
      }
    }
  }

  private updateShooting(dt: number) {
    const p = this.player;
    if (p.fireTimer > 0) p.fireTimer -= dt;

    const isShooting = this.mouse.isDown || this.isVirtualShooting;
    if (!isShooting || p.isDashing) return;

    if (p.isReloading) return;

    if (p.magAmmo <= 0) {
      this.reload();
      return;
    }

    const curWep = this.getCurrentWeapon();
    const stats = this.getUpgradedWeaponStats(curWep.id);
    const fireInterval = 1 / stats.fireRate;

    if (p.fireTimer <= 0) {
      p.fireTimer = fireInterval;
      p.magAmmo--;
      p.recoilOffset = curWep.id === 'sniper' || curWep.id === 'shotgun' ? 7 : 3.5;
      p.muzzleFlashTimer = 0.08;

      // Muzzle flash
      soundManager.playShoot(curWep.id);
      this.addCameraShake(curWep.id === 'sniper' || curWep.id === 'shotgun' ? 5 : 2);

      // Shell casing particle
      this.spawnShellCasing();

      // Fire bullets
      const baseAngle = p.angle;
      const pellets = stats.pellets;
      const spread = stats.spread;
      const barrelDist = curWep.id === 'sniper' ? 36 : (curWep.id === 'assault_rifle' ? 28 : (curWep.id === 'shotgun' ? 26 : 22));

      for (let i = 0; i < pellets; i++) {
        let angle = baseAngle;
        if (pellets > 1) {
          angle += (Math.random() - 0.5) * spread;
        }

        const isCrit = Math.random() < (stats.critChance + p.critChance);
        const damage = Math.round(stats.damage * (isCrit ? 2.0 : 1.0));

        this.bullets.push({
          id: 'b_' + Math.random(),
          x: p.x + Math.cos(baseAngle) * barrelDist,
          y: p.y + Math.sin(baseAngle) * barrelDist,
          vx: Math.cos(angle) * stats.bulletSpeed,
          vy: Math.sin(angle) * stats.bulletSpeed,
          radius: curWep.bulletRadius,
          color: curWep.bulletColor,
          damage,
          isCrit,
          rangeRemaining: stats.range,
          penetration: curWep.id === 'sniper' ? 3 : 1,
          hitEntities: new Set(),
          isRocket: curWep.id === 'rocket_launcher',
          isFlame: curWep.id === 'flamethrower',
        });
      }

      // Auto reload if emptied
      if (p.magAmmo <= 0) {
        this.reload();
      }
    }
  }

  private spawnShellCasing() {
    const angle = this.player.angle + Math.PI / 2 + (Math.random() - 0.5) * 0.4;
    const speed = 80 + Math.random() * 40;
    this.particles.push({
      x: this.player.x,
      y: this.player.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: '#eab308',
      size: 2,
      alpha: 1,
      decay: 1.5,
      type: 'shell',
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 15,
    });
  }

  private updateBullets(dt: number) {
    if (this.bullets.length > 200) {
      this.bullets.splice(0, this.bullets.length - 200);
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (!b) continue;

      // Grenade fuse
      if (b.isGrenade && b.fuseTimer !== undefined) {
        b.fuseTimer -= dt;
        b.vx *= 0.95;
        b.vy *= 0.95;
        if (b.fuseTimer <= 0) {
          this.detonateExplosion(b.x, b.y, 140, b.damage);
          this.bullets.splice(i, 1);
          continue;
        }
      }

      b.x += b.vx * dt;
      b.y += b.vy * dt;
      const distTraveled = Math.hypot(b.vx * dt, b.vy * dt);
      b.rangeRemaining -= distTraveled;

      // Rocket smoke trail
      if (b.isRocket) {
        this.particles.push({
          x: b.x,
          y: b.y,
          vx: (Math.random() - 0.5) * 20,
          vy: (Math.random() - 0.5) * 20,
          color: 'rgba(203, 213, 225, 0.4)',
          size: 4 + Math.random() * 3,
          alpha: 0.6,
          decay: 2.0,
          type: 'smoke',
        });
      }

      // Check wall collisions
      let hitWall = false;
      for (const obs of this.map.obstacles) {
        if (
          b.x >= obs.x &&
          b.x <= obs.x + obs.width &&
          b.y >= obs.y &&
          b.y <= obs.y + obs.height
        ) {
          hitWall = true;
          break;
        }
      }

      if (hitWall) {
        if (b.isRocket) {
          this.detonateExplosion(b.x, b.y, 180, b.damage);
        } else {
          // Wall sparks
          for (let s = 0; s < 4; s++) {
            this.particles.push({
              x: b.x,
              y: b.y,
              vx: (Math.random() - 0.5) * 100,
              vy: (Math.random() - 0.5) * 100,
              color: '#fde047',
              size: 2,
              alpha: 1,
              decay: 4.0,
              type: 'spark',
            });
          }
        }
        this.bullets.splice(i, 1);
        continue;
      }

      // Check zombie hits safely with a copy of the list
      let hitZombie = false;
      const targetZombies = [...this.zombies];
      for (const z of targetZombies) {
        if (!this.zombies.includes(z)) continue;
        if (b.hitEntities.has(z.id)) continue;
        const dist = Math.hypot(z.x - b.x, z.y - b.y);
        if (dist <= z.radius + b.radius) {
          b.hitEntities.add(z.id);

          if (b.isRocket) {
            this.detonateExplosion(b.x, b.y, 180, b.damage);
            hitZombie = true;
            break;
          }

          // Damage zombie
          this.damageZombie(z, b.damage, b.isCrit, b.vx, b.vy);

          // Knockback - safe from division by zero
          const kb = b.damage * 1.5;
          const bSpeed = Math.hypot(b.vx, b.vy);
          if (bSpeed > 0.001) {
            z.x += (b.vx / bSpeed) * Math.min(kb, 40);
            z.y += (b.vy / bSpeed) * Math.min(kb, 40);
          }

          b.penetration--;
          if (b.penetration <= 0) {
            hitZombie = true;
            break;
          }
        }
      }

      if (hitZombie) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Range expire
      if (b.rangeRemaining <= 0) {
        if (b.isRocket) {
          this.detonateExplosion(b.x, b.y, 180, b.damage);
        }
        this.bullets.splice(i, 1);
      }
    }
  }

  private detonateExplosion(x: number, y: number, radius: number, damage: number) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    try {
      soundManager.playExplosion();
      this.addCameraShake(14);

      // Expanding shockwave
      this.shockwaves.push({
        x,
        y,
        radius: 10,
        maxRadius: Math.max(15, radius),
        speed: 400,
        color: '#fbbf24',
        alpha: 1.0,
      });

      // Fire & smoke particles
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 100 + Math.random() * 250;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.4 ? '#f97316' : '#ef4444',
          size: 5 + Math.random() * 6,
          alpha: 1.0,
          decay: 1.8,
          type: 'fire',
        });
      }

      // Damage all zombies in blast radius using safe array copy
      const blastZombies = [...this.zombies];
      for (const z of blastZombies) {
        if (!this.zombies.includes(z)) continue;
        const d = Math.hypot(z.x - x, z.y - y);
        if (d <= radius) {
          const falloff = 1 - d / radius;
          const blastDmg = Math.round(damage * (0.5 + falloff * 0.5));
          this.damageZombie(z, blastDmg, true, (z.x - x) * 2, (z.y - y) * 2);
        }
      }

      // Self damage check if player too close
      const distToPlayer = Math.hypot(this.player.x - x, this.player.y - y);
      if (distToPlayer < radius * 0.7) {
        this.damagePlayer(Math.round(damage * 0.25));
      }
    } catch (e) {
      console.warn('[GameEngine] Explosion error:', e);
    }
  }

  public damageZombie(z: ZombieEntity, amount: number, isCrit: boolean, hitVx: number, hitVy: number) {
    // Mutant soldier ballistic armor check
    if (z.type === 'soldier') {
      amount = Math.round(amount * 0.7);
    }

    z.health -= amount;
    z.damageAnimTimer = 0.22;
    soundManager.playHit(isCrit);

    // Blood particles
    this.spawnBloodSplat(z.x, z.y, hitVx, hitVy, 6);

    // Floating damage text
    this.addFloatingText(
      `${amount}${isCrit ? '!' : ''}`,
      z.x + (Math.random() - 0.5) * 20,
      z.y - 15,
      isCrit ? '#facc15' : '#ffffff',
      isCrit ? 22 : 16
    );

    // Zombie death check
    if (z.health <= 0) {
      this.killZombie(z);
    }
  }

  private killZombie(z: ZombieEntity) {
    const idx = this.zombies.indexOf(z);
    if (idx === -1) return;
    this.zombies.splice(idx, 1);

    this.killsCount++;
    this.saveData.totalKills++;

    // Vampirism DNA perk: heal on kill
    if (this.saveData.dnaPerks.vampirism > 0) {
      const heal = this.saveData.dnaPerks.vampirism * 2;
      this.player.health = Math.min(this.player.maxHealth, this.player.health + heal);
      this.addFloatingText(`+${heal} HP`, this.player.x, this.player.y - 25, '#10b981', 14);
    }

    // Heavy blood splat decal on ground
    this.paintGroundBlood(z.x, z.y, z.radius * 2.2);

    // Gore & gib particles
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 150;
      this.particles.push({
        x: z.x,
        y: z.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#991b1b',
        size: 3 + Math.random() * 3,
        alpha: 1.0,
        decay: 1.5,
        type: 'blood',
      });
    }

    // Toxic zombie death: poison gas cloud & acid puddle
    if (z.type === 'toxic') {
      this.acidPuddles.push({
        id: 'acid_' + Math.random(),
        x: z.x,
        y: z.y,
        radius: 45,
        duration: 8.0,
      });
      for (let p = 0; p < 20; p++) {
        this.particles.push({
          x: z.x,
          y: z.y,
          vx: (Math.random() - 0.5) * 60,
          vy: (Math.random() - 0.5) * 60,
          color: 'rgba(34, 197, 94, 0.6)',
          size: 6 + Math.random() * 6,
          alpha: 0.8,
          decay: 0.8,
          type: 'smoke',
        });
      }
    }

    // Boss Hulk special death
    if (z.isBoss) {
      soundManager.playBossRoar();
      this.addCameraShake(25);
      this.saveData.totalBossKills++;

      // Colossal loot fountain
      for (let c = 0; c < 15; c++) {
        this.spawnLoot(z.x + (Math.random() - 0.5) * 100, z.y + (Math.random() - 0.5) * 100, 'coin', 50, 'epic');
      }
      this.spawnLoot(z.x, z.y, 'dna', 12, 'legendary');
      this.spawnLoot(z.x + 30, z.y - 20, 'rare_part', 2, 'epic');
      this.spawnLoot(z.x - 30, z.y + 20, 'scrap', 15, 'rare');

      this.addFloatingText('THE HULK DEFEATED!', z.x, z.y - 60, '#ef4444', 32);
      return;
    }

    // Regular loot drops
    const dropRoll = Math.random();
    if (dropRoll < 0.45) {
      // Coins
      const coinAmt = Math.round((10 + Math.random() * 20) * (1 + this.location.difficulty * 0.2));
      this.spawnLoot(z.x, z.y, 'coin', coinAmt, 'common');
    } else if (dropRoll < 0.65) {
      // Ammo
      this.spawnLoot(z.x, z.y, 'ammo', 18, 'common');
    } else if (dropRoll < 0.75) {
      // Scrap material
      this.spawnLoot(z.x, z.y, 'scrap', 2, 'rare');
    } else if (dropRoll < 0.82) {
      // Zombie DNA sample
      this.spawnLoot(z.x, z.y, 'dna', 1, 'epic');
    } else if (dropRoll < 0.88) {
      // Medkit
      this.spawnLoot(z.x, z.y, 'medkit', 1, 'rare');
    }
  }

  private updateZombies(dt: number) {
    const p = this.player;
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return;

    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];
      if (!z) continue;
      if (!Number.isFinite(z.x) || !Number.isFinite(z.y)) {
        this.zombies.splice(i, 1);
        continue;
      }
      if (z.isBoss) continue; // Handled in updateBoss

      // Face towards player
      const dx = p.x - z.x;
      const dy = p.y - z.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.001) {
        z.angle = Math.atan2(dy, dx);
      }

      // Animation timers
      z.walkAnimTimer = (z.walkAnimTimer || 0) + dt * (Math.max(1, z.speed) / 35);
      if (z.damageAnimTimer && z.damageAnimTimer > 0) z.damageAnimTimer -= dt;
      if (z.attackAnimTimer && z.attackAnimTimer > 0) z.attackAnimTimer -= dt;

      // Attack cooldown
      if (z.attackCooldownTimer > 0) {
        z.attackCooldownTimer -= dt;
      }

      // Archetype specific AI & speeds
      let currentSpeed = z.speed;

      // 1. Runner: aggressive sprint lunge
      if (z.type === 'runner' && dist < 160) {
        currentSpeed = z.speed * 1.55;
      }

      // 2. Toxic Zombie: ranged acid spit attacks
      if (z.type === 'toxic') {
        z.spitCooldownTimer = (z.spitCooldownTimer || 2.5) - dt;
        if (z.spitCooldownTimer <= 0 && dist > 80 && dist < 380) {
          z.spitCooldownTimer = 3.5;
          z.attackAnimTimer = 0.45;
          soundManager.playZombieGroan('toxic');
          // Spawn corrosive acid puddle at player position
          this.acidPuddles.push({
            id: 'acid_' + Math.random(),
            x: p.x + (Math.random() - 0.5) * 30,
            y: p.y + (Math.random() - 0.5) * 30,
            radius: 38,
            duration: 5.5,
          });
          this.addFloatingText('ACID SPIT!', z.x, z.y - 20, '#84cc16', 14);
        }
      }

      // 3. Shadow Zombie: invisibility & ambush decloak
      if (z.type === 'shadow') {
        const angleToZombie = Math.atan2(z.y - p.y, z.x - p.x);
        let angleDiff = Math.abs(p.angle - angleToZombie);
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        angleDiff = Math.abs(angleDiff);

        if (dist < 130 || (dist < 420 && angleDiff < 0.45)) {
          z.cloakedAlpha = 0.95; // Fully revealed
          if (dist < 130) currentSpeed = z.speed * 1.5; // Ambush strike burst
        } else {
          z.cloakedAlpha = 0.20; // Stealth stalker
        }
      }

      // 4. Mutant Soldier: tactical combat sprint & strafe
      if (z.type === 'soldier') {
        if (dist < 180) currentSpeed = z.speed * 1.35;
      }

      // Move towards player
      if (dist > z.radius + p.radius - 2 && dist > 0.001) {
        z.vx = (dx / dist) * currentSpeed;
        z.vy = (dy / dist) * currentSpeed;

        // Tactical soldier strafe
        if (z.type === 'soldier' && dist > 110 && dist < 260) {
          const perpX = -dy / dist;
          const perpY = dx / dist;
          z.vx += perpX * 35;
          z.vy += perpY * 35;
        }

        z.x += z.vx * dt;
        z.y += z.vy * dt;
      } else {
        z.vx = 0;
        z.vy = 0;
      }

      // Zombie obstacle collisions
      this.resolveObstacleCollisions(z, z.radius);

      // Zombie-on-zombie separation
      for (const other of this.zombies) {
        if (other === z) continue;
        const sepD = Math.hypot(z.x - other.x, z.y - other.y);
        const minDist = z.radius + other.radius;
        if (sepD < minDist && sepD > 0.1) {
          const push = (minDist - sepD) * 0.4;
          z.x += ((z.x - other.x) / sepD) * push;
          z.y += ((z.y - other.y) / sepD) * push;
        } else if (sepD <= 0.1) {
          z.x += (Math.random() - 0.5) * 4;
          z.y += (Math.random() - 0.5) * 4;
        }
      }

      // Attack player check
      if (dist <= z.radius + p.radius + 8 && z.attackCooldownTimer <= 0) {
        z.attackCooldownTimer = z.attackCooldown / 1000;
        z.attackAnimTimer = 0.35;
        this.damagePlayer(z.damage);
        soundManager.playZombieGroan(z.type);
        if (z.type === 'brute') {
          this.addCameraShake(12);
        }
      }
    }
  }

  // --- THE HULK BOSS STATE MACHINE ---
  private updateBoss(dt: number) {
    const boss = this.zombies.find((z) => z.isBoss);
    if (!boss) return;

    const p = this.player;
    const dx = p.x - boss.x;
    const dy = p.y - boss.y;
    const dist = Math.hypot(dx, dy);

    // Timers
    if (boss.roarCooldown !== undefined && boss.roarCooldown > 0) boss.roarCooldown -= dt;
    if (boss.slamCooldown !== undefined && boss.slamCooldown > 0) boss.slamCooldown -= dt;
    if (boss.chargeCooldown !== undefined && boss.chargeCooldown > 0) boss.chargeCooldown -= dt;
    if (boss.bossStateTimer !== undefined && boss.bossStateTimer > 0) boss.bossStateTimer -= dt;

    // Phase 2 check: Enrage below 50% HP
    if (boss.health < boss.maxHealth * 0.5 && boss.bossPhase === 1) {
      boss.bossPhase = 2;
      boss.speed = ENEMY_CONFIGS.hulk_boss.speed * 1.35;
      soundManager.playBossRoar();
      this.addCameraShake(18);
      this.addFloatingText('THE HULK IS ENRAGED!', boss.x, boss.y - 60, '#ef4444', 28);
    }

    switch (boss.bossState) {
      case 'chase': {
        if (dist > 0.001) {
          boss.angle = Math.atan2(dy, dx);
          boss.vx = (dx / dist) * boss.speed;
          boss.vy = (dy / dist) * boss.speed;
        } else {
          boss.vx = 0;
          boss.vy = 0;
        }
        boss.x += boss.vx * dt;
        boss.y += boss.vy * dt;

        // Melee attack
        if (dist <= boss.radius + p.radius + 8 && boss.attackCooldownTimer <= 0) {
          boss.attackCooldownTimer = 1.0;
          this.damagePlayer(boss.damage);
          this.addCameraShake(8);
        }

        // Decision logic
        if (boss.roarCooldown !== undefined && boss.roarCooldown <= 0) {
          boss.bossState = 'roaring';
          boss.bossStateTimer = 1.6;
          boss.roarCooldown = boss.bossPhase === 2 ? 8 : 12;
          soundManager.playBossRoar();
          this.addCameraShake(14);
          // Slow down player & summon 4 runner minions
          p.speed = Math.max(120, p.speed * 0.6);
          const currentUpgrades = this.saveData?.playerUpgrades?.speedLevel || 0;
          setTimeout(() => { 
            if (this.player) {
              this.player.speed = 215 * (1 + currentUpgrades * 0.08); 
            }
          }, 2200);
          for (let m = 0; m < 4; m++) {
            this.spawnMinionRunner(boss.x, boss.y);
          }
        } else if (boss.slamCooldown !== undefined && boss.slamCooldown <= 0 && dist < 260) {
          boss.bossState = 'slamming';
          boss.bossStateTimer = 1.0;
          boss.slamCooldown = boss.bossPhase === 2 ? 5 : 8;
        } else if (boss.chargeCooldown !== undefined && boss.chargeCooldown <= 0 && dist > 200) {
          boss.bossState = 'prepare_charge';
          boss.bossStateTimer = 1.1;
          boss.bossChargeAngle = Math.atan2(dy, dx);
          boss.chargeCooldown = boss.bossPhase === 2 ? 6 : 9;
        }
        break;
      }

      case 'roaring': {
        boss.vx = 0;
        boss.vy = 0;
        // Roar shockwave
        if (Math.random() < 0.25) {
          this.shockwaves.push({
            x: boss.x,
            y: boss.y,
            radius: 20,
            maxRadius: 180,
            speed: 300,
            color: '#ef4444',
            alpha: 0.8,
          });
        }
        if (boss.bossStateTimer! <= 0) {
          boss.bossState = 'chase';
        }
        break;
      }

      case 'prepare_charge': {
        boss.vx = 0;
        boss.vy = 0;
        // Stomp and telegraph line
        if (boss.bossStateTimer! <= 0) {
          boss.bossState = 'charging';
          boss.bossStateTimer = 1.4;
          soundManager.playShoot('shotgun');
        }
        break;
      }

      case 'charging': {
        const chargeSpd = 480;
        const angle = boss.bossChargeAngle || 0;
        boss.vx = Math.cos(angle) * chargeSpd;
        boss.vy = Math.sin(angle) * chargeSpd;
        boss.x += boss.vx * dt;
        boss.y += boss.vy * dt;

        // Ground dust
        this.particles.push({
          x: boss.x + (Math.random() - 0.5) * 30,
          y: boss.y + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 50,
          vy: (Math.random() - 0.5) * 50,
          color: 'rgba(203, 213, 225, 0.5)',
          size: 8,
          alpha: 0.7,
          decay: 2.0,
          type: 'smoke',
        });

        // Hit player during charge
        if (Math.hypot(boss.x - p.x, boss.y - p.y) < boss.radius + p.radius) {
          this.damagePlayer(boss.damage * 1.4);
          this.addCameraShake(16);
          // Knock player back
          p.x += Math.cos(angle) * 120;
          p.y += Math.sin(angle) * 120;
          boss.bossState = 'chase';
        }

        if (boss.bossStateTimer! <= 0) {
          boss.bossState = 'chase';
        }
        break;
      }

      case 'slamming': {
        boss.vx = 0;
        boss.vy = 0;
        if (boss.bossStateTimer! <= 0) {
          // Execute ground slam
          soundManager.playGroundSlam();
          this.addCameraShake(20);
          this.shockwaves.push({
            x: boss.x,
            y: boss.y,
            radius: 15,
            maxRadius: 240,
            speed: 450,
            color: '#f97316',
            alpha: 1.0,
          });

          // Check if player hit by ground slam
          const slamDist = Math.hypot(boss.x - p.x, boss.y - p.y);
          if (slamDist < 240) {
            const falloff = 1 - slamDist / 240;
            this.damagePlayer(Math.round(boss.damage * falloff));
            p.x += (p.x - boss.x) * 0.4;
            p.y += (p.y - boss.y) * 0.4;
          }

          boss.bossState = 'chase';
        }
        break;
      }
    }

    this.resolveObstacleCollisions(boss, boss.radius);
  }

  private spawnMinionRunner(x: number, y: number) {
    const angle = Math.random() * Math.PI * 2;
    const config = ENEMY_CONFIGS.runner;
    const runner: ZombieEntity = {
      id: 'minion_' + Math.random(),
      type: 'runner',
      x: x + Math.cos(angle) * 60,
      y: y + Math.sin(angle) * 60,
      vx: 0,
      vy: 0,
      angle: 0,
      health: config.maxHealth,
      maxHealth: config.maxHealth,
      speed: config.speed,
      baseSpeed: config.speed,
      damage: config.damage,
      radius: config.radius,
      attackCooldownTimer: 0,
      attackCooldown: config.attackCooldown,
      color: config.color,
      eyeColor: config.eyeColor,
      animFrame: 0,
    };
    this.zombies.push(runner);
  }

  // --- DAMAGE PLAYER ---
  public damagePlayer(rawAmount: number) {
    const p = this.player;
    if (p.invincibleTimer > 0) return;

    // Iron skin DNA perk damage reduction
    let amount = rawAmount;
    if (this.saveData.dnaPerks.ironSkin > 0) {
      amount = Math.round(amount * (1 - this.saveData.dnaPerks.ironSkin * 0.06));
    }

    // Armor absorbs 70% of damage until depleted
    if (p.armor > 0) {
      const armorAbsorb = Math.min(p.armor, Math.round(amount * 0.7));
      p.armor -= armorAbsorb;
      amount -= armorAbsorb;
    }

    p.health = Math.max(0, p.health - amount);
    p.invincibleTimer = 0.35;
    p.hurtFlashTimer = 0.25;

    soundManager.playPlayerHurt();
    this.addCameraShake(10);

    // Red screen blood flash
    this.spawnBloodSplat(p.x, p.y, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, 4);

    if (p.health <= 0) {
      this.handlePlayerDeath();
    }
  }

  private handlePlayerDeath() {
    this.player.isDead = true;
    this.player.deathAnimTimer = 0;
    this.isGameOver = true;
    soundManager.playDefeat();
    this.addCameraShake(25);

    const results: MissionResult = {
      won: false,
      location: this.location,
      kills: this.killsCount,
      coinsEarned: Math.round(this.killsCount * 12),
      dnaEarned: 0,
      xpEarned: Math.round(this.killsCount * 15),
      rarePartsEarned: 0,
      timeElapsed: Math.round(this.missionTimeElapsed),
    };

    if (this.onGameOver) {
      this.onGameOver(results);
    }
  }

  /**
   * Revive player following completed AdMob rewarded video
   */
  public revivePlayer() {
    this.player.isDead = false;
    this.player.deathAnimTimer = 0;
    this.player.health = Math.round(this.player.maxHealth * 0.75);
    this.player.armor = Math.round(this.player.maxArmor * 0.5);
    this.player.invincibleTimer = 3.0;
    this.player.isMoving = false;
    this.player.isDashing = false;
    this.player.dashTimer = 0;
    this.player.dashCooldownTimer = 0;
    this.isGameOver = false;
    this.isWon = false;
    this.isAdPaused = false;
    this.inputDisabled = false;

    // Clear stuck inputs
    this.keys = {};
    this.mouse.isDown = false;
    this.virtualMovement = { x: 0, y: 0 };
    this.virtualAiming = null;
    this.isVirtualShooting = false;

    // Push nearby enemies away to provide tactical breathing room
    for (const z of this.zombies) {
      const dx = z.x - this.player.x;
      const dy = z.y - this.player.y;
      const d = Math.hypot(dx, dy);
      if (d < 260 && d > 0) {
        z.x = this.player.x + (dx / d) * 280;
        z.y = this.player.y + (dy / d) * 280;
      }
    }

    // Reset clock and restart loop if paused
    this.lastTime = performance.now();
    this.isRunning = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame(this.loop);

    this.addFloatingText('SURVIVOR REVIVED!', this.player.x, this.player.y - 40, '#22c55e', 24);
    this.broadcastHUD();
  }

  // --- LOOT & COLLECTIBLES ---
  private spawnLoot(x: number, y: number, type: LootDrop['type'], amount: number, rarity: ItemRarity) {
    this.lootDrops.push({
      id: 'loot_' + Math.random(),
      x,
      y,
      type,
      amount,
      rarity,
      lifeTime: 35.0,
      bounceOffset: Math.random() * Math.PI * 2,
    });
  }

  private updateLoot(dt: number) {
    const p = this.player;

    if (this.lootDrops.length > 100) {
      this.lootDrops.splice(0, this.lootDrops.length - 100);
    }

    for (let i = this.lootDrops.length - 1; i >= 0; i--) {
      const drop = this.lootDrops[i];
      if (!drop || !Number.isFinite(drop.x) || !Number.isFinite(drop.y)) {
        this.lootDrops.splice(i, 1);
        continue;
      }

      drop.lifeTime -= dt;
      drop.bounceOffset += dt * 4;

      const dx = p.x - drop.x;
      const dy = p.y - drop.y;
      const dist = Math.hypot(dx, dy);

      // Magnet pull towards player - safe from division by zero
      if (dist < 110 && dist > 0.001) {
        const pullSpeed = (1 - dist / 110) * 320 + 80;
        drop.x += (dx / dist) * pullSpeed * dt;
        drop.y += (dy / dist) * pullSpeed * dt;
      }

      // Collect item
      if (dist < p.radius + 14) {
        soundManager.playPickup(drop.type);

        switch (drop.type) {
          case 'coin':
            this.saveData.coins += drop.amount;
            this.addFloatingText(`+${drop.amount} Coins`, drop.x, drop.y - 15, '#facc15', 16);
            break;
          case 'dna':
            this.saveData.zombieDna += drop.amount;
            this.addFloatingText(`+${drop.amount} DNA`, drop.x, drop.y - 15, '#c084fc', 18);
            break;
          case 'ammo': {
            const curWep = this.getCurrentWeapon();
            const stats = this.getUpgradedWeaponStats(curWep.id);
            p.magAmmo = Math.min(stats.magazine, p.magAmmo + drop.amount);
            this.addFloatingText(`+${drop.amount} Ammo`, drop.x, drop.y - 15, '#38bdf8', 16);
            break;
          }
          case 'medkit':
            this.saveData.inventory.medkits = Math.min(10, this.saveData.inventory.medkits + drop.amount);
            this.addFloatingText('+1 Medkit', drop.x, drop.y - 15, '#4ade80', 16);
            break;
          case 'scrap':
            this.saveData.inventory.scrapMaterials += drop.amount;
            this.addFloatingText(`+${drop.amount} Scrap`, drop.x, drop.y - 15, '#94a3b8', 16);
            break;
          case 'rare_part':
            this.saveData.inventory.rareParts += drop.amount;
            this.addFloatingText(`+${drop.amount} Rare Part`, drop.x, drop.y - 15, '#e879f9', 18);
            break;
        }

        this.lootDrops.splice(i, 1);
        continue;
      }

      if (drop.lifeTime <= 0) {
        this.lootDrops.splice(i, 1);
      }
    }
  }

  // --- PARTICLES & DECALS ---
  private updateParticles(dt: number) {
    if (this.particles.length > 300) {
      this.particles.splice(0, this.particles.length - 300);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];
      if (!part) continue;

      part.x += part.vx * dt;
      part.y += part.vy * dt;
      part.vx *= 0.96;
      part.vy *= 0.96;
      part.alpha -= part.decay * dt;

      if (part.vRot !== undefined && part.rotation !== undefined) {
        part.rotation += part.vRot * dt;
      }

      if (part.alpha <= 0 || !Number.isFinite(part.x) || !Number.isFinite(part.y)) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateWeather(dt: number) {
    if (this.location.weather === 'rain' || this.location.weather === 'storm') {
      for (const w of this.weatherParticles) {
        w.x += w.vx * dt;
        w.y += w.vy * dt;
        if (w.y > this.canvas.height) {
          w.y = -10;
          w.x = Math.random() * this.canvas.width;
        }
        if (w.x < 0) {
          w.x = this.canvas.width;
        }
      }

      // Lightning flash in storm
      if (this.location.weather === 'storm') {
        this.lightningTimer += dt;
        if (this.lightningTimer > 7 + Math.random() * 8) {
          this.lightningTimer = 0;
          this.lightningAlpha = 0.85;
          soundManager.playExplosion();
        }
      }
    }

    if (this.lightningAlpha > 0) {
      this.lightningAlpha = Math.max(0, this.lightningAlpha - dt * 2.5);
    }
  }

  private updatePuddles(dt: number) {
    const p = this.player;

    for (let i = this.acidPuddles.length - 1; i >= 0; i--) {
      const puddle = this.acidPuddles[i];
      puddle.duration -= dt;

      // Check player standing in acid
      if (Math.hypot(p.x - puddle.x, p.y - puddle.y) < puddle.radius + p.radius) {
        let acidDmg = 8 * dt;
        if (this.saveData.dnaPerks.toxicResistance > 0) {
          acidDmg *= 1 - this.saveData.dnaPerks.toxicResistance * 0.15;
        }
        p.health = Math.max(0, p.health - acidDmg);
      }

      if (puddle.duration <= 0) {
        this.acidPuddles.splice(i, 1);
      }
    }
  }

  private updateShockwaves(dt: number) {
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed * dt;
      sw.alpha = 1 - sw.radius / sw.maxRadius;
      if (sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.alpha -= 0.8 * dt;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private addFloatingText(text: string, x: number, y: number, color: string, size: number = 16) {
    this.floatingTexts.push({
      id: 'ft_' + Math.random(),
      text,
      x,
      y,
      color,
      size,
      alpha: 1.0,
      vy: -35,
    });
  }

  private spawnBloodSplat(x: number, y: number, vx: number, vy: number, count: number) {
    const detail = this.saveData.settings.bloodDetail;
    const mult = detail === 'extreme' ? 2 : detail === 'high' ? 1.4 : 1.0;
    const total = Math.round(count * mult);

    for (let i = 0; i < total; i++) {
      const angle = Math.atan2(vy, vx) + (Math.random() - 0.5) * 1.5;
      const speed = 50 + Math.random() * 160;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.3 ? '#991b1b' : '#dc2626',
        size: 2.5 + Math.random() * 3,
        alpha: 1.0,
        decay: 2.0,
        type: 'blood',
      });
    }
  }

  private paintGroundBlood(x: number, y: number, radius: number) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius <= 0) return;
    try {
      const bg = this.bgCtx;
      bg.save();
      bg.fillStyle = 'rgba(127, 29, 29, 0.7)';
      bg.beginPath();
      bg.arc(x, y, radius, 0, Math.PI * 2);
      bg.fill();

      // Satellite droplets
      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = radius * (0.8 + Math.random() * 0.8);
        bg.beginPath();
        bg.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 3 + Math.random() * 4, 0, Math.PI * 2);
        bg.fill();
      }
      bg.restore();
    } catch {
      // Ignore decal paint error safely
    }
  }

  // --- COLLISION RESOLUTION ---
  private resolveObstacleCollisions(entity: { x: number; y: number }, radius: number) {
    if (!Number.isFinite(entity.x) || !Number.isFinite(entity.y)) {
      entity.x = this.map.playerSpawn?.x || 1100;
      entity.y = this.map.playerSpawn?.y || 1100;
      return;
    }

    const safeRadius = Math.max(1, Number.isFinite(radius) ? radius : 18);

    for (const obs of this.map.obstacles) {
      // Find closest point on rectangle
      const closestX = Math.max(obs.x, Math.min(entity.x, obs.x + obs.width));
      const closestY = Math.max(obs.y, Math.min(entity.y, obs.y + obs.height));

      const distX = entity.x - closestX;
      const distY = entity.y - closestY;
      const distance = Math.hypot(distX, distY);

      if (distance < safeRadius) {
        if (distance === 0) {
          entity.x += safeRadius;
        } else {
          const overlap = safeRadius - distance;
          entity.x += (distX / distance) * overlap;
          entity.y += (distY / distance) * overlap;
        }
      }
    }

    // Clamp entity inside map world boundaries (e.g. 3200 x 3200)
    const margin = 45;
    entity.x = Math.max(margin + safeRadius, Math.min(this.map.width - margin - safeRadius, entity.x));
    entity.y = Math.max(margin + safeRadius, Math.min(this.map.height - margin - safeRadius, entity.y));
  }

  private updateSpawns(dt: number) {
    if (this.location.isBossStage && this.zombies.some((z) => z.isBoss)) {
      // Slower minion spawns during boss
      this.spawnTimer += dt;
      if (this.spawnTimer > 7.0 && this.zombies.length < 8) {
        this.spawnTimer = 0;
        this.spawnWaveZombie();
      }
      return;
    }

    this.spawnTimer += dt;
    const interval = this.location.enemySpawnRate || (this.location.timeOfDay === 'night' ? 1.4 : 2.2);
    if (this.spawnTimer >= interval) {
      this.spawnTimer = 0;
      this.spawnWaveZombie();
    }
  }

  // --- OBJECTIVES & WIN CONDITIONS ---
  private updateObjective(dt: number) {
    if (this.isWon || this.isGameOver) return;

    switch (this.location.missionType) {
      case 'survive_time': {
        const remaining = Math.max(0, this.location.targetCount - this.missionTimeElapsed);
        if (remaining <= 0) {
          this.triggerVictory();
        }
        break;
      }

      case 'kill_count': {
        if (this.killsCount >= this.location.targetCount) {
          this.triggerVictory();
        }
        break;
      }

      case 'collect_supplies': {
        if (this.suppliesCollected >= this.location.targetCount) {
          this.triggerVictory();
        }
        break;
      }

      case 'rescue_survivors': {
        const allRescued = this.map.survivors.every((s) => s.rescued);
        if (allRescued && this.map.survivors.length > 0) {
          this.triggerVictory();
        }
        break;
      }

      case 'protect_area': {
        if (this.map.defenseZone) {
          this.areaDefendTimer += dt;
          if (this.areaDefendTimer >= this.location.targetCount) {
            this.triggerVictory();
          }
          if (this.map.defenseZone.health <= 0) {
            this.handlePlayerDeath();
          }
        }
        break;
      }

      case 'reach_extraction': {
        if (this.map.extractionPoint) {
          const pt = this.map.extractionPoint;
          const dist = Math.hypot(this.player.x - pt.x, this.player.y - pt.y);
          if (dist <= pt.radius) {
            this.extractionTimer += dt;
            if (this.extractionTimer >= pt.timeRemaining) {
              this.triggerVictory();
            }
          }
        }
        break;
      }

      case 'defeat_boss': {
        const bossAlive = this.zombies.some((z) => z.isBoss);
        if (!bossAlive && this.saveData.totalBossKills > 0) {
          this.triggerVictory();
        }
        break;
      }
    }
  }

  private updateSurvivors(dt: number) {
    for (const survivor of this.map.survivors) {
      if (survivor.followingPlayer && !survivor.rescued) {
        const dx = this.player.x - survivor.x;
        const dy = this.player.y - survivor.y;
        const dist = Math.hypot(dx, dy);

        // Follow behind player
        if (dist > 65) {
          survivor.x += (dx / dist) * 160 * dt;
          survivor.y += (dy / dist) * 160 * dt;
        }

        // Check if brought to safe extraction / spawn courtyard
        const distToSafeZone = Math.hypot(survivor.x - this.map.playerSpawn.x, survivor.y - this.map.playerSpawn.y);
        if (distToSafeZone < 160) {
          survivor.rescued = true;
          this.survivorsRescued++;
          try {
            soundManager.playVictory();
          } catch {}
          this.addFloatingText('SURVIVOR SECURED!', survivor.x, survivor.y - 30, '#38bdf8', 22);
        }
      }
    }
  }

  private updateDefenseZone(dt: number) {
    if (!this.map.defenseZone) return;
    const zone = this.map.defenseZone;

    // Check zombies attacking generator
    for (const z of this.zombies) {
      const dist = Math.hypot(z.x - zone.x, z.y - zone.y);
      if (dist < zone.radius + z.radius && z.attackCooldownTimer <= 0) {
        z.attackCooldownTimer = 1.0;
        zone.health = Math.max(0, zone.health - z.damage);
        this.addCameraShake(5);
        this.addFloatingText(`-${z.damage}`, zone.x, zone.y - 20, '#ef4444', 16);
      }
    }
  }

  private triggerVictory() {
    if (this.isWon) return;
    this.isWon = true;

    try {
      soundManager.playVictory();
    } catch (e) {
      console.warn('[GameEngine] Victory sound failed:', e);
    }

    const coinsReward = this.location.rewardCoins || 250;
    const xpReward = this.location.rewardXp || 350;
    const dnaReward = this.location.rewardDna || 5;

    try {
      this.saveData.coins += coinsReward;
      this.saveData.zombieDna += dnaReward;

      // Unlock next location if not yet unlocked (up to Level 50)
      const nextLocId = this.location.id + 1;
      if (nextLocId <= 50 && !this.saveData.unlockedLocations.includes(nextLocId)) {
        this.saveData.unlockedLocations.push(nextLocId);
      }
      if (!this.saveData.completedLocations.includes(this.location.id)) {
        this.saveData.completedLocations.push(this.location.id);
      }
    } catch (e) {
      console.error('[GameEngine] Error updating victory save data:', e);
    }

    const result: MissionResult = {
      won: true,
      location: this.location,
      kills: this.killsCount,
      coinsEarned: coinsReward,
      dnaEarned: dnaReward,
      xpEarned: xpReward,
      rarePartsEarned: 1,
      timeElapsed: Math.max(1, Math.round(this.missionTimeElapsed)),
    };

    if (this.onMissionComplete) {
      try {
        this.onMissionComplete(result);
      } catch (e) {
        console.error('[GameEngine] Error in onMissionComplete callback:', e);
      }
    }
  }

  private addCameraShake(amount: number) {
    if (!this.saveData.settings.screenShake) return;
    this.camera.shake = Math.min(25, this.camera.shake + amount);
  }

  // --- RENDER PASSES ---
  private render() {
    const ctx = this.ctx;
    const canvas = this.canvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Render the world offset by the camera position safely
    const camX = Number.isFinite(this.camera.x) ? this.camera.x : 0;
    const camY = Number.isFinite(this.camera.y) ? this.camera.y : 0;
    const sX = Number.isFinite(this.camera.shakeX) ? this.camera.shakeX : 0;
    const sY = Number.isFinite(this.camera.shakeY) ? this.camera.shakeY : 0;
    const cameraX = Math.round(camX + sX);
    const cameraY = Math.round(camY + sY);
    ctx.translate(-cameraX, -cameraY);

    // 1. Draw pre-rendered floor & permanent blood decals
    ctx.drawImage(this.backgroundCanvas, 0, 0);

    // 2. Draw ground zones (Defense zone, Extraction point)
    this.renderGroundZones(ctx);

    // 3. Draw supply crates & interactables
    this.renderInteractables(ctx);

    // 4. Draw acid pools
    this.renderAcidPools(ctx);

    // 5. Draw loot drops
    this.renderLootDrops(ctx);

    // 6. Draw survivors NPCs
    this.renderSurvivors(ctx);

    // 7. Draw player survivor
    this.renderPlayer(ctx);

    // 8. Draw zombies & Boss
    this.renderZombies(ctx);

    // 9. Draw bullets & rockets
    this.renderBullets(ctx);

    // 10. Draw particles
    this.renderParticles(ctx);

    // 11. Draw shockwaves
    this.renderShockwaves(ctx);

    // 12. Draw floating damage text
    this.renderFloatingTexts(ctx);

    ctx.restore();

    // 13. Dynamic Lighting & Darkness pass
    this.renderLightingPass(-cameraX, -cameraY);

    // 14. Screen weather & storm lightning
    this.renderWeatherOverlay();

    // 15. Low HP Heartbeat / Blood vignette
    this.renderScreenVignette();
  }

  private renderGroundZones(ctx: CanvasRenderingContext2D) {
    // Defense zone
    if (this.map.defenseZone) {
      const dz = this.map.defenseZone;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.12)';
      ctx.beginPath();
      ctx.arc(dz.x, dz.y, dz.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Health bar above generator
      const barW = 100;
      const barH = 8;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(dz.x - barW / 2, dz.y - dz.radius - 18, barW, barH);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(dz.x - barW / 2, dz.y - dz.radius - 18, barW * (dz.health / dz.maxHealth), barH);
    }

    // Extraction point
    if (this.map.extractionPoint) {
      const ep = this.map.extractionPoint;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pulsing center beacon
      const pulse = 10 + Math.sin(performance.now() * 0.005) * 5;
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, pulse, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderInteractables(ctx: CanvasRenderingContext2D) {
    for (const crate of this.map.crates) {
      if (crate.collected) continue;
      ctx.fillStyle = crate.type === 'dna_sample' ? '#9333ea' : '#d97706';
      ctx.fillRect(crate.x - 16, crate.y - 16, 32, 32);

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.strokeRect(crate.x - 16, crate.y - 16, 32, 32);

      // Supply crate icon label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Share Tech Mono"';
      ctx.textAlign = 'center';
      ctx.fillText(crate.type === 'dna_sample' ? 'DNA' : 'CRATE', crate.x, crate.y + 4);
    }
  }

  private renderAcidPools(ctx: CanvasRenderingContext2D) {
    for (const puddle of this.acidPuddles) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
      ctx.beginPath();
      ctx.arc(puddle.x, puddle.y, puddle.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(74, 222, 128, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  private renderLootDrops(ctx: CanvasRenderingContext2D) {
    for (const drop of this.lootDrops) {
      const yOffset = Math.sin(drop.bounceOffset) * 4;
      const x = drop.x;
      const y = drop.y + yOffset;

      let color = '#facc15';
      if (drop.type === 'ammo') color = '#38bdf8';
      if (drop.type === 'medkit') color = '#4ade80';
      if (drop.type === 'dna') color = '#c084fc';
      if (drop.type === 'scrap') color = '#94a3b8';

      // Outer glow
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();

      // Inner ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  private renderSurvivors(ctx: CanvasRenderingContext2D) {
    for (const s of this.map.survivors) {
      if (s.rescued) continue;
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Share Tech Mono"';
      ctx.textAlign = 'center';
      ctx.fillText(s.followingPlayer ? 'FOLLOWING' : 'RESCUE', s.x, s.y - 18);
    }
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    const curWep = this.getCurrentWeapon();

    renderPlayerCharacter(ctx, {
      x: p.x,
      y: p.y,
      radius: p.radius,
      angle: p.angle,
      moveAngle: p.moveAngle,
      isMoving: p.isMoving,
      isRunning: p.isDashing,
      walkAnimTimer: p.walkAnimTimer,
      isReloading: p.isReloading,
      reloadProgress: p.isReloading ? 1 - p.reloadTimer / p.reloadTotal : 0,
      isShooting: (this.mouse.isDown || this.isVirtualShooting) && !p.isReloading && p.magAmmo > 0,
      recoilOffset: p.recoilOffset,
      muzzleFlashTimer: p.muzzleFlashTimer,
      hurtFlashTimer: p.hurtFlashTimer,
      isDead: p.isDead,
      deathAnimTimer: p.deathAnimTimer,
      armor: p.armor,
      maxArmor: p.maxArmor,
      currentWeapon: curWep,
    });
  }

  private renderZombies(ctx: CanvasRenderingContext2D) {
    const now = performance.now();
    for (const z of this.zombies) {
      renderZombie(ctx, z, { now });
    }
  }

  private renderHulkBoss(ctx: CanvasRenderingContext2D, boss: ZombieEntity) {
    // Large monstrous mutated boss
    const r = boss.radius;

    // Outer spiked carapace
    ctx.fillStyle = boss.bossPhase === 2 ? '#991b1b' : boss.color;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Massive claws
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(r * 0.5, -r * 0.8, 22, 16);
    ctx.fillRect(r * 0.5, r * 0.4, 22, 16);

    // Glowing menacing fiery eyes
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(r * 0.4, -10, 5, 0, Math.PI * 2);
    ctx.arc(r * 0.4, 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Charge telegraph line
    if (boss.bossState === 'prepare_charge' && boss.bossChargeAngle !== undefined) {
      ctx.save();
      ctx.rotate(-boss.angle + boss.bossChargeAngle);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 8;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(600, 0);
      ctx.stroke();
      ctx.restore();
    }
  }

  private renderBullets(ctx: CanvasRenderingContext2D) {
    for (const b of this.bullets) {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      // Tracer tail
      ctx.strokeStyle = b.color;
      ctx.lineWidth = b.radius * 0.8;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 0.02, b.y - b.vy * 0.02);
      ctx.stroke();
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.type === 'shell') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillRect(-2, -1, 5, 2);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderShockwaves(ctx: CanvasRenderingContext2D) {
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${ft.size}px "Chakra Petch", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  // --- DYNAMIC LIGHTING PASS ---
  private renderLightingPass(cameraOffsetX: number, cameraOffsetY: number) {
    const lc = this.lightCanvas;
    const lctx = this.lightCtx;

    if (lc.width !== this.canvas.width || lc.height !== this.canvas.height) {
      lc.width = this.canvas.width;
      lc.height = this.canvas.height;
    }

    const isNight = this.location.timeOfDay === 'night';
    // Base darkness
    lctx.globalCompositeOperation = 'source-over';
    lctx.fillStyle = isNight ? 'rgba(5, 7, 13, 0.93)' : 'rgba(5, 7, 13, 0.35)';
    lctx.fillRect(0, 0, lc.width, lc.height);

    // Cut out player flashlight
    lctx.globalCompositeOperation = 'destination-out';

    const pScreenX = this.player.x + cameraOffsetX;
    const pScreenY = this.player.y + cameraOffsetY;

    // Small immediate player body aura
    const bodyGrad = lctx.createRadialGradient(pScreenX, pScreenY, 10, pScreenX, pScreenY, 90);
    bodyGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
    bodyGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    lctx.fillStyle = bodyGrad;
    lctx.beginPath();
    lctx.arc(pScreenX, pScreenY, 90, 0, Math.PI * 2);
    lctx.fill();

    // Directional flashlight cone
    const beamAngle = this.player.angle;
    const coneAngle = 0.55; // Spread in radians
    const beamDist = isNight ? 520 : 350;

    lctx.save();
    lctx.beginPath();
    lctx.moveTo(pScreenX, pScreenY);
    lctx.arc(pScreenX, pScreenY, beamDist, beamAngle - coneAngle / 2, beamAngle + coneAngle / 2);
    lctx.closePath();

    const beamGrad = lctx.createRadialGradient(pScreenX, pScreenY, 20, pScreenX, pScreenY, beamDist);
    beamGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
    beamGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)');
    beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    lctx.fillStyle = beamGrad;
    lctx.fill();
    lctx.restore();

    // Cut out explosions and burning fires
    for (const sw of this.shockwaves) {
      const swX = sw.x + cameraOffsetX;
      const swY = sw.y + cameraOffsetY;
      const swRadius = Math.max(11, Number.isFinite(sw.radius) ? sw.radius * 1.5 : 15);
      if (Number.isFinite(swX) && Number.isFinite(swY)) {
        try {
          const expGrad = lctx.createRadialGradient(swX, swY, 10, swX, swY, swRadius);
          expGrad.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
          expGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          lctx.fillStyle = expGrad;
          lctx.beginPath();
          lctx.arc(swX, swY, swRadius, 0, Math.PI * 2);
          lctx.fill();
        } catch {
          // Ignore gradient error safely
        }
      }
    }

    // Blend darkness onto main game canvas
    this.ctx.drawImage(lc, 0, 0);
  }

  private renderWeatherOverlay() {
    const ctx = this.ctx;

    // Storm lightning screen flash
    if (this.lightningAlpha > 0) {
      ctx.fillStyle = `rgba(240, 249, 255, ${this.lightningAlpha})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Falling rain streaks
    if (this.location.weather === 'rain' || this.location.weather === 'storm') {
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (const w of this.weatherParticles) {
        ctx.moveTo(w.x, w.y);
        ctx.lineTo(w.x - 4, w.y + 14);
      }
      ctx.stroke();
    } else if (this.location.weather === 'fog') {
      for (const f of this.weatherParticles) {
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderScreenVignette() {
    const ctx = this.ctx;
    const hpRatio = this.player.health / this.player.maxHealth;

    if (hpRatio < 0.35 || this.player.hurtFlashTimer > 0) {
      const alpha = this.player.hurtFlashTimer > 0 
        ? 0.5 
        : (1 - hpRatio / 0.35) * 0.4;
      const r0 = Math.max(1, (this.canvas.width || 1280) * 0.3);
      const r1 = Math.max(r0 + 1, (this.canvas.width || 1280) * 0.7);
      try {
        const grad = ctx.createRadialGradient(
          this.canvas.width / 2, this.canvas.height / 2, r0,
          this.canvas.width / 2, this.canvas.height / 2, r1
        );
        grad.addColorStop(0, 'rgba(239, 68, 68, 0)');
        grad.addColorStop(1, `rgba(239, 68, 68, ${alpha})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      } catch {
        // Safe fallback
      }
    }
  }

  // --- HUD STATE BROADCAST ---
  private broadcastHUD() {
    if (!this.onHUDUpdate) return;
    try {
      const curWep = this.getCurrentWeapon();
      const stats = this.getUpgradedWeaponStats(curWep.id);

      // Objective description
      let objText = '';
      let objProg = '';

      switch (this.location.missionType) {
        case 'survive_time':
          objText = 'SURVIVE UNTIL AIRLIFT';
          objProg = `${Math.max(0, Math.ceil(this.location.targetCount - this.missionTimeElapsed))}s`;
          break;
        case 'kill_count':
          objText = 'ELIMINATE INFESTATION';
          objProg = `${this.killsCount} / ${this.location.targetCount}`;
          break;
        case 'collect_supplies':
          objText = 'RECOVER CRATES';
          objProg = `${this.suppliesCollected} / ${this.location.targetCount}`;
          break;
        case 'rescue_survivors':
          objText = 'ESCORT SURVIVORS';
          objProg = `${this.survivorsRescued} / ${this.map.survivors.length}`;
          break;
        case 'protect_area':
          objText = 'DEFEND TRANSMITTER';
          objProg = `${Math.max(0, Math.ceil(this.location.targetCount - this.areaDefendTimer))}s`;
          break;
        case 'reach_extraction':
          objText = 'HOLD EXTRACTION POINT';
          objProg = `${Math.ceil(this.map.extractionPoint?.timeRemaining ? Math.max(0, this.map.extractionPoint.timeRemaining - this.extractionTimer) : 0)}s`;
          break;
        case 'defeat_boss':
          objText = 'ELIMINATE THE HULK';
          objProg = this.zombies.some((z) => z.isBoss) ? 'TARGET ALIVE' : 'TARGET DESTROYED';
          break;
      }

      const boss = this.zombies.find((z) => z.isBoss);

      this.onHUDUpdate({
        health: Math.round(this.player.health),
        maxHealth: this.player.maxHealth,
        armor: Math.round(this.player.armor),
        maxArmor: this.player.maxArmor,
        stamina: Math.round(this.player.stamina),
        maxStamina: this.player.maxStamina,
        currentWeapon: curWep,
        equippedSlot: this.player.equippedSlot,
        currentMag: this.player.magAmmo,
        maxMag: stats.magazine,
        isReloading: this.player.isReloading,
        reloadProgress: this.player.isReloading ? 1 - this.player.reloadTimer / this.player.reloadTotal : 0,
        coins: this.saveData.coins,
        zombieDna: this.saveData.zombieDna,
        medkits: this.saveData.inventory.medkits,
        grenades: this.saveData.inventory.grenades,
        playerLevel: this.saveData.playerLevel,
        playerXp: this.saveData.playerXp,
        kills: this.killsCount,
        objectiveText: objText,
        objectiveProgress: objProg,
        isObjectiveDone: this.isWon,
        bossHealthPercent: boss ? boss.health / boss.maxHealth : undefined,
        bossName: boss ? 'THE HULK' : undefined,
        weather: this.location.weather,
        timeOfDay: this.location.timeOfDay,
        minimap: {
          playerX: this.player.x,
          playerY: this.player.y,
          playerAngle: this.player.angle,
          mapWidth: this.map.width,
          mapHeight: this.map.height,
          camX: this.camera.x,
          camY: this.camera.y,
          camW: this.canvas.width,
          camH: this.canvas.height,
          zombies: this.zombies.map((z) => ({ x: z.x, y: z.y, isBoss: z.isBoss })),
          crates: this.map.crates.map((c) => ({ x: c.x, y: c.y, collected: c.collected })),
          survivors: this.map.survivors.map((s) => ({ x: s.x, y: s.y, rescued: s.rescued })),
          extraction: this.map.extractionPoint ? { x: this.map.extractionPoint.x, y: this.map.extractionPoint.y } : undefined,
          defenseZone: this.map.defenseZone ? { x: this.map.defenseZone.x, y: this.map.defenseZone.y } : undefined,
        },
      });
    } catch (err) {
      console.warn('[GameEngine] HUD update error caught safely:', err);
    }
  }

  // --- CLEANUP ---
  public destroy() {
    this.stop();
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.handleResize);
    }
    window.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
  }
}
