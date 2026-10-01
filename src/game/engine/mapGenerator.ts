import { LocationConfig } from '../../types/game';
import { Obstacle, SupplyCrate, SurvivorNPC, DefenseZone, ExtractionPoint } from './types';

export interface GeneratedMap {
  width: number;
  height: number;
  themeColor: string;
  floorPattern: 'asphalt' | 'tiles' | 'concrete' | 'dirt' | 'metal' | 'nest';
  obstacles: Obstacle[];
  crates: SupplyCrate[];
  survivors: SurvivorNPC[];
  defenseZone?: DefenseZone;
  extractionPoint?: ExtractionPoint;
  playerSpawn: { x: number; y: number };
}

export function generateMapForLocation(loc: LocationConfig): GeneratedMap {
  const width = 3200;
  const height = 3200;
  const midX = width / 2;
  const midY = height / 2;
  const obstacles: Obstacle[] = [];
  const crates: SupplyCrate[] = [];
  const survivors: SurvivorNPC[] = [];
  let defenseZone: DefenseZone | undefined;
  let extractionPoint: ExtractionPoint | undefined;

  // Outer boundary walls
  const wallThick = 50;
  // Top
  obstacles.push({ x: 0, y: 0, width, height: wallThick, type: 'wall', color: '#1e293b' });
  // Bottom
  obstacles.push({ x: 0, y: height - wallThick, width, height: wallThick, type: 'wall', color: '#1e293b' });
  // Left
  obstacles.push({ x: 0, y: 0, width: wallThick, height, type: 'wall', color: '#1e293b' });
  // Right
  obstacles.push({ x: width - wallThick, y: 0, width: wallThick, height, type: 'wall', color: '#1e293b' });

  let floorPattern: 'asphalt' | 'tiles' | 'concrete' | 'dirt' | 'metal' | 'nest' = 'asphalt';
  let themeColor = '#0f172a';

  switch (loc.id) {
    case 1: // Abandoned Street
      floorPattern = 'asphalt';
      themeColor = '#111827';
      // Corner Destroyed Buildings / Ruined Stores across the massive city
      obstacles.push({ x: 260, y: 260, width: 340, height: 280, type: 'building', color: '#334155' });
      obstacles.push({ x: width - 600, y: 260, width: 340, height: 280, type: 'building', color: '#475569' });
      obstacles.push({ x: 260, y: height - 580, width: 340, height: 300, type: 'building', color: '#334155' });
      obstacles.push({ x: width - 600, y: height - 580, width: 340, height: 300, type: 'building', color: '#475569' });

      // Mid-block buildings
      obstacles.push({ x: 260, y: midY - 600, width: 300, height: 220, type: 'building', color: '#1e293b' });
      obstacles.push({ x: width - 560, y: midY + 380, width: 300, height: 220, type: 'building', color: '#1e293b' });

      // Abandoned cars with models scattered along avenues
      obstacles.push({ x: 750, y: midY - 140, width: 140, height: 75, type: 'car', color: '#0f172a', carModel: 'police' });
      obstacles.push({ x: 2150, y: midY - 140, width: 140, height: 75, type: 'car', color: '#eab308', carModel: 'taxi' });
      obstacles.push({ x: midX - 140, y: 750, width: 80, height: 140, type: 'car', color: '#7c2d12', carModel: 'pickup' });
      obstacles.push({ x: midX - 140, y: 2250, width: 80, height: 140, type: 'car', color: '#334155', carModel: 'sedan' });
      obstacles.push({ x: midX + 60, y: 1200, width: 80, height: 140, type: 'car', color: '#0f172a', carModel: 'police' });
      obstacles.push({ x: midX + 60, y: 2000, width: 80, height: 140, type: 'car', color: '#eab308', carModel: 'taxi' });

      // Concrete barricades with hazard chevrons
      obstacles.push({ x: midX - 240, y: midY - 220, width: 140, height: 35, type: 'barricade', color: '#64748b' });
      obstacles.push({ x: midX + 100, y: midY - 220, width: 140, height: 35, type: 'barricade', color: '#64748b' });
      obstacles.push({ x: midX - 240, y: midY + 185, width: 140, height: 35, type: 'barricade', color: '#64748b' });
      obstacles.push({ x: midX + 100, y: midY + 185, width: 140, height: 35, type: 'barricade', color: '#64748b' });

      // Loot Crates around the city
      crates.push({ id: 'c1', x: 500, y: 500, collected: false, type: 'ammo' });
      crates.push({ id: 'c2', x: 2600, y: 500, collected: false, type: 'medical' });
      crates.push({ id: 'c3', x: 500, y: 2600, collected: false, type: 'ammo' });
      crates.push({ id: 'c4', x: 2600, y: 2600, collected: false, type: 'dna_sample' });
      break;

    case 2: // Grocery Store
      floorPattern = 'tiles';
      themeColor = '#0a0f1d';
      // Shelving aisles
      for (let i = 0; i < 6; i++) {
        obstacles.push({ x: 600 + i * 360, y: 650, width: 70, height: 600, type: 'crate', color: '#334155' });
        obstacles.push({ x: 600 + i * 360, y: 1750, width: 70, height: 600, type: 'crate', color: '#334155' });
      }
      // Supplies to collect
      crates.push({ id: 'c1', x: 500, y: 500, collected: false, type: 'food' });
      crates.push({ id: 'c2', x: 1200, y: 450, collected: false, type: 'food' });
      crates.push({ id: 'c3', x: 1800, y: 450, collected: false, type: 'food' });
      crates.push({ id: 'c4', x: 2500, y: 500, collected: false, type: 'food' });
      crates.push({ id: 'c5', x: 500, y: 2600, collected: false, type: 'food' });
      crates.push({ id: 'c6', x: 1200, y: 2650, collected: false, type: 'food' });
      crates.push({ id: 'c7', x: 1800, y: 2650, collected: false, type: 'food' });
      crates.push({ id: 'c8', x: 2500, y: 2600, collected: false, type: 'food' });
      break;

    case 3: // Police Station
      floorPattern = 'concrete';
      themeColor = '#091026';
      // Precinct desks & holding cell walls
      obstacles.push({ x: 1000, y: 1000, width: 350, height: 50, type: 'wall', color: '#475569' });
      obstacles.push({ x: 1850, y: 1000, width: 350, height: 50, type: 'wall', color: '#475569' });
      obstacles.push({ x: 1400, y: 1900, width: 400, height: 60, type: 'wall', color: '#475569' });
      obstacles.push({ x: 650, y: 2000, width: 160, height: 75, type: 'car', color: '#1e3a8a', carModel: 'police' });
      obstacles.push({ x: 2400, y: 2000, width: 160, height: 75, type: 'car', color: '#1e3a8a', carModel: 'police' });

      // Survivors to rescue across the precinct
      survivors.push({ id: 's1', x: 550, y: 550, health: 120, maxHealth: 120, rescued: false, followingPlayer: false });
      survivors.push({ id: 's2', x: 2650, y: 600, health: 120, maxHealth: 120, rescued: false, followingPlayer: false });
      survivors.push({ id: 's3', x: 2400, y: 2500, health: 120, maxHealth: 120, rescued: false, followingPlayer: false });
      survivors.push({ id: 's4', x: 600, y: 2500, health: 120, maxHealth: 120, rescued: false, followingPlayer: false });
      break;

    case 4: // Hospital
      floorPattern = 'tiles';
      themeColor = '#06201a';
      // Quarantine barriers & triage beds
      obstacles.push({ x: 900, y: 900, width: 240, height: 50, type: 'barricade', color: '#065f46' });
      obstacles.push({ x: 1900, y: 900, width: 240, height: 50, type: 'barricade', color: '#065f46' });
      obstacles.push({ x: 900, y: 2100, width: 240, height: 50, type: 'barricade', color: '#065f46' });
      obstacles.push({ x: 1900, y: 2100, width: 240, height: 50, type: 'barricade', color: '#065f46' });
      crates.push({ id: 'med1', x: 600, y: 600, collected: false, type: 'medical' });
      crates.push({ id: 'med2', x: 2500, y: 600, collected: false, type: 'medical' });
      crates.push({ id: 'med3', x: 600, y: 2500, collected: false, type: 'medical' });
      crates.push({ id: 'med4', x: 2500, y: 2500, collected: false, type: 'medical' });
      break;

    case 5: // Subway Station
      floorPattern = 'dirt';
      themeColor = '#120b08';
      // Subway support pillars across the long tunnel
      for (let px = 500; px <= 2600; px += 400) {
        obstacles.push({ x: px, y: 1000, width: 60, height: 60, type: 'wall', color: '#78350f' });
        obstacles.push({ x: px, y: 2000, width: 60, height: 60, type: 'wall', color: '#78350f' });
      }
      // Extraction point at the far end
      extractionPoint = {
        x: 2750,
        y: midY,
        radius: 95,
        activated: false,
        timeRemaining: 10,
      };
      break;

    case 6: // Military Base
      floorPattern = 'concrete';
      themeColor = '#141a0b';
      // Sandbags and communication antenna generator
      obstacles.push({ x: midX - 200, y: midY - 200, width: 400, height: 35, type: 'sandbag', color: '#4d7c0f' });
      obstacles.push({ x: midX - 200, y: midY + 165, width: 400, height: 35, type: 'sandbag', color: '#4d7c0f' });
      obstacles.push({ x: midX - 200, y: midY - 165, width: 35, height: 330, type: 'sandbag', color: '#4d7c0f' });
      obstacles.push({ x: midX + 165, y: midY - 165, width: 35, height: 330, type: 'sandbag', color: '#4d7c0f' });

      // The radio defense zone
      defenseZone = {
        x: midX,
        y: midY,
        radius: 140,
        health: 600,
        maxHealth: 600,
      };
      break;

    case 7: // Research Laboratory
      floorPattern = 'metal';
      themeColor = '#0d1527';
      // Pod chambers
      obstacles.push({ x: 800, y: 800, width: 160, height: 160, type: 'wall', color: '#1e3a8a' });
      obstacles.push({ x: 2100, y: 800, width: 160, height: 160, type: 'wall', color: '#1e3a8a' });
      obstacles.push({ x: 800, y: 2100, width: 160, height: 160, type: 'wall', color: '#1e3a8a' });
      obstacles.push({ x: 2100, y: 2100, width: 160, height: 160, type: 'wall', color: '#1e3a8a' });

      // DNA Canisters scattered in lab wings
      crates.push({ id: 'dna1', x: 600, y: 600, collected: false, type: 'dna_sample' });
      crates.push({ id: 'dna2', x: 2400, y: 600, collected: false, type: 'dna_sample' });
      crates.push({ id: 'dna3', x: 600, y: 2400, collected: false, type: 'dna_sample' });
      crates.push({ id: 'dna4', x: 2400, y: 2400, collected: false, type: 'dna_sample' });
      crates.push({ id: 'dna5', x: midX, y: 700, collected: false, type: 'dna_sample' });
      crates.push({ id: 'dna6', x: midX, y: 2400, collected: false, type: 'dna_sample' });
      crates.push({ id: 'dna7', x: 700, y: midY, collected: false, type: 'dna_sample' });
      crates.push({ id: 'dna8', x: 2400, y: midY, collected: false, type: 'dna_sample' });
      break;

    case 8: // Zombie Nest (The Hulk Boss Arena)
      floorPattern = 'nest';
      themeColor = '#1a0808';
      // Outer corrupted pillars allowing kiting and cover against The Hulk's charge
      obstacles.push({ x: 900, y: 900, width: 110, height: 110, type: 'wall', color: '#450a0a' });
      obstacles.push({ x: 2100, y: 900, width: 110, height: 110, type: 'wall', color: '#450a0a' });
      obstacles.push({ x: 900, y: 2100, width: 110, height: 110, type: 'wall', color: '#450a0a' });
      obstacles.push({ x: 2100, y: 2100, width: 110, height: 110, type: 'wall', color: '#450a0a' });
      break;
  }

  // Player starts around center or safe edge
  const playerSpawn = loc.id === 5 ? { x: 450, y: midY } : { x: midX, y: midY };

  return {
    width,
    height,
    themeColor,
    floorPattern,
    obstacles,
    crates,
    survivors,
    defenseZone,
    extractionPoint,
    playerSpawn,
  };
}
