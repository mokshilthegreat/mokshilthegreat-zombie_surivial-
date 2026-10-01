import { GameSaveData, WeaponId } from '../types/game';
import { INITIAL_SAVE_DATA, XP_FOR_LEVEL } from './constants';

const STORAGE_KEY = 'zombie_survival_last_stand_save_v1';

export function loadGameData(): GameSaveData {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return JSON.parse(JSON.stringify(INITIAL_SAVE_DATA));
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return JSON.parse(JSON.stringify(INITIAL_SAVE_DATA));
    }
    return {
      ...INITIAL_SAVE_DATA,
      ...parsed,
      playerLevel: typeof parsed.playerLevel === 'number' && parsed.playerLevel >= 1 ? parsed.playerLevel : 1,
      playerXp: typeof parsed.playerXp === 'number' && parsed.playerXp >= 0 ? parsed.playerXp : 0,
      coins: typeof parsed.coins === 'number' && parsed.coins >= 0 ? parsed.coins : 300,
      zombieDna: typeof parsed.zombieDna === 'number' && parsed.zombieDna >= 0 ? parsed.zombieDna : 5,
      unlockedLocations: Array.isArray(parsed.unlockedLocations) && parsed.unlockedLocations.length > 0
        ? parsed.unlockedLocations
        : [1],
      completedLocations: Array.isArray(parsed.completedLocations) ? parsed.completedLocations : [],
      unlockedWeapons: Array.isArray(parsed.unlockedWeapons) && parsed.unlockedWeapons.length > 0
        ? parsed.unlockedWeapons
        : ['pistol'],
      equippedWeaponId: parsed.equippedWeaponId || 'pistol',
      secondaryWeaponId: parsed.secondaryWeaponId || 'shotgun',
      selectedCharacter: parsed.selectedCharacter || 'survivor',
      settings: { ...INITIAL_SAVE_DATA.settings, ...(parsed.settings || {}) },
      inventory: { ...INITIAL_SAVE_DATA.inventory, ...(parsed.inventory || {}) },
      playerUpgrades: { ...INITIAL_SAVE_DATA.playerUpgrades, ...(parsed.playerUpgrades || {}) },
      dnaPerks: { ...INITIAL_SAVE_DATA.dnaPerks, ...(parsed.dnaPerks || {}) },
      weaponUpgrades: { ...INITIAL_SAVE_DATA.weaponUpgrades, ...(parsed.weaponUpgrades || {}) },
    };
  } catch (e) {
    console.error('Failed to load save game:', e);
    return JSON.parse(JSON.stringify(INITIAL_SAVE_DATA));
  }
}

export function saveGameData(data: GameSaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write save game:', e);
  }
}

export function resetGameData(): GameSaveData {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  const fresh = JSON.parse(JSON.stringify(INITIAL_SAVE_DATA));
  saveGameData(fresh);
  return fresh;
}

/**
 * Add XP and check for level ups
 */
export function addPlayerXp(current: GameSaveData, gainedXp: number): { data: GameSaveData; leveledUp: boolean; newLevel: number } {
  let xp = current.playerXp + gainedXp;
  let level = current.playerLevel;
  let leveledUp = false;

  while (xp >= XP_FOR_LEVEL(level)) {
    xp -= XP_FOR_LEVEL(level);
    level += 1;
    leveledUp = true;
  }

  const updated: GameSaveData = {
    ...current,
    playerLevel: level,
    playerXp: xp,
  };

  saveGameData(updated);
  return { data: updated, leveledUp, newLevel: level };
}

/**
 * Upgrade weapon stat
 */
export function upgradeWeaponStat(
  saveData: GameSaveData,
  weaponId: WeaponId,
  stat: 'damage' | 'fireRate' | 'magazine' | 'reloadSpeed' | 'critChance',
  cost: number
): GameSaveData | null {
  if (saveData.coins < cost) return null;
  const currentLevel = saveData.weaponUpgrades[weaponId]?.[stat] ?? 0;
  if (currentLevel >= 5) return null;

  const updated: GameSaveData = {
    ...saveData,
    coins: saveData.coins - cost,
    weaponUpgrades: {
      ...saveData.weaponUpgrades,
      [weaponId]: {
        ...saveData.weaponUpgrades[weaponId],
        [stat]: currentLevel + 1,
      },
    },
  };
  saveGameData(updated);
  return updated;
}
